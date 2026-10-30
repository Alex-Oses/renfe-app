import type { Billete } from "@renfe/shared/api/tipos";

export interface Viaje {
  reservaId: string;
  billetes: Billete[]; // ordenados por id (LOC-1, LOC-2...)
  // Segundo tren del mismo viaje, si este se compró con transbordo.
  enlace?: Viaje;
}

// Junta los billetes de una misma reserva y ordena los viajes por salida.
export function agrupar(billetes: Billete[]): Viaje[] {
  const mapa = new Map<string, Billete[]>();
  for (const b of billetes) mapa.set(b.reservaId, [...(mapa.get(b.reservaId) ?? []), b]);
  return [...mapa]
    .map(([reservaId, bs]) => ({ reservaId, billetes: bs.sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true })) }))
    .sort((a, b) => a.billetes[0].tren.salida.localeCompare(b.billetes[0].tren.salida));
}

const MINUTO = 60_000;

// No se guarda un id de transbordo: dos reservas forman uno si se compraron juntas y una acaba donde
// empieza la otra, con la espera que ofrece GET /trenes/transbordos (15 min a 3 h).
function sonTransbordo(a: Viaje, b: Viaje): boolean {
  const [x, y] = [a.billetes[0]!, b.billetes[0]!];
  if (!x.emitido || !y.emitido || a.billetes.length !== b.billetes.length) return false;
  if (x.tren.destino.id !== y.tren.origen.id) return false;
  const espera = (Date.parse(y.tren.salida) - Date.parse(x.tren.llegada)) / MINUTO;
  return espera >= 15 && espera <= 180 && Math.abs(Date.parse(y.emitido) - Date.parse(x.emitido)) <= 15 * MINUTO;
}

export function unirTransbordos(viajes: Viaje[]): Viaje[] {
  const salida: Viaje[] = [];
  for (const viaje of viajes) {
    const previo = salida.at(-1);
    if (previo && !previo.enlace && sonTransbordo(previo, viaje)) previo.enlace = viaje;
    else salida.push(viaje);
  }
  return salida;
}
