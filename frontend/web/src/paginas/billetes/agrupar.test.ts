import { describe, expect, it } from "vitest";
import type { Billete } from "@renfe/shared/api/tipos";
import { agrupar, unirTransbordos, type Viaje } from "./agrupar";

const b = (id: string, reservaId: string, salida: string) => ({ id, reservaId, tren: { salida } }) as unknown as Billete;

describe("agrupar", () => {
  it("junta por reserva, ordena viajes por salida y billetes por número", () => {
    const v = agrupar([b("X-10", "r2", "2026-12-02T10:00"), b("A-1", "r1", "2026-12-01T09:00"), b("X-2", "r2", "2026-12-02T10:00")]);
    expect(v.map((x) => x.reservaId)).toEqual(["r1", "r2"]);
    expect(v[1].billetes.map((x) => x.id)).toEqual(["X-2", "X-10"]);
  });
});

describe("unirTransbordos", () => {
  const viaje = (id: string, o: string, d: string, sal: string, lle: string, emitido = "2026-11-01T10:00:00+01:00"): Viaje => ({
    reservaId: id,
    billetes: [{ emitido, tren: { origen: { id: o }, destino: { id: d }, salida: sal, llegada: lle } } as unknown as Billete],
  });
  const a = viaje("A", "1", "2", "2026-11-02T08:00:00+01:00", "2026-11-02T09:00:00+01:00");

  it("une dos reservas compradas juntas que enlazan", () => {
    const r = unirTransbordos([a, viaje("B", "2", "3", "2026-11-02T09:30:00+01:00", "2026-11-02T10:30:00+01:00")]);
    expect(r).toHaveLength(1);
    expect(r[0]!.enlace?.reservaId).toBe("B");
  });

  it("no une si se compraron en otro momento o la espera es demasiado corta", () => {
    const tarde = viaje("B", "2", "3", "2026-11-02T09:30:00+01:00", "2026-11-02T10:30:00+01:00", "2026-11-01T18:00:00+01:00");
    const corta = viaje("C", "2", "3", "2026-11-02T09:05:00+01:00", "2026-11-02T10:30:00+01:00");
    expect(unirTransbordos([{ ...a }, tarde])).toHaveLength(2);
    expect(unirTransbordos([{ ...a }, corta])).toHaveLength(2);
  });
});
