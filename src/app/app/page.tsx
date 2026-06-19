import Link from "next/link";
import { Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, status")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .maybeSingle();

  const { count: matchCount } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tus ofertas</h1>
        <p className="text-sm text-muted-foreground">
          Aquí verás solo las ofertas donde de verdad encajas.
        </p>
      </div>

      {!cv ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Upload size={24} />
            </span>
            <h2 className="mt-4 text-lg font-semibold">
              Empieza subiendo tu CV
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              La IA leerá tu PDF y, en breve, buscará las ofertas que mejor
              encajan contigo. Es sencillo.
            </p>
            <Link href="/app/cv" className="mt-6">
              <Button size="lg">Subir mi CV</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (matchCount ?? 0) === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Sparkles size={24} />
            </span>
            <h2 className="mt-4 text-lg font-semibold">
              Estamos preparando tus coincidencias
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Tu CV está {cv.status === "parsed" ? "listo" : "procesándose"}. El
              buscador de ofertas con match llegará muy pronto.
            </p>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          Tienes {matchCount} coincidencias. (La tabla CRM llega en la Fase 4.)
        </p>
      )}
    </div>
  );
}
