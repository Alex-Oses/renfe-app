import { describe, expect, it } from "vitest";
import type { ResultadoValidacion } from "@renfe/shared/api/tipos";
import { MAXIMO_LECTURAS, anadirLectura, type Lectura } from "./historial";

const lectura = (validadoEn: string): ResultadoValidacion => ({
  estado: "valido",
  validadoEn,
  comprobadoEnServidor: true,
});

describe("historial del revisor", () => {
  it("distingue dos lecturas del mismo segundo, que la API fecha sin milisegundos", () => {
    const primera = anadirLectura([], lectura("2026-10-29T10:00:00+01:00"), 0);
    const dos = anadirLectura(primera, lectura("2026-10-29T10:00:00+01:00"), 1);

    expect(dos.map((x) => x.lecturaId)).toEqual([1, 0]);
    expect(new Set(dos.map((x) => x.lecturaId)).size).toBe(2);
    expect(dos[0]!.validadoEn).toBe(dos[1]!.validadoEn);
  });

  it("pone la última lectura primero y guarda solo las últimas 20", () => {
    let historial: Lectura[] = [];
    for (let i = 0; i < MAXIMO_LECTURAS; i++) {
      historial = anadirLectura(historial, lectura(`2026-10-29T10:00:${String(i).padStart(2, "0")}+01:00`), i);
    }

    const final = anadirLectura(historial, lectura("2026-10-29T10:01:00+01:00"), MAXIMO_LECTURAS);

    expect(final).toHaveLength(MAXIMO_LECTURAS);
    expect(final[0]!.lecturaId).toBe(MAXIMO_LECTURAS);
    expect(final.some((x) => x.lecturaId === 0)).toBe(false);
  });
});
