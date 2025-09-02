import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Product, CartItem

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

    # --- Auth mínima (Ampliaremos en Bloque 2) ---
    @app.post('/api/auth/register')
    def register():
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''
        name = data.get('name') or ''
        if not email or not password:
            return jsonify(msg='Email y password son requeridos'), 400
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
        token = create_access_token(identity=user.id)
        return jsonify(access_token=token, name=user.name or '', email=user.email)

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

    @app.get('/api/static/products/<path:filename>')
    def product_static(filename):
        root = os.path.join(app.root_path, 'static', 'products')
        return send_from_directory(root, filename)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
