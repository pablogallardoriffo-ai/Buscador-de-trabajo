"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  ExternalLink,
  Bookmark,
  Check,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrButton } from "@/components/qr-button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export interface MatchRow {
  id: string;
  score: number;
  status: string;
  matched_skills: string[];
  job: {
    title: string | null;
    company_name: string | null;
    location: string | null;
    region: string | null;
    url: string | null;
    salary: string | null;
  } | null;
}

const STATUS_LABEL: Record<string, string> = {
  nueva: "Nueva",
  guardada: "Guardada",
  postulada: "Postulada",
  descartada: "Descartada",
};

function scoreBadge(score: number) {
  if (score >= 70) return "success" as const;
  if (score >= 45) return "default" as const;
  return "warning" as const;
}

function salaryText(salary: string | null): string {
  return salary && salary.trim() ? salary : "No especificado";
}

/** Botón para recalcular los matches (sin IA). */
export function RematchButton({ label = "Buscar ofertas" }: { label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    await fetch("/api/match", { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button variant="outline" size="sm" onClick={run} disabled={loading}>
      {loading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <RefreshCw size={16} />
      )}
      {label}
    </Button>
  );
}

const FILTERS = [
  { key: "activas", label: "Activas" },
  { key: "guardada", label: "Guardadas" },
  { key: "postulada", label: "Postuladas" },
  { key: "todas", label: "Todas" },
] as const;

export function MatchesTable({ matches }: { matches: MatchRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("activas");
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    const supabase = createClient();
    await supabase.from("matches").update({ status }).eq("id", id);
    router.refresh();
    setBusy(null);
  }

  const visible = matches.filter((m) => {
    if (filter === "todas") return true;
    if (filter === "activas")
      return m.status === "nueva" || m.status === "guardada";
    return m.status === filter;
  });

  function Actions({ m }: { m: MatchRow }) {
    return (
      <div className="flex items-center gap-1">
        <Link href={`/app/oferta/${m.id}`}>
          <Button
            variant="ghost"
            size="icon"
            title="Preparar postulación: consejos y carta con IA"
          >
            <Sparkles size={16} />
          </Button>
        </Link>
        {m.job?.url && <QrButton url={m.job.url} title={m.job.title} />}
        {m.job?.url && (
          <a href={m.job.url} target="_blank" rel="noreferrer">
            <Button
              variant="ghost"
              size="icon"
              title="Ver la oferta en el sitio oficial"
            >
              <ExternalLink size={16} />
            </Button>
          </a>
        )}
        <Button
          variant="ghost"
          size="icon"
          title="Guardar"
          disabled={busy === m.id}
          onClick={() => setStatus(m.id, "guardada")}
        >
          <Bookmark size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Marcar como postulada"
          disabled={busy === m.id}
          onClick={() => setStatus(m.id, "postulada")}
        >
          <Check size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Descartar"
          disabled={busy === m.id}
          onClick={() => setStatus(m.id, "descartada")}
        >
          <X size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <RematchButton label="Actualizar ofertas" />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          No hay ofertas en esta vista.
        </div>
      ) : (
        <>
          {/* Móvil: tarjetas */}
          <div className="space-y-3 md:hidden">
            {visible.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{m.job?.company_name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {m.job?.title ?? "—"}
                    </p>
                  </div>
                  <Badge variant={scoreBadge(m.score)}>{m.score}%</Badge>
                </div>
                <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  <p>📍 {m.job?.location ?? m.job?.region ?? "—"}</p>
                  <p>💰 {salaryText(m.job?.salary ?? null)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="neutral">
                    {STATUS_LABEL[m.status] ?? m.status}
                  </Badge>
                  <Actions m={m} />
                </div>
              </div>
            ))}
          </div>

          {/* Escritorio: tabla */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Cargo</th>
                  <th className="px-4 py-3 font-medium">Ubicación</th>
                  <th className="px-4 py-3 font-medium">Sueldo</th>
                  <th className="px-4 py-3 font-medium">Match</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      {m.job?.company_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">{m.job?.title ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {m.job?.location ?? m.job?.region ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {salaryText(m.job?.salary ?? null)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={scoreBadge(m.score)}>{m.score}%</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">
                        {STATUS_LABEL[m.status] ?? m.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Actions m={m} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
