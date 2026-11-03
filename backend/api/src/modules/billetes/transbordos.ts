import type { Billete } from './billetes.service.js';

export interface EnlaceTransbordo {
  desde: string;
  hasta: string;
}

const MINUTO = 60_000;

// Una reserva (localizador) es un tramo; sus billetes se ordenan por id (LOC-1, LOC-2...).
function tramos(billetes: Billete[]): Billete[][] {
  const mapa = new Map<string, Billete[]>();
  for (const billete of billetes) {
    mapa.set(billete.localizador, [...(mapa.get(billete.localizador) ?? []), billete]);
  }
  return [...mapa.values()]
    .map((bs) => bs.sort((a, b) => a.id.localeCompare(b.id, 'es', { numeric: true })))
    .sort((a, b) => a[0].salida.localeCompare(b[0].salida));
}

// Misma regla que el frontend: se compraron juntos y uno acaba donde empieza el otro.
function enlazan(a: Billete[], b: Billete[]): boolean {
  const [x, y] = [a[0], b[0]];
  if (a.length !== b.length || x.destino.id !== y.origen.id) return false;
  const espera = (Date.parse(y.salida) - Date.parse(x.llegada)) / MINUTO;
  return (
    espera >= 15 &&
    espera <= 180 &&
    Math.abs(Date.parse(y.emitido) - Date.parse(x.emitido)) <= 15 * MINUTO
  );
}

/** Pares de reservas consecutivas que forman un viaje con transbordo. */
export function transbordosDe(billetes: Billete[]): EnlaceTransbordo[] {
  const grupos = tramos(billetes);
  const enlaces: EnlaceTransbordo[] = [];
  for (let i = 1; i < grupos.length; i++) {
    if (enlazan(grupos[i - 1], grupos[i])) {
      enlaces.push({ desde: grupos[i - 1][0].localizador, hasta: grupos[i][0].localizador });
    }
  }
  return enlaces;
}
