// Resultado de una compra de abono. El estado manda: nunca se deduce el tono del texto.
import type { Abono } from "./tipos";

export type ResultadoCompraAbono =
  | { estado: "inicial" }
  | { estado: "enviando" }
  | { estado: "exito"; abono: Abono }
  | { estado: "error"; mensaje: string };

export const compraInicial = (): ResultadoCompraAbono => ({ estado: "inicial" });
export const compraEnviando = (): ResultadoCompraAbono => ({ estado: "enviando" });
export const compraConfirmada = (abono: Abono): ResultadoCompraAbono => ({ estado: "exito", abono });
export const compraFallida = (mensaje: string): ResultadoCompraAbono => ({ estado: "error", mensaje });

export type TonoCompra = "info" | "ok" | "error";

// Traduce el estado de la operación al tono visual. No mira `mensaje` ni `nombre`.
export function tonoCompra(resultado: ResultadoCompraAbono): TonoCompra {
  if (resultado.estado === "exito") return "ok";
  if (resultado.estado === "error") return "error";
  return "info";
}
