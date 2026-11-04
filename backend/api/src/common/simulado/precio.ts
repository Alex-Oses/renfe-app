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

// Mismas reglas que la web (frontend/shared/api/simulado-precios.ts): tarifa por factor, niño 40 % y la
// tarjeta no se acumula con el niño (gana el mayor).
export const TIPOS_VIAJERO = ['adulto', 'nino'] as const;
export type TipoViajero = (typeof TIPOS_VIAJERO)[number];
export const FACTOR_TARIFA: Record<string, number> = { basico: 1, elige: 1.25, 'elige-confort': 1.5, premium: 1.9 };
export const PCT_DESCUENTO: Record<string, number> = {
  ninguno: 0,
  joven: 30,
  dorada: 40,
  'fn-general': 20,
  'fn-especial': 50,
};
export const PCT_NINO = 40;

export function centimosViajero(base: number, tipo = 'adulto', tarifa = 'basico', descuento = 'ninguno'): number {
  const pct = Math.max(tipo === 'nino' ? PCT_NINO : 0, PCT_DESCUENTO[descuento] ?? 0);
  return Math.round(base * (FACTOR_TARIFA[tarifa] ?? 1) * (1 - pct / 100));
}

// Extras: los que van por viajero se cobran una vez por butaca; el menú ya va incluido en Prémium.
export const EXTRAS: Record<string, { centimos: number; porViajero: boolean }> = {
  equipaje: { centimos: 1500, porViajero: false },
  mascota: { centimos: 2500, porViajero: false },
  bici: { centimos: 1000, porViajero: false },
  comida: { centimos: 1200, porViajero: true },
  seguro: { centimos: 250, porViajero: true },
};

export function centimosExtras(ids: readonly string[], viajeros: number, tarifa = 'basico'): number {
  return [...new Set(ids)].reduce((suma, id) => {
    const e = EXTRAS[id];
    if (!e || (id === 'comida' && tarifa === 'premium')) return suma;
    return suma + (e.porViajero ? e.centimos * viajeros : e.centimos);
  }, 0);
}
