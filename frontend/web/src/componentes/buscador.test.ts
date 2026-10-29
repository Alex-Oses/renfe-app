import { describe, expect, it } from "vitest";
import { elegirEstacion, porNombre } from "./Buscador";
import type { Estacion } from "@renfe/shared/api/tipos";

describe("porNombre", () => {
  it("acepta nombre sin tildes, código y ciudad con una sola estación", () => {
    expect(porNombre("valencia joaquin sorolla")?.id).toBe("65000");
    expect(porNombre("71801")?.nombre).toBe("Barcelona-Sants");
    expect(porNombre("barcelona")?.id).toBe("71801");
  });
  it("no adivina si hay varias estaciones o ninguna", () => {
    expect(porNombre("Madrid")).toBeUndefined();
    expect(porNombre("MAD")).toBeUndefined();
    expect(porNombre("")).toBeUndefined();
  });
});

const est = (id: string, nombre: string): Estacion => ({ id, nombre, ciudad: nombre, lat: 0, lon: 0 });

describe("elegirEstacion (estaciones de la API)", () => {
  const lista = [est("1", "Madrid-Puerta de Atocha"), est("2", "Madrid-Chamartín")];

  it("encuentra por nombre exacto sin tildes y por id", () => {
    expect(elegirEstacion(lista, "madrid-puerta de atocha")?.id).toBe("1");
    expect(elegirEstacion(lista, "2")?.nombre).toBe("Madrid-Chamartín");
  });

  it("solo acepta un resultado suelto; con varios, que elija de la lista", () => {
    expect(elegirEstacion(lista, "Madrid")).toBeUndefined();
    expect(elegirEstacion([est("3", "Sevilla-Santa Justa")], "Sevilla")?.id).toBe("3");
    expect(elegirEstacion(lista, "   ")).toBeUndefined();
  });
});
