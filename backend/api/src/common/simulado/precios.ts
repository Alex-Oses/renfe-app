// Tarifas, descuentos y extras del precio. Portado de `frontend/shared/api/simulado-precios.ts`:
// la API tiene que cobrar exactamente lo que el frontend muestra. Si cambias una tabla aquí,
// cámbiala también allí (y al revés).
export const IDS_TARIFA = ['basico', 'elige', 'elige-confort', 'premium'] as const;
export type IdTarifa = (typeof IDS_TARIFA)[number];
const FACTOR_TARIFA: Record<IdTarifa, number> = {
  basico: 1,
  elige: 1.25,
  'elige-confort': 1.5,
  premium: 1.9,
};

export const IDS_DESCUENTO = ['ninguno', 'joven', 'dorada', 'fn-general', 'fn-especial'] as const;
export type IdDescuento = (typeof IDS_DESCUENTO)[number];
const PCT_DESCUENTO: Record<IdDescuento, number> = {
  ninguno: 0,
  joven: 30,
  dorada: 40,
  'fn-general': 20,
  'fn-especial': 50,
};
const PCT_NINO = 40;

export const IDS_EXTRA = ['equipaje', 'mascota', 'bici', 'comida', 'seguro'] as const;
export type IdExtra = (typeof IDS_EXTRA)[number];
// porViajero: una vez por viajero con asiento; si no, una vez por reserva.
const EXTRA: Record<IdExtra, { precio: number; porViajero: boolean }> = {
  equipaje: { precio: 15, porViajero: false },
  mascota: { precio: 25, porViajero: false },
  bici: { precio: 10, porViajero: false },
  comida: { precio: 12, porViajero: true },
  seguro: { precio: 2.5, porViajero: true },
};

export const IDS_TIPO_VIAJERO = ['adulto', 'nino', 'bebe'] as const;
export type TipoViajero = (typeof IDS_TIPO_VIAJERO)[number];

const redondear = (n: number) => Math.round(n * 100) / 100;

/** Niño y descuento no se acumulan: se aplica el mayor. Bebé no paga. */
export function precioViajero(
  precioAsiento: number,
  tarifa: IdTarifa = 'basico',
  tipo: TipoViajero = 'adulto',
  descuento: IdDescuento = 'ninguno',
): number {
  if (tipo === 'bebe') return 0;
  const pct = Math.max(tipo === 'nino' ? PCT_NINO : 0, PCT_DESCUENTO[descuento]);
  return redondear(precioAsiento * FACTOR_TARIFA[tarifa] * (1 - pct / 100));
}

export function precioExtra(id: IdExtra, viajeros: number, tarifa: IdTarifa = 'basico'): number {
  if (id === 'comida' && tarifa === 'premium') return 0; // ya va incluida
  const e = EXTRA[id];
  return redondear(e.porViajero ? e.precio * viajeros : e.precio);
}

export interface Desglose {
  billetes: number;
  extras: number;
  total: number;
}

/** `tipos` va alineado con las butacas: una entrada por pasajero. */
export function calcularDesglose(o: {
  precioAsiento: number;
  tipos: TipoViajero[];
  tarifa?: IdTarifa;
  descuento?: IdDescuento;
  extras?: IdExtra[];
}): Desglose {
  const billetes = redondear(
    o.tipos.reduce((s, tipo) => s + precioViajero(o.precioAsiento, o.tarifa, tipo, o.descuento), 0),
  );
  const extras = redondear(
    [...new Set(o.extras ?? [])].reduce((s, id) => s + precioExtra(id, o.tipos.length, o.tarifa), 0),
  );
  return { billetes, extras, total: redondear(billetes + extras) };
}
