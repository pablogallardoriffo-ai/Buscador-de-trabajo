# 🤖 Bot de búsqueda de empleo — Es Sencillo

Bot que recorre secciones de **"Trabaja con nosotros"** / portales de empleo,
extrae las vacantes, evalúa el **match con tu CV** usando IA y te entrega los
resultados en **Excel** y en el **panel de Es Sencillo**.

> ⚠️ Este bot corre en **tu computador o un servidor** (usa un navegador real),
> NO en Vercel. Es un módulo aparte de la web app; se conectan por la base de
> datos (Supabase).

## Estructura

```
scraper/
  main.py         Orquesta todo el flujo
  scraper.py      Módulo 1: web scraping (Playwright stealth) + extracción IA
  matcher.py      Módulo 2: match del CV vs oferta (IA) → JSON
  sink.py         Módulo 3: salida a Excel y a la plataforma (Supabase)
  ai.py           Cliente de Claude + parseo robusto de JSON
  prompts.py      System prompts (extracción y match)
  config.py       Sitios objetivo, umbral, modelo
  cv.txt          Tu CV en texto plano (créalo desde cv.example.txt)
  requirements.txt
  .env            Tus claves (créalo desde .env.example)
```

## Instalación

```bash
cd scraper
python -m venv .venv && source .venv/bin/activate   # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium

cp .env.example .env          # y completa ANTHROPIC_API_KEY
cp cv.example.txt cv.txt      # y pega el texto de tu CV
```

## Uso

```bash
python main.py
```

El bot:
1. Recorre las empresas de `config.py` (`TARGET_SITES`) — agrega/quita las que quieras.
2. Extrae las vacantes de cada página.
3. Evalúa el match de tu CV con cada oferta.
4. Guarda las que superan el umbral (`MATCH_THRESHOLD`, por defecto 75%) en
   `ofertas_match.xlsx` y, si configuraste Supabase, en tu panel de Es Sencillo.

## Columnas del Excel

`Nombre de la Empresa` · `Nombre del Cargo` · `Porcentaje de Match (%)` ·
`Razón` · `Link Directo a la postulación`

## Ejemplo del System Prompt de match (el que envía el código a la IA)

Está en `prompts.py` (`MATCH_SYSTEM`). Resumido:

> Eres un reclutador técnico experto en el mercado laboral chileno. Evalúas la
> compatibilidad entre el CV de un candidato y una oferta. Considera rubro,
> competencias técnicas y analíticas, experiencia y formación. Devuelve SOLO un
> JSON: `{"match": <0-100>, "razon": "máx 2 líneas"}`.

## Notas honestas (léelas)

- **Fragilidad:** cada sitio es distinto y muchos bloquean bots o cambian su
  HTML. Por eso la extracción la hace la IA sobre el texto de la página (más
  robusto que selectores fijos), pero aun así habrá sitios que fallen.
- **Cobertura real:** apuntar a plataformas que agregan muchas empresas
  (trabajando.cl, Pandapé/Computrabajo, AIRA…) rinde más que 1.000 scrapers a
  medida. Varias de las URLs de ejemplo ya son de esas plataformas.
- **Costo IA:** cada extracción y cada match consumen tokens (fracciones de
  centavo con Haiku). Con muchas ofertas, revisa tu tope de gasto en Anthropic.
- **Legal/ético:** respeta los términos de cada sitio y no lo ejecutes de forma
  masiva/agresiva.
- **Programarlo:** para que corra solo cada día, usa `cron` (Linux/Mac) o el
  Programador de tareas (Windows), o un servidor.
