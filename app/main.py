# app/main.py
from fastapi import FastAPI, Request, HTTPException, Body
from fastapi.responses import RedirectResponse
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
import os, json, re
from app.routers import productos
from app.routers import contacto
from functools import lru_cache
from app.utils.utils_filtro_precios import limpiar_precio
from fastapi import Body
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
from typing import List, Union
from pydantic import BaseModel, EmailStr
from datetime import datetime
from email.message import EmailMessage
import aiosmtplib
from email.message import EmailMessage


load_dotenv()

# Configuración de correo desde .env
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
EMAIL_TO = os.getenv("EMAIL_TO")

print("EMAIL:", os.getenv("EMAIL_USER"))
print("PASS:", os.getenv("EMAIL_PASS"))

app = FastAPI()


# Directorio base
BASE_DIR = Path(__file__).resolve().parent

# Montar carpeta static
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

# Configurar plantilla
templates = Jinja2Templates(directory=BASE_DIR / "templates")

templates = Jinja2Templates(directory="app/templates")
templates = Jinja2Templates(directory=os.path.join(os.path.dirname(__file__), "templates"))

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Registrar router de productos
app.include_router(productos.router)

# Registrar router de contacto
app.include_router(contacto.router)

# Ahora desde aqui la logica del carrito
class OrderItem(BaseModel):
    id: str | None = None
    nombre: str
    precio: float
    imagen: str | None = None
    qty: int

class Cliente(BaseModel):
    nombre: str
    correo: EmailStr
    telefono: str
    empresa: str | None = None 
    direccion: str | None = None 
    notas: str | None = None 

class OrderRequest(BaseModel):
    cliente: Cliente
    carrito: List[OrderItem]


def format_currency(v: float) -> str:
    return f"S/ {v:,.2f}"



