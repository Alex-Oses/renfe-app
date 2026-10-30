// Precio y plazas son simulados (Renfe solo publica GTFS). Deterministas a
// propósito: la misma búsqueda devuelve siempre lo mismo, para que la demo y
// los tests no cambien en cada llamada.
export { kmTrayecto, precioSimulado } from '../../common/simulado/precio.js';

function semilla(texto: string): number {
  let hash = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function plazasSimuladas(clave: string): number {
  return semilla(`${clave}:plazas`) % 61;
}
