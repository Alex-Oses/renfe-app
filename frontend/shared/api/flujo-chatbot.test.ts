import { describe, expect, it } from "vitest";
import { parsearEventos } from "./flujo-chatbot";

const marco = (evento: string, datos: unknown) => `event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`;

describe("parsearEventos (SSE del chatbot)", () => {
  it("lee los eventos completos y deja el trozo sin terminar", () => {
    const { eventos, resto } = parsearEventos(
      marco("paso", { paso: "analizando" }) + "event: fin\ndata: {\"respuesta\":\"ho",
    );

    expect(eventos).toEqual([{ evento: "paso", datos: { paso: "analizando" } }]);
    expect(resto).toBe('event: fin\ndata: {"respuesta":"ho');
  });

  it("acepta saltos de línea de Windows y varios eventos de golpe", () => {
    const buffer = marco("paso", { paso: "consultando", herramienta: "buscar_trenes" }).replace(/\n/g, "\r\n")
      + marco("fin", { respuesta: "ok", trenes: [] });

    const { eventos, resto } = parsearEventos(buffer);

    expect(resto).toBe("");
    expect(eventos.map((e) => e.evento)).toEqual(["paso", "fin"]);
    expect(eventos[1]!.datos).toEqual({ respuesta: "ok", trenes: [] });
  });

  it("descarta un evento con JSON roto y los comentarios sin datos", () => {
    const { eventos } = parsearEventos(": ping\n\nevent: paso\ndata: {no es json}\n\n" + marco("fin", { respuesta: "ok" }));

    expect(eventos).toEqual([{ evento: "fin", datos: { respuesta: "ok" } }]);
  });
});
