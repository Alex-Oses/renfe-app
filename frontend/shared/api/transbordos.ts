// Mismos márgenes que la API (`backend/api/src/modules/trenes/transbordos.ts`), tomados de
// obsidian/02-contratos-api/endpoints.md: 15 min en la misma estación, 30 al cambiar de estación
// dentro de la misma ciudad y 3 h de espera máxima.
export const MARGEN_MIN_MIN = 15;
export const MARGEN_CAMBIO_MIN = 30;
export const ESPERA_MAX_MIN = 180;

/**
 * ¿La opción que ha devuelto la API es realmente posible? Se recalcula la espera con las horas ISO
 * de los tramos, sin fiarse de `esperaMin`, y se compara por instante (cambio de día incluido).
 */
export function transbordoViable(opcion: {
  cambioEstacion?: boolean;
  tramos: [{ llegada: string }, { salida: string }];
}): boolean {
  const espera =
    (Date.parse(opcion.tramos[1].salida) - Date.parse(opcion.tramos[0].llegada)) / 60_000;
  const minimo = opcion.cambioEstacion ? MARGEN_CAMBIO_MIN : MARGEN_MIN_MIN;
  return Number.isFinite(espera) && espera >= minimo && espera <= ESPERA_MAX_MIN;
}
