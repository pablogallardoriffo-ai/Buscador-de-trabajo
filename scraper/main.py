"""
Bot de búsqueda de empleo — orquestador.

Flujo:
  1. Recorre las páginas de "Trabaja con nosotros" (config.TARGET_SITES)
  2. Extrae las vacantes (Playwright + IA)
  3. Evalúa el match contra tu CV (IA)
  4. Filtra > umbral y exporta a Excel + a tu panel de Es Sencillo

Uso:
    python main.py
"""
import os
import sys
from config import (
    CV_PATH,
    CV_TEXT,
    MATCH_THRESHOLD,
    TARGET_SITES,
    ANTHROPIC_API_KEY,
)
from scraper import scrape_site
from matcher import evaluar_match
from sink import export_excel, push_to_platform


def cargar_cv() -> str:
    # 1) Variable de entorno CV_TEXT (para la ejecución automática en CI).
    if CV_TEXT.strip():
        return CV_TEXT.strip()
    # 2) Archivo cv.txt (para uso local).
    if not os.path.exists(CV_PATH):
        sys.exit(
            f"Falta tu CV: define CV_TEXT o crea {CV_PATH} con el texto de tu CV."
        )
    with open(CV_PATH, encoding="utf-8") as f:
        cv = f.read().strip()
    if len(cv) < 50:
        sys.exit("El CV está casi vacío. Pega el contenido real en cv.txt.")
    return cv


def main() -> None:
    if not ANTHROPIC_API_KEY:
        sys.exit("Falta ANTHROPIC_API_KEY. Copia .env.example a .env y complétalo.")

    cv = cargar_cv()
    print(f"🤖 Bot iniciado. Umbral de match: {MATCH_THRESHOLD}%\n")

    todas_las_ofertas: list[dict] = []
    print("1) Extrayendo vacantes…")
    for site in TARGET_SITES:
        try:
            todas_las_ofertas.extend(scrape_site(site["empresa"], site["url"]))
        except Exception as e:
            print(f"    ⚠ Error en {site['empresa']}: {e}")

    print(f"\n2) Evaluando match de {len(todas_las_ofertas)} ofertas…")
    seleccionadas: list[dict] = []
    for oferta in todas_las_ofertas:
        resultado = evaluar_match(cv, oferta)
        if resultado and resultado["match"] >= MATCH_THRESHOLD:
            seleccionadas.append(resultado)
            print(f"    ✓ {resultado['match']}% — {resultado['empresa']}: {resultado['cargo']}")

    print(f"\n3) {len(seleccionadas)} ofertas superan el {MATCH_THRESHOLD}%.")
    if not seleccionadas:
        print("No hubo ofertas sobre el umbral. Ajusta MATCH_THRESHOLD o agrega sitios.")
        return

    export_excel(seleccionadas)
    push_to_platform(seleccionadas)
    print("\n🎉 Listo.")


if __name__ == "__main__":
    main()
