import { describe, expect, it } from "vitest";
import type { Abono } from "./tipos";
import { compraConfirmada, compraEnviando, compraFallida, compraInicial, tonoCompra } from "./resultado-compra";

const abono = (nombre = "Abono recurrente Cercanías"): Abono => ({
  id: "AB-1",
  tipo: "cercanias-recurrente",
  nombre,
  origen: null,
  destino: null,
  inicio: "2026-11-03",
  fin: "2026-12-02",
  viajesTotales: null,
  viajesRestantes: null,
  precio: 20,
  creado: "2026-11-03T10:00:00.000Z",
  qr: "RNA1.x.y",
});

describe("resultado de compra de abono", () => {
  it("solo la confirmación es éxito", () => {
    const resultado = compraConfirmada(abono());
    expect(resultado.estado).toBe("exito");
    expect(tonoCompra(resultado)).toBe("ok");
  });

  it("el tono depende del estado, no de las palabras del mensaje", () => {
    const resultado = compraConfirmada(abono("Error al comprar: no se ha cobrado nada"));
    expect(tonoCompra(resultado)).toBe("ok");
  });

  it("un fallo mantiene el tono de error y no trae abono", () => {
    const resultado = compraFallida("No se pudo completar la compra.");
    expect(resultado.estado).toBe("error");
    expect(tonoCompra(resultado)).toBe("error");
    expect(resultado).not.toHaveProperty("abono");
  });

  it("inicial y enviando quedan pendientes", () => {
    expect(tonoCompra(compraInicial())).toBe("info");
    expect(tonoCompra(compraEnviando())).toBe("info");
    expect(compraEnviando().estado).toBe("enviando");
  });
});
