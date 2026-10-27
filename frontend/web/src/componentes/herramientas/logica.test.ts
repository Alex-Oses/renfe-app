import { describe, expect, it } from "vitest";
import { costeCambio, devolucionAnulacion, horariosCercanias, indemnizacion, porcentajeIndemnizacion, puntosGanados } from "./logica";

describe("compromiso de puntualidad", () => {
  it("AVE: 50 % desde 60 min, 100 % por encima de 90", () => {
    expect(porcentajeIndemnizacion("AVE", 59)).toBe(0);
    expect(porcentajeIndemnizacion("AVE", 60)).toBe(50);
    expect(porcentajeIndemnizacion("AVE", 90)).toBe(50);
    expect(porcentajeIndemnizacion("AVE", 91)).toBe(100);
  });
  it("Media Distancia: 25/50/100 %", () => {
    expect(porcentajeIndemnizacion("Media Distancia", 15)).toBe(0);
    expect(porcentajeIndemnizacion("Media Distancia", 16)).toBe(25);
    expect(porcentajeIndemnizacion("Media Distancia", 31)).toBe(50);
    expect(porcentajeIndemnizacion("Media Distancia", 61)).toBe(100);
  });
  it("Cercanías no tiene indemnización y el importe se redondea", () => {
    expect(porcentajeIndemnizacion("Cercanías", 120)).toBe(0);
    expect(indemnizacion("Alvia", 75, 33.33)).toBe(16.67);
  });
});

describe("cambios y anulaciones", () => {
  it("aplica las condiciones de cambio y anulación por tarifa", () => {
    expect(costeCambio("Básico", 50)).toBe(10);
    expect(devolucionAnulacion("Básico", 50)).toBe(0);
    expect(costeCambio("Prémium", 50)).toBe(0);
    expect(costeCambio("Elige", 50)).toBe(0);
    expect(devolucionAnulacion("Elige", 50)).toBe(35);
    expect(devolucionAnulacion("Prémium", 50)).toBe(50);
  });
});

describe("puntos y cercanías", () => {
  it("puntos por nivel", () => {
    expect(puntosGanados(100, "General")).toEqual({ puntos: 1000, euros: 10 });
    expect(puntosGanados(100, "Oro")).toEqual({ puntos: 1500, euros: 15 });
    expect(puntosGanados(-5, "Plata").puntos).toBe(0);
  });
  it("horarios deterministas", () => {
    expect(horariosCercanias("madrid", "C1", 0, 3)).toEqual(horariosCercanias("madrid", "C1", 0, 3));
    expect(horariosCercanias("madrid", "C1", 0, 3).length).toBeGreaterThan(20);
  });
});
