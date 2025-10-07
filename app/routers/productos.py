from fastapi import APIRouter
from fastapi.responses import JSONResponse
import json
import os
from pathlib import Path

router = APIRouter(prefix="/productos")

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "productos.json"

@router.get("/api/productos", tags=["Productos"])
def get_productos():
    
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as archivo:
            productos = json.load(archivo)
        return productos
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})












