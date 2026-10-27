import { describe, expect, it } from "vitest";
import { convertirFeed } from "./gtfs-rt";

describe("convertirFeed", () => {
  const json = {
    header: { timestamp: "1793100000" },
    entity: [
      { vehicle: { trip: { tripId: "3097L23537C1" }, position: { latitude: 40.4, longitude: -3.69, bearing: 45, speed: 25 }, vehicle: { id: "23537" } } },
      { vehicle: { trip: { tripId: "sin-posicion" } } },
      { vehicle: { position: { latitude: 1, longitude: 1 } } },
    ],
  };

  it("convierte las entidades con posición y viaje, y pasa la velocidad a km/h", () => {
    const r = convertirFeed(json, "cercanias");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ feed: "cercanias", vehicleId: "23537", tripId: "3097L23537C1", rumbo: 45, velocidadKmh: 90 });
    expect(r[0].actualizado).toBe(new Date(1793100000 * 1000).toISOString());
  });

  it("no rompe con un feed vacío", () => {
    expect(convertirFeed({}, "avld")).toEqual([]);
  });
});
