// Formato común de billetes, abonos y QR. Todo son funciones puras para poder
// probarlas sin BD.

/** `ave` → `AVE`; `null` → `DESCONOCIDO` (misma regla que `/trenes`). */
export function tipoVisible(tipoServicio: string | null): string {
  return tipoServicio?.toUpperCase() ?? 'DESCONOCIDO';
}

/** Número del tren al final de `nombre_corto` (`AVE 02070` → `02070`). */
export function numeroVisible(
  nombreCorto: string | null,
  numero: string | null = null,
): string | null {
  return numero ?? nombreCorto?.match(/(\d+)\s*$/)?.[1] ?? null;
}

/** `turista` → `Turista`, `preferente` → `Confort` (lo que ve el revisor). */
export function claseVisible(clase: string): string {
  return clase === 'preferente' ? 'Confort' : 'Turista';
}

/** `12345678Z` → `••••678Z`. Se guarda completo en BD; solo se enmascara al pintar. */
export function enmascararDocumento(documento: string): string {
  const limpio = documento.trim();
  return `••••${limpio.slice(-4)}`;
}

/** `Lucía Pérez Gómez` → `Lucía P.` (titular de un abono). */
export function enmascararTitular(nombre: string): string {
  const [pila = '', ...resto] = nombre.trim().split(/\s+/);
  const inicial = resto[0]?.[0];
  return inicial ? `${pila} ${inicial}.` : pila;
}

/** `12A`: butaca con letra de fila según el número (A y D son ventanilla). */
export function etiquetaAsiento(numero: number): string {
  return `${Math.ceil(numero / 4)}${'ABCD'[(numero - 1) % 4]}`;
}

/** Ventanilla = columnas A y D de la plantilla simulada de 4 asientos por fila. */
/** `2A` → 5: inversa de etiquetaAsiento. `null` si no es una butaca de la plantilla. */
export function numeroDeAsiento(etiqueta: string): number | null {
  const partes = /^(\d+)([A-D])$/.exec(etiqueta);
  if (!partes) return null;
  const numero = (Number(partes[1]) - 1) * 4 + 'ABCD'.indexOf(partes[2]!) + 1;
  return numero >= 1 && numero <= 40 ? numero : null;
}

export function esVentanilla(numero: number): boolean {
  const columna = (numero - 1) % 4;
  return columna === 0 || columna === 3;
}

/** `R-7K3M9Q` / `AB-7K2M9Q`: 6 caracteres sin letras que se confunden (0/O, 1/I). */
const ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function referencia(ancho = 6): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(ancho));
  return Array.from(bytes, (byte) => ALFABETO[byte % ALFABETO.length]).join('');
}
