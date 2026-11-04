import type { Viaje } from "@renfe/shared/billetes/agrupar";

/** El primer billete del viaje es el destino de la tarjeta completa. */
export function enlaceBillete(viaje: Viaje): string {
  return `/billetes/${encodeURIComponent(viaje.billetes[0].id)}`;
}
