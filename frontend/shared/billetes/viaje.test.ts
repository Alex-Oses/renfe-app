import { describe, expect, it } from "vitest";
import { FRANJAS, documentoValido, duracionMin, emailValido, minutosDelDia } from "./viaje";

describe("viaje", () => {
  it("minutos del día con la hora de la estación", () => {
    expect(minutosDelDia("2026-11-03T07:30:00+01:00")).toBe(450);
  });
  it("duración en minutos", () => {
    expect(duracionMin({ salida: "2026-11-03T07:30:00+01:00", llegada: "2026-11-03T10:00:00+01:00" })).toBe(150);
  });
  it("franjas sin huecos de 0 a 24 h", () => {
    expect(FRANJAS[0].desde).toBe(0);
    expect(FRANJAS.at(-1)?.hasta).toBe(24 * 60);
  });
  it("valida documento y correo", () => {
    expect(documentoValido(" 12345678Z ")).toBe(true);
    expect(documentoValido("123-45")).toBe(false);
    expect(emailValido("ana@correo.es")).toBe(true);
    expect(emailValido("ana@@correo.es")).toBe(false);
  });
});
