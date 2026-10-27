import { describe, expect, it } from "vitest";
import { crearQr, leerQr } from "./qr-billete";
import type { Billete } from "./tipos";

const billete = {
  id: "ABC123-1",
  reservaId: "r1",
  localizador: "ABC123",
  tren: {
    id: "t1", tipo: "AVE", numero: "03142", salida: "2026-11-02T07:15:00+01:00", llegada: "2026-11-02T09:40:00+01:00",
    origen: { id: "60000", nombre: "Madrid-Puerta de Atocha" }, destino: { id: "71801", nombre: "Barcelona-Sants" },
    precioDesde: 45, plazasLibres: 10,
  },
  asiento: { id: "3-12A", coche: 3, fila: 12, letra: "A", clase: "Confort", libre: false, precio: 60 },
  pasajero: { nombre: "Lucía", apellidos: "Pérez Gómez", documento: "12345678Z", email: "l@x.es" },
  qr: "",
} as Billete;

describe("QR del billete", () => {
  it("lo que se firma se lee igual, con tildes y el documento enmascarado", async () => {
    const qr = await crearQr(billete);
    expect(qr.startsWith("RNF1.")).toBe(true);
    const r = await leerQr(qr);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.datos).toMatchObject({ id: "ABC123-1", p: "Lucía Pérez Gómez", doc: "••••678Z", co: 3, as: "12A" });
  });

  it("detecta un QR manipulado (firma) y uno que no es de un billete (formato)", async () => {
    const [pre, datos, firma] = (await crearQr(billete)).split(".");
    const otro = btoa(JSON.stringify({ v: 1, id: "FALSO-1" })).replace(/=+$/, "");
    expect(await leerQr(`${pre}.${otro}.${firma}`)).toEqual({ ok: false, motivo: "firma" });
    expect(await leerQr(`${pre}.${datos}.AAAA`)).toEqual({ ok: false, motivo: "firma" });
    expect(await leerQr("https://example.com")).toEqual({ ok: false, motivo: "formato" });
    expect(await leerQr('{"loc":"ABC123","firma":"simulada"}')).toEqual({ ok: false, motivo: "formato" });
  });
});
