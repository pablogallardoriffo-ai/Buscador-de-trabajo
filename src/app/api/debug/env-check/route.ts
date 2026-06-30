import { NextResponse } from "next/server";

/**
 * Diagnóstico temporal: confirma qué variables de entorno están
 * disponibles en este despliegue, SIN exponer ningún valor secreto.
 * Borrar una vez resuelto el problema de configuración en Vercel.
 */
export async function GET() {
  return NextResponse.json({
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasSupabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
