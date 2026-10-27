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

  it("mueve los trenes con el tiempo", () => {
    const a = posicionesEn(t);
    const b = posicionesEn(t + 60_000);
    expect(a.some((x, i) => x.lat !== b[i].lat)).toBe(true);
  });

  it("da la hora de la próxima parada y la del destino, en ese orden", () => {
    for (const x of posicionesEn(t)) {
      expect(x.llegadaDestino).toBeTruthy();
      if (x.llegadaProxima) expect(Date.parse(x.llegadaProxima)).toBeLessThanOrEqual(Date.parse(x.llegadaDestino!));
    }
  });

  it("da ruta de origen a destino y paradas ordenadas con llegadas crecientes", () => {
    const p = posicionesEn(t + 13 * 60_000);
    expect(p.some((x) => x.tipo === "Cercanías")).toBe(true);
    for (const x of p) {
      const [o, d] = [x.paradas[0], x.paradas[x.paradas.length - 1]];
      expect(o.nombre).toBe(x.origen);
      expect(d.nombre).toBe(x.destino);
      expect(x.ruta[0]).toEqual([o.lat, o.lon]);
      expect(x.ruta[x.ruta.length - 1]).toEqual([d.lat, d.lon]);
      const horas = x.paradas.map((s) => Date.parse(s.llegada));
      for (let i = 1; i < horas.length; i++) expect(horas[i]).toBeGreaterThan(horas[i - 1]);
      // Las pasadas van primero y la próxima parada no está pasada.
      const k = x.paradas.findIndex((s) => !s.pasada);
      expect(x.paradas.slice(k).every((s) => !s.pasada)).toBe(true);
      expect(x.paradas[k].nombre).toBe(x.proximaParada);
      // La hora de la próxima parada no queda en el pasado (sin contar el retraso).
      expect(horas[k] - x.retrasoMin * 60_000).toBeGreaterThanOrEqual(t + 13 * 60_000 - 1000);
    }
  });
});
