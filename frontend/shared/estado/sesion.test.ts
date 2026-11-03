import { beforeEach, describe, expect, it } from "vitest";
import { CLAVE_SESION } from "../api/simulado-cuenta";
import type { Sesion } from "../api/tipos";
import { guardarSesion, leerSesion } from "./sesion";

const datos = new Map<string, string>();
(globalThis as { sessionStorage?: unknown }).sessionStorage = {
  getItem: (k: string) => datos.get(k) ?? null,
  setItem: (k: string, v: string) => void datos.set(k, v),
  removeItem: (k: string) => void datos.delete(k),
};

describe("sesión guardada", () => {
  beforeEach(() => datos.clear());

  it("guarda, lee y borra", () => {
    const s = { token: "t", usuario: { email: "a@b.es" } } as Sesion;
    guardarSesion(s);
    expect(leerSesion()).toEqual(s);
    guardarSesion(null);
    expect(leerSesion()).toBeNull();
  });

  it("ignora una sesión corrupta o sin token", () => {
    datos.set(CLAVE_SESION, "{no es json");
    expect(leerSesion()).toBeNull();
    datos.set(CLAVE_SESION, JSON.stringify({ usuario: { email: "a@b.es" } }));
    expect(leerSesion()).toBeNull();
  });
});
