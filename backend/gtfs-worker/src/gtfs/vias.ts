/**
 * Red ferroviaria de OpenStreetMap como grafo, para dibujar el recorrido real de los trenes que no
 * traen `shapes.txt` (AV/LD/MD). Cada estación se engancha al nodo de vía más cercano y el trazado
 * entre dos estaciones seguidas es el camino más corto por las vías (A* con distancia en metros).
 * Datos © colaboradores de OpenStreetMap (ODbL).
 */
import { metros, redondear, simplificar, type Punto } from "./geometria.js";

/** Respuesta de Overpass con `out body; >; out skel qt;`. */
export interface Osm {
  elements: Array<
    | { type: "node"; id: number; lat: number; lon: number }
    | { type: "way"; id: number; nodes: number[]; tags?: Record<string, string> }
  >;
}

export interface Grafo {
  coords: Map<number, Punto>;
  vecinos: Map<number, Array<[nodo: number, metros: number]>>;
  /** Celdas de ~1 km con sus nodos, para encontrar el más cercano sin recorrer todos. */
  celdas: Map<string, number[]>;
  /** Red conexa a la que pertenece cada nodo: ancho ibérico y ancho estándar (AVE) no se tocan. */
  componente: Map<number, number>;
}

const CELDA = 0.01; // grados (~1 km)
const celda = (lat: number, lon: number) => `${Math.floor(lat / CELDA)}:${Math.floor(lon / CELDA)}`;

export function construirGrafo(osm: Osm): Grafo {
  const coords = new Map<number, Punto>();
  for (const e of osm.elements) if (e.type === "node") coords.set(e.id, [e.lat, e.lon]);

  const vecinos = new Map<number, Array<[number, number]>>();
  const unir = (a: number, b: number, m: number) => {
    const lista = vecinos.get(a);
    if (lista) lista.push([b, m]);
    else vecinos.set(a, [[b, m]]);
  };
  for (const e of osm.elements) {
    if (e.type !== "way") continue;
    for (let i = 1; i < e.nodes.length; i++) {
      const [a, b] = [e.nodes[i - 1]!, e.nodes[i]!];
      const [pa, pb] = [coords.get(a), coords.get(b)];
      if (!pa || !pb) continue;
      const m = metros(pa, pb);
      unir(a, b, m);
      unir(b, a, m);
    }
  }

  const celdas = new Map<string, number[]>();
  for (const id of vecinos.keys()) {
    const [lat, lon] = coords.get(id)!;
    const clave = celda(lat, lon);
    const lista = celdas.get(clave);
    if (lista) lista.push(id);
    else celdas.set(clave, [id]);
  }
  const componente = new Map<number, number>();
  let siguiente = 0;
  for (const inicio of vecinos.keys()) {
    if (componente.has(inicio)) continue;
    const pila = [inicio];
    componente.set(inicio, siguiente);
    while (pila.length) {
      for (const [v] of vecinos.get(pila.pop()!) ?? []) {
        if (!componente.has(v)) {
          componente.set(v, siguiente);
          pila.push(v);
        }
      }
    }
    siguiente += 1;
  }
  return { coords, vecinos, celdas, componente };
}

/** El nodo más cercano a `p` de cada red conexa que pasa a menos de `radio` metros. */
export function candidatos(g: Grafo, p: Punto, radio = 3000): Map<number, number> {
  const anillos = Math.ceil(radio / 1000) + 1;
  const [ci, cj] = [Math.floor(p[0] / CELDA), Math.floor(p[1] / CELDA)];
  const mejor = new Map<number, [nodo: number, metros: number]>();
  for (let i = ci - anillos; i <= ci + anillos; i++) {
    for (let j = cj - anillos; j <= cj + anillos; j++) {
      for (const id of g.celdas.get(`${i}:${j}`) ?? []) {
        const d = metros(p, g.coords.get(id)!);
        const red = g.componente.get(id)!;
        if (d < radio && d < (mejor.get(red)?.[1] ?? Infinity)) mejor.set(red, [id, d]);
      }
    }
  }
  return new Map([...mejor].map(([red, [id]]) => [red, id]));
}

