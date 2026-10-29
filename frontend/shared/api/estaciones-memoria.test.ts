import { describe, expect, it } from "vitest";
import { estacionConocida, recordarEstaciones } from "./estaciones-memoria";

describe("memoria de estaciones", () => {
  it("guarda las estaciones que devuelve /estaciones para volver del resultado al buscador", () => {
    recordarEstaciones([{ id: "04040", nombre: "Zaragoza-Delicias", ciudad: "Zaragoza", lat: 41.65, lon: -0.91 }]);
    expect(estacionConocida("04040")?.nombre).toBe("Zaragoza-Delicias");
  });

  it("no inventa nada para ids que no ha visto", () => {
    expect(estacionConocida("99999")).toBeUndefined();
    expect(estacionConocida(null)).toBeUndefined();
    expect(estacionConocida(undefined)).toBeUndefined();
  });

  it("la última lectura manda si cambia el nombre", () => {
    recordarEstaciones([{ id: "60000", nombre: "Madrid-Puerta de Atocha", ciudad: "Madrid", lat: 40.4, lon: -3.69 }]);
    recordarEstaciones([{ id: "60000", nombre: "Madrid-Puerta de Atocha-Almudena Grandes", ciudad: "Madrid", lat: 40.4, lon: -3.69 }]);
    expect(estacionConocida("60000")?.nombre).toContain("Almudena");
  });
});
