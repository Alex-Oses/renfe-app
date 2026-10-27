// Datos simulados mientras la API no existe. Mismas firmas que cliente.ts.
import type { BusquedaTrenes, Estacion, TipoTren, Tren } from "./tipos";

export const ESTACIONES: Estacion[] = [
  { id: "60000", nombre: "Madrid-Puerta de Atocha", ciudad: "Madrid" },
  { id: "17000", nombre: "Madrid-Chamartín-Clara Campoamor", ciudad: "Madrid" },
  { id: "71801", nombre: "Barcelona-Sants", ciudad: "Barcelona" },
  { id: "65000", nombre: "València Joaquín Sorolla", ciudad: "Valencia" },
  { id: "51003", nombre: "Sevilla-Santa Justa", ciudad: "Sevilla" },
  { id: "50500", nombre: "Córdoba", ciudad: "Córdoba" },
  { id: "54413", nombre: "Málaga María Zambrano", ciudad: "Málaga" },
  { id: "04040", nombre: "Zaragoza-Delicias", ciudad: "Zaragoza" },
  { id: "10600", nombre: "Valladolid Campo Grande", ciudad: "Valladolid" },
  { id: "60911", nombre: "Alicante/Alacant", ciudad: "Alicante" },
  { id: "05000", nombre: "Bilbao-Abando Indalecio Prieto", ciudad: "Bilbao" },
  { id: "31412", nombre: "A Coruña", ciudad: "A Coruña" },
  { id: "79300", nombre: "Girona", ciudad: "Girona" },
  { id: "37606", nombre: "León", ciudad: "León" },
];

const sinTildes = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export function buscarEstaciones(q: string): Estacion[] {
  const t = sinTildes(q.trim());
  if (!t) return ESTACIONES;
  return ESTACIONES.filter((e) => sinTildes(`${e.nombre} ${e.ciudad}`).includes(t));
}

// Número estable a partir de un texto, para que la misma búsqueda dé siempre los mismos trenes.
function semilla(texto: string): number {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

const TIPOS: { tipo: TipoTren; factor: number; base: number }[] = [
  { tipo: "AVE", factor: 1, base: 45 },
  { tipo: "Avlo", factor: 1.05, base: 19 },
  { tipo: "Alvia", factor: 1.35, base: 32 },
  { tipo: "Intercity", factor: 1.5, base: 25 },
  { tipo: "Media Distancia", factor: 1.8, base: 14 },
];

export function buscarTrenes({ origen, destino, fecha }: BusquedaTrenes): Tren[] {
  const o = ESTACIONES.find((e) => e.id === origen);
  const d = ESTACIONES.find((e) => e.id === destino);
  if (!o || !d || o.id === d.id) return [];

  const s = semilla(`${o.id}-${d.id}`);
  const minutosBase = 70 + (s % 120); // trayecto "AVE" entre 1 h 10 y 3 h 10
  const trenes: Tren[] = [];
  for (let i = 0; i < 9; i++) {
    const r = semilla(`${s}-${fecha}-${i}`);
    const { tipo, factor, base } = TIPOS[r % TIPOS.length];
    const salidaMin = 6 * 60 + i * 105 + (r % 40);
    const duracion = Math.round(minutosBase * factor);
    const salida = new Date(`${fecha}T00:00:00`);
    salida.setMinutes(salidaMin);
    const llegada = new Date(salida.getTime() + duracion * 60_000);
    trenes.push({
      id: `${o.id}-${d.id}-${fecha}-${i}`,
      tipo,
      numero: String(2000 + (r % 8000)),
      origen: o,
      destino: d,
      salida: iso(salida),
      llegada: iso(llegada),
      precioDesde: base + (r % 30),
      plazasLibres: r % 7 === 0 ? 0 : 3 + (r % 120),
    });
  }
  return trenes;
}

function iso(f: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${f.getFullYear()}-${p(f.getMonth() + 1)}-${p(f.getDate())}T${p(f.getHours())}:${p(f.getMinutes())}:00`;
}
