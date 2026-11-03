import { describe, expect, it, vi } from "vitest";
import { buscarOpcion, claveTramo, comprarDosTramos } from "./comprar-transbordo";

describe("comprarDosTramos", () => {
  it("devuelve las dos reservas si los dos tramos salen bien", async () => {
    const cancelar = vi.fn(async () => undefined);
    const r = await comprarDosTramos(async (i) => ({ localizador: `L${i}` }), cancelar);
    expect(r.map((x) => x.localizador)).toEqual(["L0", "L1"]);
    expect(cancelar).not.toHaveBeenCalled();
  });

  it("cancela el primero y relanza el error si falla el segundo", async () => {
    const cancelar = vi.fn(async () => undefined);
    const compra = comprarDosTramos(async (i) => {
      if (i === 1) throw new Error("Sin plazas");
      return { localizador: "L0" };
    }, cancelar);
    await expect(compra).rejects.toThrow("Sin plazas");
    expect(cancelar).toHaveBeenCalledWith("L0");
  });

  it("si falla la cancelación, sigue relanzando el error del segundo tramo", async () => {
    const compra = comprarDosTramos(
      async (i) => {
        if (i === 1) throw new Error("Sin plazas");
        return { localizador: "L0" };
      },
      async () => {
        throw new Error("red");
      },
    );
    await expect(compra).rejects.toThrow("Sin plazas");
  });

  it("no cancela nada si falla el primero", async () => {
    const cancelar = vi.fn(async () => undefined);
    await expect(comprarDosTramos(async () => Promise.reject(new Error("x")), cancelar)).rejects.toThrow("x");
    expect(cancelar).not.toHaveBeenCalled();
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
