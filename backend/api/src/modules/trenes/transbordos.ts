// Márgenes del contrato (obsidian/02-contratos-api/endpoints.md): 15 min en la misma estación,
// 30 min si hay que cambiar de estación dentro de la misma ciudad y 3 h de espera máxima.
// Si el producto cambia el margen, se cambia aquí y en `frontend/shared/api/transbordos.ts`.
export const MARGEN_MIN_MS = 15 * 60_000;
export const MARGEN_CAMBIO_MS = 30 * 60_000;
export const ESPERA_MAX_MS = 3 * 60 * 60_000;

/**
 * ¿El enlace llega y sale con tiempo suficiente? Las horas son ISO con offset, así que el cambio
 * de día y los trenes nocturnos se comparan por instante, no por reloj de pared.
 */
export function esperaSuficiente(
  llegada: string,
  salida: string,
  cambioEstacion: boolean,
): boolean {
  const espera = Date.parse(salida) - Date.parse(llegada);
  const minimo = cambioEstacion ? MARGEN_CAMBIO_MS : MARGEN_MIN_MS;
  return Number.isFinite(espera) && espera >= minimo && espera <= ESPERA_MAX_MS;
}
