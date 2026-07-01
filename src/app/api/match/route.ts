import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreJob, type Candidate } from "@/lib/matching";
import { inferCategories } from "@/lib/categories";

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

  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      "id, title, description, company_name, location, region, category, is_national"
    );

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
