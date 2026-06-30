/**
 * Diccionario de competencias para el lector de CV sin IA.
 * Cubre los rubros más comunes del mercado laboral chileno.
 * Cada entrada es la forma "bonita" para mostrar; la detección
 * en el texto del CV se hace sin tildes y en minúsculas.
 */
export const SKILL_KEYWORDS = [
  // Retail y ventas
  "Atención al cliente", "Ventas", "Caja", "Manejo de efectivo", "Retail",
  "Visual merchandising", "Reposición", "Inventario", "Punto de venta",

  // Bodega y logística
  "Bodega", "Logística", "Grúa horquilla", "Despacho", "Picking",
  "Control de stock", "Recepción de mercadería",

  // Administración y oficina
  "Excel", "Office", "Word", "PowerPoint", "Archivo", "Administración",
  "Facturación", "Remuneraciones", "Contabilidad", "SII",
  "Atención de público", "Redacción", "Agenda",

  // Aseo y limpieza
  "Aseo", "Limpieza", "Orden",

  // Técnico / industrial / eléctrico
  "Electricidad", "Electricidad industrial", "Mantención", "Mantenimiento",
  "Lectura de planos", "Soldadura", "Mecánica", "Refrigeración", "Minería",

  // Salud
  "TENS", "Enfermería", "Signos vitales", "Cuidado de pacientes",
  "Primeros auxilios",

  // Conducción
  "Licencia clase B", "Licencia clase A", "Conducción", "Reparto",

  // Tecnología
  "JavaScript", "TypeScript", "React", "Node.js", "HTML", "CSS",
  "Python", "SQL", "Bases de datos", "Desarrollo web", "Git",

  // Call center / atención telefónica
  "Call center", "Atención telefónica", "Telemarketing",

  // Gastronomía
  "Garzón", "Cocina", "Gastronomía", "Manipulación de alimentos",
  "Servicio de mesas", "Bartending",

  // Idiomas
  "Inglés", "Portugués",

  // Habilidades blandas
  "Trabajo en equipo", "Liderazgo", "Comunicación", "Responsabilidad",
  "Puntualidad", "Resolución de problemas", "Proactividad",
  "Organización", "Adaptabilidad", "Capacitación",
] as const;
