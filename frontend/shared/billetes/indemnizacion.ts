// Compromiso de puntualidad de Renfe (renfe.com/es/es/ayuda/compromiso-puntualidad).
import type { TipoTren } from "../api/tipos";

const redondear = (n: number) => Math.round(n * 100) / 100;

// [minutos, %]; se aplica el tramo más alto superado.
const COMERCIAL: [number, number, boolean][] = [[90, 100, false], [60, 50, true]]; // [umbral, %, incluye el umbral]
const MEDIA_DISTANCIA: [number, number, boolean][] = [[60, 100, false], [30, 50, false], [15, 25, false]];
const TABLA: Partial<Record<TipoTren, [number, number, boolean][]>> = {
  AVE: COMERCIAL,
  Avlo: COMERCIAL,
  Alvia: COMERCIAL,
  Intercity: COMERCIAL,
  "Media Distancia": MEDIA_DISTANCIA,
};

/** % del billete que se devuelve. Cercanías no está en este compromiso: 0. */
export function porcentajeIndemnizacion(tipo: TipoTren, minutos: number): number {
  for (const [umbral, pct, incluye] of TABLA[tipo] ?? []) if (incluye ? minutos >= umbral : minutos > umbral) return pct;
  return 0;
}

export const indemnizacion = (tipo: TipoTren, minutos: number, precio: number) =>
  redondear((precio * porcentajeIndemnizacion(tipo, minutos)) / 100);
