// Tarifas, descuentos y extras simulados. Inspirados en la web de Renfe; los importes son inventados.
import type { IdDescuento, IdExtra, IdTarifa, TipoViajero } from "./tipos";

export const TARIFAS: { id: IdTarifa; nombre: string; factor: number; incluye: string[] }[] = [
  { id: "basico", nombre: "Básico", factor: 1, incluye: ["Plaza Estándar asignada", "Sin cambios ni anulaciones"] },
  { id: "elige", nombre: "Elige", factor: 1.25, incluye: ["Elige tu plaza", "Cambios con cargo", "Anulación con cargo del 30 %"] },
  { id: "elige-confort", nombre: "Elige Confort", factor: 1.5, incluye: ["Plaza Confort, más amplia", "Cambios gratis", "Anulación con cargo del 30 %"] },
  { id: "premium", nombre: "Prémium", factor: 1.9, incluye: ["Plaza Prémium", "Comida a bordo incluida", "Cambios y anulación gratis", "Acceso a Sala Club"] },
];

// Porcentaje que se descuenta; niño y tarjeta no se acumulan: se aplica el mayor.
export const DESCUENTOS: { id: IdDescuento; nombre: string; pct: number }[] = [
  { id: "ninguno", nombre: "Sin descuento", pct: 0 },
  { id: "joven", nombre: "Tarjeta Joven (14-25 años)", pct: 30 },
  { id: "dorada", nombre: "Tarjeta Dorada (mayores de 60)", pct: 40 },
  { id: "fn-general", nombre: "Familia numerosa general", pct: 20 },
  { id: "fn-especial", nombre: "Familia numerosa especial", pct: 50 },
];
export const PCT_NINO = 40;

// porViajero: se cobra una vez por cada viajero con asiento; si no, una vez por reserva.
export const EXTRAS: { id: IdExtra; nombre: string; precio: number; porViajero: boolean }[] = [
  { id: "equipaje", nombre: "Maleta extra", precio: 15, porViajero: false },
  { id: "mascota", nombre: "Mascota (hasta 10 kg, en transportín)", precio: 25, porViajero: false },
  { id: "bici", nombre: "Bicicleta desmontada", precio: 10, porViajero: false },
  { id: "comida", nombre: "Menú a bordo", precio: 12, porViajero: true },
  { id: "seguro", nombre: "Seguro de viaje", precio: 2.5, porViajero: true },
];

const redondear = (n: number) => Math.round(n * 100) / 100;
const buscar = <T extends { id: string }>(lista: T[], id: string | undefined, def: T) => lista.find((x) => x.id === id) ?? def;

export function precioViajero(precioAsiento: number, tarifa: IdTarifa = "basico", tipo: TipoViajero = "adulto", descuento: IdDescuento = "ninguno"): number {
  if (tipo === "bebe") return 0;
  const pct = Math.max(tipo === "nino" ? PCT_NINO : 0, buscar(DESCUENTOS, descuento, DESCUENTOS[0]).pct);
  return redondear(precioAsiento * buscar(TARIFAS, tarifa, TARIFAS[0]).factor * (1 - pct / 100));
}

export function precioExtra(id: IdExtra, viajeros: number, tarifa: IdTarifa = "basico"): number {
  if (id === "comida" && tarifa === "premium") return 0; // ya va incluida
  const e = EXTRAS.find((x) => x.id === id);
  if (!e) return 0;
  return redondear(e.porViajero ? e.precio * viajeros : e.precio);
}

export interface Desglose {
  billetes: number;
  extras: number;
  total: number;
}

export function calcularTotal(o: {
  precios: number[]; // precio de cada asiento
  tipos?: (TipoViajero | undefined)[];
  tarifa?: IdTarifa;
  descuento?: IdDescuento;
  extras?: IdExtra[];
}): Desglose {
  const billetes = redondear(o.precios.reduce((s, p, i) => s + precioViajero(p, o.tarifa, o.tipos?.[i], o.descuento), 0));
  const extras = redondear([...new Set(o.extras ?? [])].reduce((s, id) => s + precioExtra(id, o.precios.length, o.tarifa), 0));
  return { billetes, extras, total: redondear(billetes + extras) };
}
