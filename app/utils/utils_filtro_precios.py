import re

# --- FUNCIONES AUXILIARES ---
def limpiar_precio(precio_str: str) -> float:
    """
    Limpia un precio en formato 'S/ 595.00' o 'S/ 3,940.50'
    y lo convierte en float.
    """
    if not precio_str:
        return 0.0
    precio_str = re.sub(r"[^\d,\.]", "", precio_str)  # elimina S/ o $
    precio_str = precio_str.replace(",", ".")         # cambia comas por puntos
    try:
        return float(precio_str)
    except ValueError:
        return 0.0

