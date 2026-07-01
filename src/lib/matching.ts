/**
 * Motor de match entre el CV y las ofertas — SIN IA, sin consumo de tokens.
 *
 * Modelo profesional en dos señales:
 *  1) Categoría: ¿el rubro del candidato coincide con el de la oferta?
 *     (p. ej. un Ing. Civil Industrial encaja en administración/logística).
 *  2) Competencias: ¿cuántas de las que pide la oferta tiene el candidato?
 *
 * La región es una señal suave: las ofertas remotas o de empresas con
 * presencia nacional aplican a cualquier zona; misma región suma un poco.
 */
import { normalize } from "./text";
import { SKILL_KEYWORDS } from "./cv-keywords";

const REMOTE_WORDS = ["remoto", "remota", "teletrabajo", "home office"];

export interface JobLike {
  title: string | null;
  description: string | null;
  company_name: string | null;
  location: string | null;
  region: string | null;
  category: string | null;
  is_national: boolean | null;
}

export interface Candidate {
  skills: string[];
  categories: string[];
  region: string | null;
}

export interface MatchResult {
  score: number; // 0-100
  matchedSkills: string[];
}

export function isRemoteJob(job: JobLike): boolean {
  const haystack = normalize(
    [job.title, job.description, job.location].filter(Boolean).join(" ")
  );
  return REMOTE_WORDS.some((w) => haystack.includes(w));
}

/** Competencias del diccionario que la oferta menciona en su texto. */
export function jobSkills(job: JobLike): string[] {
  const haystack = normalize(
    [job.title, job.description].filter(Boolean).join(" ")
  );
  return SKILL_KEYWORDS.filter((s) => haystack.includes(normalize(s)));
}

/**
 * Puntúa una oferta para un candidato. Devuelve null si no hay encaje
 * razonable (calidad sobre cantidad).
 */
export function scoreJob(candidate: Candidate, job: JobLike): MatchResult | null {
  const candSkillsNorm = new Set(candidate.skills.map((s) => normalize(s)));
  const jSkills = jobSkills(job);
  const matchedSkills = jSkills.filter((s) => candSkillsNorm.has(normalize(s)));
  const overlap = matchedSkills.length;

  const categoryHit = Boolean(
    job.category && candidate.categories.includes(job.category)
  );

  // Sin categoría en común y sin competencias en común: no aplica.
  if (!categoryHit && overlap === 0) return null;

  // Cobertura: de lo que pide la oferta, cuánto tiene el candidato.
  const coverage = jSkills.length > 0 ? overlap / jSkills.length : 0;

  const remoteOrNational = isRemoteJob(job) || job.is_national === true;
  const sameRegion =
    remoteOrNational ||
    (candidate.region
      ? normalize(job.region ?? "") === normalize(candidate.region)
      : false);

  let score = 0;
  if (categoryHit) score += 45; // estás en el rubro correcto
  score += coverage * 40; // qué tanto cubres los requisitos
  score += Math.min(overlap, 3) * 3; // pequeño empujón por cada skill en común
  if (sameRegion) score += 10; // misma zona / remoto / nacional

  // Piso razonable cuando de verdad encaja el rubro y hay alguna competencia.
  if (categoryHit && overlap >= 1) score = Math.max(score, 55);

  score = Math.round(Math.min(score, 100));

  if (score < 20) return null;

  return { score, matchedSkills };
}
