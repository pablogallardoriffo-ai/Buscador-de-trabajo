/**
 * Conector con Jooble (agregador de ofertas de empleo).
 * Trae ofertas reales y vigentes con enlace DIRECTO a cada postulación
 * y sueldo cuando la empresa lo publica.
 *
 * Requiere la variable JOOBLE_API_KEY (se solicita gratis en jooble.org/api/about).
 * Docs: https://jooble.org/api/about
 */
import { inferCategoryScores } from "@/lib/categories";
import { CHILE_REGIONS } from "@/lib/regions";
import { normalize } from "@/lib/text";

export interface NormalizedJob {
  source: string;
  source_id: string;
  title: string;
  company_name: string | null;
  location: string | null;
  region: string | null;
  url: string;
  description: string | null;
  salary: string | null;
  category: string | null;
  is_national: boolean;
}

interface JoobleJob {
  title?: string;
  location?: string;
  snippet?: string;
  salary?: string;
  source?: string;
  type?: string;
  link?: string;
  company?: string;
  updated?: string;
  id?: number | string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Deduce la región de Chile a partir del texto de ubicación. */
function regionFromLocation(location: string | undefined): string | null {
  if (!location) return null;
  const n = normalize(location);
  for (const region of CHILE_REGIONS) {
    if (n.includes(normalize(region))) return region;
  }
  return null;
}

/** Elige la categoría profesional dominante del texto de la oferta. */
function topCategory(text: string): string | null {
  const scores = inferCategoryScores(text);
  let best: string | null = null;
  let bestN = 0;
  for (const [key, n] of scores) {
    if (n > bestN) {
      best = key;
      bestN = n;
    }
  }
  return best;
}

/**
 * Consulta Jooble y devuelve ofertas normalizadas para nuestra tabla `jobs`.
 * Devuelve [] si no hay API key o si la consulta falla (no rompe el flujo).
 */
export async function fetchJoobleJobs(
  keywords: string,
  location: string
): Promise<NormalizedJob[]> {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(`https://jooble.org/api/${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords, location }),
    });
    if (!res.ok) return [];

    const data = (await res.json()) as { jobs?: JoobleJob[] };
    const jobs = data.jobs ?? [];

    return jobs
      .filter((j) => j.id != null && j.link && j.title)
      .map((j) => {
        const description = j.snippet ? stripHtml(j.snippet) : null;
        const text = `${j.title ?? ""} ${description ?? ""}`;
        return {
          source: "jooble",
          source_id: String(j.id),
          title: j.title!.slice(0, 200),
          company_name: j.company?.trim() || null,
          location: j.location?.trim() || null,
          region: regionFromLocation(j.location),
          url: j.link!,
          description,
          salary: j.salary?.trim() || null,
          category: topCategory(text),
          is_national: false,
        } satisfies NormalizedJob;
      });
  } catch {
    return [];
  }
}
