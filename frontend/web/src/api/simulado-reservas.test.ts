import { beforeEach, describe, expect, it } from "vitest";
import { buscarTrenes } from "./simulado";
import { _vaciar, confirmarPago, crearReserva, misBilletes, obtenerAsientos, obtenerBillete } from "./simulado-reservas";

const tren = buscarTrenes({ origen: "60000", destino: "71801", fecha: "2026-11-02" })[0];
const viajero = { nombre: "Ana", apellidos: "Pérez", documento: "12345678Z", email: "ana@example.com" };

describe("reservas simuladas", () => {
  beforeEach(() => _vaciar());

  it("da los mismos asientos para el mismo tren, con clases por coche", () => {
    const a = obtenerAsientos(tren.id);
    expect(a).toEqual(obtenerAsientos(tren.id));
    expect(a.find((x) => x.id === "1-1A")?.clase).toBe("Prémium");
    expect(a.find((x) => x.id === "3-1A")?.clase).toBe("Confort");
    expect(a.find((x) => x.id === "5-1A")?.clase).toBe("Estándar");
    expect(a.some((x) => x.libre)).toBe(true);
    expect(a.some((x) => !x.libre)).toBe(true);
  });

  it("no deja reservar un asiento ocupado", () => {
    const ocupado = obtenerAsientos(tren.id).find((x) => !x.libre)!;
    expect(() => crearReserva({ trenId: tren.id, asientos: [ocupado.id], pasajeros: [viajero] })).toThrow(/ocupado/);
    const libre = obtenerAsientos(tren.id).find((x) => x.libre)!;
    crearReserva({ trenId: tren.id, asientos: [libre.id], pasajeros: [viajero] });
    expect(() => crearReserva({ trenId: tren.id, asientos: [libre.id], pasajeros: [viajero] })).toThrow(/ocupado/);
  });

  it("el total es la suma de los asientos y el pago genera un billete por viajero", () => {
    const libres = obtenerAsientos(tren.id).filter((x) => x.libre);
    const elegidos = [libres[0], libres[libres.length - 1]];
    const r = crearReserva({ trenId: tren.id, asientos: elegidos.map((a) => a.id), pasajeros: [viajero, viajero] });
    expect(r.total).toBeCloseTo(elegidos[0].precio + elegidos[1].precio, 2);
    expect(r.localizador).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);

    const pagada = confirmarPago(r.id);
    expect(pagada.estado).toBe("pagada");
    const billetes = misBilletes();
    expect(billetes).toHaveLength(2);
    expect(JSON.parse(obtenerBillete(billetes[0].id).qr)).toMatchObject({ loc: r.localizador, firma: "simulada" });
  });

  it("cobra según tarifa, tipo de viajero y extras", () => {
    const [a, b] = obtenerAsientos(tren.id).filter((x) => x.libre && x.clase === "Estándar");
    const r = crearReserva({
      trenId: tren.id,
      asientos: [a.id, b.id],
      pasajeros: [viajero, { ...viajero, tipo: "nino" }],
      tarifa: "elige",
      extras: ["equipaje"],
    });
    expect(r.total).toBeCloseTo(a.precio * 1.25 + b.precio * 1.25 * 0.6 + 15, 2);
    expect(r.tarifa).toBe("elige");
  });
});
