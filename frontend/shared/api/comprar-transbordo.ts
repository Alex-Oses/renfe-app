import { crearReservaTransbordo } from "./cliente";
import type { NuevaReserva, Reserva, Tren } from "./tipos";

// La API confirma los dos tramos en una sola transacción.
export function comprarDosTramos(trenes: [Tren, Tren], datos: NuevaReserva): Promise<[Reserva, Reserva]> {
  return crearReservaTransbordo(trenes, datos);
}
