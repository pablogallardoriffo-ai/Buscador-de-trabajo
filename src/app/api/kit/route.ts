import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateApplicationKit,
  type KitCandidate,
} from "@/lib/application-kit";

export const maxDuration = 60;

/**
 * Genera (o regenera) el kit de postulación de un match: consejos + carta
 * de presentación. Usa Claude (Sonnet) si hay API key; si no, plantilla.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { matchId } = await request.json().catch(() => ({ matchId: null }));
  if (!matchId) {
    return NextResponse.json({ error: "Falta matchId" }, { status: 400 });
  }

  // El match debe pertenecer al usuario (RLS lo refuerza igualmente).
  const { data: match } = await supabase
    .from("matches")
    .select(
      "id, cv_id, matched_skills, missing_skills, job:jobs(title, company_name, location, description)"
    )
    .eq("id", matchId)
    .eq("user_id", user.id)
    .maybeSingle();

  const job = (match?.job ?? null) as {
    title: string;
    company_name: string | null;
    location: string | null;
    description: string | null;
  } | null;

  if (!match || !job) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  }

  // Datos del CV con el que se calculó el match (o el activo como respaldo).
  let cvQuery = supabase
    .from("cv_data")
    .select("full_name, headline, summary, seniority, skills, experience")
    .eq("user_id", user.id);
  if (match.cv_id) cvQuery = cvQuery.eq("cv_id", match.cv_id);
  const { data: cvData } = await cvQuery
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!cvData) {
    return NextResponse.json(
      { error: "Aún no has subido un CV analizado" },
      { status: 400 }
    );
  }

  const candidate: KitCandidate = {
    full_name: cvData.full_name ?? "",
    headline: cvData.headline ?? "",
    summary: cvData.summary ?? "",
    seniority: cvData.seniority ?? "",
    skills: cvData.skills ?? [],
    experience:
      (cvData.experience as KitCandidate["experience"] | null) ?? [],
  };

  try {
    const { kit, usedAi } = await generateApplicationKit(candidate, {
      title: job.title,
      company_name: job.company_name,
      location: job.location,
      description: job.description,
      matched_skills: match.matched_skills ?? [],
      missing_skills: match.missing_skills ?? [],
    });

    const { error: upsertError } = await supabase
      .from("application_kits")
      .upsert(
        {
          match_id: match.id,
          user_id: user.id,
          tips: kit.tips,
          cover_letter: kit.cover_letter,
        },
        { onConflict: "match_id" }
      );
    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, kit, usedAi });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al generar el kit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
