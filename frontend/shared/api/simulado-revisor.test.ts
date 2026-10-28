import { beforeEach, describe, expect, it, vi } from "vitest";
import { crearQr, firmarQr } from "./qr-billete";
import { PREFIJO_QR_ABONO } from "./simulado-abonos";
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

describe("validarBillete con abonos (RNA1)", () => {
  const datos = (o: Partial<{ vr: number | null; ini: string; fin: string }> = {}) => ({
    v: 1, id: `AB-${JSON.stringify(o)}`, t: "bono-10", o: "Madrid", d: "Toledo", ini: "2026-11-01", fin: "2026-12-30", vr: 2, p: "Lucía Pérez Gómez", ...o,
  });

  it("bono válido: enseña titular enmascarado y descuenta un viaje en cada lectura", async () => {
    const qr = await firmarQr(PREFIJO_QR_ABONO, datos());
    const r1 = await validarBillete(qr, ahora);
    expect(r1).toMatchObject({ estado: "valido", abono: { nombre: "Bono 10 viajes", titular: "Lucía P. G.", origen: "Madrid", viajesRestantes: 1 } });
    expect((await validarBillete(qr, ahora)).abono?.viajesRestantes).toBe(0);
    expect((await validarBillete(qr, ahora)).estado).toBe("agotado");
  });

  it("abono sin límite no descuenta; caducado, pendiente y sin viajes se rechazan", async () => {
    const r = await validarBillete(await firmarQr(PREFIJO_QR_ABONO, { ...datos({ vr: null }), t: "avant-mensual" }), ahora);
    expect(r).toMatchObject({ estado: "valido", abono: { viajesRestantes: null } });
    expect((await validarBillete(await firmarQr(PREFIJO_QR_ABONO, datos({ fin: "2026-11-01" })), ahora)).estado).toBe("caducado");
    expect((await validarBillete(await firmarQr(PREFIJO_QR_ABONO, datos({ ini: "2026-11-10" })), ahora)).estado).toBe("otro_dia");
    expect((await validarBillete(await firmarQr(PREFIJO_QR_ABONO, datos({ vr: 0 })), ahora)).estado).toBe("agotado");
    expect((await validarBillete("RNA1.e30.AAAA", ahora)).estado).toBe("falso");
  });
});
