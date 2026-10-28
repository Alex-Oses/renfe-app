import { describe, expect, it } from "vitest";
import { emparejarTren, seguirRetraso, textoRetraso } from "./retraso-billete";
import type { PosicionTren } from "./tipos";

const pos = (numero: string, retrasoMin = 0) => ({ trenId: `t-${numero}-${retrasoMin}`, numero, retrasoMin }) as PosicionTren;
const tren = { numero: "03142", salida: "2026-11-02T10:00:00+01:00", llegada: "2026-11-02T12:30:00+01:00" };

describe("emparejarTren", () => {
  it("encuentra el tren por número aunque cambien los ceros", () => {
    expect(emparejarTren(tren, [pos("9999"), pos("3142", 7)])?.retrasoMin).toBe(7);
  });
  it("sin coincidencia o con varias, null", () => {
    expect(emparejarTren(tren, [pos("9999")])).toBeNull();
    expect(emparejarTren(tren, [pos("3142"), pos("03142", 5)])).toBeNull();
    expect(emparejarTren(tren, [])).toBeNull();
  });
});

describe("seguirRetraso", () => {
  it("hoy antes de salir y en marcha sí; otro día o ya llegado no", () => {
    expect(seguirRetraso(tren, new Date("2026-11-02T07:00:00+01:00"))).toBe(true);
    expect(seguirRetraso(tren, new Date("2026-11-02T11:00:00+01:00"))).toBe(true);
    expect(seguirRetraso(tren, new Date("2026-11-02T13:00:00+01:00"))).toBe(false);
    expect(seguirRetraso(tren, new Date("2026-11-04T09:00:00+01:00"))).toBe(false);
  });
});

it("textoRetraso", () => {
  expect(textoRetraso(pos("1"))).toBe("Puntual");
  expect(textoRetraso(pos("1", 12))).toBe("+12 min");
});
