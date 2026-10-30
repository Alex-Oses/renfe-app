// Nombres de estación vistos durante la sesión. /trenes enlaza con el id y el buscador solo guarda
// texto, así que sin esta memoria al volver del resultado no se sabría cómo se llama la estación.
// Vive en memoria a propósito: no es un dato de negocio, solo para no repetir peticiones.
import type { Estacion } from "./tipos";

const vistas = new Map<string, Estacion>();

export function recordarEstaciones(lista: Estacion[]): void {
  for (const e of lista) if (e?.id) vistas.set(e.id, e);
}

export const estacionConocida = (id?: string | null): Estacion | undefined =>
  id ? vistas.get(id) : undefined;
