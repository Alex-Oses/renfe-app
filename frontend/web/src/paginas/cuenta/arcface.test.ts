import { describe, expect, it } from "vitest";
import { aTensor, normalizar, puntosDeMalla, REFERENCIA, semejanza } from "./arcface";

const aplicar = ([a, b, tx, ty]: number[], [x, y]: number[]) => [a * x - b * y + tx, b * x + a * y + ty];

describe("semejanza", () => {
  it("recupera una semejanza conocida (escala 2, giro 30°, traslación)", () => {
    const ang = Math.PI / 6;
    const t = [2 * Math.cos(ang), 2 * Math.sin(ang), 15, -7];
    const destino = REFERENCIA.map((p) => aplicar(t, p) as [number, number]);
    semejanza(REFERENCIA, destino).forEach((v, i) => expect(v).toBeCloseTo(t[i]!, 6));
  });

  it("lleva los puntos de una cara grande y torcida a la plantilla de 112×112", () => {
    const cara = REFERENCIA.map(([x, y]) => [300 + 3 * x - 0.5 * y, 120 + 0.5 * x + 3 * y] as [number, number]);
    const m = semejanza(cara, REFERENCIA);
    cara.forEach((p, i) => {
      const [x, y] = aplicar(m, p);
      expect(x).toBeCloseTo(REFERENCIA[i]![0], 4);
      expect(y).toBeCloseTo(REFERENCIA[i]![1], 4);
    });
  });
});

describe("puntosDeMalla", () => {
  it("saca ojos, nariz y boca de la malla de MediaPipe ordenados de izquierda a derecha", () => {
    const malla = Array.from({ length: 468 }, () => [0, 0, 0]);
    Object.assign(malla, { 33: [210, 100, 0], 133: [190, 100, 0], 362: [110, 100, 0], 263: [90, 100, 0], 1: [150, 140, 0], 61: [180, 180, 0], 291: [120, 180, 0] });
    expect(puntosDeMalla(malla)).toEqual([[100, 100], [200, 100], [150, 140], [120, 180], [180, 180]]);
  });
});

describe("aTensor y normalizar", () => {
  it("pasa RGBA a NCHW RGB en [-1, 1] y la huella a norma 1", () => {
    const rgba = new Uint8ClampedArray(112 * 112 * 4).fill(255);
    rgba[0] = 0; // R del primer píxel
    const t = aTensor(rgba);
    expect(t.length).toBe(3 * 112 * 112);
    expect(t[0]).toBe(-1);
    expect(t[112 * 112]).toBe(1); // G del primer píxel
    expect(Math.hypot(...normalizar([3, 4]))).toBeCloseTo(1);
  });
});
