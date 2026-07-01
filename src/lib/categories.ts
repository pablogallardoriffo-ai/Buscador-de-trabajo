/**
 * Categorías profesionales para el match por área (no solo por palabra suelta).
 * Se usan para inferir el/los rubros del candidato (desde su CV) y compararlos
 * con la categoría de cada oferta. Un match de categoría es la señal fuerte.
 */
import { normalize } from "./text";

export interface Category {
  key: string;
  label: string;
  /** Términos (competencias, cargos, carreras) que indican esta categoría. */
  keywords: string[];
}

export const CATEGORIES: Category[] = [
  {
    key: "administracion",
    label: "Administración y oficina",
    keywords: [
      "administracion", "administrativo", "administrativa", "excel", "office",
      "word", "facturacion", "remuneraciones", "contabilidad", "contador",
      "sii", "archivo", "agenda", "atencion de publico", "secretaria",
      "secretariado", "recepcionista", "asistente administrativo",
      "ingenieria civil industrial", "ingenieria comercial",
      "administracion de empresas", "auxiliar administrativo", "planillas",
    ],
  },
  {
    key: "ventas_retail",
    label: "Ventas y retail",
    keywords: [
      "ventas", "vendedor", "vendedora", "atencion al cliente", "caja",
      "cajero", "cajera", "retail", "reposicion", "reponedor", "punto de venta",
      "visual merchandising", "promotor", "promotora", "comercial",
      "ejecutivo de ventas",
    ],
  },
  {
    key: "logistica",
    label: "Bodega y logística",
    keywords: [
      "logistica", "bodega", "bodeguero", "inventario", "control de stock",
      "despacho", "picking", "grua horquilla", "recepcion de mercaderia",
      "operario", "operador", "abastecimiento", "distribucion",
    ],
  },
  {
    key: "ti",
    label: "Tecnología",
    keywords: [
      "javascript", "typescript", "react", "node", "html", "css", "python",
      "sql", "bases de datos", "desarrollo web", "git", "informatica",
      "programacion", "programador", "desarrollador", "software",
      "ingenieria en informatica", "soporte ti", "analista",
    ],
  },
  {
    key: "salud",
    label: "Salud",
    keywords: [
      "tens", "enfermeria", "enfermero", "enfermera", "signos vitales",
      "cuidado de pacientes", "primeros auxilios", "salud",
      "tecnico en enfermeria", "auxiliar de enfermeria", "paramedico",
    ],
  },
  {
    key: "industrial_tecnico",
    label: "Técnico e industrial",
    keywords: [
      "electricidad", "electricidad industrial", "mantencion", "mantenimiento",
      "lectura de planos", "soldadura", "mecanica", "mecanico", "refrigeracion",
      "mineria", "tecnico industrial", "electromecanica", "instalaciones",
    ],
  },
  {
    key: "gastronomia",
    label: "Gastronomía",
    keywords: [
      "garzon", "garzona", "cocina", "cocinero", "gastronomia",
      "manipulacion de alimentos", "servicio de mesas", "bartending",
      "mesero", "ayudante de cocina", "barista",
    ],
  },
  {
    key: "call_center",
    label: "Call center y atención",
    keywords: [
      "call center", "atencion telefonica", "telemarketing", "contact center",
      "ejecutivo telefonico", "servicio al cliente",
    ],
  },
  {
    key: "aseo",
    label: "Aseo y servicios",
    keywords: [
      "aseo", "limpieza", "auxiliar de aseo", "auxiliar de servicios",
      "mucama", "conserje",
    ],
  },
  {
    key: "conduccion",
    label: "Conducción y reparto",
    keywords: [
      "licencia clase b", "licencia clase a", "conduccion", "reparto",
      "chofer", "conductor", "repartidor", "delivery",
    ],
  },
];

const CATEGORY_BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]));

export function categoryLabel(key: string | null): string {
  return (key && CATEGORY_BY_KEY.get(key)?.label) || "General";
}

/**
 * Infiere las categorías profesionales de un texto (CV completo, o el texto
 * de una oferta), con un puntaje = nº de términos de esa categoría hallados.
 */
export function inferCategoryScores(text: string): Map<string, number> {
  const n = normalize(text);
  const scores = new Map<string, number>();
  for (const cat of CATEGORIES) {
    let hits = 0;
    for (const kw of cat.keywords) {
      if (n.includes(kw)) hits++;
    }
    if (hits > 0) scores.set(cat.key, hits);
  }
  return scores;
}

/** Devuelve las claves de categoría presentes en el texto. */
export function inferCategories(text: string): string[] {
  return [...inferCategoryScores(text).keys()];
}
