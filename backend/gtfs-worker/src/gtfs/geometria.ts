/** Geometría mínima para los recorridos del mapa: distancias y simplificación de líneas. */

export type Punto = [lat: number, lon: number];

const RADIO_TIERRA_M = 6_371_000;
const rad = (g: number) => (g * Math.PI) / 180;

/** Distancia en metros entre dos puntos (haversine). */
export function metros(a: Punto, b: Punto): number {
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.sqrt(h));
}

/** Distancia en metros de `p` al segmento a-b (proyección plana local: vale para tramos cortos). */
function distanciaASegmento(p: Punto, a: Punto, b: Punto): number {
  const k = Math.cos(rad(a[0]));
  const [ax, ay, bx, by, px, py] = [a[1] * k, a[0], b[1] * k, b[0], p[1] * k, p[0]];
  const dx = bx - ax;
  const dy = by - ay;
  const t = dx === 0 && dy === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return metros(p, [ay + t * dy, (ax + t * dx) / k]);
}

/** Douglas-Peucker: quita los puntos que se desvían menos de `tolerancia` metros. Conserva extremos. */
export function simplificar(puntos: Punto[], tolerancia = 15): Punto[] {
  if (puntos.length <= 2) return puntos;
  const conservar = new Uint8Array(puntos.length);
  conservar[0] = conservar[puntos.length - 1] = 1;
  const pila: [number, number][] = [[0, puntos.length - 1]];
  while (pila.length) {
    const [i, j] = pila.pop()!;
    let maximo = 0;
    let indice = -1;
    for (let k = i + 1; k < j; k++) {
      const d = distanciaASegmento(puntos[k]!, puntos[i]!, puntos[j]!);
      if (d > maximo) [maximo, indice] = [d, k];
    }
    if (indice >= 0 && maximo > tolerancia) {
      conservar[indice] = 1;
      pila.push([i, indice], [indice, j]);
    }
  }
  return puntos.filter((_, k) => conservar[k]);
}

/** Redondea a 5 decimales (~1 m): menos bytes en la BD y en la respuesta de la API. */
export const redondear = (p: Punto): Punto => [Math.round(p[0] * 1e5) / 1e5, Math.round(p[1] * 1e5) / 1e5];
