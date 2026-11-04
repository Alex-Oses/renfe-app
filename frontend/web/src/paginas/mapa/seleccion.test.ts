import { describe, expect, it } from "vitest";
import { seleccionTrasClic } from "./seleccion";

describe("seleccionTrasClic", () => {
  it("selecciona un tren al pulsarlo", () => {
    expect(seleccionTrasClic({ tipo: "tren", trenId: "avld:1" })).toBe("avld:1");
  });

  it("deselecciona al pulsar el fondo", () => {
    expect(seleccionTrasClic({ tipo: "fondo" })).toBeNull();
  });

  it("cambia la selección al pulsar otro tren", () => {
    const primero = seleccionTrasClic({ tipo: "tren", trenId: "avld:1" });
    const segundo = seleccionTrasClic({ tipo: "tren", trenId: "avld:2" });
    expect(primero).toBe("avld:1");
    expect(segundo).toBe("avld:2");
    expect(segundo).not.toBe(primero);
  });
});
