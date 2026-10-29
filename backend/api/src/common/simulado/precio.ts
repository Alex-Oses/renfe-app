// Precio simulado (Renfe solo publica GTFS). Determinista a propósito: la misma
// clave devuelve siempre el mismo precio, para que la demo y los tests no cambien
// en cada llamada.
function semilla(texto: string): number {
  let hash = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function precioSimulado(clave: string): number {
  return Number((20 + (semilla(`${clave}:precio`) % 8000) / 100).toFixed(2));
}
