import type { Billete } from "../../api/tipos";

export interface Viaje {
  reservaId: string;
  billetes: Billete[]; // ordenados por id (LOC-1, LOC-2...)
}

// Junta los billetes de una misma reserva y ordena los viajes por salida.
export function agrupar(billetes: Billete[]): Viaje[] {
  const mapa = new Map<string, Billete[]>();
  for (const b of billetes) mapa.set(b.reservaId, [...(mapa.get(b.reservaId) ?? []), b]);
  return [...mapa]
    .map(([reservaId, bs]) => ({ reservaId, billetes: bs.sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true })) }))
    .sort((a, b) => a.billetes[0].tren.salida.localeCompare(b.billetes[0].tren.salida));
}
