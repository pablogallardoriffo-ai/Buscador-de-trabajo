import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApplicationKitPanel, type KitData } from "@/components/application-kit";
import { createClient } from "@/lib/supabase/server";

interface JobDetail {
  title: string;
  company_name: string | null;
  location: string | null;
  region: string | null;
  salary: string | null;
  description: string | null;
  url: string | null;
}

function scoreBadge(score: number) {
  if (score >= 70) return "success" as const;
  if (score >= 45) return "default" as const;
  return "warning" as const;
}

export default async function OfertaPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: match } = await supabase
    .from("matches")
    .select(
      "id, score, status, matched_skills, missing_skills, job:jobs(title, company_name, location, region, salary, description, url)"
    )
    .eq("id", matchId)
    .eq("user_id", user!.id)
    .maybeSingle();

  const job = (match?.job ?? null) as JobDetail | null;
  if (!match || !job) notFound();

  const { data: kitRow } = await supabase
    .from("application_kits")
    .select("tips, cover_letter")
    .eq("match_id", match.id)
    .maybeSingle();

  const kit: KitData | null = kitRow
    ? {
        tips: Array.isArray(kitRow.tips) ? (kitRow.tips as string[]) : [],
        cover_letter: kitRow.cover_letter,
      }
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Volver a tus ofertas
      </Link>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight">
                {job.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {job.company_name ?? "Empresa no especificada"}
              </p>
            </div>
            <Badge variant={scoreBadge(match.score ?? 0)}>
              {match.score ?? 0}% match
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} />
              {job.location ?? job.region ?? "Sin ubicación"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wallet size={15} />
              {job.salary?.trim() || "Sueldo no especificado"}
            </span>
          </div>

          {(match.matched_skills.length > 0 ||
            match.missing_skills.length > 0) && (
            <div className="mt-4 space-y-2">
              {match.matched_skills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Coincides en:
                  </span>
                  {match.matched_skills.map((s) => (
                    <Badge key={s} variant="success">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
              {match.missing_skills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    La oferta también pide:
                  </span>
                  {match.missing_skills.map((s) => (
                    <Badge key={s} variant="neutral">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {job.description && (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {job.description}
            </p>
          )}

          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block"
            >
              <Button variant="outline" size="sm">
                <ExternalLink size={16} />
                Ver la oferta en el sitio oficial
              </Button>
            </a>
          )}
        </CardContent>
      </Card>

      <ApplicationKitPanel matchId={match.id} kit={kit} />
    </div>
  );
}
