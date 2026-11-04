import { describe, expect, it } from "vitest";
import type { Tren } from "@renfe/shared/api/tipos";
import { estadoDeLinea, proximosTrenes } from "./estado";

const ahora = Date.parse("2026-11-03T12:00:00+01:00");
const tren = (id: string, salida: string) => ({ id, salida }) as Tren;

describe("proximosTrenes", () => {
  it("quita los ya salidos, respeta el orden recibido y limita a cuatro", () => {
    const trenes = [
      tren("pasado", "2026-11-03T09:00:00+01:00"),
      ...["13:00", "14:00", "15:00", "16:00", "17:00"].map((hora, i) =>
        tren(`futuro-${i}`, `2026-11-03T${hora}:00+01:00`),
      ),
    ];

    expect(proximosTrenes(trenes, ahora).map((t) => t.id)).toEqual([
      "futuro-0",
      "futuro-1",
      "futuro-2",
      "futuro-3",
    ]);
  });
});

describe("estadoDeLinea", () => {
  it("muestra los trenes de la línea cuando hay salidas futuras", () => {
    expect(
      estadoDeLinea({ trenes: [tren("a", "2026-11-03T13:00:00+01:00")], error: "", ahora }),
    ).toEqual({ tipo: "trenes", trenes: [tren("a", "2026-11-03T13:00:00+01:00")] });
  });

  it("marca vacía solo si la consulta responde sin viajes futuros", () => {
    expect(estadoDeLinea({ trenes: [], error: "", ahora })).toEqual({ tipo: "vacia" });
    expect(
      estadoDeLinea({ trenes: [tren("viejo", "2026-11-03T09:00:00+01:00")], error: "", ahora }),
    ).toEqual({ tipo: "vacia" });
  });

  it("un fallo de carga es un error, no una línea vacía", () => {
    expect(estadoDeLinea({ trenes: [], error: "La API no responde", ahora })).toEqual({
      tipo: "error",
      mensaje: "La API no responde",
    });
    expect(estadoDeLinea({ trenes: null, error: "", ahora })).toEqual({ tipo: "cargando" });
  });

  it("compara instantes aunque el ISO venga en UTC", () => {
    // 12:30Z son las 13:30 en Madrid: aún no ha salido a las 12:00 +01.
    expect(
      proximosTrenes([tren("utc", "2026-11-03T12:30:00Z")], ahora).map((t) => t.id),
    ).toEqual(["utc"]);
  });
});
