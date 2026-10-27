import { describe, expect, it } from "vitest";
import type { Billete } from "../../api/tipos";
import { agrupar } from "./agrupar";

const b = (id: string, reservaId: string, salida: string) => ({ id, reservaId, tren: { salida } }) as unknown as Billete;

describe("agrupar", () => {
  it("junta por reserva, ordena viajes por salida y billetes por número", () => {
    const v = agrupar([b("X-10", "r2", "2026-12-02T10:00"), b("A-1", "r1", "2026-12-01T09:00"), b("X-2", "r2", "2026-12-02T10:00")]);
    expect(v.map((x) => x.reservaId)).toEqual(["r1", "r2"]);
    expect(v[1].billetes.map((x) => x.id)).toEqual(["X-2", "X-10"]);
  });
});
