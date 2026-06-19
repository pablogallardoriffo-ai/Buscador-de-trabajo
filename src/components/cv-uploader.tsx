"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { CHILE_REGIONS } from "@/lib/regions";

type Status = "idle" | "uploading" | "parsing" | "error";

export function CvUploader({ defaultRegion }: { defaultRegion?: string | null }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [region, setRegion] = useState(defaultRegion ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) return setError("Selecciona tu CV en PDF.");
    if (file.type !== "application/pdf")
      return setError("El archivo debe ser un PDF.");
    if (file.size > 10 * 1024 * 1024)
      return setError("El PDF no puede superar los 10 MB.");
    if (!region) return setError("Selecciona la zona donde buscas trabajo.");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setError("Tu sesión expiró. Vuelve a entrar.");

    try {
      setStatus("uploading");
      const path = `${user.id}/${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("cvs")
        .upload(path, file, { contentType: "application/pdf" });
      if (upErr) throw upErr;

      // Desactiva CVs anteriores y registra el nuevo.
      await supabase
        .from("cvs")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);

      const { data: cv, error: insErr } = await supabase
        .from("cvs")
        .insert({
          user_id: user.id,
          file_path: path,
          file_name: file.name,
          status: "pending",
          is_active: true,
        })
        .select("id")
        .single();
      if (insErr || !cv) throw insErr ?? new Error("No se pudo guardar el CV");

      await supabase
        .from("profiles")
        .update({ region, onboarded: true })
        .eq("id", user.id);

      setStatus("parsing");
      const res = await fetch("/api/cv/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId: cv.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo analizar el CV");
      }

      // Calcula las ofertas con match (sin IA).
      await fetch("/api/match", { method: "POST" });

      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
      setStatus("error");
    }
  }

  const busy = status === "uploading" || status === "parsing";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="cv">Tu CV en PDF</Label>
        <input
          id="cv"
          type="file"
          accept="application/pdf"
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-[#d9e8e2]"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="region">¿En qué zona buscas trabajo?</Label>
        <select
          id="region"
          value={region}
          disabled={busy}
          onChange={(e) => setRegion(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          <option value="">Selecciona una región…</option>
          {CHILE_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            {status === "uploading" ? "Subiendo CV…" : "La IA está leyendo tu CV…"}
          </>
        ) : (
          <>
            <Upload size={18} />
            Subir y analizar mi CV
          </>
        )}
      </Button>
    </form>
  );
}
