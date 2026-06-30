import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Crea una cuenta ya confirmada (sin depender del envío de email).
 * El cliente inicia sesión inmediatamente después con la misma contraseña.
 */
export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));

  if (!email || !password || String(password).length < 6) {
    return NextResponse.json(
      { error: "Correo y contraseña (mínimo 6 caracteres) son requeridos." },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const friendly = error.message.includes("already been registered")
      ? "Ese correo ya tiene una cuenta. Inicia sesión."
      : error.message;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
