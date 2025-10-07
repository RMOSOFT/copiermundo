from app.db.conexion import Base, engine
from app.db.models.models import Contacto, Producto


# Tablas para contacto
print("Creando tabla para contacto...!")
Base.metadata.create_all(bind=engine)
print("✅ Tablas creadas correctamente.")

# Tablas para productos
print("Creando la tabla para productos...!")
print("✅ Tabla 'productos' creada correctamente")