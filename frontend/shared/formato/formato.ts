// Formato común de la web y la app (precios, horas y fechas en español).
import type { EstadoAbono } from "../api/simulado-abonos";

const EUROS = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
export const euros = (n: number) => EUROS.format(n);

/** Hora tal cual viene en el ISO de la API (hora de la estación, sin pasar a la zona del dispositivo). */
export const hora = (iso: string) => iso.slice(11, 16);
/** Hora pasada a la zona del dispositivo (avisos, posiciones y datos que no son de horario). */
export const horaLocal = (instante: string | number) =>
  new Date(instante).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

export const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
export const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
/** Fechas "AAAA-MM-DD" (abonos), a mediodía para que el huso no cambie el día. */
export const aFecha = (dia: string) =>
  new Date(`${dia}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

export const TEXTO_ESTADO: Record<EstadoAbono, string> = {
  pendiente: "Aún no empieza",
  vigente: "Vigente",
  agotado: "Sin viajes",
  caducado: "Caducado",
};
