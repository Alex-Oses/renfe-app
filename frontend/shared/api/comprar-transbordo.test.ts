import { describe, expect, it, vi } from "vitest";
import { crearReservaTransbordo } from "./cliente";
import { comprarDosTramos } from "./comprar-transbordo";
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
