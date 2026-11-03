import { describe, expect, it, vi } from "vitest";
import { crearReservaTransbordo } from "./cliente";
import { buscarOpcion, claveTramo, comprarDosTramos, precioOpcion } from "./comprar-transbordo";
import { transbordoViable } from "./transbordos";
import type { NuevaReserva, Reserva, Tren } from "./tipos";

vi.mock("./cliente", () => ({ crearReservaTransbordo: vi.fn() }));

const tren = (id: string) => ({ id } as Tren);
const datos: NuevaReserva = { trenId: "a", asientos: [], pasajeros: [] };
const reserva = (localizador: string) => ({ localizador } as Reserva);

describe("comprarDosTramos", () => {
  it("delega la compra de los dos tramos en una sola operación", async () => {
    vi.mocked(crearReservaTransbordo).mockResolvedValue([reserva("L1"), reserva("L2")]);

    await expect(comprarDosTramos([tren("a"), tren("b")], datos)).resolves.toEqual([reserva("L1"), reserva("L2")]);
    expect(crearReservaTransbordo).toHaveBeenCalledWith([tren("a"), tren("b")], datos);
  });
});

describe("buscarOpcion", () => {
  it("encuentra la opción por tipo, número y salida aunque el id lleve la fecha del calendario", () => {
    const a = { id: "avld:A:2026-11-03", tipo: "AVE", numero: "02070", salida: "2026-11-03T07:15:00+01:00" };
    const b = { id: "avld:B:2026-11-03", tipo: "AVLO", numero: "01001", salida: "2026-11-03T09:00:00+01:00" };
    const opcion = { tramos: [a, b] } as never;

    expect(buscarOpcion([opcion], claveTramo(a), claveTramo(b))).toBe(opcion);
    expect(buscarOpcion([opcion], a.id, b.id)).toBeUndefined();
  });
});

describe("precioOpcion", () => {
  const opcion = {
    tramos: [{ precioDesde: 40 }, { precioDesde: 20 }] as [{ precioDesde: number }, { precioDesde: number }],
  };

  it("suma los dos tramos con la tarifa elegida", () => {
    expect(precioOpcion(opcion, { tipos: ["adulto"], tarifa: "elige" })).toBe(75);
  });

  it("aplica el descuento y el tipo de cada viajero, como la API", () => {
    // Adulto joven: 28 + 14 = 42; niño con joven (40 % > 30 %): 24 + 12 = 36.
    expect(precioOpcion(opcion, { tipos: ["adulto", "nino"], descuento: "joven" })).toBe(78);
  });
});

describe("transbordoViable", () => {
  const opcion = (llegada: string, salida: string, cambioEstacion = false) => ({
    cambioEstacion,
    tramos: [{ llegada }, { salida }] as [{ llegada: string }, { salida: string }],
  });

  it("acepta 15 min en la misma estación y rechaza 14", () => {
    expect(transbordoViable(opcion("2026-11-03T08:30:00+01:00", "2026-11-03T08:45:00+01:00"))).toBe(true);
    expect(transbordoViable(opcion("2026-11-03T08:30:00+01:00", "2026-11-03T08:44:00+01:00"))).toBe(false);
  });

  it("exige 30 min si hay que cambiar de estación", () => {
    expect(transbordoViable(opcion("2026-11-03T08:30:00+01:00", "2026-11-03T09:00:00+01:00", true))).toBe(true);
    expect(transbordoViable(opcion("2026-11-03T08:30:00+01:00", "2026-11-03T08:59:00+01:00", true))).toBe(false);
  });

  it("rechaza más de 3 h y acepta el cambio de día", () => {
    expect(transbordoViable(opcion("2026-11-03T08:30:00+01:00", "2026-11-03T11:31:00+01:00"))).toBe(false);
    expect(
      transbordoViable(opcion("2026-11-03T23:50:00+01:00", "2026-11-04T00:20:00+01:00")),
    ).toBe(true);
  });
});
