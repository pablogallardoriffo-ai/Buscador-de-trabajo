import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/** Cliente de Supabase para Server Components, Route Handlers y Server Actions. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Invocado desde un Server Component: el refresco de sesion
            // lo gestiona el middleware. Se puede ignorar.
          }
        },
      },
    }
  );
}

/**
 * Cliente con privilegios de servicio (omite RLS).
 * USAR SOLO en el servidor para tareas de backend (ingesta de ofertas,
 * creación de cuentas confirmadas, etc.). La service role key es secreta
 * de verdad (a diferencia de la URL/anon key) y debe venir siempre de
 * una variable de entorno — nunca hardcodeada en el repo.
 */
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "Falta la variable SUPABASE_SERVICE_ROLE_KEY en este despliegue (Vercel → Settings → Environment Variables)."
    );
  }
  const { createClient } = require("@supabase/supabase-js");
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });
}
