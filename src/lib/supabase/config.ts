/**
 * Configuración pública de Supabase (proyecto es-sencillo).
 *
 * La URL y la clave "anon"/"publishable" NO son secretas — están
 * diseñadas para viajar al navegador (la seguridad real la da RLS).
 * Por eso llevan un valor por defecto: así la app funciona aunque
 * las variables de entorno en Vercel no queden bien configuradas.
 * Si NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY están
 * definidas, esas tienen prioridad.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tnntcngconuhyzfavibz.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_5w_xUaNtn94gyLmQ45Kumg_BSYmj3TR";
