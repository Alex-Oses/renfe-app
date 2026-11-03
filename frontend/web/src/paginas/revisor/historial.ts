import type { ResultadoValidacion } from "@renfe/shared/api/tipos";

// Una lectura del revisor. `validadoEn` no sirve como clave de React: la API lo devuelve con
// precisión de segundos, así que dos lecturas en el mismo segundo chocarían. Cada lectura lleva
// su propio identificador estable mientras vive en el historial.
export type Lectura = ResultadoValidacion & { lecturaId: number };

export const MAXIMO_LECTURAS = 20;

export function anadirLectura(historial: Lectura[], lectura: ResultadoValidacion, lecturaId: number): Lectura[] {
  return [{ ...lectura, lecturaId }, ...historial].slice(0, MAXIMO_LECTURAS);
}
