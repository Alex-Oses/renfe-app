import { crearReservaTransbordo } from "./cliente";
import { haSalido } from "./salidas";
import { precioViajero } from "./simulado-precios";
import type { IdDescuento, IdTarifa, TipoViajero } from "./tipos";
import type { NuevaReserva, Reserva, Tren } from "./tipos";

// La API confirma los dos tramos en una sola transacción.
export function comprarDosTramos(trenes: [Tren, Tren], datos: NuevaReserva): Promise<[Reserva, Reserva]> {
  if (trenes.some((tren) => haSalido(tren.salida))) {
    throw new Error("Alguno de los trenes ya ha salido: vuelve a buscar la combinación.");
  }
  return crearReservaTransbordo(trenes, datos);
}

// El tripId de un mismo servicio cambia entre búsquedas (lleva la fecha de su calendario GTFS), así que
// la opción elegida se identifica por tipo, número y hora de salida de cada tren, no por su id.
export const claveTramo = (t: { tipo: string; numero: string; salida: string }) => `${t.tipo}|${t.numero}|${t.salida}`;

// Mismo cálculo que hace la API: un billete por tramo y viajero, con la tarifa y el descuento. Se usa
// para que la vista previa del transbordo enseñe lo que se va a cobrar, no la suma base.
export function precioOpcion(
  opcion: { tramos: [{ precioDesde: number }, { precioDesde: number }] },
  {
    tipos,
    tarifa,
    descuento,
  }: { tipos: TipoViajero[]; tarifa?: IdTarifa; descuento?: IdDescuento },
): number {
  const total = tipos.reduce(
    (suma, tipo) =>
      suma +
      precioViajero(opcion.tramos[0].precioDesde, tarifa, tipo, descuento) +
      precioViajero(opcion.tramos[1].precioDesde, tarifa, tipo, descuento),
    0,
  );
  return Math.round(total * 100) / 100;
}

export const buscarOpcion = <O extends { tramos: [{ tipo: string; numero: string; salida: string }, { tipo: string; numero: string; salida: string }] }>(
  lista: O[],
  a: string | undefined | null,
  b: string | undefined | null,
): O | undefined => lista.find((o) => claveTramo(o.tramos[0]) === a && claveTramo(o.tramos[1]) === b);
