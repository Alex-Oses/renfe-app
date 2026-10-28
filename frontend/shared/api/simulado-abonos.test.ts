import { beforeEach, describe, expect, it } from "vitest";
import { _vaciar, comprarAbono, estadoAbono, finAbono, gastarViaje, leerQrAbono, misAbonos, obtenerAbono } from "./simulado-abonos";
import { CLAVE_SESION } from "./simulado-cuenta";

const almacen = () => {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
};
const entrar = (id: string) =>
  sessionStorage.setItem(
    CLAVE_SESION,
    JSON.stringify({ token: "t", usuario: { id, nombre: "Lucía Pérez", email: `${id}@x.es`, caraRegistrada: false } }),
  );

beforeEach(() => {
  Object.assign(globalThis, { localStorage: almacen(), sessionStorage: almacen() });
  _vaciar();
  entrar("u1");
});

describe("validez", () => {
  it("mensual: 30 días contando el de inicio; bono: 60", () => {
    expect(finAbono("ave-ld-mensual", "2026-11-01")).toBe("2026-11-30");
    expect(finAbono("bono-10", "2026-12-15")).toBe("2027-02-12");
  });

  it("pendiente antes de empezar, vigente hasta el último día y caducado después", () => {
    const a = { inicio: "2026-11-01", fin: "2026-11-30", viajesRestantes: null };
    expect(estadoAbono(a, "2026-10-31")).toBe("pendiente");
    expect(estadoAbono(a, "2026-11-30")).toBe("vigente");
    expect(estadoAbono(a, "2026-12-01")).toBe("caducado");
  });
});

describe("viajes restantes", () => {
  it("un bono nuevo tiene 10 y se agota al gastarlos; un abono mensual no cambia", async () => {
    let b = await comprarAbono({ tipo: "bono-10", origenId: "60000", destinoId: "04040", inicio: "2026-11-01" }, "2026-10-28");
    expect(b.viajesRestantes).toBe(10);
    for (let i = 0; i < 10; i++) b = gastarViaje(b, "2026-11-02");
    expect(b.viajesRestantes).toBe(0);
    expect(estadoAbono(b, "2026-11-02")).toBe("agotado");
    expect(() => gastarViaje(b, "2026-11-02")).toThrow();
    const m = await comprarAbono({ tipo: "cercanias-recurrente", inicio: "2026-10-28" }, "2026-10-28");
    expect(gastarViaje(m, "2026-10-28").viajesRestantes).toBeNull();
  });

  it("valida trayecto y fecha", async () => {
    const hoy = "2026-10-28";
    await expect(comprarAbono({ tipo: "avant-mensual", inicio: "2026-11-01" }, hoy)).rejects.toThrow(/origen/);
    await expect(
      comprarAbono({ tipo: "avant-mensual", origenId: "60000", destinoId: "60000", inicio: "2026-11-01" }, hoy),
    ).rejects.toThrow(/distintos/);
    await expect(comprarAbono({ tipo: "cercanias-recurrente", inicio: "2026-10-01" }, hoy)).rejects.toThrow(/anterior/);
  });

  it("cada cuenta ve solo sus abonos", async () => {
    const a = await comprarAbono({ tipo: "cercanias-recurrente", inicio: "2026-10-28" }, "2026-10-28");
    expect(misAbonos()).toHaveLength(1);
    entrar("u2");
    expect(misAbonos()).toHaveLength(0);
    expect(() => obtenerAbono(a.id)).toThrow();
  });
});

describe("QR del abono", () => {
  it("va firmado con RNA1 y detecta manipulaciones", async () => {
    const a = await comprarAbono({ tipo: "bono-10", origenId: "60000", destinoId: "71801", inicio: "2026-11-01" }, "2026-10-28");
    expect(await leerQrAbono(a.qr)).toMatchObject({
      ok: true,
      datos: { id: a.id, t: "bono-10", vr: 10, p: "Lucía Pérez", o: "Madrid-Puerta de Atocha" },
    });
    const [pre, , firma] = a.qr.split(".");
    const falso = btoa(JSON.stringify({ v: 1, id: a.id, vr: 99 })).replace(/=+$/, "");
    expect(await leerQrAbono(`${pre}.${falso}.${firma}`)).toEqual({ ok: false, motivo: "firma" });
    expect(await leerQrAbono(a.qr.replace("RNA1", "RNF1"))).toEqual({ ok: false, motivo: "formato" });
  });
});
