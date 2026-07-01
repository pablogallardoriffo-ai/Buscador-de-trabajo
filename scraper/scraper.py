"""
Módulo de web scraping con Playwright en modo "stealth".

Abre cada página de empleos, obtiene el texto visible y los enlaces, y usa la
IA para extraer las vacantes (robusto ante páginas con estructuras distintas).
"""
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright
from ai import ask_json
from prompts import EXTRACTION_SYSTEM

# Script que oculta señales típicas de automatización (stealth manual, sin
# dependencias frágiles). Reduce bloqueos básicos.
STEALTH_JS = """
Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
Object.defineProperty(navigator, 'languages', {get: () => ['es-CL', 'es']});
Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
window.chrome = { runtime: {} };
"""

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)


def _collect_links(page, base_url: str, limit: int = 120):
    """Recolecta (texto, href absoluto) de los enlaces de la página."""
    links = []
    for a in page.locator("a").all()[:limit]:
        try:
            href = a.get_attribute("href")
            text = (a.inner_text() or "").strip()
            if href:
                links.append({"texto": text[:80], "href": urljoin(base_url, href)})
        except Exception:
            continue
    return links


def scrape_site(empresa: str, url: str) -> list[dict]:
    """Devuelve una lista de ofertas {empresa, cargo, descripcion, link}."""
    print(f"  → Revisando {empresa}: {url}")
    ofertas: list[dict] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
        )
        context = browser.new_context(
            user_agent=USER_AGENT,
            locale="es-CL",
            viewport={"width": 1366, "height": 900},
        )
        context.add_init_script(STEALTH_JS)
        page = context.new_page()

        try:
            page.goto(url, wait_until="networkidle", timeout=45000)
            page.wait_for_timeout(2500)  # deja cargar contenido dinámico
            body_text = page.locator("body").inner_text()[:12000]
            links = _collect_links(page, url)
        except Exception as e:
            print(f"    ⚠ No se pudo cargar: {e}")
            browser.close()
            return []

        browser.close()

    # La IA extrae las vacantes del texto + enlaces.
    payload = (
        f"EMPRESA: {empresa}\nURL: {url}\n\n"
        f"TEXTO VISIBLE DE LA PÁGINA:\n{body_text}\n\n"
        f"ENLACES DETECTADOS (texto -> href):\n"
        + "\n".join(f"{l['texto']} -> {l['href']}" for l in links[:80])
    )

    try:
        data = ask_json(EXTRACTION_SYSTEM, payload, max_tokens=3000)
    except Exception as e:
        print(f"    ⚠ Error de IA al extraer: {e}")
        return []

    for o in (data or {}).get("ofertas", []):
        cargo = (o.get("cargo") or "").strip()
        if not cargo:
            continue
        # En portales agregadores, la empresa viene por aviso; si no, la del sitio.
        empresa_oferta = (o.get("empresa") or "").strip() or empresa
        ofertas.append(
            {
                "empresa": empresa_oferta[:120],
                "cargo": cargo[:200],
                "descripcion": (o.get("descripcion") or "").strip()[:400],
                "link": (o.get("link") or url).strip(),
            }
        )

    print(f"    ✓ {len(ofertas)} vacantes detectadas")
    return ofertas
