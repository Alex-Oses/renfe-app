import { describe, expect, it } from "vitest";
import { porNombre } from "./Buscador";

describe("porNombre", () => {
  it("acepta nombre sin tildes, código y ciudad con una sola estación", () => {
    expect(porNombre("valencia joaquin sorolla")?.id).toBe("65000");
    expect(porNombre("71801")?.nombre).toBe("Barcelona-Sants");
    expect(porNombre("barcelona")?.id).toBe("71801");
  });
  it("no adivina si hay varias estaciones o ninguna", () => {
    expect(porNombre("Madrid")).toBeUndefined();
    expect(porNombre("MAD")).toBeUndefined();
    expect(porNombre("")).toBeUndefined();
  });
});
