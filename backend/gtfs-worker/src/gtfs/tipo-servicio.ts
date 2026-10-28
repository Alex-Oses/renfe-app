/**
 * Deducción de `rutas.tipo_servicio` (contrato §4.3).
 *
 * `route_type` de GTFS vale `2` (rail) en todo Renfe, así que no distingue
 * producto: hay que deducirlo del nombre. En el feed de AV/LD/MD el
 * `route_short_name` **ya es el producto**, así que la tabla de abajo cubre el
 * 100 % de las 663 rutas medidas el 28/10. El respaldo por palabras clave queda
 * para cuando Renfe publique un producto nuevo: entonces caerá en `otro` y el
 * informe de la importación lo dirá.
 *
 * Se compara por **nombre corto completo** y no por subcadena a propósito: `MD`
 * aparece dentro de `PROXIMDAD` y una búsqueda por subcadena lo clasificaría mal.
 */

export type TipoServicio =
  | "cercanias"
  | "ave"
  | "avlo"
  | "avant"
  | "alvia"
  | "intercity"
  | "media_distancia"
  | "regional"
  | "otro";

const POR_NOMBRE_CORTO: Record<string, TipoServicio> = {
  AVE: "ave",
  "AVE INT": "ave",
  AVLO: "avlo",
  AVANT: "avant",
  "AVANT EXP": "avant",
  ALVIA: "alvia",
  INTERCITY: "intercity",
  EUROMED: "intercity",
  MD: "media_distancia",
  PROXIMDAD: "media_distancia",
  TRENCELTA: "media_distancia",
  REGIONAL: "regional",
  REGEXP: "regional",
};

/** Palabras clave para productos que no estaban el 28/10, por orden de precedencia. */
const POR_PALABRA_CLAVE: Array<[TipoServicio, string[]]> = [
  ["ave", ["AVE"]],
  ["avlo", ["AVLO"]],
  ["avant", ["AVANT"]],
  ["alvia", ["ALVIA"]],
  ["intercity", ["INTERCITY", "EUROMED"]],
  ["media_distancia", ["MEDIA DISTANCIA", "PROXIMDAD", "TRENCELTA"]],
  ["regional", ["REGIONAL", "REG EXP"]],
];

/** Mayúsculas, sin acentos y sin puntuación: `Reg.Exp.` → `REGEXP`. */
export function normalizarNombre(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function tipoServicio(
  feed: string,
  nombreCorto: string | null,
  nombre: string | null,
): TipoServicio {
  // En Cercanías todo es cercanías: no hay que adivinar nada.
  if (feed === "cercanias") return "cercanias";

  const corto = normalizarNombre(nombreCorto ?? "");
  const directo = POR_NOMBRE_CORTO[corto];
  if (directo !== undefined) return directo;

  const texto = `${corto} ${normalizarNombre(nombre ?? "")}`.trim();
  for (const [tipo, claves] of POR_PALABRA_CLAVE) {
    if (claves.some((clave) => texto.includes(clave))) return tipo;
  }
  return "otro";
}
