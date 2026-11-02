import { afterEach, describe, expect, it, vi } from "vitest";
import { estacionConocida, recordarEstaciones } from "./estaciones-memoria";

const TARRAGONA = { id: "71500", nombre: "TARRAGONA", ciudad: "Tarragona", lat: 41.11, lon: 1.25 };

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

  describe("al recargar la página (sessionStorage)", () => {
    afterEach(() => {
      delete (globalThis as { sessionStorage?: Storage }).sessionStorage;
      vi.resetModules();
    });

    it("el buscador sigue sabiendo el nombre de la estación de la URL", async () => {
      const datos = new Map<string, string>();
      (globalThis as { sessionStorage?: unknown }).sessionStorage = {
        getItem: (k: string) => datos.get(k) ?? null,
        setItem: (k: string, v: string) => void datos.set(k, v),
      };
      vi.resetModules();

      const antes = await import("./estaciones-memoria");
      antes.recordarEstaciones([TARRAGONA]);

      // F5: módulo nuevo, mismo sessionStorage.
      vi.resetModules();
      const despues = await import("./estaciones-memoria");
      expect(despues.estacionConocida("71500")?.nombre).toBe("TARRAGONA");
    });

    it("si el almacenamiento está roto o bloqueado se empieza vacío", async () => {
      (globalThis as { sessionStorage?: unknown }).sessionStorage = {
        getItem: () => {
          throw new Error("bloqueado");
        },
        setItem: () => {
          throw new Error("bloqueado");
        },
      };
      vi.resetModules();
      const antes = await import("./estaciones-memoria");
      expect(() => antes.recordarEstaciones([TARRAGONA])).not.toThrow();
      expect(antes.estacionConocida("71500")?.nombre).toBe("TARRAGONA");
    });
  });
});
