/**
 * Motor de match entre el CV y las ofertas — SIN IA, sin consumo de tokens.
 * Compara las competencias detectadas en el CV con el texto de cada oferta.
 */

/** Minúsculas y sin tildes, para comparar de forma robusta. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export interface JobLike {
  title: string | null;
  description: string | null;
  company_name: string | null;
  location: string | null;
  region: string | null;
}

export interface MatchResult {
  score: number; // 0-100
  matchedSkills: string[];
}

/**
 * Puntúa una oferta para un conjunto de competencias y una región.
 * Devuelve null si no hay encaje suficiente (calidad sobre cantidad).
 */
export function scoreJob(
  skills: string[],
  profileRegion: string | null,
  job: JobLike
): MatchResult | null {
  const haystack = normalize(
    [job.title, job.description, job.company_name, job.location]
      .filter(Boolean)
      .join(" ")
  );

  const matchedSkills = skills.filter((s) => {
    const n = normalize(s.trim());
    return n.length >= 3 && haystack.includes(n);
  });

  const m = matchedSkills.length;
  if (m === 0) return null; // sin ninguna competencia en común: no se muestra

  const total = Math.max(skills.length, 1);
  const coverage = m / total; // proporción del CV cubierta
  const regionMatch = profileRegion
    ? normalize(job.region ?? "") === normalize(profileRegion)
    : false;

  let score =
    coverage * 55 + // qué parte de tu perfil aplica
    Math.min(m, 4) * 8 + // cuántas competencias coinciden
    (regionMatch ? 13 : 0); // misma zona

  score = Math.round(Math.min(score, 100));

  if (score < 25) return null; // umbral de calidad

  return { score, matchedSkills };
}
