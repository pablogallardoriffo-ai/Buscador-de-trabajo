import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { scoreJob, type Candidate } from "@/lib/matching";
import { inferCategories, categoryLabel } from "@/lib/categories";
import { fetchJoobleJobs } from "@/lib/jobs/jooble";

export const maxDuration = 60;

/** Trae ofertas reales y vigentes de Jooble para el perfil y las guarda. */
async function ingestLiveJobs(candidate: Candidate, desiredRole: string | null) {
  if (!process.env.JOOBLE_API_KEY) return;

  const keywords =
    desiredRole ||
    (candidate.categories[0] ? categoryLabel(candidate.categories[0]) : "") ||
    candidate.skills.slice(0, 3).join(" ") ||
    "trabajo";
  const location = candidate.region || "Chile";

  const jobs = await fetchJoobleJobs(keywords, location);
  if (jobs.length === 0) return;

  // La tabla jobs solo la escribe el backend (service role omite RLS).
  const service = createServiceClient();
  await service
    .from("jobs")
    .upsert(jobs, { onConflict: "source,source_id", ignoreDuplicates: false });
}

type EducationItem = { degree?: string; field?: string; institution?: string };
type ExperienceItem = { role?: string; company?: string; description?: string };

/** Calcula los matches del usuario contra las ofertas disponibles. Sin IA. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // CV activo + datos detectados.
  const { data: cv } = await supabase
    .from("cvs")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!cv) {
    return NextResponse.json({ error: "Aún no has subido un CV" }, { status: 400 });
  }

  const { data: cvData } = await supabase
    .from("cv_data")
    .select("skills, full_name, headline, summary, desired_role, seniority, education, experience")
    .eq("cv_id", cv.id)
    .maybeSingle();

  const skills = cvData?.skills ?? [];
  if (skills.length === 0) {
    return NextResponse.json({ ok: true, count: 0 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("region")
    .eq("id", user.id)
    .maybeSingle();

  // Perfil del candidato: competencias + rubros inferidos de todo el CV.
  const education = (cvData?.education as EducationItem[] | null) ?? [];
  const experience = (cvData?.experience as ExperienceItem[] | null) ?? [];
  const profileText = [
    skills.join(" "),
    cvData?.full_name,
    cvData?.headline,
    cvData?.summary,
    cvData?.desired_role,
    ...education.map((e) => `${e.degree ?? ""} ${e.field ?? ""}`),
    ...experience.map((e) => `${e.role ?? ""} ${e.description ?? ""}`),
  ]
    .filter(Boolean)
    .join(" ");

  const candidate: Candidate = {
    skills,
    categories: inferCategories(profileText),
    region: profile?.region ?? null,
  };

  // Trae ofertas reales y vigentes de Jooble para este perfil (si hay API key).
  await ingestLiveJobs(candidate, cvData?.desired_role ?? null);

  // Ofertas a evaluar: curadas (siempre) + de Jooble recientes (últimos 45 días,
  // para no mostrar vencidas).
  const fresh = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      "id, title, description, company_name, location, region, category, is_national"
    )
    .or(`source.neq.jooble,created_at.gte.${fresh}`);

  const rows: {
    user_id: string;
    job_id: string;
    cv_id: string;
    score: number;
    matched_skills: string[];
  }[] = [];

  for (const job of jobs ?? []) {
    const result = scoreJob(candidate, job);
    if (result) {
      rows.push({
        user_id: user.id,
        job_id: job.id,
        cv_id: cv.id,
        score: result.score,
        matched_skills: result.matchedSkills,
      });
    }
  }

  // Recalcula limpio: elimina los matches "nueva" previos (conserva los que
  // el usuario haya guardado/postulado/descartado), luego inserta los nuevos.
  await supabase
    .from("matches")
    .delete()
    .eq("user_id", user.id)
    .eq("status", "nueva");

  if (rows.length > 0) {
    // upsert sin 'status': en altas usa el valor por defecto ('nueva'); en
    // los que el usuario ya movió, solo actualiza score y competencias.
    const { error } = await supabase
      .from("matches")
      .upsert(rows, { onConflict: "user_id,job_id" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
