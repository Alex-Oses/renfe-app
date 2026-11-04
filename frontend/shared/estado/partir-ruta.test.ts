import { describe, expect, it } from "vitest";
import { partirRuta, type PuntoRuta } from "./partir-ruta";

// Madrid → Zaragoza → Barcelona, en línea recta para poder comprobar el corte a mano.
const RUTA: PuntoRuta[] = [
  [40.4, -3.7],
  [41.66, -0.92],
  [41.38, 2.14],
];

describe("partirRuta", () => {
  it("con el tren en el origen, lo recorrido es solo el primer punto", () => {
    const { hecho, pendiente } = partirRuta(RUTA, 40.4, -3.7);
    expect(hecho).toHaveLength(2);
    expect(hecho[0]).toEqual(RUTA[0]);
    expect(hecho[1]![0]).toBeCloseTo(40.4, 6);
    expect(hecho[1]![1]).toBeCloseTo(-3.7, 6);
    expect(pendiente).toHaveLength(3);
  });

  it("corta por el punto más cercano y encadena los dos tramos", () => {
    const { hecho, pendiente } = partirRuta(RUTA, 41.66, -0.92);
    const corte = hecho.at(-1)!;
    // El corte cae en la parada de Zaragoza.
    expect(corte[0]).toBeCloseTo(41.66, 6);
    expect(corte[1]).toBeCloseTo(-0.92, 6);
    // El tramo hecho acaba donde empieza el pendiente: la línea no se rompe.
    expect(hecho[0]).toEqual(RUTA[0]);
    expect(pendiente[0]).toEqual(corte);
    expect(pendiente.at(-1)).toEqual(RUTA.at(-1));
  });

  it("proyecta sobre el segmento y no solo sobre los vértices", () => {
    const recta: PuntoRuta[] = [
      [40, -4],
      [40, -2],
    ];
    // Mitad del segmento, con un grado de latitud de desvío.
    const { hecho, pendiente } = partirRuta(recta, 41, -3);
    const corte = hecho.at(-1)!;
    expect(corte[0]).toBeCloseTo(40, 6);
    expect(corte[1]).toBeCloseTo(-3, 6);
    expect(pendiente).toEqual([corte, recta[1]]);
  });

  it("con el tren en el destino, todo el recorrido está hecho", () => {
    const { hecho, pendiente } = partirRuta(RUTA, 41.38, 2.14);
    expect(hecho[0]).toEqual(RUTA[0]);
    expect(hecho.at(-1)).toEqual(RUTA.at(-1));
    // Ya no queda nada por delante: el pendiente es el propio destino.
    expect(pendiente[0]).toEqual(RUTA.at(-1));
    expect(pendiente.at(-1)).toEqual(RUTA.at(-1));
  });

  it("sin dos puntos no hay nada que cortar", () => {
    expect(partirRuta([], 40, -3)).toEqual({ hecho: [], pendiente: [] });
    const uno: PuntoRuta[] = [[40.4, -3.7]];
    expect(partirRuta(uno, 40.4, -3.7)).toEqual({ hecho: [], pendiente: uno });
  });

  it("no depende de que el tren esté exactamente encima de la ruta", () => {
    // Tren desviado al norte del tramo Zaragoza-Barcelona: el corte cae dentro del tramo, no en
    // una de las dos paradas.
    const { hecho } = partirRuta(RUTA, 41.5, 0.6);
    const corte = hecho.at(-1)!;
    expect(corte[0]).toBeLessThan(41.66);
    expect(corte[1]).toBeGreaterThan(-0.92);
    expect(corte[1]).toBeLessThan(2.14);
  });
});
