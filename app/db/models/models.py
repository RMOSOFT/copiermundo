from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, Float
from datetime import datetime
from app.db.conexion import Base


class Contacto(Base):
    __tablename__ = "contactos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    empresa = Column(String(100))
    correo = Column(String(100), nullable=False)
    telefono = Column(String(30), nullable=False)
    asunto = Column(String(100), nullable=False)
    mensaje = Column(Text)
    fecha = Column(DateTime, default=datetime.utcnow)

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String)
    precio = Column(Numeric(10, 2))
    imagen_url = Column(String)
    afiche_url = Column(String)
    caracteristicas = Column(String)  # Usar JSON si es necesario
    categoria = Column(String)