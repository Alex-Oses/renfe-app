import type { Billete, TransbordoApi } from "../api/tipos";

export interface Viaje {
  reservaId: string;
  billetes: Billete[]; // ordenados por id (LOC-1, LOC-2...)
  transbordos?: TransbordoApi[];
  // Segundo tren del mismo viaje, si este se compró con transbordo.
  enlace?: Viaje;
}

// Junta los billetes de una misma reserva y ordena los viajes por salida.
export function agrupar(billetes: Billete[]): Viaje[] {
  const mapa = new Map<string, Billete[]>();
  for (const b of billetes) mapa.set(b.reservaId, [...(mapa.get(b.reservaId) ?? []), b]);
  return [...mapa]
    .map(([reservaId, bs]) => ({
      reservaId,
      billetes: bs.sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true })),
      transbordos: bs[0]?.transbordos,
    }))
    .sort((a, b) => a.billetes[0].tren.salida.localeCompare(b.billetes[0].tren.salida));
}

const MINUTO = 60_000;

// No se guarda un id de transbordo: dos reservas forman uno si se compraron juntas y una acaba donde
// empieza la otra, con la espera que ofrece GET /trenes/transbordos (15 min a 3 h).
function sonTransbordo(a: Viaje, b: Viaje): boolean {
  if (a.transbordos?.some((t) => t.desde === a.reservaId && t.hasta === b.reservaId)) return true;
  if (a.transbordos || b.transbordos) return false;
  const [x, y] = [a.billetes[0]!, b.billetes[0]!];
  if (!x.emitido || !y.emitido || a.billetes.length !== b.billetes.length) return false;
  if (x.tren.destino.id !== y.tren.origen.id) return false;
  const espera = (Date.parse(y.tren.salida) - Date.parse(x.tren.llegada)) / MINUTO;
  return espera >= 15 && espera <= 180 && Math.abs(Date.parse(y.emitido) - Date.parse(x.emitido)) <= 15 * MINUTO;
}

const emision = (v: Viaje) => Date.parse(v.billetes[0]!.emitido ?? "");

// Si el mismo viaje se compra dos veces seguidas, cada segundo tren va con el primero que se emitió más cerca.
export function unirTransbordos(viajes: Viaje[]): Viaje[] {
  const salida: Viaje[] = [];
  for (const viaje of viajes) {
    const previo = salida
      .filter((p) => !p.enlace && sonTransbordo(p, viaje))
      .sort((p, q) => Math.abs(emision(p) - emision(viaje)) - Math.abs(emision(q) - emision(viaje)))[0];
    if (previo) previo.enlace = viaje;
    else salida.push(viaje);
  }
  return salida;
}

// Lo pagado por un viaje (con su transbordo): billetes más los extras de cada reserva, una vez.
export const totalViaje = (v: Viaje): number =>
  Math.round(
    [v, ...(v.enlace ? [v.enlace] : [])].reduce(
      (suma, r) => suma + r.billetes.reduce((s, b) => s + b.asiento.precio, 0) + (r.billetes[0]?.extrasReserva ?? 0),
      0,
    ) * 100,
  ) / 100;

// Un viaje acaba cuando llega su último tren (el del transbordo, si lo hay). Compara instantes, no
// textos: la llegada viene con el offset de Madrid y toISOString() va en UTC.
export const haTerminado = (viaje: Viaje, ahora = Date.now()) =>
  Date.parse((viaje.enlace ?? viaje).billetes[0]!.tren.llegada) < ahora;
