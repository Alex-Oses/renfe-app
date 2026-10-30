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

// €/km y mínimo aproximados por producto. Cercanías va casi por zonas: fijo más poco por km.
const TARIFAS: Record<string, { fijo: number; porKm: number; minimo: number }> = {
  cercanias: { fijo: 1.5, porKm: 0.05, minimo: 1.8 },
  regional: { fijo: 1, porKm: 0.08, minimo: 2.5 },
  media_distancia: { fijo: 1, porKm: 0.09, minimo: 4 },
  avant: { fijo: 2, porKm: 0.13, minimo: 8 },
  intercity: { fijo: 2, porKm: 0.1, minimo: 8 },
  alvia: { fijo: 3, porKm: 0.13, minimo: 12 },
  avlo: { fijo: 2, porKm: 0.06, minimo: 7 },
  ave: { fijo: 4, porKm: 0.16, minimo: 15 },
};

/** Distancia por vía aproximada: la línea recta entre estaciones más un 25 %. */
export function kmTrayecto(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radianes = Math.PI / 180;
  const dLat = (lat2 - lat1) * radianes;
  const dLon = (lon2 - lon1) * radianes * Math.cos(((lat1 + lat2) / 2) * radianes);
  return 6371 * Math.hypot(dLat, dLon) * 1.25;
}

/** Euros por plaza según producto y distancia, ±15 % según el viaje (como la demanda real), en múltiplos de 5 céntimos. */
export function precioSimulado(tipoServicio: string | null, km: number, clave: string): number {
  const tarifa = TARIFAS[tipoServicio?.toLowerCase() ?? ''] ?? TARIFAS.media_distancia!;
  const base = Math.max(tarifa.minimo, tarifa.fijo + km * tarifa.porKm);
  const demanda = 0.85 + (semilla(`${clave}:precio`) % 3001) / 10000;
  return Math.round(base * demanda * 20) / 20;
}
