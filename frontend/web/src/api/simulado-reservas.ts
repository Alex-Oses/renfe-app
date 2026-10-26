// Reservas, pagos y billetes simulados. Dueño: agente de reservas.
import type { Asiento, Billete, IntentoPago, NuevaReserva, Reserva } from "./tipos";

const pendiente = (): never => {
  throw new Error("Pendiente de implementar");
};

export const obtenerAsientos = (_trenId: string): Asiento[] => pendiente();
export const crearReserva = (_r: NuevaReserva): Reserva => pendiente();
export const crearIntentoPago = (_reservaId: string): IntentoPago => pendiente();
export const confirmarPago = (_reservaId: string): Reserva => pendiente();
export const misBilletes = (): Billete[] => pendiente();
export const obtenerBillete = (_id: string): Billete => pendiente();
