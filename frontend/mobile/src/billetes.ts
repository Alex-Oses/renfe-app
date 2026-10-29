import type { Billete } from "@renfe/shared/api/tipos";

// Una reserva puede tener varios billetes (uno por viajero). Se enseñan juntos, como en la web.
export interface Viaje {
  reservaId: string;
  billetes: Billete[];
}

export function agrupar(billetes: Billete[]): Viaje[] {
  const mapa = new Map<string, Billete[]>();
  for (const b of billetes) mapa.set(b.reservaId, [...(mapa.get(b.reservaId) ?? []), b]);
  return [...mapa]
    .map(([reservaId, bs]) => ({
      reservaId,
      billetes: bs.sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true })),
    }))
    .sort((a, b) => a.billetes[0].tren.salida.localeCompare(b.billetes[0].tren.salida));
}

// "A Coruña" -> "a-coruna", para buscar la foto del destino.
export const slug = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
