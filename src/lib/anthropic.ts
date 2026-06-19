import Anthropic from "@anthropic-ai/sdk";

/**
 * Modelos de Claude usados en Es Sencillo.
 * - Parseo del CV y scoring: Haiku 4.5 (rápido y económico, soporta PDF
 *   y salida estructurada). Decidido en el plan del proyecto.
 * - Cartas y consejos (Fase 5): Sonnet 4.6.
 */
export const MODELS = {
  cvParsing: "claude-haiku-4-5",
  coverLetter: "claude-sonnet-4-6",
} as const;

export function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

/** Estructura que la IA extrae de un CV. */
export interface ParsedCv {
  full_name: string;
  headline: string;
  summary: string;
  location: string;
  desired_role: string;
  seniority: string;
  skills: string[];
  education: { institution: string; degree: string; field: string; year: string }[];
  experience: {
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  languages: { language: string; level: string }[];
}

/** Esquema JSON para forzar la salida estructurada de la IA. */
const CV_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    full_name: { type: "string", description: "Nombre completo de la persona" },
    headline: {
      type: "string",
      description: "Titular profesional breve, p.ej. 'Técnico eléctrico'",
    },
    summary: {
      type: "string",
      description: "Resumen de 1-2 frases del perfil profesional",
    },
    location: { type: "string", description: "Ciudad o comuna de residencia" },
    desired_role: {
      type: "string",
      description: "Cargo o tipo de trabajo que parece buscar",
    },
    seniority: {
      type: "string",
      description: "Nivel: practicante, junior, semi-senior, senior o sin experiencia",
    },
    skills: {
      type: "array",
      description: "Competencias técnicas y blandas detectadas",
      items: { type: "string" },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          institution: { type: "string" },
          degree: { type: "string" },
          field: { type: "string" },
          year: { type: "string" },
        },
        required: ["institution", "degree", "field", "year"],
      },
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          company: { type: "string" },
          role: { type: "string" },
          period: { type: "string" },
          description: { type: "string" },
        },
        required: ["company", "role", "period", "description"],
      },
    },
    languages: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          language: { type: "string" },
          level: { type: "string" },
        },
        required: ["language", "level"],
      },
    },
  },
  required: [
    "full_name",
    "headline",
    "summary",
    "location",
    "desired_role",
    "seniority",
    "skills",
    "education",
    "experience",
    "languages",
  ],
} as const;

/** Lee un PDF (base64) y devuelve los datos estructurados del CV. */
export async function parseCvPdf(pdfBase64: string): Promise<ParsedCv> {
  const client = getAnthropic();
  if (!client) {
    throw new Error("ANTHROPIC_API_KEY no configurada");
  }

  const response = await client.messages.create({
    model: MODELS.cvParsing,
    max_tokens: 4096,
    system:
      "Eres un asistente que analiza currículums (CV) en español de Chile. " +
      "Extrae la información con precisión. Si un dato no aparece, deja el campo " +
      "como cadena vacía o lista vacía; nunca inventes datos.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: "Analiza este CV y extrae sus datos estructurados.",
          },
        ],
      },
    ],
    output_config: { format: { type: "json_schema", schema: CV_SCHEMA } },
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("La IA no devolvió texto");
  }
  return JSON.parse(block.text) as ParsedCv;
}
