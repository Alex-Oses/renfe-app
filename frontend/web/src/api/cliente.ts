// Único punto de acceso a la API. Sin VITE_API_URL se usan datos simulados.
import type { BusquedaTrenes, Estacion, Tren } from "./tipos";
import * as simulado from "./simulado";

const BASE = import.meta.env.VITE_API_URL as string | undefined;

async function get<T>(ruta: string): Promise<T> {
  const r = await fetch(`${BASE}${ruta}`);
  if (!r.ok) throw new Error(`La API respondió ${r.status} en ${ruta}`);
  return r.json() as Promise<T>;
}

export function buscarEstaciones(q: string): Promise<Estacion[]> {
  if (!BASE) return Promise.resolve(simulado.buscarEstaciones(q));
  return get(`/estaciones?q=${encodeURIComponent(q)}`);
}

export function buscarTrenes(b: BusquedaTrenes): Promise<Tren[]> {
  if (!BASE) return Promise.resolve(simulado.buscarTrenes(b));
  return get(`/trenes?${new URLSearchParams({ ...b })}`);
}

export const usaDatosSimulados = !BASE;
