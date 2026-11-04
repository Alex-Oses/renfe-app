import { describe, expect, it } from "vitest";
import { ESPERA_MAX_MIN, MARGEN_CAMBIO_MIN, MARGEN_MIN_MIN, transbordoViable } from "./transbordos";

const opcion = (llegada: string, salida: string, cambioEstacion = false) => ({
  cambioEstacion,
  tramos: [{ llegada }, { salida }] as [{ llegada: string }, { salida: string }],
});

describe("transbordoViable", () => {
  it("acepta el margen mínimo en la misma estación", () => {
    expect(MARGEN_MIN_MIN).toBe(15);
    expect(transbordoViable(opcion("2026-11-03T10:00:00+01:00", "2026-11-03T10:15:00+01:00"))).toBe(true);
    expect(transbordoViable(opcion("2026-11-03T10:00:00+01:00", "2026-11-03T10:14:00+01:00"))).toBe(false);
  });

  it("exige 30 minutos si se cambia de estación", () => {
    expect(MARGEN_CAMBIO_MIN).toBe(30);
    expect(transbordoViable(opcion("2026-11-03T10:00:00+01:00", "2026-11-03T10:30:00+01:00", true))).toBe(true);
    expect(transbordoViable(opcion("2026-11-03T10:00:00+01:00", "2026-11-03T10:29:00+01:00", true))).toBe(false);
  });

  it("descarta una espera de más de tres horas", () => {
    expect(ESPERA_MAX_MIN).toBe(180);
    expect(transbordoViable(opcion("2026-11-03T10:00:00+01:00", "2026-11-03T13:00:00+01:00"))).toBe(true);
    expect(transbordoViable(opcion("2026-11-03T10:00:00+01:00", "2026-11-03T13:01:00+01:00"))).toBe(false);
  });

  it("compara instantes aunque el transbordo cruce la medianoche", () => {
    expect(transbordoViable(opcion("2026-11-03T23:30:00+01:00", "2026-11-04T00:10:00+01:00"))).toBe(true);
  });

  it("rechaza horas inválidas en vez de ofrecer la conexión", () => {
    expect(transbordoViable(opcion("no-es-una-hora", "2026-11-03T10:15:00+01:00"))).toBe(false);
  });
});
