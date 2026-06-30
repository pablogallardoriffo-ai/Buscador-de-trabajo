import Link from "next/link";
import { Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MatchesTable, RematchButton, type MatchRow } from "@/components/matches";
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

  const { data: matchesRaw } = await supabase
    .from("matches")
    .select(
      "id, score, status, matched_skills, job:jobs(title, company_name, location, region, url, salary)"
    )
    .eq("user_id", user!.id)
    .order("score", { ascending: false });

  const matches = (matchesRaw ?? []) as unknown as MatchRow[];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tus ofertas</h1>
        <p className="text-sm text-muted-foreground">
          Solo las ofertas donde de verdad encajas. Calidad sobre cantidad. El
          enlace de cada oferta lleva al sitio oficial de "Trabaja con
          nosotros" de la empresa — ahí confirmas la vacante vigente.
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
              Leemos tu PDF y buscamos las ofertas que mejor encajan contigo.
              Es sencillo.
            </p>
            <Link href="/app/cv" className="mt-6">
              <Button size="lg">Subir mi CV</Button>
            </Link>
          </CardContent>
        </Card>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Sparkles size={24} />
            </span>
            <h2 className="mt-4 text-lg font-semibold">
              Aún no encontramos coincidencias
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {cv.status === "parsed"
                ? "Pulsa para buscar ofertas que encajen con tu perfil."
                : "Tu CV se está procesando. Vuelve en un momento."}
            </p>
            <div className="mt-6">
              <RematchButton />
            </div>
          </CardContent>
        </Card>
      ) : (
        <MatchesTable matches={matches} />
      )}
    </div>
  );
}
