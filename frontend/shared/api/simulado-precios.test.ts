import { describe, expect, it } from "vitest";
import { calcularTotal, precioExtra, precioViajero } from "./simulado-precios";

describe("precios por viajero", () => {
  it("aplica el factor de la tarifa", () => {
    expect(precioViajero(40)).toBe(40);
    expect(precioViajero(40, "elige")).toBe(50);
    expect(precioViajero(40, "premium")).toBe(76);
  });

  it("niño paga un 40 % menos y bebé no paga", () => {
    expect(precioViajero(50, "basico", "nino")).toBe(30);
    expect(precioViajero(50, "premium", "bebe")).toBe(0);
  });

  it("no acumula descuentos: se queda con el mayor", () => {
    expect(precioViajero(100, "basico", "nino", "fn-general")).toBe(60); // 40 > 20
    expect(precioViajero(100, "basico", "nino", "fn-especial")).toBe(50); // 50 > 40
    expect(precioViajero(100, "basico", "adulto", "dorada")).toBe(60);
  });
});

describe("extras y total", () => {
  it("cobra por viajero o por reserva, y la comida va incluida en Prémium", () => {
    expect(precioExtra("seguro", 3)).toBe(7.5);
    expect(precioExtra("equipaje", 3)).toBe(15);
    expect(precioExtra("comida", 2, "premium")).toBe(0);
  });

  it("suma billetes y extras sin repetir extras", () => {
    const d = calcularTotal({ precios: [40, 40], tipos: ["adulto", "nino"], tarifa: "elige", extras: ["mascota", "mascota", "seguro"] });
    expect(d).toEqual({ billetes: 80, extras: 30, total: 110 });
  });
});
