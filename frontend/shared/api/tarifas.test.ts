import { describe, expect, it } from "vitest";
import { TARIFAS } from "./simulado-precios";
import { TARIFA_POR_DEFECTO, nombreDeTarifa, resolverTarifa } from "./tarifas";

describe("resolverTarifa", () => {
  it.each(TARIFAS.map((t) => t.id))("conserva el id %s", (id) => {
    expect(resolverTarifa(id)).toBe(id);
  });

  it("cae al básico con la etiqueta, un id inventado o vacío", () => {
    expect(resolverTarifa("Elige")).toBe(TARIFA_POR_DEFECTO);
    expect(resolverTarifa("tarifa-inventada")).toBe(TARIFA_POR_DEFECTO);
    expect(resolverTarifa(null)).toBe(TARIFA_POR_DEFECTO);
    expect(resolverTarifa("")).toBe(TARIFA_POR_DEFECTO);
  });

  it("devuelve el nombre visible de cada tarifa", () => {
    for (const tarifa of TARIFAS) expect(nombreDeTarifa(tarifa.id)).toBe(tarifa.nombre);
  });
});
