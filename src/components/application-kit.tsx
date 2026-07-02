"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface KitData {
  tips: string[];
  cover_letter: string | null;
}

/** Consejos + carta de presentación de una oferta, con generación bajo demanda. */
export function ApplicationKitPanel({
  matchId,
  kit,
}: {
  matchId: string;
  kit: KitData | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/kit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo generar el kit. Intenta de nuevo.");
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  async function copyLetter() {
    if (!kit?.cover_letter) return;
    await navigator.clipboard.writeText(kit.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!kit) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Sparkles size={24} />
          </span>
          <h2 className="mt-4 text-lg font-semibold">
            Prepara tu postulación
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Generamos consejos para esta oferta y un borrador de carta de
            presentación a partir de tu CV.
          </p>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <Button className="mt-6" onClick={generate} disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            {loading ? "Generando…" : "Generar consejos y carta"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Consejos para postular</CardTitle>
          <CardDescription>
            Pensados para esta oferta y tu perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {kit.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {kit.cover_letter && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Carta de presentación</CardTitle>
              <CardDescription>
                Es un borrador: revísalo y dale tu toque antes de enviarlo.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={copyLetter}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copiada" : "Copiar"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-md bg-muted/40 p-4 text-sm leading-relaxed">
              {kit.cover_letter}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={generate} disabled={loading}>
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <RefreshCw size={16} />
          )}
          Volver a generar
        </Button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
