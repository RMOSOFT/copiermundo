from fastapi import APIRouter, Form, Request, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from pydantic import EmailStr
from starlette.status import HTTP_302_FOUND
from app.utils.email_utils import enviar_email
from app.db.models.models import Contacto  # Lo crearemos en el paso 3
from app.db.conexion import get_db  # Tu función de conexión SQLAlchemy
from sqlalchemy.orm import Session

router = APIRouter()

templates = Jinja2Templates(directory="templates")

@router.post("/api/contacto", response_model=None)
async def procesar_contacto(
    request: Request,
    nombre: str = Form(...),
    empresa: str = Form(""),
    correo: EmailStr = Form(...),
    telefono: str = Form(""),
    asunto: str = Form(...),
    mensaje: str = Form(...),
    privacidad: str = Form(None),
    db: Session = Depends(get_db) # ESTA es la línea que confunde a FastAPI
):
    
    # 🔐 Verifica si aceptó política
    if not privacidad:
        return templates.TemplateResponse("contacto.html", {
            "request": request,
            "error": "Debes aceptar la politica de privacidad.!"
        })

    # Guardar en la base de datos
    nuevo_contacto = Contacto(
        nombre=nombre,
        empresa=empresa,
        correo=correo,
        telefono=telefono,
        asunto=asunto,
        mensaje=mensaje
    )
    db.add(nuevo_contacto)
    db.commit()


    # Enviar por correo
    enviar_email(nombre, correo, asunto, mensaje, empresa, telefono)
    # Redirección a página de éxito
    return RedirectResponse(url="/contacto?enviado=true", status_code=HTTP_302_FOUND)


    # Aquí puedes guardar en base de datos o enviar por correo
    #print("📩 Nuevo mensaje de contacto:")
    #print(f"Nombre: {nombre}")
    #print(f"Empresa: {empresa}")
    #print(f"Correo: {correo}")
    #print(f"Teléfono: {telefono}")
    #print(f"Asunto: {asunto}")
    #print(f"Mensaje: {mensaje}")

    