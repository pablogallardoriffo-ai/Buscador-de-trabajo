"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-5xl px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-20">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8">
            {status === "sent" ? (
              <div className="text-center">
                <h1 className="text-xl font-semibold">Revisa tu correo</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Te enviamos un enlace a <strong>{email}</strong>. Ábrelo desde
                  este dispositivo para entrar. Puedes cerrar esta pestaña.
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-semibold">Entra o regístrate</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Sin contraseñas. Te enviamos un enlace seguro a tu correo.
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="tucorreo@ejemplo.cl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-danger">{error}</p>}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={status === "loading"}
                  >
                    {status === "loading"
                      ? "Enviando..."
                      : "Enviarme el enlace"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
