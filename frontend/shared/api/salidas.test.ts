import { describe, expect, it } from "vitest";
import { haSalido } from "./salidas";

describe("haSalido", () => {
  const ahora = Date.parse("2026-11-03T12:00:00+01:00");

  it("deja pasar una salida futura", () => {
    expect(haSalido("2026-11-03T15:00:00+01:00", ahora)).toBe(false);
  });

  it("bloquea una salida pasada", () => {
    expect(haSalido("2026-11-03T09:00:00+01:00", ahora)).toBe(true);
  });

  it("bloquea justo en el instante de la salida", () => {
    expect(haSalido("2026-11-03T12:00:00+01:00", ahora)).toBe(true);
  });

  it("cubre el cambio de día y los trenes nocturnos", () => {
    expect(haSalido("2026-11-03T23:50:00+01:00", Date.parse("2026-11-04T00:10:00+01:00"))).toBe(true);
    expect(haSalido("2026-11-04T00:30:00+01:00", Date.parse("2026-11-03T23:50:00+01:00"))).toBe(false);
  });

  it("compara el instante aunque el ISO venga en UTC", () => {
    // 13:00Z son las 14:00 en Madrid: aún no ha salido a las 13:30 +01.
    expect(haSalido("2026-11-03T13:00:00Z", Date.parse("2026-11-03T13:30:00+01:00"))).toBe(false);
  });

  it("una hora inválida no oculta el tren", () => {
    expect(haSalido("no-es-una-hora", ahora)).toBe(false);
  });
});
