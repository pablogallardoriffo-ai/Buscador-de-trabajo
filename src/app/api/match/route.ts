import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreJob } from "@/lib/matching";

/** Calcula los matches del usuario contra las ofertas disponibles. Sin IA. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // CV activo + competencias detectadas.
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
    .select("skills")
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

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, description, company_name, location, region");

  const rows: {
    user_id: string;
    job_id: string;
    cv_id: string;
    score: number;
    matched_skills: string[];
  }[] = [];

  for (const job of jobs ?? []) {
    const result = scoreJob(skills, profile?.region ?? null, job);
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

  // Upsert sin tocar el estado (no incluimos 'status', así se conserva
  // el que el usuario haya fijado; en altas usa el valor por defecto).
  if (rows.length > 0) {
    const { error } = await supabase
      .from("matches")
      .upsert(rows, { onConflict: "user_id,job_id" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
