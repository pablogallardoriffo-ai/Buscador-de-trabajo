# Plan — Es Sencillo

Mercado inicial: **Chile**. Fuente de ofertas: **portales/APIs** (no scraping directo).
Diferenciador: solo mostramos ofertas con match real (calidad > cantidad).

## Fases

- [x] **Fase 0 — Base, auth y diseño**
  - Proyecto Next.js + Tailwind, sistema de diseño (paleta salvia/teal, estilo CRM)
  - Supabase: esquema completo + RLS + Storage privado para CVs
  - Auth por enlace mágico, rutas protegidas, armazón del panel

- [x] **Fase 1 — Subir CV + análisis IA**
  - Subida de PDF a Storage
  - Claude (Haiku 4.5) extrae competencias, estudios, experiencia, idiomas → `cv_data`
  - Selección de zona (regiones de Chile) + vista del perfil extraído
  - Pendiente: pegar `ANTHROPIC_API_KEY` para activar el análisis

- [~] **Fase 2 — Ingesta de ofertas (Chile)**
  - Ofertas de ejemplo cargadas (12, varias regiones/rubros) para demo
  - Pendiente: conectar fuente real (Jooble / SerpApi / BNE) tras investigación

- [x] **Fase 3 — Matching (sin IA, sin tokens)**
  - Motor propio: compara competencias del CV con el texto de la oferta
  - Score 0-100 + bonus por zona + umbral de calidad → `matches`
  - Opcional futuro: embeddings (Voyage) + re-ranking con Claude

- [x] **Fase 4 — Dashboard CRM**
  - Tabla con columnas: empresa, cargo, ubicación, % match, estado, link
  - Filtros y estados (nueva / guardada / postulada / descartada)

- [x] **Fase 5 — Consejos + carta de presentación**
  - Generación bajo demanda con Claude (Sonnet) → `application_kits`
  - Página de detalle por oferta (`/app/oferta/[matchId]`) con consejos,
    carta con botón de copiar y regeneración
  - Alternativa sin tokens (plantilla) cuando no hay `ANTHROPIC_API_KEY`

- [ ] **Fase 6 — Pulido, seguridad y deploy**
  - Borrado total de datos (Ley 19.628), revisión de advisors, deploy en Vercel

## Decisiones tomadas

- Nombre: **Es Sencillo**
- Auth: enlace mágico (sin contraseñas)
- Modelos: Claude Haiku 4.5 (parseo/scoring), Sonnet 4.6 (cartas/consejos)
- Embeddings: Voyage AI `voyage-3` (1024 dims), multilingüe

## Pendiente de validar

- Mejor fuente de ofertas para Chile (Fase 2).
- Confirmar proveedor de embeddings (Voyage requiere su propia API key).

## Infraestructura

- Supabase: proyecto `es-sencillo` (ref `tnntcngconuhyzfavibz`, región sa-east-1)
- Vercel: equipo `pablogallardoriffo-3032s-projects` (deploy en Fase 6 o antes para pruebas)
