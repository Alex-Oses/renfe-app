import { describe, expect, it } from "vitest";
import type { Viaje } from "@renfe/shared/billetes/agrupar";
import { enlaceBillete } from "./enlace";

const viaje = (ids: string[]) => ({ billetes: ids.map((id) => ({ id })) }) as Viaje;

describe("enlaceBillete", () => {
  it("abre el primer billete del viaje y codifica el identificador", () => {
    expect(enlaceBillete(viaje(["AVLD/1", "AVLD/2"]))).toBe("/billetes/AVLD%2F1");
  });

  it("funciona con una reserva de un solo viajero", () => {
    expect(enlaceBillete(viaje(["R-ABC123"]))).toBe("/billetes/R-ABC123");
  });
});
