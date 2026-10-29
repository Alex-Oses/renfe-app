import { describe, expect, it } from "vitest";
import type { ParadaRuta } from "@renfe/shared/api/tipos";
import { ciudadCorta, etiquetaRetraso, extremos, nivelRetraso, progresoDe, proximaDe, repasarParadas } from "./estado-tren";

const parada = (nombre: string, llegada: string, pasada: boolean): ParadaRuta => ({
  estacionId: nombre,
  nombre,
  lat: 40,
  lon: -3,
  llegada,
  pasada,
});

const PARADAS = [
  parada("Madrid", "2026-10-29T09:00:00.000Z", true),
  parada("Zaragoza", "2026-10-29T10:30:00.000Z", false),
  parada("Barcelona", "2026-10-29T12:00:00.000Z", false),
];
const MEDIODIA = Date.parse("2026-10-29T11:00:00.000Z");

describe("etiquetaRetraso", () => {
  it("distingue puntual, retraso, adelanto y falta de dato", () => {
    expect(etiquetaRetraso(0)).toBe("A tiempo");
    expect(etiquetaRetraso(720)).toBe("Retraso 12 min");
    expect(etiquetaRetraso(-180)).toBe("Adelantado 3 min");
    // 20 s no llega al minuto: sigue siendo puntual.
    expect(etiquetaRetraso(20)).toBe("A tiempo");
  });

  it("no confunde «sin dato» con ir a tiempo", () => {
    expect(etiquetaRetraso(null)).toBe("Sin datos");
    expect(etiquetaRetraso(undefined)).toBe("Sin datos");
  });
});

describe("nivelRetraso", () => {
  it("reparte en ok, medio y alto y aparta el caso sin dato", () => {
    expect(nivelRetraso(0)).toBe("ok");
    expect(nivelRetraso(-240)).toBe("ok");
    expect(nivelRetraso(15 * 60)).toBe("medio");
    expect(nivelRetraso(16 * 60)).toBe("alto");
    // Un tren muy adelantado sigue sin ser un retraso.
    expect(nivelRetraso(-16 * 60)).toBe("ok");
    expect(nivelRetraso(null)).toBe("sin-datos");
  });
});

describe("repasarParadas", () => {
  it("marca como pasadas las que ya han llegado", () => {
    const v = repasarParadas(PARADAS, MEDIODIA);
    expect(v.map((p) => p.pasada)).toEqual([true, true, false]);
  });

  it("devuelve el mismo array si nada cambia, para no repintar el mapa", () => {
    const ya = repasarParadas(PARADAS, MEDIODIA);
    expect(repasarParadas(ya, MEDIODIA)).toBe(ya);
  });

  it("no toca la parada si la hora no se puede leer", () => {
    const rota = [parada("Rara", "sin hora", false)];
    expect(repasarParadas(rota, MEDIODIA)[0].pasada).toBe(false);
  });
});

describe("progreso, próxima y extremos", () => {
  it("calcula el avance del trayecto", () => {
    const v = repasarParadas(PARADAS, MEDIODIA);
    expect(progresoDe(v)).toBeCloseTo(2 / 3);
    expect(progresoDe([])).toBe(0);
  });

  it("elige la primera parada pendiente", () => {
    expect(proximaDe(repasarParadas(PARADAS, MEDIODIA))?.nombre).toBe("Barcelona");
    expect(proximaDe(repasarParadas(PARADAS, Date.parse("2026-10-29T13:00:00.000Z")))).toBeUndefined();
  });

  it("devuelve la primera y la última parada", () => {
    const { salida, llegada } = extremos(PARADAS);
    expect(salida?.nombre).toBe("Madrid");
    expect(llegada?.nombre).toBe("Barcelona");
    expect(extremos([])).toEqual({ salida: undefined, llegada: undefined });
  });
});

describe("ciudadCorta", () => {
  it("quita el nombre de la estación y deja enteras las ciudades compuestas", () => {
    expect(ciudadCorta("MADRID-PUERTA DE ATOCHA-ALMUDENA GRANDES")).toBe("MADRID");
    expect(ciudadCorta("SAN SEBASTIÁN-DONOSTIA")).toBe("SAN SEBASTIÁN");
    expect(ciudadCorta("A CORUÑA")).toBe("A CORUÑA");
    expect(ciudadCorta("LA ROBLA")).toBe("LA ROBLA");
    expect(ciudadCorta("SANTIAGO DE COMPOSTELA-DANIEL CASTELAO")).toBe("SANTIAGO");
  });
});
