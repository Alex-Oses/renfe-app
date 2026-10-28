// Empareja el tren de un billete con su posición en directo para enseñar el retraso.
import type { PosicionTren, Tren } from "./tipos";

type TrenBillete = Pick<Tren, "numero" | "salida" | "llegada">;

// Solo merece la pena buscarlo si sale hoy o ya está en marcha (y aún no ha llegado).
export function seguirRetraso(t: TrenBillete, ahora = new Date()): boolean {
  if (ahora.getTime() > Date.parse(t.llegada)) return false;
  return ahora.getTime() >= Date.parse(t.salida) || new Date(t.salida).toDateString() === ahora.toDateString();
}

// Por número de tren (sin ceros a la izquierda). Si no hay ninguno, o hay varios y no se
// sabe cuál es, null: mejor no enseñar nada que enseñar el retraso de otro tren.
export function emparejarTren(t: TrenBillete, posiciones: PosicionTren[]): PosicionTren | null {
  const num = (n: string) => n.trim().replace(/^0+(?=\d)/, "");
  const iguales = posiciones.filter((p) => num(p.numero) === num(t.numero));
  return iguales.length === 1 ? iguales[0] : null;
}

export const textoRetraso = (p: PosicionTren) => (p.retrasoMin > 0 ? `+${p.retrasoMin} min` : "Puntual");
