import { describe, expect, it } from "vitest";
import { posicionesEn } from "./simulado-tiempo-real";

describe("tiempo real simulado", () => {
  const t = Date.parse("2026-11-02T10:00:00Z");

  it("es determinista para un instante dado", () => {
    expect(posicionesEn(t)).toEqual(posicionesEn(t));
  });

  it("da entre 20 y 30 trenes dentro de España con progreso en [0,1]", () => {
    for (const ahora of [t, t + 37 * 60_000, t + 5 * 3600_000]) {
      const p = posicionesEn(ahora);
      expect(p.length).toBeGreaterThanOrEqual(20);
      expect(p.length).toBeLessThanOrEqual(30);
      for (const x of p) {
        expect(x.lat).toBeGreaterThan(35.9);
        expect(x.lat).toBeLessThan(43.8);
        expect(x.lon).toBeGreaterThan(-9.4);
        expect(x.lon).toBeLessThan(3.4);
        expect(x.progreso).toBeGreaterThanOrEqual(0);
        expect(x.progreso).toBeLessThanOrEqual(1);
        expect(x.rumbo).toBeGreaterThanOrEqual(0);
        expect(x.rumbo).toBeLessThanOrEqual(360);
      }
    }
  });

  it("mueve los trenes con el tiempo y los AVE van más rápido que los MD", () => {
    const a = posicionesEn(t);
    const b = posicionesEn(t + 60_000);
    expect(a.some((x, i) => x.lat !== b[i].lat)).toBe(true);
    const max = (tipo: string) => Math.max(...a.filter((x) => x.tipo === tipo).map((x) => x.velocidad));
    expect(max("AVE")).toBeGreaterThan(max("Media Distancia"));
  });
});
