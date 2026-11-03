// Cálculos de los resultados y la compra comunes a la web y la app.
import type { Tren } from "../api/tipos";
import { hora } from "../formato/formato";

/** Minutos desde medianoche de la hora del ISO de la API ("…T07:30…" -> 450). */
export const minutosDelDia = (iso: string) => {
  const [h, m] = hora(iso).split(":").map(Number);
  return h * 60 + m;
};
export const duracionMin = (t: Pick<Tren, "salida" | "llegada">) =>
  (new Date(t.llegada).getTime() - new Date(t.salida).getTime()) / 60_000;

export const FRANJAS = [
  { id: "manana", texto: "Mañana", desde: 0, hasta: 12 * 60 },
  { id: "tarde", texto: "Tarde", desde: 12 * 60, hasta: 18 * 60 },
  { id: "noche", texto: "Noche", desde: 18 * 60, hasta: 24 * 60 },
] as const;

export const documentoValido = (v: string) => /^[A-Za-z0-9]{6,12}$/.test(v.trim());
export const emailValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
