/**
 * Lector de CV sin IA — extrae datos del texto plano de un PDF
 * usando palabras clave y secciones típicas de un CV en español.
 * No consume tokens ni depende de ninguna API externa.
 */
import { normalize } from "./text";
import { SKILL_KEYWORDS } from "./cv-keywords";
import { CHILE_REGIONS } from "./regions";
import type { ParsedCv } from "./anthropic";

const SECTION_HEADERS = {
  summary: ["perfil profesional", "resumen", "objetivo", "perfil", "sobre mi", "presentacion"],
  experience: ["experiencia laboral", "experiencia profesional", "experiencia", "historial laboral", "trayectoria laboral"],
  education: ["educacion", "estudios", "formacion academica", "formacion"],
  skills: ["habilidades", "competencias", "habilidades tecnicas", "conocimientos"],
  languages: ["idiomas"],
} as const;

type SectionKey = keyof typeof SECTION_HEADERS | "other";

function detectHeader(line: string): SectionKey | null {
  const n = normalize(line).trim().replace(/[:.\-]+$/, "");
  if (n.length === 0 || n.length > 40) return null;
  for (const [key, headers] of Object.entries(SECTION_HEADERS)) {
    if (headers.some((h) => n === h || n.startsWith(h))) {
      return key as SectionKey;
    }
  }
  return null;
}

/** Agrupa las líneas del CV por sección (experiencia, educación, etc.). */
function splitIntoSections(lines: string[]): Record<SectionKey, string[]> {
  const sections: Record<SectionKey, string[]> = {
    summary: [], experience: [], education: [], skills: [], languages: [], other: [],
  };
  let current: SectionKey = "other";
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const header = detectHeader(line);
    if (header) {
      current = header;
      continue;
    }
    sections[current].push(line);
  }
  return sections;
}

const YEAR_RE = /\b(19|20)\d{2}\b/;
const PERIOD_RE = /\b((19|20)\d{2})\s*[-–—aA]+\s*((19|20)\d{2}|actualidad|presente|hoy)\b/i;

const LANGUAGE_NAMES = ["Inglés", "Portugués", "Francés", "Alemán", "Italiano"];
const LEVEL_WORDS = ["básico", "intermedio", "avanzado", "nativo", "fluido", "bilingüe"];

function detectLanguages(text: string): { language: string; level: string }[] {
  const normalized = normalize(text);
  const found: { language: string; level: string }[] = [];
  for (const lang of LANGUAGE_NAMES) {
    const idx = normalized.indexOf(normalize(lang));
    if (idx === -1) continue;
    const window = normalized.slice(idx, idx + 40);
    const level = LEVEL_WORDS.find((l) => window.includes(normalize(l)));
    found.push({ language: lang, level: level ? level[0].toUpperCase() + level.slice(1) : "No especificado" });
  }
  return found;
}

function detectSeniority(text: string): string {
  const n = normalize(text);
  if (n.includes("senior") && !n.includes("semi senior") && !n.includes("semi-senior")) return "Senior";
  if (n.includes("semi senior") || n.includes("semi-senior")) return "Semi-senior";
  if (n.includes("junior")) return "Junior";
  if (n.includes("practicante") || n.includes("practica profesional")) return "Practicante";
  return "";
}

function detectLocation(text: string): string {
  const n = normalize(text);
  for (const region of CHILE_REGIONS) {
    if (n.includes(normalize(region))) return region;
  }
  return "";
}

function detectSkills(text: string): string[] {
  const n = normalize(text);
  return SKILL_KEYWORDS.filter((skill) => n.includes(normalize(skill)));
}

/** Extrae datos estructurados del texto plano de un CV (heurísticas, sin IA). */
export function parseCvText(rawText: string): ParsedCv {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim());
  const nonEmpty = lines.filter(Boolean);
  const sections = splitIntoSections(lines);

  const fullName = nonEmpty[0]?.slice(0, 80) ?? "";
  const headline = nonEmpty[1] && nonEmpty[1].length <= 70 ? nonEmpty[1] : "";

  const summary = sections.summary.slice(0, 4).join(" ").slice(0, 400);

  const education = sections.education.slice(0, 8).map((line) => {
    const yearMatch = line.match(YEAR_RE);
    return {
      institution: "",
      degree: line.slice(0, 120),
      field: "",
      year: yearMatch ? yearMatch[0] : "",
    };
  });

  const experience = sections.experience.slice(0, 8).map((line) => {
    const periodMatch = line.match(PERIOD_RE);
    return {
      company: "",
      role: line.slice(0, 120),
      period: periodMatch ? periodMatch[0] : "",
      description: "",
    };
  });

  return {
    full_name: fullName,
    headline,
    summary,
    location: detectLocation(rawText),
    desired_role: headline,
    seniority: detectSeniority(rawText),
    skills: detectSkills(rawText),
    education,
    experience,
    languages: detectLanguages(rawText),
  };
}
