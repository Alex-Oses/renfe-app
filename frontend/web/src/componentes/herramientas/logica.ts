// Cálculos de los widgets. Todo simulado salvo la tabla de puntualidad (renfe.com/es/es/ayuda/compromiso-puntualidad).
import type { Reserva, TipoTren } from "@renfe/shared/api/tipos";

export const euros = (n: number) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
const redondear = (n: number) => Math.round(n * 100) / 100;

// Compromiso de puntualidad de Renfe: [minutos, %]; se aplica el tramo más alto superado.
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

// La reserva simulada no guarda tarifa: se deduce de la clase del asiento.
export type Tarifa = "Básico" | "Elige" | "Prémium";
export const tarifaDe = (r: Reserva): Tarifa =>
  ({ Estándar: "Básico", Confort: "Elige", Prémium: "Prémium" } as const)[r.asientos[0]?.clase ?? "Estándar"];

/** Coste de cambiar el billete según las condiciones de renfe.com: Básico 10 €, Elige y Prémium gratis (primer cambio). */
export function costeCambio(t: Tarifa, _total: number): number | null {
  return t === "Básico" ? 10 : 0;
}

/** % de penalización al anular (renfe.com): Básico sin devolución, Elige devuelve el 70 %, Prémium el 100 %.
 * shortcut: no aplica el 95 % de Prémium en los últimos 6 días; necesita la fecha del viaje. */
export const PENALIZACION: Record<Tarifa, number | null> = { Básico: 100, Elige: 30, Prémium: 0 };

export function devolucionAnulacion(t: Tarifa, total: number): number | null {
  const p = PENALIZACION[t];
  return p === null ? null : redondear(total * (1 - p / 100));
}

// Programa de puntos simulado: 10 puntos por euro, multiplicador por nivel, 100 puntos = 1 €.
export const NIVELES = { General: 1, Plata: 1.25, Oro: 1.5, Platino: 2 } as const;
export type Nivel = keyof typeof NIVELES;

export function puntosGanados(importe: number, nivel: Nivel) {
  const puntos = Math.floor(Math.max(0, importe) * 10 * NIVELES[nivel]);
  return { puntos, euros: redondear(puntos / 100) };
}

export function semilla(texto: string): number {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export const expediente = (prefijo: string) => `${prefijo}-${Date.now().toString(36).toUpperCase().slice(-6)}`;

// Cercanías: líneas y estaciones inventadas pero estables por núcleo.
const NOMBRES = ["Centro", "Estación Norte", "Universidad", "Hospital", "Aeropuerto", "Puerto", "Polígono", "Playa", "Estadio", "Parque", "Mercado", "Sur"];

export function lineasNucleo(nucleo: string) {
  const s = semilla(nucleo);
  return Array.from({ length: 2 + (s % 3) }, (_, i) => ({
    id: `C${i + 1}`,
    estaciones: Array.from({ length: 6 }, (_, j) => `${NOMBRES[(s + i * 5 + j * 7) % NOMBRES.length]}${j > 2 && i ? ` ${i + 1}` : ""}`).filter(
      (n, k, a) => a.indexOf(n) === k,
    ),
  }));
}

/** Salidas cada 15-30 min entre 5:30 y 23:30, deterministas por línea y tramo. */
export function horariosCercanias(nucleo: string, linea: string, origen: number, destino: number) {
  const s = semilla(`${nucleo}-${linea}`);
  const cada = 15 + (s % 4) * 5;
  const viaje = Math.abs(destino - origen) * (3 + (s % 3));
  const hora = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const salidas = [];
  for (let m = 330 + (s % cada) + origen * 3; m <= 1410; m += cada) salidas.push({ sale: hora(m), llega: hora(m + viaje), duracion: viaje });
  return salidas;
}
