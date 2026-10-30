// Datos simulados mientras la API no existe. Mismas firmas que cliente.ts.
import type { BusquedaTrenes, Estacion, TipoTren, Tren } from "./tipos";

export const ESTACIONES: Estacion[] = [
  { id: "60000", nombre: "Madrid-Puerta de Atocha", ciudad: "Madrid", lat: 40.4066, lon: -3.6892 },
  { id: "43000", nombre: "Tarragona", ciudad: "Tarragona", lat: 41.1189, lon: 1.2445 },
  { id: "17000", nombre: "Madrid-Chamartín-Clara Campoamor", ciudad: "Madrid", lat: 40.4722, lon: -3.6825 },
  { id: "71801", nombre: "Barcelona-Sants", ciudad: "Barcelona", lat: 41.3791, lon: 2.1404 },
  { id: "65000", nombre: "València Joaquín Sorolla", ciudad: "Valencia", lat: 39.4594, lon: -0.3836 },
  { id: "51003", nombre: "Sevilla-Santa Justa", ciudad: "Sevilla", lat: 37.3916, lon: -5.9756 },
  { id: "50500", nombre: "Córdoba", ciudad: "Córdoba", lat: 37.8885, lon: -4.7899 },
  { id: "54413", nombre: "Málaga María Zambrano", ciudad: "Málaga", lat: 36.7118, lon: -4.4325 },
  { id: "04040", nombre: "Zaragoza-Delicias", ciudad: "Zaragoza", lat: 41.6587, lon: -0.9113 },
  { id: "10600", nombre: "Valladolid Campo Grande", ciudad: "Valladolid", lat: 41.6449, lon: -4.729 },
  { id: "60911", nombre: "Alicante/Alacant", ciudad: "Alicante", lat: 38.3442, lon: -0.4951 },
  { id: "05000", nombre: "Bilbao-Abando Indalecio Prieto", ciudad: "Bilbao", lat: 43.2614, lon: -2.9268 },
  { id: "31412", nombre: "A Coruña", ciudad: "A Coruña", lat: 43.3546, lon: -8.4097 },
  { id: "79300", nombre: "Girona", ciudad: "Girona", lat: 41.979, lon: 2.817 },
  { id: "37606", nombre: "León", ciudad: "León", lat: 42.593, lon: -5.58 },
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

// Los ids simulados son "<origen>-<destino>-<AAAA-MM-DD>-<n>": se regenera la búsqueda y se coge el tren.
export function obtenerTren(id: string): Tren {
  const [origen, destino, a, m, d] = id.split("-");
  const tren = buscarTrenes({ origen, destino, fecha: `${a}-${m}-${d}` }).find((t) => t.id === id);
  if (!tren) throw new Error("Ese tren no existe o ya no está a la venta.");
  return tren;
}
