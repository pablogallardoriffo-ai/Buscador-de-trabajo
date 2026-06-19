"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  ExternalLink,
  Bookmark,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
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

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Cargo</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Ubicación
              </th>
              <th className="px-4 py-3 font-medium">Match</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                Estado
              </th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No hay ofertas en esta vista.
                </td>
              </tr>
            )}
            {visible.map((m) => (
              <tr
                key={m.id}
                className="border-b border-border last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-medium">
                  {m.job?.company_name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {m.job?.title ?? "—"}
                  {m.job?.salary && (
                    <span className="block text-xs text-muted-foreground">
                      {m.job.salary}
                    </span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                  {m.job?.location ?? m.job?.region ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={scoreBadge(m.score)}>{m.score}%</Badge>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <Badge variant="neutral">
                    {STATUS_LABEL[m.status] ?? m.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {m.job?.url && (
                      <a href={m.job.url} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="icon" title="Ver oferta">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
