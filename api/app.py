import os, re
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Product, CartItem

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
        db.session.add(user)
        db.session.commit()
        return jsonify(msg='Registrado'), 201

    @app.post('/api/auth/login')
    def login():
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify(msg='Credenciales inválidas'), 401
        token = create_access_token(identity=str(user.id))
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

        # Campos editables
        name = data.get('name', u.name)
        email = (data.get('email') or u.email).strip().lower()

        # Validaciones
        if not EMAIL_RE.match(email):
            return jsonify(msg='Email inválido'), 400
        if email != u.email and User.query.filter_by(email=email).first():
            return jsonify(msg='Ese email ya está en uso'), 409

        # Cambio de contraseña (opcional)
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        if new_password:
            if not current_password or not check_password_hash(u.password_hash, current_password):
                return jsonify(msg='Contraseña actual incorrecta'), 401
            if len(new_password) < 6:
                return jsonify(msg='La nueva contraseña debe tener al menos 6 caracteres'), 400
            u.password_hash = generate_password_hash(new_password)

        u.name = name
        u.email = email
        db.session.commit()
        return jsonify(msg='Perfil actualizado')

    @app.delete('/api/me')
    @jwt_required()
    def me_delete():
        uid = int(get_jwt_identity())
        u = User.query.get_or_404(uid)
        # Borrar items de carrito del usuario
        CartItem.query.filter_by(user_id=u.id).delete()
        db.session.delete(u)
        db.session.commit()
        return jsonify(msg='Cuenta eliminada')

    # ---------- PRODUCTOS ----------
    @app.get('/api/products')
    def list_products():
        products = Product.query.order_by(Product.id.asc()).all()
        def to_dict(p):
            return {
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'price': float(p.price),
                'short_description': p.short_description,
                'usage': p.usage,
                'warnings': p.warnings,
                'image': p.image,
            }
        return jsonify([to_dict(p) for p in products])

    @app.get('/api/products/<slug>')
    def get_product(slug):
        p = Product.query.filter_by(slug=slug).first_or_404()
        return jsonify({
            'id': p.id,
            'name': p.name,
            'slug': p.slug,
            'price': float(p.price),
            'short_description': p.short_description,
            'usage': p.usage,
            'warnings': p.warnings,
            'image': p.image,
        })

    # Estáticos de productos
    @app.get('/api/static/products/<path:filename>')
    def product_static(filename):
        root = os.path.join(app.root_path, 'static', 'products')
        return send_from_directory(root, filename)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
