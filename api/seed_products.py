from app import app
from models import db, Product

PRODUCTS = [
    {
        'name': 'Cítrico Amanecer', 'slug': 'citrico-amanecer', 'price': 8.90,
        'short_description': 'Estallido cítrico y vitalizante para empezar el día.',
        'usage': 'Aplicar sobre piel húmeda, masajear y enjuagar. Ideal en la ducha matutina.',
        'warnings': 'Evitar contacto con los ojos. Uso externo.',
        'image': '/api/static/products/citrico-amanecer.jpg'
    },
    {
        'name': 'Menta Alpina', 'slug': 'menta-alpina', 'price': 8.90,
        'short_description': 'Frescura intensa y limpieza profunda.',
        'usage': 'Perfecto tras el ejercicio o en días calurosos.',
        'warnings': 'Puede ser intenso en pieles muy sensibles.',
        'image': '/api/static/products/menta-alpina.jpg'
    },
    {
        'name': 'Rosa Mosqueta', 'slug': 'rosa-mosqueta', 'price': 9.50,
        'short_description': 'Delicado, nutritivo y floral.',
        'usage': 'Uso diario, recomendado para piel seca o madura.',
        'warnings': 'Suspender uso en caso de irritación.',
        'image': '/api/static/products/rosa-mosqueta.jpg'
    },
    {
        'name': 'Coco Tropical', 'slug': 'coco-tropical', 'price': 8.90,
        'short_description': 'Nutrición y dulzor con aroma playero.',
        'usage': 'Ideal para baños relajantes.',
        'warnings': 'No exponer el jabón húmedo directamente al sol.',
        'image': '/api/static/products/coco-tropical.jpg'
    },
    {
        'name': 'Avena y Miel', 'slug': 'avena-y-miel', 'price': 8.90,
        'short_description': 'Calma, suaviza e hidrata naturalmente.',
        'usage': 'Perfecto para piel sensible o reseca.',
        'warnings': 'Uso externo únicamente.',
        'image': '/api/static/products/avena-y-miel.jpg'
    },
    {
        'name': 'Lavanda Serena', 'slug': 'lavanda-serena', 'price': 8.90,
        'short_description': 'Relajante clásico para desconectar.',
        'usage': 'Excelente antes de dormir.',
        'warnings': 'Evitar contacto con mucosas.',
        'image': '/api/static/products/lavanda-serena.jpg'
    },
    {
        'name': 'Bosque Fresco', 'slug': 'bosque-fresco', 'price': 8.90,
        'short_description': 'Aroma verde, pinos y eucalipto.',
        'usage': 'Apto para ducha diaria.',
        'warnings': 'Mantener el jabón seco tras cada uso.',
        'image': '/api/static/products/bosque-fresco.jpg'
    },
    {
        'name': 'Carbón Activo', 'slug': 'carbon-activo', 'price': 9.20,
        'short_description': 'Purificante y detox. Limpieza profunda.',
        'usage': 'Recomendado para piel mixta o grasa.',
        'warnings': 'Puede manchar telas si no se enjuaga bien.',
        'image': '/api/static/products/carbon-activo.jpg'
    }
]

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if Product.query.count() == 0:
            for p in PRODUCTS:
                db.session.add(Product(**p))
            db.session.commit()
            print('Productos iniciales creados ✅')
        else:
            print('Ya existen productos, no se insertó nada.')
