import { describe, expect, it, vi } from "vitest";
import { crearReservaTransbordo } from "./cliente";
import { buscarOpcion, claveTramo, comprarDosTramos } from "./comprar-transbordo";
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
  const tren = (numero: string, salida: string, id: string) => ({ id, tipo: "AVE", numero, salida });
  it("encuentra la opción aunque el tripId haya cambiado", () => {
    const lista = [{ tramos: [tren("03940", "2026-11-04T09:05", "x:1"), tren("13039", "2026-11-04T17:17", "x:2026-10-29")] as const }];
    const elegida = { tramos: [tren("03940", "2026-11-04T09:05", "x:1"), tren("13039", "2026-11-04T17:17", "x:2026-11-01")] };
    const o = buscarOpcion(lista as never, claveTramo(elegida.tramos[0]), claveTramo(elegida.tramos[1]));
    expect(o).toBe(lista[0]);
  });
});