/** Nodo de vía más cercano a `p` dentro de `radio` metros, o `null`. */
export function nodoCercano(g: Grafo, p: Punto, radio = 3000): number | null {
  const anillos = Math.ceil(radio / 1000) + 1;
  const [ci, cj] = [Math.floor(p[0] / CELDA), Math.floor(p[1] / CELDA)];
  let mejor: number | null = null;
  let distancia = radio;
  for (let i = ci - anillos; i <= ci + anillos; i++) {
    for (let j = cj - anillos; j <= cj + anillos; j++) {
      for (const id of g.celdas.get(`${i}:${j}`) ?? []) {
        const d = metros(p, g.coords.get(id)!);
        if (d < distancia) [mejor, distancia] = [id, d];
      }
    }
  }
  return mejor;
}

/** Montículo binario mínimo de [prioridad, nodo]. */
class Monticulo {
  private datos: Array<[number, number]> = [];
  get tamano() {
    return this.datos.length;
  }
  meter(x: [number, number]) {
    const d = this.datos;
    d.push(x);
    for (let i = d.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (d[p]![0] <= d[i]![0]) break;
      [d[p], d[i]] = [d[i]!, d[p]!];
      i = p;
    }
  }
  sacar(): [number, number] {
    const d = this.datos;
    const cima = d[0]!;
    const ultimo = d.pop()!;
    if (d.length) {
      d[0] = ultimo;
      for (let i = 0; ; ) {
        const [l, r] = [2 * i + 1, 2 * i + 2];
        let m = i;
        if (l < d.length && d[l]![0] < d[m]![0]) m = l;
        if (r < d.length && d[r]![0] < d[m]![0]) m = r;
        if (m === i) break;
        [d[m], d[i]] = [d[i]!, d[m]!];
        i = m;
      }
    }
    return cima;
  }
}

/** Camino más corto por las vías entre dos nodos (A*). `null` si no están conectados. */
export function caminoMasCorto(g: Grafo, desde: number, hasta: number, maxNodos = 3_000_000): { puntos: Punto[]; metros: number } | null {
  const fin = g.coords.get(hasta)!;
  const coste = new Map<number, number>([[desde, 0]]);
  const previo = new Map<number, number>();
  const abiertos = new Monticulo();
  abiertos.meter([metros(g.coords.get(desde)!, fin), desde]);
  let explorados = 0;
  while (abiertos.tamano) {
    const [, nodo] = abiertos.sacar();
    if (nodo === hasta) {
      const camino = [hasta];
      for (let n = hasta; previo.has(n); ) camino.push((n = previo.get(n)!));
      return { puntos: camino.reverse().map((n) => g.coords.get(n)!), metros: coste.get(hasta)! };
    }
    if (++explorados > maxNodos) return null;
    const base = coste.get(nodo)!;
    for (const [vecino, m] of g.vecinos.get(nodo) ?? []) {
      const nuevo = base + m;
      if (nuevo < (coste.get(vecino) ?? Infinity)) {
        coste.set(vecino, nuevo);
        previo.set(vecino, nodo);
        abiertos.meter([nuevo + metros(g.coords.get(vecino)!, fin), vecino]);
      }
    }
  }
  return null;
}

/**
 * Trazado entre dos estaciones por las vías, simplificado para el mapa. `null` si alguna estación
 * no tiene vía cerca o el camino es absurdo (más del triple de la distancia en línea recta).
 */
export function trazado(g: Grafo, origen: Punto, destino: Punto): { puntos: Punto[]; metros: number } | null {
  // Se prueba en cada red que pase cerca de las dos estaciones y se queda el camino más corto.
  const [desde, hasta] = [candidatos(g, origen), candidatos(g, destino)];
  let camino: { puntos: Punto[]; metros: number } | null = null;
  for (const [red, a] of desde) {
    const b = hasta.get(red);
    if (b === undefined || a === b) continue;
    const c = caminoMasCorto(g, a, b);
    if (c && (!camino || c.metros < camino.metros)) camino = c;
  }
  if (!camino || camino.metros > 3 * metros(origen, destino) + 5000) return null;
  return {
    puntos: simplificar([origen, ...camino.puntos, destino], 25).map(redondear),
    metros: Math.round(camino.metros),
  };
}
