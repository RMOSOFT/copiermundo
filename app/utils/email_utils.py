import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

# Cargar variables del archivo .env
load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def enviar_email(nombre, correo, asunto, mensaje, empresa="", telefono=""):
    email = EmailMessage()
    email['Subject'] = f"[CONTACTO WEB] {asunto}"
    email['From'] = correo
    email['To'] = EMAIL_USER
    email.set_content(f"""
    Nombre: {nombre}
    Empresa: {empresa}
    Correo: {correo}
    Teléfono: {telefono}
    Asunto: {asunto}
    Mensaje:
    {mensaje}
    """)
    with smtplib.SMTP_SSL(os.getenv("EMAIL_HOST"), int(os.getenv("EMAIL_PORT"))) as smtp:
        smtp.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASS"))
        smtp.send_message(email)

#Enviar por correo con todos los datos
#enviar_email(nombre, correo, asunto, mensaje, empresa, telefono)