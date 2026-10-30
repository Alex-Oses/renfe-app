import { describe, expect, it } from "vitest";
import { metros, simplificar } from "./gtfs/geometria.js";
import { construirGrafo, trazado, type Osm } from "./gtfs/vias.js";

describe("geometría", () => {
  it("simplificar quita puntos alineados y conserva los extremos", () => {
    expect(simplificar([[40, -3], [40, -2.99], [40, -2.98]])).toEqual([[40, -3], [40, -2.98]]);
  });

  it("metros da ~111 km por grado de latitud", () => {
    expect(Math.round(metros([40, -3], [41, -3]) / 1000)).toBe(111);
  });
});

describe("trazado por las vías", () => {
  // Vía en forma de L: A (40,-3) → B (40,-2.9) → C (40.1,-2.9).
  const osm: Osm = {
    elements: [
      { type: "node", id: 1, lat: 40, lon: -3 },
      { type: "node", id: 2, lat: 40, lon: -2.9 },
      { type: "node", id: 3, lat: 40.1, lon: -2.9 },
      { type: "way", id: 10, nodes: [1, 2, 3] },
    ],
  };
  const grafo = construirGrafo(osm);

  it("sigue la vía en vez de la línea recta", () => {
    const t = trazado(grafo, [40, -3], [40.1, -2.9]);
    expect(t?.puntos).toContainEqual([40, -2.9]);
    expect(t!.metros).toBeGreaterThan(metros([40, -3], [40.1, -2.9]));
  });

  it("devuelve null si una estación no tiene vía cerca", () => {
    expect(trazado(grafo, [40, -3], [42, 0])).toBeNull();
  });
});
