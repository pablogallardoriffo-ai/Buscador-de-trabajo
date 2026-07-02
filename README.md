# Es Sencillo

> **Encontrar trabajo, sencillo.** Sube tu CV y te mostramos solo las ofertas donde de verdad encajas — con consejos y un borrador de carta de presentación para cada una. Calidad sobre cantidad.

Plataforma tipo CRM, pensada para Chile, con un estilo sobrio y colores que relajan. El cliente que la usa busca trabajo para él y su familia: nada de saturar con cientos de ofertas inútiles.

## Stack

- **Next.js 16** (App Router) — frontend + backend, desplegado en **Vercel**
- **Supabase** — Postgres, Auth (enlace mágico), Storage (PDFs) y RLS
- **pgvector** — búsqueda semántica para el match
- **Claude** (Anthropic) — lectura del CV, scoring del match, consejos y cartas
- **Tailwind CSS v4** + componentes propios

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # rellena las claves
npm run dev
```

Abre http://localhost:3000

### Variables de entorno

Ver `.env.example`. Las imprescindibles para arrancar:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — ya configuradas para el proyecto `es-sencillo`.
- `SUPABASE_SERVICE_ROLE_KEY` — desde Supabase → Settings → API (solo servidor).
- `ANTHROPIC_API_KEY` — para el análisis del CV (Fase 1).
- `VOYAGE_API_KEY`, `JOOBLE_API_KEY` — fases posteriores.

## Estructura

```
src/
  app/
    page.tsx            Landing pública
    login/              Acceso por enlace mágico
    auth/               Callback y cierre de sesión
    app/                Panel privado (CRM)
      page.tsx          Ofertas (dashboard)
      oferta/[matchId]/ Detalle de la oferta + consejos y carta con IA
      cv/               Subir y ver el CV
      perfil/           Datos de cuenta y zona
  components/           UI (botones, tarjetas, sidebar, marca)
  lib/supabase/         Clientes (browser/server) y tipos de la BD
  middleware.ts         Refresco de sesión y protección de rutas
```

## Base de datos

Tablas: `profiles`, `cvs`, `cv_data`, `jobs`, `matches`, `application_kits`.
Todo con RLS: cada usuario solo accede a sus datos. Las ofertas (`jobs`) son
compartidas y solo el backend (service role) las escribe.

## Hoja de ruta

Ver [PLAN.md](./PLAN.md). Estado actual: **Fase 5 completada** — subir CV con
análisis IA, matching, dashboard CRM y kit de postulación (consejos + carta de
presentación) por oferta. Falta la fuente definitiva de ofertas (Fase 2) y el
pulido final + deploy (Fase 6).
