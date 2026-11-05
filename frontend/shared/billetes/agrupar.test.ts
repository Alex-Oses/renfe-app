import { describe, expect, it } from "vitest";
import type { Billete } from "../api/tipos";
import { agrupar, haTerminado, totalViaje, unirTransbordos, type Viaje } from "./agrupar";

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

  it("con el mismo viaje comprado dos veces, une cada tramo con su compra", () => {
    const t = (id: string, o: string, d: string, sal: string, lle: string, min: string) =>
      viaje(id, o, d, `2026-11-04T${sal}:00+01:00`, `2026-11-04T${lle}:00+01:00`, `2026-11-03T10:${min}:00+01:00`);
    const r = unirTransbordos([t("A1", "1", "2", "09:05", "14:47", "00"), t("B1", "1", "2", "09:05", "14:47", "08"), t("A2", "2", "3", "17:17", "19:13", "01"), t("B2", "2", "3", "17:17", "19:13", "09")]);
    expect(r.map((v) => `${v.reservaId}+${v.enlace?.reservaId}`)).toEqual(["A1+A2", "B1+B2"]);
  });
});

describe("totalViaje", () => {
  it("suma los billetes de los dos tramos y los extras de cada reserva una vez", () => {
    const b = (precio: number, extrasReserva = 0) => ({ asiento: { precio }, extrasReserva }) as unknown as Billete;
    const v: Viaje = { reservaId: "A", billetes: [b(30, 25), b(20, 25)], enlace: { reservaId: "B", billetes: [b(10), b(5)] } };
    expect(totalViaje(v)).toBe(90);
  });
});

describe("haTerminado", () => {
  const v = (llegada: string): Viaje => ({ reservaId: "A", billetes: [{ tren: { llegada } } as unknown as Billete] });
  it("compara instantes con offset, no texto", () => {
    // 10:30 en Madrid son las 09:30 UTC: a las 10:00 UTC ya ha llegado.
    expect(haTerminado(v("2026-11-04T10:30:00+01:00"), Date.parse("2026-11-04T10:00:00Z"))).toBe(true);
    expect(haTerminado(v("2026-11-04T10:30:00+01:00"), Date.parse("2026-11-04T09:00:00Z"))).toBe(false);
  });
  it("un transbordo no termina hasta que llega el segundo tren", () => {
    const viaje = { ...v("2026-11-04T10:00:00+01:00"), enlace: v("2026-11-04T13:00:00+01:00") };
    expect(haTerminado(viaje, Date.parse("2026-11-04T10:00:00Z"))).toBe(false);
  });
});
