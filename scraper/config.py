"""Configuración del bot: sitios objetivo, umbrales y modelo."""
import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-haiku-4-5")
MATCH_THRESHOLD = int(os.getenv("MATCH_THRESHOLD", "75"))

# Para una primera prueba rápida/barata: revisa solo los primeros N sitios.
# Déjalo en 0 para revisar todos.
MAX_SITES = int(os.getenv("MAX_SITES", "0"))

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
# ---------------------------------------------------------------------------
# SOLO páginas OFICIALES de empresas ("Trabaja con nosotros" / portal propio
# de la empresa). NADA de agregadores tipo Computrabajo/Indeed.
# Agrega todas las empresas que quieras seguir (Chile e internacionales).
# ---------------------------------------------------------------------------
TARGET_SITES = [
    # =====================================================================
    # CHILE — páginas oficiales "Trabaja con nosotros"
    # =====================================================================
    {"empresa": "Falabella", "url": "http://www.trabajos.falabella.cl/falabella/ofertas-laborales"},
    {"empresa": "Cencosud", "url": "https://empleos.cencosud.com/"},
    {"empresa": "Walmart Chile", "url": "https://odin.trabajaenwalmart.cl/trabaja-con-nosotros-en-nuestros-supermercados"},
    {"empresa": "Codelco", "url": "https://www.codelco.com/trabaja-en-codelco"},
    {"empresa": "Komatsu Cummins", "url": "https://www.komatsucummins.cl/trabaja-con-nosotros/"},
    {"empresa": "BancoEstado", "url": "https://bancoestado.trabajando.cl/"},
    {"empresa": "Chilexpress", "url": "https://chilexpress.trabajando.cl/"},
    {"empresa": "Sodexo Chile", "url": "https://cl.sodexo.com/trabaja-con-nosotros/"},
    {"empresa": "Clínica Alemana", "url": "https://trabajos.alemana.cl/"},
    {"empresa": "Betterfly", "url": "https://careers.betterfly.com/"},

    # =====================================================================
    # LATAM — empresas grandes con roles de Proyectos / Datos / BI / Automatización
    # (páginas de carreras oficiales; muchas ofrecen posiciones remotas)
    # =====================================================================
    {"empresa": "Mercado Libre", "url": "https://careers-meli.mercadolibre.com/en"},
    {"empresa": "Globant", "url": "https://career.globant.com/"},
    {"empresa": "LATAM Airlines", "url": "https://www.latamairlines.com/cl/es/trabaja-con-nosotros"},

    # =====================================================================
    # US / EUROPA — remoto global (Gestión de Proyectos, Datos, Automatización)
    # Empresas 100% remotas: publican cargos abiertos a Latinoamérica.
    # =====================================================================
    {"empresa": "GitLab", "url": "https://about.gitlab.com/jobs/all-jobs/"},
    {"empresa": "Zapier", "url": "https://zapier.com/jobs"},
    {"empresa": "Automattic", "url": "https://automattic.com/work-with-us/"},
]
