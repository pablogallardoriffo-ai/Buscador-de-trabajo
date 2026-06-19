# Plan — Es Sencillo

Mercado inicial: **Chile**. Fuente de ofertas: **portales/APIs** (no scraping directo).
Diferenciador: solo mostramos ofertas con match real (calidad > cantidad).

## Fases

- [x] **Fase 0 — Base, auth y diseño**
  - Proyecto Next.js + Tailwind, sistema de diseño (paleta salvia/teal, estilo CRM)
  - Supabase: esquema completo + RLS + Storage privado para CVs
  - Auth por enlace mágico, rutas protegidas, armazón del panel

- [ ] **Fase 1 — Subir CV + análisis IA**
  - Subida de PDF a Storage
  - Claude extrae competencias, estudios, experiencia, idiomas → `cv_data`
  - Vista de perfil editable y selección de zona

- [ ] **Fase 2 — Ingesta de ofertas (Chile)**
  - Validar y conectar fuente (Jooble / SerpApi / BNE) tras pequeña investigación
  - Interfaz `JobProvider` intercambiable + deduplicación en `jobs`

- [ ] **Fase 3 — Matching**
  - Embeddings (Voyage AI, multilingüe) + búsqueda vectorial pgvector
  - Re-ranking y scoring con Claude → `matches` (score + porqué + skills)

- [ ] **Fase 4 — Dashboard CRM**
  - Tabla con columnas: empresa, ubicación, cargo, % match, fecha, link, estado
  - Filtros y estados (nueva / guardada / postulada / descartada)

- [ ] **Fase 5 — Consejos + carta de presentación**
  - Generación bajo demanda con Claude → `application_kits`

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
