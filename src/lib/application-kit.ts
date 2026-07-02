import { getAnthropic, MODELS, type ParsedCv } from "@/lib/anthropic";

/** Kit de postulación: consejos + borrador de carta de presentación. */
export interface ApplicationKit {
  tips: string[];
  cover_letter: string;
}

/** Datos del candidato usados para personalizar el kit. */
export type KitCandidate = Pick<
  ParsedCv,
  "full_name" | "headline" | "summary" | "seniority"
> & {
  skills: string[];
  experience: { company?: string; role?: string; description?: string }[];
};

/** Datos de la oferta usados para personalizar el kit. */
export interface KitJob {
  title: string;
  company_name: string | null;
  location: string | null;
  description: string | null;
  matched_skills: string[];
  missing_skills: string[];
}

const KIT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    tips: {
      type: "array",
      description:
        "3 a 5 consejos concretos y accionables para postular a esta oferta",
      items: { type: "string" },
    },
    cover_letter: {
      type: "string",
      description:
        "Borrador de carta de presentación en español de Chile, tono cercano y profesional, 3-4 párrafos",
    },
  },
  required: ["tips", "cover_letter"],
} as const;

/** Genera el kit con Claude (Sonnet). Requiere ANTHROPIC_API_KEY. */
async function generateKitWithAi(
  candidate: KitCandidate,
  job: KitJob
): Promise<ApplicationKit> {
  const client = getAnthropic();
  if (!client) {
    throw new Error("ANTHROPIC_API_KEY no configurada");
  }

  const candidateText = [
    candidate.full_name && `Nombre: ${candidate.full_name}`,
    candidate.headline && `Titular: ${candidate.headline}`,
    candidate.summary && `Resumen: ${candidate.summary}`,
    candidate.seniority && `Nivel: ${candidate.seniority}`,
    candidate.skills.length > 0 &&
      `Competencias: ${candidate.skills.join(", ")}`,
    candidate.experience.length > 0 &&
      `Experiencia: ${candidate.experience
        .map((e) => `${e.role ?? ""} en ${e.company ?? ""} (${e.description ?? ""})`)
        .join("; ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const jobText = [
    `Cargo: ${job.title}`,
    job.company_name && `Empresa: ${job.company_name}`,
    job.location && `Ubicación: ${job.location}`,
    job.description && `Descripción: ${job.description}`,
    job.matched_skills.length > 0 &&
      `Competencias del candidato que coinciden: ${job.matched_skills.join(", ")}`,
    job.missing_skills.length > 0 &&
      `Competencias que la oferta pide y el candidato no menciona: ${job.missing_skills.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.create({
    model: MODELS.coverLetter,
    max_tokens: 2048,
    system:
      "Eres un orientador laboral chileno. Preparas a personas para postular a " +
      "un empleo concreto: consejos prácticos y un borrador de carta de " +
      "presentación. Escribe en español de Chile, tono cercano pero profesional, " +
      "sin exagerar ni inventar experiencia que el candidato no tiene. La carta " +
      "debe apoyarse en las competencias reales del candidato que coinciden con " +
      "la oferta, y los consejos deben ayudar a cubrir o compensar lo que falta.",
    messages: [
      {
        role: "user",
        content:
          `PERFIL DEL CANDIDATO:\n${candidateText}\n\n` +
          `OFERTA DE TRABAJO:\n${jobText}\n\n` +
          "Genera los consejos y el borrador de carta de presentación.",
      },
    ],
    output_config: { format: { type: "json_schema", schema: KIT_SCHEMA } },
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("La IA no devolvió texto");
  }
  return JSON.parse(block.text) as ApplicationKit;
}

/** Alternativa sin IA (sin tokens): plantilla con los datos del match. */
function generateKitWithoutAi(
  candidate: KitCandidate,
  job: KitJob
): ApplicationKit {
  const name = candidate.full_name || "[Tu nombre]";
  const company = job.company_name || "la empresa";
  const skills = job.matched_skills.slice(0, 4);
  const skillsText =
    skills.length > 0 ? skills.join(", ") : "mi experiencia previa";

  const tips = [
    `Revisa la oferta en el sitio oficial de ${company} y confirma que sigue vigente antes de postular.`,
    skills.length > 0
      ? `Destaca en tu CV y en la entrevista estas competencias que coinciden con la oferta: ${skills.join(", ")}.`
      : "Adapta tu CV para destacar la experiencia más relacionada con el cargo.",
    job.missing_skills.length > 0
      ? `La oferta menciona competencias que tu CV no destaca (${job.missing_skills
          .slice(0, 3)
          .join(", ")}): si las tienes, agrégalas; si no, prepárate para explicar cómo las compensas.`
      : "Prepara ejemplos concretos de logros en trabajos anteriores.",
    "Personaliza la carta antes de enviarla: revisa el nombre de la empresa y ajusta el tono a tu forma de hablar.",
  ];

  const cover_letter = [
    `Estimado equipo de ${company}:`,
    ``,
    `Les escribo para postular al cargo de ${job.title}. ` +
      `${candidate.headline ? `Soy ${candidate.headline.toLowerCase()} y creo` : "Creo"} ` +
      `que mi perfil encaja bien con lo que buscan.`,
    ``,
    `Cuento con experiencia en ${skillsText}, lo que me permitiría aportar desde el primer día. ` +
      `${candidate.summary || ""}`.trim(),
    ``,
    `Me interesa mucho la oportunidad de conversar con ustedes y contarles más sobre mi experiencia. ` +
      `Quedo atento(a) a sus comentarios.`,
    ``,
    `Atentamente,`,
    name,
  ].join("\n");

  return { tips, cover_letter };
}

/**
 * Genera el kit de postulación. Usa IA (Claude Sonnet) si hay API key;
 * si no, usa la plantilla sin tokens como alternativa automática.
 */
export async function generateApplicationKit(
  candidate: KitCandidate,
  job: KitJob
): Promise<{ kit: ApplicationKit; usedAi: boolean }> {
  if (process.env.ANTHROPIC_API_KEY) {
    return { kit: await generateKitWithAi(candidate, job), usedAi: true };
  }
  return { kit: generateKitWithoutAi(candidate, job), usedAi: false };
}
