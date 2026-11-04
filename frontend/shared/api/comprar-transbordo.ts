import { crearReservaTransbordo } from "./cliente";
import type { NuevaReserva, Reserva, Tren } from "./tipos";

// La API confirma los dos tramos en una sola transacción.
export function comprarDosTramos(trenes: [Tren, Tren], datos: NuevaReserva): Promise<[Reserva, Reserva]> {
  return crearReservaTransbordo(trenes, datos);
}

// El tripId de un mismo servicio cambia entre búsquedas (lleva la fecha de su calendario GTFS), así que
// la opción elegida se identifica por tipo, número y hora de salida de cada tren, no por su id.
export const claveTramo = (t: { tipo: string; numero: string; salida: string }) => `${t.tipo}|${t.numero}|${t.salida}`;

export const buscarOpcion = <O extends { tramos: [{ tipo: string; numero: string; salida: string }, { tipo: string; numero: string; salida: string }] }>(
  lista: O[],
  a: string | undefined | null,
  b: string | undefined | null,
): O | undefined => lista.find((o) => claveTramo(o.tramos[0]) === a && claveTramo(o.tramos[1]) === b);
