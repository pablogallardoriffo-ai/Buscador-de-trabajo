import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { createClient } from "@/lib/supabase/server";
import { parseCvPdf } from "@/lib/anthropic";
import { parseCvText } from "@/lib/cv-parser";

export const maxDuration = 60;

/**
 * Analiza el CV indicado y guarda los datos extraídos.
 * Usa IA (Claude) si hay una API key configurada; si no, usa el lector
 * por palabras clave (gratuito, sin tokens) como alternativa automática.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { cvId } = await request.json().catch(() => ({ cvId: null }));
  if (!cvId) {
    return NextResponse.json({ error: "Falta cvId" }, { status: 400 });
  }

  // El CV debe pertenecer al usuario (RLS lo refuerza igualmente).
  const { data: cv, error: cvError } = await supabase
    .from("cvs")
    .select("id, file_path, user_id")
    .eq("id", cvId)
    .eq("user_id", user.id)
    .single();

  if (cvError || !cv) {
    return NextResponse.json({ error: "CV no encontrado" }, { status: 404 });
  }

  await supabase.from("cvs").update({ status: "parsing" }).eq("id", cv.id);

  try {
    // Descarga el PDF desde Storage.
    const { data: file, error: dlError } = await supabase.storage
      .from("cvs")
      .download(cv.file_path);
    if (dlError || !file) {
      throw new Error("No se pudo descargar el PDF");
    }
    const buffer = Buffer.from(await file.arrayBuffer());

    const parsed = process.env.ANTHROPIC_API_KEY
      ? await parseCvPdf(buffer.toString("base64"))
      : await parseCvWithoutAi(buffer);

    // Reemplaza datos previos de este CV y guarda los nuevos.
    await supabase.from("cv_data").delete().eq("cv_id", cv.id);
    const { error: insErr } = await supabase.from("cv_data").insert({
      cv_id: cv.id,
      user_id: user.id,
      full_name: parsed.full_name || null,
      headline: parsed.headline || null,
      summary: parsed.summary || null,
      location: parsed.location || null,
      desired_role: parsed.desired_role || null,
      seniority: parsed.seniority || null,
      skills: parsed.skills ?? [],
      education: parsed.education ?? [],
      experience: parsed.experience ?? [],
      languages: parsed.languages ?? [],
    });
    if (insErr) throw insErr;

    await supabase
      .from("cvs")
      .update({ status: "parsed", error_message: null })
      .eq("id", cv.id);

    return NextResponse.json({ ok: true, data: parsed });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al analizar el CV";
    const friendly = message.includes("ANTHROPIC_API_KEY")
      ? "Falta configurar la clave de la IA (ANTHROPIC_API_KEY)."
      : message;
    await supabase
      .from("cvs")
      .update({ status: "error", error_message: friendly })
      .eq("id", cv.id);
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}

/** Extrae el texto del PDF y aplica el lector por palabras clave. */
async function parseCvWithoutAi(buffer: Buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return parseCvText(text);
}
