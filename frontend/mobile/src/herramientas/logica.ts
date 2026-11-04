// Cálculos de los widgets informativos, con las mismas reglas que la web
// (frontend/web/src/componentes/herramientas/logica.ts). Todo simulado salvo la tabla de
// puntualidad, que viene de @renfe/shared.
// Sin dependencias de ejecución a propósito: así `node --test` puede probar los cálculos sin
// Metro ni el paquete @renfe/shared (ver logica.test.mjs). La tabla de puntualidad se importa
// del shared directamente en cada widget.
import type { Reserva } from "@renfe/shared/api/tipos";

const redondear = (n: number) => Math.round(n * 100) / 100;

// La reserva simulada no guarda tarifa: se deduce de la clase del asiento.
export type Tarifa = "Básico" | "Elige" | "Prémium";
export const tarifaDe = (r: Reserva): Tarifa =>
  ({ Estándar: "Básico", Confort: "Elige", Prémium: "Prémium" } as const)[r.asientos[0]?.clase ?? "Estándar"];

/** Coste de cambiar el billete: Básico 10 €, Elige y Prémium gratis (primer cambio). */
export function costeCambio(t: Tarifa, _total: number): number | null {
  return t === "Básico" ? 10 : 0;
}

/** % de penalización al anular: Básico sin devolución, Elige devuelve el 70 %, Prémium el 100 %. */
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

// Validaciones que la web reparte entre comun.tsx y Formularios.tsx.
export const espera = (ms = 400) => new Promise((r) => setTimeout(r, ms));
export const LOCALIZADOR = /^(R-)?[A-Z0-9]{6}$/i;
export const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
export const telefonoValido = (v: string) => /^[6-9]\d{8}$/.test(v.replace(/\s/g, ""));
export const movilValido = (v: string) => /^[67]\d{8}$/.test(v.replace(/\s/g, ""));
export const nifValido = (v: string) => /^[A-Z0-9]\d{7}[A-Z0-9]$/i.test(v);
export const hoyIso = () => new Date().toISOString().slice(0, 10);

/** Franjas de cita previa libres: deterministas por estación y fecha (misma tabla que la web). */
export const FRANJAS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "16:00", "16:30", "17:00", "17:30"];
export const franjasLibres = (estacion: string, fecha: string) =>
  estacion && fecha ? FRANJAS.filter((f) => semilla(`${estacion}-${fecha}-${f}`) % 3 !== 0) : [];

// La web lee el almacén simulado de reservas directamente (clave "anden-reservas") porque
// no hay búsqueda por localizador en el cliente simulado. En la app el almacén es SQLite.
export function reservaPorLocalizador(loc: string): Reserva | undefined {
  try {
    const a = JSON.parse(localStorage.getItem("anden-reservas") ?? "null") as { reservas: Reserva[] } | null;
    return a?.reservas.find((r) => r.localizador === loc.trim().toUpperCase());
  } catch {
    return undefined;
  }
}
