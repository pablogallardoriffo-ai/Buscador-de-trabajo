"""Configuración del bot: sitios objetivo, umbrales y modelo."""
import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-haiku-4-5")
MATCH_THRESHOLD = int(os.getenv("MATCH_THRESHOLD", "75"))

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
TARGET_USER_EMAIL = os.getenv("TARGET_USER_EMAIL", "")

# CV: por variable de entorno (útil para la ejecución automática en CI) o,
# si está vacío, desde el archivo cv.txt.
CV_TEXT = os.getenv("CV_TEXT", "")
CV_PATH = os.path.join(os.path.dirname(__file__), "cv.txt")

# Salida Excel
EXCEL_PATH = os.path.join(os.path.dirname(__file__), "ofertas_match.xlsx")

# ---------------------------------------------------------------------------
# Empresas / portales a revisar. Cada entrada: nombre + URL de la sección de
# empleos ("Trabaja con nosotros"). Agrega/quita libremente.
#
# Consejo profesional: muchas empresas chilenas publican en unas pocas
# plataformas (trabajando.cl, Pandapé/Computrabajo, AIRA...). Apuntar a esas
# páginas de listado cubre muchas empresas de forma más estable.
# ---------------------------------------------------------------------------
TARGET_SITES = [
    # --- Portales que AGREGAN muchas empresas (mayor cobertura por URL) ---
    # Cada búsqueda lista decenas de avisos de empresas distintas con link
    # directo. Ajusta las palabras/comuna a tu perfil.
    {"empresa": "Portal Computrabajo", "url": "https://cl.computrabajo.com/trabajo-de-ingeniero-industrial"},
    {"empresa": "Portal Computrabajo", "url": "https://cl.computrabajo.com/trabajo-de-administracion"},
    {"empresa": "Portal Computrabajo", "url": "https://cl.computrabajo.com/trabajo-de-logistica-en-valparaiso"},

    # --- Empresas puntuales ("Trabaja con nosotros") ---
    {"empresa": "Falabella", "url": "http://www.trabajos.falabella.cl/falabella/ofertas-laborales"},
    {"empresa": "Cencosud", "url": "https://cencosud.trabajando.cl/trabajo-empleo"},
    {"empresa": "Walmart Chile", "url": "https://walmart.trabajando.cl/trabajo-empleo"},
    {"empresa": "BancoEstado", "url": "https://bancoestado.trabajando.cl/trabajo-empleo"},
    {"empresa": "Chilexpress", "url": "https://chilexpress.trabajando.cl/trabajo-empleo"},
]
