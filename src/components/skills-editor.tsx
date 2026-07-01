"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { SKILL_KEYWORDS } from "@/lib/cv-keywords";
import { normalize } from "@/lib/text";

/** Permite al usuario corregir sus competencias y recalcular sus ofertas. */
export function SkillsEditor({
  cvId,
  initialSkills,
}: {
  cvId: string;
  initialSkills: string[];
}) {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const present = useMemo(
    () => new Set(skills.map((s) => normalize(s))),
    [skills]
  );

  // Sugerencias del diccionario que el usuario aún no tiene.
  const suggestions = useMemo(
    () => SKILL_KEYWORDS.filter((s) => !present.has(normalize(s))).slice(0, 15),
    [present]
  );

  function add(raw: string) {
    const value = raw.trim();
    if (!value || present.has(normalize(value))) return;
    setSkills((prev) => [...prev, value]);
    setInput("");
    setStatus("idle");
  }

  function remove(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
    setStatus("idle");
  }

  async function save() {
    setStatus("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("cv_data")
      .update({ skills })
      .eq("cv_id", cvId);
    if (error) {
      setStatus("idle");
      return;
    }
    // Recalcula las ofertas con las competencias corregidas.
    await fetch("/api/match", { method: "POST" });
    setStatus("saved");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay competencias todavía. Agrega las tuyas abajo.
          </p>
        )}
        {skills.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary"
          >
            {s}
            <button
              onClick={() => remove(s)}
              aria-label={`Quitar ${s}`}
              className="hover:text-danger"
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(input);
            }
          }}
          placeholder="Agrega una competencia y presiona Enter"
        />
        <Button type="button" variant="outline" onClick={() => add(input)}>
          <Plus size={16} /> Agregar
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs text-muted-foreground">
            Sugerencias (toca para agregar):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => add(s)}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={status === "saving"}>
          {status === "saving" ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Guardando…
            </>
          ) : (
            "Guardar y actualizar ofertas"
          )}
        </Button>
        {status === "saved" && (
          <span className="inline-flex items-center gap-1 text-sm text-success">
            <Check size={16} /> Guardado. Revisa tus ofertas.
          </span>
        )}
      </div>
    </div>
  );
}
