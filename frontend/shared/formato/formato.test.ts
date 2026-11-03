import { describe, expect, it } from "vitest";
import { TEXTO_ESTADO, aFecha, euros, fecha, fechaCorta, hora } from "./formato";

describe("formato", () => {
  it("euros en español", () => {
    expect(euros(12.5).replace(/\s/g, " ")).toBe("12,50 €");
    expect(euros(0).replace(/\s/g, " ")).toBe("0,00 €");
  });
  it("hora del ISO de la API sin cambiar de zona", () => {
    expect(hora("2026-11-03T07:05:00+01:00")).toBe("07:05");
  });
  it("fecha con año y fecha corta sin año", () => {
    expect(fecha("2026-11-03T12:00:00")).toContain("2026");
    expect(fechaCorta("2026-11-03T12:00:00")).not.toContain("2026");
  });
  it("aFecha no cambia de día por el huso", () => {
    expect(aFecha("2026-11-03")).toContain("3");
  });
  it("texto de cada estado de abono", () => {
    expect(TEXTO_ESTADO.pendiente).toBe("Aún no empieza");
  });
});
