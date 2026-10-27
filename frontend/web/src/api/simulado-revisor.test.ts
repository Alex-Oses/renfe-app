import { beforeEach, describe, expect, it, vi } from "vitest";
import { crearQr } from "./qr-billete";
import { _olvidarValidaciones, validarBillete } from "./simulado-revisor";
import type { Billete } from "./tipos";

// localStorage mínimo para recordar validaciones entre lecturas.
const almacen = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => almacen.get(k) ?? null,
  setItem: (k: string, v: string) => void almacen.set(k, v),
  removeItem: (k: string) => void almacen.delete(k),
});

const billete = (salida: string, llegada: string) =>
  ({
    id: `X-${salida}`, reservaId: "r", localizador: "XYZ789",
    tren: { id: "t", tipo: "AVE", numero: "03142", salida, llegada, origen: { id: "1", nombre: "Madrid" }, destino: { id: "2", nombre: "Sevilla" }, precioDesde: 1, plazasLibres: 1 },
    asiento: { id: "1-1A", coche: 1, fila: 1, letra: "A", clase: "Estándar", libre: false, precio: 1 },
    pasajero: { nombre: "Ana", apellidos: "Ruiz", documento: "11111111H", email: "a@a.es" }, qr: "",
  }) as Billete;

const ahora = new Date("2026-11-02T08:00:00+01:00");

beforeEach(() => _olvidarValidaciones());

describe("validarBillete (sin API)", () => {
  it("válido la primera vez y «ya validado» la segunda, con la hora de la primera", async () => {
    const qr = await crearQr(billete("2026-11-02T07:30:00+01:00", "2026-11-02T10:00:00+01:00"));
    const r1 = await validarBillete(qr, ahora);
    expect(r1).toMatchObject({ estado: "valido", comprobadoEnServidor: false, billete: { pasajero: "Ana Ruiz", asiento: "1A", documento: "••••111H" } });
    const r2 = await validarBillete(qr, new Date(ahora.getTime() + 60_000));
    expect(r2.estado).toBe("ya_validado");
    expect(r2.primeraValidacion).toBe(r1.validadoEn);
  });

  it("distingue otro día, caducado y falso", async () => {
    expect((await validarBillete(await crearQr(billete("2026-11-05T07:30:00+01:00", "2026-11-05T10:00:00+01:00")), ahora)).estado).toBe("otro_dia");
    expect((await validarBillete(await crearQr(billete("2026-11-01T07:30:00+01:00", "2026-11-01T10:00:00+01:00")), ahora)).estado).toBe("caducado");
    const r = await validarBillete("RNF1.e30.AAAA", ahora);
    expect(r.estado).toBe("falso");
    expect(r.billete).toBeUndefined();
  });
});
