// Catálogo cerrado de abonos y bonos (endpoints.md, «Abonos y bonos»). Todo es
// simulado: no hay tarifas reales, solo precios de demo deterministas.
export const TIPOS_ABONO = [
  'ave-ld-mensual',
  'avant-mensual',
  'cercanias-recurrente',
  'bono-10',
] as const;

export type TipoAbono = (typeof TIPOS_ABONO)[number];

export interface ProductoAbono {
  nombre: string;
  /** Días naturales de validez; `fin` = inicio + dias - 1 (último día inclusive). */
  dias: number;
  /** `null` = ilimitado. */
  viajes: number | null;
  /** Precio simulado en euros. */
  precio: number;
  /** `false` solo en Cercanías, que no lleva trayecto. */
  trayecto: boolean;
}

export const PRODUCTOS: Record<TipoAbono, ProductoAbono> = {
  'ave-ld-mensual': {
    nombre: 'Abono mensual AVE/Larga Distancia',
    dias: 30,
    viajes: null,
    precio: 380,
    trayecto: true,
  },
  'avant-mensual': {
    nombre: 'Abono mensual Avant',
    dias: 30,
    viajes: null,
    precio: 230,
    trayecto: true,
  },
  'cercanias-recurrente': {
    nombre: 'Abono recurrente Cercanías',
    dias: 30,
    viajes: null,
    precio: 60,
    trayecto: false,
  },
  'bono-10': {
    nombre: 'Bono 10 viajes',
    dias: 60,
    viajes: 10,
    precio: 220,
    trayecto: true,
  },
};

export function productoDe(tipo: string): ProductoAbono | undefined {
  return PRODUCTOS[tipo as TipoAbono];
}
