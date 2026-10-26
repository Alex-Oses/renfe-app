import { describe, expect, it } from "vitest";
import { buscarEstaciones, buscarTrenes } from "./simulado";

describe("datos simulados", () => {
  it("busca estaciones sin tildes ni mayúsculas", () => {
    expect(buscarEstaciones("valencia").map((e) => e.id)).toEqual(["65000"]);
    expect(buscarEstaciones("CORDOBA")[0].nombre).toBe("Córdoba");
  });

  it("devuelve los mismos trenes para la misma búsqueda, ordenados y con llegada posterior", () => {
    const b = { origen: "60000", destino: "71801", fecha: "2026-11-02" };
    const a = buscarTrenes(b);
    expect(a).toEqual(buscarTrenes(b));
    expect(a.length).toBeGreaterThan(0);
    for (let i = 0; i < a.length; i++) {
      expect(a[i].llegada > a[i].salida).toBe(true);
      if (i > 0) expect(a[i].salida > a[i - 1].salida).toBe(true);
    }
  });

  it("no hay trenes de una estación a sí misma", () => {
    expect(buscarTrenes({ origen: "60000", destino: "60000", fecha: "2026-11-02" })).toEqual([]);
  });
});
