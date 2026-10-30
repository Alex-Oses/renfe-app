import { describe, expect, it } from "vitest";
import { tipoDeFeed, unoPorVehiculo } from "./cliente";

describe("tipoDeFeed", () => {
  it("Cercanías por el feed, sin mirar el nombre", () => expect(tipoDeFeed("cercanias", "AVE 1")).toBe("Cercanías"));
  it("saca el producto del nombre", () => {
    expect(tipoDeFeed("avld", "AVE 02070")).toBe("AVE");
    expect(tipoDeFeed("avld", "Avlo 6000")).toBe("Avlo");
    expect(tipoDeFeed("avld", "MD 18000")).toBe("Media Distancia");
  });
  it("sin nombre es Larga Distancia", () => expect(tipoDeFeed("avld", null)).toBe("Larga Distancia"));
});

describe("unoPorVehiculo", () => {
  const p = (vehicleId: string | null, tripId: string) =>
    ({ feed: "avld", vehicleId, tripId, lat: 0, lon: 0, rumbo: null, velocidadKmh: null, estado: null, retrasoSeg: null, actualizado: "" }) as const;
  it("deja un viaje por vehículo y no junta los que no tienen vehículo", () => {
    const r = unoPorVehiculo([p("00631", "a"), p("00631", "b"), p("03091", "c"), p(null, "d"), p(null, "e")]);
    expect(r.map((x) => x.tripId)).toEqual(["a", "c", "d", "e"]);
  });
  it("de los tramos encadenados de un vehículo se queda el que está en curso", () => {
    const tramo = (tripId: string, proxima: boolean, llega: string) =>
      ({ ...p("04186", tripId), proximaParada: proxima ? { id: "1", nombre: "X", llegada: llega } : null, llegadaDestino: llega });
    const r = unoPorVehiculo([tramo("terminado", false, "2026-10-29T08:55:00+01:00"), tramo("en-curso", true, "2026-10-29T11:28:00+01:00")]);
    expect(r.map((x) => x.tripId)).toEqual(["en-curso"]);
  });
});