# Ruta para la pagina principal
@app.get("/",  response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/productos", response_class=HTMLResponse)
async def mostrar_productos(request: Request):
    return templates.TemplateResponse("productos/index_productos.html", {"request": request})

# Aqui van la interaccion de los botones tanto nuestras categorias para enrutar los productos
@app.get("/productos/fotocopiadoras", response_class=HTMLResponse)
async def mostrar_fotocopiadoras(request: Request):
    ruta_base = os.path.dirname(__file__)
    ruta_json = os.path.abspath(os.path.join(ruta_base, "static", "data", "productos.json"))
    
    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            datos = json.load(f)
    except FileNotFoundError:
        datos = {}   # 👈 si no existe, que no truene
        
    return templates.TemplateResponse("productos/fotocopiadoras.html", {
        "request": request,
        "productos": datos,
        "categoria": "fotocopiadoras"
    })

# Aqui va productos hijas desde el sidebar.
@app.get("/productos/fotocopiadoras/impresoras-multifuncional", response_class=HTMLResponse)
async def mostrar_fotocopiadoras(request: Request):
    return templates.TemplateResponse("productos/fotocopiadoras/impresoras-multifuncional.html", {"request": request})

@app.get("/productos/fotocopiadoras/impresoras-kyoceras", response_class=HTMLResponse)
async def mostrar_fotocopiadoras(request: Request):
    return templates.TemplateResponse("productos/fotocopiadoras/impresoras-kyoceras.html", {"request": request})

@app.get("/productos/fotocopiadoras/impresoras-color", response_class=HTMLResponse)
async def mostrar_fotocopiadoras(request: Request):
    return templates.TemplateResponse("productos/fotocopiadoras/impresoras-color.html", {"request": request})

@app.get("/productos/fotocopiadoras/impresoras-monocromaticas", response_class=HTMLResponse)
async def mostrar_fotocopiadoras(request: Request):
    return templates.TemplateResponse("productos/fotocopiadoras/impresoras-monocromaticas.html", {"request": request})

@app.get("/productos/fotocopiadoras/impresoras-seminuevas", response_class=HTMLResponse)
async def mostrar_fotocopiadoras(request: Request):
    return templates.TemplateResponse("productos/fotocopiadoras/impresoras-seminuevas.html", {"request": request})

@app.get("/productos/fotocopiadoras/impresoras-seminuevas-series-8", response_class=HTMLResponse)
async def mostrar_fotocopiadoras(request: Request):
    return templates.TemplateResponse("productos/fotocopiadoras/impresoras-seminuevas-series-8.html", {"request": request})


@app.get("/productos/tonerescartuchos", response_class=HTMLResponse)
async def mostrar_toneres(request: Request):
    return templates.TemplateResponse("productos/tonerescartuchos.html", {"request": request})

@app.get("/productos/accesoriosoficina", response_class=HTMLResponse)
async def mostrar_toneres(request: Request):
    return templates.TemplateResponse("productos/accesoriosoficina.html", {"request": request})


# Ruta desde aqui es para hacer la logica de consumibles de los productos generales
def cargar_consumibles(nombre_archivo):
    ruta_base = os.path.dirname(__file__)
    ruta_json = os.path.join(ruta_base, "static", "data", "consumibles", nombre_archivo)
    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# ✅ Ruta para consumibles
@app.get("/consumibles", response_class=HTMLResponse)
async def consumibles_generales(request: Request):
    productos = cargar_consumibles(nombre_archivo)
    return templates.TemplateResponse("consumibles/index_consumibles.html", {"request": request, "productos": productos})

@app.get("/consumibles/{categoria}", response_class=HTMLResponse)
async def consumibles_categoria(request: Request, categoria: str):
    nombre_archivo = f"{categoria}.json"
    productos = cargar_consumibles(nombre_archivo)

    # Mapea títulos amigables
    titulos = {
        "toneroriginal": "Tóner Original",
        "recargacompatible": "Recarga / Tóner Compatible",
        "papelimpresion": "Papel de Impresión",
    }

    titulo = titulos.get(categoria, "Consumibles")

    return templates.TemplateResponse("consumibles/index_consumibles.html", {"request": request, "productos": productos, "titulo": titulo})
    

# ✅ Ruta para nosotros
@app.get("/nosotros", response_class=HTMLResponse)
async def read_nosotros(request: Request):
    return templates.TemplateResponse("nosotros/index_nosotros.html", {"request": request})


# Esta parte es para el campo del formulario de contactanos
@app.post("/api/solicitar-presupuesto")
async def solicitar_presupuesto(data: dict = Body(...)):
    mensaje = EmailMessage()
    mensaje["From"] = EMAIL_USER
    mensaje["To"] = "administradora@example.com"  # destinatario
    mensaje["Subject"] = f"Solicitud de presupuesto: {data.get('asunto', 'Sin asunto')}"

    cuerpo = []
    if data.get('nombre'):
        cuerpo.append(f"Nombre: {data.get('nombre')}")
    if data.get('empresa'):
        cuerpo.append(f"Empresa: {data.get('empresa')}")
    if data.get('correo'):
        cuerpo.append(f"Correo: {data.get('correo')}")
    if data.get('telefono'):
        cuerpo.append(f"Teléfono: {data.get('telefono')}")
    if data.get('asunto'):
        cuerpo.append(f"Asunto: {data.get('asunto')}")
    if data.get('mensaje'):
        cuerpo.append(f"Mensaje: {data.get('mensaje')}")

    # Unir solo si hay líneas
    mensaje.set_content("\n".join(cuerpo))

    try:
        await aiosmtplib.send(
            mensaje,
            hostname=EMAIL_HOST,
            port=EMAIL_PORT,
            username=EMAIL_USER,
            password=EMAIL_PASS,
            start_tls=True
        )
        return {"status": "ok", "mensaje": "Presupuesto enviado"}
    except Exception as e:
        print("Error enviando correo:", e)
        return {"status": "error", "mensaje": "No se pudo enviar el presupuesto"}


# ✅ Ruta para contacto
@app.get("/contacto", response_class=HTMLResponse)
async def read_contacto(request: Request):
    return templates.TemplateResponse("contacto/index_contacto.html", {"request": request})


# En esta parte sera la funcion del buscador de la pagina web busqueda general
@app.get("/buscar", response_class=HTMLResponse)
async def buscar(request: Request, s: str ="", category: str =""):
    # Normaliza texto para busqueda
    palabra_clave = s.lower().strip()
    categoria = category.lower().strip()

    # Diccionario para redirigir a páginas existentes
    rutas = {
        "fotocopiadoras multifuncionales": "/productos/fotocopiadoras",
        "fotocopiadoras multifuncionales seminuevas": "/productos/fotocopiadoras/impresoras-seminuevas",
        "fotocopiadoras multifuncionales seminuevas series 8": "/productos/fotocopiadoras/impresoras-seminuevas-series-8",
        "fotocopiadoras multifuncionales seminuevas a color": "/productos/fotocopiadoras/impresoras-color",
        "fotocopiadoras kyoceras": "/productos/fotocopiadoras/impresoras-kyoceras",
        "fotocopiadoras monocromaticas": "/productos/fotocopiadoras/impresoras-monocromaticas",
        "cartuchos y recargas toners": "/productos/tonerescartuchos",
        "accesorios de oficina": "/productos/accesoriosoficina",  # futura ruta
    }
    # Si no escribió texto, pero eligió una categoría
    if not palabra_clave and categoria in rutas:
        return RedirectResponse(url=rutas[categoria])

    # Buscar por palabra clave + categoría
    if palabra_clave:
        # Buscar coincidencias simples con nombre
        if "fotocopiadoras" in palabra_clave or categoria == "fotocopiadoras multifuncionales":
            return RedirectResponse(url="/productos/fotocopiadoras")
        elif "toner" in palabra_clave or "cartucho" in palabra_clave or categoria == "cartuchos y recargas toners":
            return RedirectResponse(url="/productos/tonerescartuchos")
        elif "accesorios" in palabra_clave or "oficina" in palabra_clave or categoria == "accesorios de oficina":
            return RedirectResponse(url="/productos/accesoriosoficina")

        # Si no encontró coincidencia
    return templates.TemplateResponse("no_resultados.html", {"request": request, "palabra": s})


# Lógica para productos filtrados de fotocopiadoras
@app.get("/productos/filtro-precio", response_class=HTMLResponse)
async def filtrar_por_precio(request: Request, min: float = 0, max: float = 9999999):
    # Construir ruta del JSON
    ruta_base = os.path.dirname(__file__)
    ruta_json = os.path.abspath(os.path.join(ruta_base, "..", "app", "static", "data", "productos.json"))

    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            datos = json.load(f)
    except FileNotFoundError:
        return templates.TemplateResponse("no_resultados.html", {
            "request": request,
            "mensaje": "⚠️ Archivo productos.json no encontrado."
        })

    productos_filtrados = []

    for key, producto in datos.items():
        precio_str = producto.get("precio", "")
        try:
            precio_limpio = float(re.sub(r"[^\d.]", "", precio_str))
        except ValueError:
            continue

        if min <= precio_limpio <= max:
            productos_filtrados.append({
                "nombre": producto.get("titulo", "Sin nombre"),
                "precio": precio_limpio,
                "imagen": producto.get("imagen", ""),
                "descripcion": producto.get("descripcion", "")
            })

    return templates.TemplateResponse("productos/filtroprecio/filtrar_precio_fotocopiadoras.html", {
        "request": request,
        "productos": productos_filtrados,
        "min": min,
        "max": max
    })

# Logica para filtros de precios paginas hijas como impresora-color
@app.get("/productos/fotocopiadoras/filtro-precios-impresora-color", response_class=HTMLResponse)
async def filtrar_por_precio_color(request: Request, min: float = 0, max: float = 9999999):
    # Construir ruta del JSON
    ruta_base = os.path.dirname(__file__)
    ruta_json = os.path.abspath(os.path.join(ruta_base, "..", "app", "static", "data", "productosImpresorasColor", "impresora-color.json"))

    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            datos = json.load(f)
    except FileNotFoundError:
        return templates.TemplateResponse("no_resultados.html", {
            "request": request,
            "mensaje": "⚠️ Archivo productos.json no encontrado."
        })

    productos_filtrados = []

    for key, producto in datos.items():
        precio_str = producto.get("precio", "")
        try:
            precio_limpio = float(re.sub(r"[^\d.]", "", precio_str))
        except ValueError:
            continue

        if min <= precio_limpio <= max:
            productos_filtrados.append({
                "nombre": producto.get("titulo", "Sin nombre"),
                "precio": precio_limpio,
                "imagen": producto.get("imagen", ""),
                "descripcion": producto.get("descripcion", "")
            })

    return templates.TemplateResponse("productos/filtroprecio/filtrar_precio_impresora_color.html", {
        "request": request,
        "productos": productos_filtrados,
        "min": min,
        "max": max
    })


# Logica para filtros de precios paginas hijas como impresora-kyocera
@app.get("/productos/fotocopiadoras/filtro-precios-impresora-kyoceras", response_class=HTMLResponse)
async def filtrar_por_precio_kyocera(request: Request, min: float = 0, max: float = 9999999):
    # Construir ruta del JSON
    ruta_base = os.path.dirname(__file__)
    ruta_json = os.path.abspath(os.path.join(ruta_base, "..", "app", "static", "data", "productosImpresorasKyocera", "impresora-kyocera.json"))

    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            datos = json.load(f)
    except FileNotFoundError:
        return templates.TemplateResponse("no_resultados.html", {
            "request": request,
            "mensaje": "⚠️ Archivo impresora-kyocera.json no encontrado."
        })

    productos_filtrados = []

    for key, producto in datos.items():
        precio_str = producto.get("precio", "")
        try:
            precio_limpio = float(re.sub(r"[^\d.]", "", precio_str))
        except ValueError:
            continue

        if min <= precio_limpio <= max:
            productos_filtrados.append({
                "nombre": producto.get("titulo", "Sin nombre"),
                "precio": precio_limpio,
                "imagen": producto.get("imagen", ""),
                "descripcion": producto.get("descripcion", "")
            })

    return templates.TemplateResponse("productos/filtroprecio/filtrar_precio_impresora_kyoceras.html", {
        "request": request,
        "productos": productos_filtrados,
        "min": min,
        "max": max
    })

# Logica para filtros de precios paginas hijas como impresora-kyocera
@app.get("/productos/fotocopiadoras/filtro-precios-impresora-monocromatica", response_class=HTMLResponse)
async def filtrar_por_precio_monocromatica(request: Request, min: float = 0, max: float = 9999999):
    # Construir ruta del JSON
    ruta_base = os.path.dirname(__file__)
    ruta_json = os.path.abspath(os.path.join(ruta_base, "..", "app", "static", "data", "productosImpresorasMonocromaticas", "impresora-monocromatica.json"))

    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            datos = json.load(f)
    except FileNotFoundError:
        return templates.TemplateResponse("no_resultados.html", {
            "request": request,
            "mensaje": "⚠️ Archivo impresora-kyocera.json no encontrado."
        })

    productos_filtrados = []

    for key, producto in datos.items():
        precio_str = producto.get("precio", "")
        try:
            precio_limpio = float(re.sub(r"[^\d.]", "", precio_str))
        except ValueError:
            continue

        if min <= precio_limpio <= max:
            productos_filtrados.append({
                "nombre": producto.get("titulo", "Sin nombre"),
                "precio": precio_limpio,
                "imagen": producto.get("imagen", ""),
                "descripcion": producto.get("descripcion", "")
            })

    return templates.TemplateResponse("productos/filtroprecio/filtrar_precio_impresora_monocromatica.html", {
        "request": request,
        "productos": productos_filtrados,
        "min": min,
        "max": max
    })

# Logica para filtros de precios paginas hijas como impresora-seminuevas
@app.get("/productos/fotocopiadoras/filtro-precios-impresora-seminuevas", response_class=HTMLResponse)
async def filtrar_por_precio_monocromatica(request: Request, min: float = 0, max: float = 9999999):
    # Construir ruta del JSON
    ruta_base = os.path.dirname(__file__)
    ruta_json = os.path.abspath(os.path.join(ruta_base, "..", "app", "static", "data", "productosImpresorasSeminuevas", "impresora-seminuevas.json"))

    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            datos = json.load(f)
    except FileNotFoundError:
        return templates.TemplateResponse("no_resultados.html", {
            "request": request,
            "mensaje": "⚠️ Archivo impresora-kyocera.json no encontrado."
        })

    productos_filtrados = []

    for key, producto in datos.items():
        precio_str = producto.get("precio", "")
        try:
            precio_limpio = float(re.sub(r"[^\d.]", "", precio_str))
        except ValueError:
            continue

        if min <= precio_limpio <= max:
            productos_filtrados.append({
                "nombre": producto.get("titulo", "Sin nombre"),
                "precio": precio_limpio,
                "imagen": producto.get("imagen", ""),
                "descripcion": producto.get("descripcion", "")
            })

    return templates.TemplateResponse("productos/filtroprecio/filtrar-precio-impresoras-seminuevas.html", {
        "request": request,
        "productos": productos_filtrados,
        "min": min,
        "max": max
    })

# Logica para filtros de precios paginas hijas como impresora-seminuevas
@app.get("/productos/fotocopiadoras/filtro-precios-impresora-seminuevas-series-8", response_class=HTMLResponse)
async def filtrar_por_precio_monocromatica(request: Request, min: float = 0, max: float = 9999999):
    # Construir ruta del JSON
    ruta_base = os.path.dirname(__file__)
    ruta_json = os.path.abspath(os.path.join(ruta_base, "..", "app", "static", "data", "productosImpresorasSeminuevasSeries8", "impresoras-seminuevas-series-8.json"))

    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            datos = json.load(f)
    except FileNotFoundError:
        return templates.TemplateResponse("no_resultados.html", {
            "request": request,
            "mensaje": "⚠️ Archivo impresora-kyocera.json no encontrado."
        })

    productos_filtrados = []

    for key, producto in datos.items():
        precio_str = producto.get("precio", "")
        try:
            precio_limpio = float(re.sub(r"[^\d.]", "", precio_str))
        except ValueError:
            continue

        if min <= precio_limpio <= max:
            productos_filtrados.append({
                "nombre": producto.get("titulo", "Sin nombre"),
                "precio": precio_limpio,
                "imagen": producto.get("imagen", ""),
                "descripcion": producto.get("descripcion", "")
            })

    return templates.TemplateResponse("productos/filtroprecio/filtrar-precio-impresoras-seminuevas-series-8.html", {
        "request": request,
        "productos": productos_filtrados,
        "min": min,
        "max": max
    })


# Lógica para productos filtrados de accesorios
@app.get("/productos/filtro-precios-accesorios", response_class=HTMLResponse)
async def filtrar_por_precio(request: Request, min: float = 0, max: float = 9999999):
    # Construir ruta del JSON
    ruta_base = os.path.dirname(__file__)
    ruta_json = os.path.abspath(os.path.join(ruta_base, "..", "app", "static", "data", "productos-guillotinas.json"))

    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            datos = json.load(f)
    except FileNotFoundError:
        return templates.TemplateResponse("no_resultados.html", {
            "request": request,
            "mensaje": "⚠️ Archivo productos.json no encontrado."
        })

    productos_filtrados = []

    for key, producto in datos.items():
        precio_str = producto.get("precio", "")
        try:
            precio_limpio = float(re.sub(r"[^\d.]", "", precio_str))
        except ValueError:
            continue

        if min <= precio_limpio <= max:
            productos_filtrados.append({
                "nombre": producto.get("titulo", "Sin nombre"),
                "precio": precio_limpio,
                "imagen": producto.get("imagen", ""),
                "descripcion": producto.get("descripcion", "")
            })

    return templates.TemplateResponse("productos/filtroprecio/filtrar_precio_accesorios.html", {
        "request": request,
        "productos": productos_filtrados,
        "min": min,
        "max": max
    })


# Lógica para productos filtrados de Toneres y cartuchos
@app.get("/productos/filtro-precios-toners", response_class=HTMLResponse)
async def filtrar_por_precio(request: Request, min: float = 0, max: float = 9999999):
    # Construir ruta del JSON
    ruta_base = os.path.dirname(__file__)
    ruta_json = os.path.abspath(os.path.join(ruta_base, "..", "app", "static", "data", "productos-tuners.json"))

    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            datos = json.load(f)
    except FileNotFoundError:
        return templates.TemplateResponse("no_resultados.html", {
            "request": request,
            "mensaje": "⚠️ Archivo productos.json no encontrado."
        })

    productos_filtrados = []

    for key, producto in datos.items():
        precio_str = producto.get("precio", "")
        try:
            precio_limpio = float(re.sub(r"[^\d.]", "", precio_str))
        except ValueError:
            continue

        if min <= precio_limpio <= max:
            productos_filtrados.append({
                "nombre": producto.get("titulo", "Sin nombre"),
                "precio": precio_limpio,
                "imagen": producto.get("imagen", ""),
                "descripcion": producto.get("descripcion", "")
            })

    return templates.TemplateResponse("productos/filtroprecio/filtrar_precio_toners.html", {
        "request": request,
        "productos": productos_filtrados,
        "min": min,
        "max": max
    })


# --- Configuración de correo ---
@app.post("/api/solicitar-consumible")
async def solicitar_consumible(data: dict = Body(...)):
    # 1. Armar el correo
    mensaje = EmailMessage()
    mensaje["From"] = EMAIL_USER
    mensaje["To"] = "copiermundo33@gmail.com"  # correo de la administradora
    mensaje["Subject"] = f"Solicitud de consumible: {data.get('consumible', 'Desconocido')}"
    mensaje.set_content(
        f"""
        Se ha recibido una nueva solicitud de consumible.

        Consumible: {data.get('consumible')}
        Cantidad: {data.get('cantidad')}
        Nombre: {data.get('nombre')}
        Empresa: {data.get('empresa')}
        Telefono: {data.get('telefono')}
        Correo: {data.get('correo')}

        """
    )

    # 2. Enviar el correo
    try:
        await aiosmtplib.send(
            mensaje,
            hostname=EMAIL_HOST,
            port=EMAIL_PORT,
            username=EMAIL_USER,
            password=EMAIL_PASS,
            start_tls=True
        )
        return {"status": "ok", "mensaje": "Solicitud enviada a la administradora"}
    except Exception as e:
        print("Error enviando correo:", e)
        return {"status": "error", "mensaje": "No se pudo enviar la solicitud"}


async def enviar_email_admin(pedido: OrderRequest):
    productos = "\n".join(
        [f"- {item.nombre} (x{item.qty}) = S/ {item.precio * item.qty}" for item in pedido.carrito]
    )

    body = f"""
    📦 Nuevo Pedido Recibido

    Cliente: {pedido.cliente.nombre}
    Correo: {pedido.cliente.correo}
    Teléfono: {pedido.cliente.telefono}
    Empresa: {pedido.cliente.empresa or 'No especificada'}
    Dirección: {pedido.cliente.direccion or 'No especificada'}
    Notas: {pedido.cliente.notas or 'Sin notas'}

    Productos:
    {productos}
    """

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = "🛒 Nuevo Pedido en la Tienda"
    msg["From"] = EMAIL_USER
    msg["To"] = EMAIL_TO

    try:
        # 👇 Aquí clave: Gmail funciona con 587 + STARTTLS
        await aiosmtplib.send(
            msg,
            hostname=EMAIL_HOST,  # smtp.gmail.com
            port=EMAIL_PORT,             # asegúrate que sea 587
            username=EMAIL_USER,
            password=EMAIL_PASS,
            start_tls=True        # Forzamos STARTTLS
        )
        print("📧 Correo enviado (async)")
    except Exception as e:
        print("❌ Error enviando correo:", e)
        raise

# --- ENDPOINT ---
@app.post("/api/enviar-pedido")
async def enviar_pedido(pedido: OrderRequest):
    try:
        await enviar_email_admin(pedido)
        return {"status": "ok", "mensaje": "Pedido enviado a la administradora"}
    except Exception as e:
        return {"status": "error", "mensaje": "No se pudo enviar el pedido"}


# En esta parte es el enlace para el carrito 
# 📦 Ruta del carrito
@app.get("/carrito", response_class=HTMLResponse)
async def carrito(request: Request):
    return templates.TemplateResponse("carrito/carrito.html", {"request": request})


# 📧 Procesar pedido del carrito (POST)
@app.post("/api/carrito")
async def enviar_carrito(data: dict = Body(...)):
    mensaje = EmailMessage()
    mensaje["From"] = EMAIL_USER
    mensaje["To"] = EMAIL_TO
    mensaje["Subject"] = "🛒 Nuevo Pedido desde el carrito"

    mensaje.set_content(f"""
        Cliente: {data.get('nombre')}
        Correo: {data.get('correo')}
        Teléfono: {data.get('telefono')}
        Empresa: {data.get('empresa') or 'No especificada'}
        Dirección: {data.get('direccion') or 'No especificada'}
        Notas: {data.get('notas') or 'Sin notas'}
        Productos: {data.get('productos', 'No se añadieron productos')}
    """)

    try:
        await aiosmtplib.send(
            mensaje,
            hostname=EMAIL_HOST,
            port=EMAIL_PORT,
            username=EMAIL_USER,
            password=EMAIL_PASS,
            start_tls=True
        )
        return {"status": "ok", "mensaje": "Pedido enviado al administrador ✅"}
    except Exception as e:
        print("❌ Error enviando correo:", e)
        return {"status": "error", "mensaje": str(e)}