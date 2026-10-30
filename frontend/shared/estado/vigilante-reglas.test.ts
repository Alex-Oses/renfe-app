import { describe, expect, it } from "vitest";
import type { Billete, PosicionTren } from "../api/tipos";
import { novedadesBillete, reglasSeguimientos } from "./vigilante-reglas";

const ahora = Date.parse("2026-11-02T10:00:00Z");

describe("reglas del vigilante", () => {
  it("billete: embarque por hora y retraso real de su tren en /posiciones", () => {
    const b = { id: "b1", tren: { id: "avld:T1", tipo: "AVE", numero: "03123", salida: new Date(ahora + 10 * 60_000).toISOString(), origen: { nombre: "Girona" } } } as Billete;
    expect(novedadesBillete(b, ahora).map((x) => x.clave)).toEqual(["bil-embarque:b1"]);
    const pos = [{ trenId: "avld:T1", retrasoSeg: 1080 }] as PosicionTren[];
    const a = novedadesBillete(b, ahora, pos);
    expect(a.find((x) => x.tipo === "retraso")).toMatchObject({ clave: "bil-retraso:b1:18", grave: true });
    expect(novedadesBillete(b, ahora, [{ trenId: "avld:T1", retrasoSeg: 60 } as PosicionTren]).some((x) => x.tipo === "retraso")).toBe(false);
    expect(novedadesBillete(b, ahora + 5 * 3600_000, pos)).toEqual([]);
  });

  it("avisa de la llegada dentro del margen y del cambio de retraso", () => {
    const p = {
      trenId: "t1", tipo: "AVE", numero: "1", retrasoMin: 0,
      paradas: [{ estacionId: "e1", nombre: "León", llegada: new Date(ahora + 5 * 60_000).toISOString(), pasada: false }],
    } as PosicionTren;
    const prev = new Map<string, number>();
    const seg = [{ trenId: "t1", estacionId: "e1", minutosAntes: 10 }];
    expect(reglasSeguimientos(seg, [p], ahora, prev).map((x) => x.tipo)).toEqual(["llegada"]);
    const otra = reglasSeguimientos(seg, [{ ...p, retrasoMin: 20 }], ahora, prev);
    expect(otra.find((x) => x.tipo === "retraso")?.grave).toBe(true);
  });
});
