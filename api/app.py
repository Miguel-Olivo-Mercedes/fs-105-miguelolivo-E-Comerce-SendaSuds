import os, re
from decimal import Decimal
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Product, CartItem
import stripe
from dotenv import load_dotenv
load_dotenv()

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

def create_app():
    app = Flask(__name__)

    database_url = os.getenv('DATABASE_URL', 'sqlite:///local.db')
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-change-me')

    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    db.init_app(app)
    Migrate(app, db)
    JWTManager(app)

    stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
    PUBLIC_API_ORIGIN = os.getenv('PUBLIC_API_ORIGIN')
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

    @app.get('/api/health')
    def health():
        return jsonify(status='ok')

    # ---------- AUTH ----------
    @app.post('/api/auth/register')
    def register():
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''
        name = data.get('name') or ''
        if not email or not password:
            return jsonify(msg='Email y password son requeridos'), 400
        if not EMAIL_RE.match(email):
            return jsonify(msg='Email inválido'), 400
        if len(password) < 6:
            return jsonify(msg='La contraseña debe tener al menos 6 caracteres'), 400
        if User.query.filter_by(email=email).first():
            return jsonify(msg='Email ya registrado'), 409
        user = User(email=email, password_hash=generate_password_hash(password), name=name)
        db.session.add(user); db.session.commit()
        return jsonify(msg='Registrado'), 201

    @app.post('/api/auth/login')
    def login():
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify(msg='Credenciales inválidas'), 401
        token = create_access_token(identity=str(user.id))  # sub como string
        return jsonify(access_token=token, name=user.name or '', email=user.email)

    # ---------- PERFIL ----------
    @app.get('/api/me')
    @jwt_required()
    def me():
        uid = int(get_jwt_identity())
        u = User.query.get_or_404(uid)
        return jsonify(id=u.id, name=u.name, email=u.email, created_at=u.created_at.isoformat())

    @app.put('/api/me')
    @jwt_required()
    def me_update():
        uid = int(get_jwt_identity())
        u = User.query.get_or_404(uid)
        data = request.get_json() or {}

        name = data.get('name', u.name)
        email = (data.get('email') or u.email).strip().lower()
        if not EMAIL_RE.match(email):
            return jsonify(msg='Email inválido'), 400
        if email != u.email and User.query.filter_by(email=email).first():
            return jsonify(msg='Ese email ya está en uso'), 409

        current_password = data.get('current_password')
        new_password = data.get('new_password')
        if new_password:
            if not current_password or not check_password_hash(u.password_hash, current_password):
                return jsonify(msg='Contraseña actual incorrecta'), 401
            if len(new_password) < 6:
                return jsonify(msg='La nueva contraseña debe tener al menos 6 caracteres'), 400
            u.password_hash = generate_password_hash(new_password)

        u.name = name; u.email = email
        db.session.commit()
        return jsonify(msg='Perfil actualizado')

    @app.delete('/api/me')
    @jwt_required()
    def me_delete():
        uid = int(get_jwt_identity())
        u = User.query.get_or_404(uid)
        CartItem.query.filter_by(user_id=u.id).delete()
        db.session.delete(u); db.session.commit()
        return jsonify(msg='Cuenta eliminada')

    # ---------- PRODUCTOS ----------
    @app.get('/api/products')
    def list_products():
        products = Product.query.order_by(Product.id.asc()).all()
        def to_dict(p):
            return {
                'id': p.id, 'name': p.name, 'slug': p.slug,
                'price': float(p.price), 'short_description': p.short_description,
                'usage': p.usage, 'warnings': p.warnings, 'image': p.image,
            }
        return jsonify([to_dict(p) for p in products])

    @app.get('/api/products/<slug>')
    def get_product(slug):
        p = Product.query.filter_by(slug=slug).first_or_404()
        return jsonify({
            'id': p.id, 'name': p.name, 'slug': p.slug,
            'price': float(p.price), 'short_description': p.short_description,
            'usage': p.usage, 'warnings': p.warnings, 'image': p.image,
        })

    # ---------- CARRITO ----------
    def cart_item_dict(ci: CartItem, product: Product):
        price = Decimal(product.price)
        line_total = price * ci.qty
        return {
            'id': ci.id, 'product_id': product.id, 'qty': ci.qty,
            'product': {
                'id': product.id, 'name': product.name, 'slug': product.slug,
                'price': float(product.price), 'image': product.image,
                'short_description': product.short_description
            },
            'line_total': float(line_total)
        }

    @app.get('/api/cart')
    @jwt_required()
    def cart_list():
        uid = int(get_jwt_identity())
        items = CartItem.query.filter_by(user_id=uid).all()
        payload, subtotal = [], Decimal('0.00')
        for ci in items:
            p = Product.query.get(ci.product_id)
            if not p:
                db.session.delete(ci)
                continue
            d = cart_item_dict(ci, p)
            subtotal += Decimal(str(d['line_total']))
            payload.append(d)
        db.session.commit()
        return jsonify(items=payload, subtotal=float(subtotal))

    @app.post('/api/cart')
    @jwt_required()
    def cart_add():
        uid = int(get_jwt_identity())
        data = request.get_json() or {}
        product_id = data.get('product_id')
        qty = int(data.get('qty') or 1)
        if not product_id: return jsonify(msg='product_id requerido'), 400
        if qty < 1: return jsonify(msg='qty debe ser >= 1'), 400
        p = Product.query.get(product_id)
        if not p: return jsonify(msg='Producto no existe'), 404
        existing = CartItem.query.filter_by(user_id=uid, product_id=product_id).first()
        if existing:
            existing.qty += qty; ci = existing
        else:
            ci = CartItem(user_id=uid, product_id=product_id, qty=qty); db.session.add(ci)
        db.session.commit()
        return jsonify(msg='Añadido al carrito', id=ci.id), 201

    @app.put('/api/cart/<int:item_id>')
    @jwt_required()
    def cart_update(item_id):
        uid = int(get_jwt_identity())
        ci = CartItem.query.get_or_404(item_id)
        if ci.user_id != uid: return jsonify(msg='No autorizado'), 403
        data = request.get_json() or {}
        qty = int(data.get('qty') or 1)
        if qty < 1:
            db.session.delete(ci); db.session.commit()
            return jsonify(msg='Item eliminado (qty < 1)')
        ci.qty = qty; db.session.commit()
        return jsonify(msg='Item actualizado')

    @app.delete('/api/cart/<int:item_id>')
    @jwt_required()
    def cart_delete(item_id):
        uid = int(get_jwt_identity())
        ci = CartItem.query.get_or_404(item_id)
        if ci.user_id != uid: return jsonify(msg='No autorizado'), 403
        db.session.delete(ci); db.session.commit()
        return jsonify(msg='Item eliminado')

    @app.delete('/api/cart')
    @jwt_required()
    def cart_clear():
        uid = int(get_jwt_identity())
        CartItem.query.filter_by(user_id=uid).delete()
        db.session.commit()
        return jsonify(msg='Carrito vaciado')

    # ---------- CHECKOUT (Stripe) ----------
    @app.post('/api/checkout/session')
    @jwt_required()
    def create_checkout_session():
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        if not stripe.api_key:
            return jsonify(msg='Stripe no configurado'), 500

        uid = int(get_jwt_identity())
        items = CartItem.query.filter_by(user_id=uid).all()
        if not items:
            return jsonify(msg='Carrito vacío'), 400

        origin = PUBLIC_API_ORIGIN or (request.host_url.rstrip('/'))

        line_items = []
        for ci in items:
            p = Product.query.get(ci.product_id)
            if not p: continue
            image_abs = f"{origin}{p.image}" if p.image and p.image.startswith('/api/') else None
            price_cents = int(Decimal(str(p.price)) * 100)
            li = {
                "quantity": int(ci.qty),
                "price_data": {
                    "currency": "chf",
                    "unit_amount": price_cents,
                    "product_data": { "name": p.name }
                }
            }
            if image_abs:
                li["price_data"]["product_data"]["images"] = [image_abs]
            line_items.append(li)

        payload = request.get_json() or {}
        success_url = payload.get('success_url') or f"{FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url  = payload.get('cancel_url')  or f"{FRONTEND_URL}/cart"

        try:
            session = stripe.checkout.Session.create(
                mode="payment",
                line_items=line_items,
                success_url=success_url,
                cancel_url=cancel_url,
                allow_promotion_codes=True,
                billing_address_collection="auto"
            )
            return jsonify(url=session.url)
        except Exception as e:
            return jsonify(msg=str(e)), 500

    # Estáticos de productos
    @app.get('/api/static/products/<path:filename>')
    def product_static(filename):
        root = os.path.join(app.root_path, 'static', 'products')
        return send_from_directory(root, filename)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
