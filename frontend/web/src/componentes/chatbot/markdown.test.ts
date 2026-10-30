import { describe, expect, it } from "vitest";
import { bloques, enfasis } from "./markdown";

describe("bloques del Markdown del chatbot", () => {
  it("separa párrafos y listas", () => {
    expect(bloques("Trenes para mañana:\n\n- **AVE 03311** a las 06:27\n- AVE 03073 a las 07:27\n\n¿Reservamos?")).toEqual([
      { tipo: "parrafo", lineas: ["Trenes para mañana:"] },
      { tipo: "lista", lineas: ["**AVE 03311** a las 06:27", "AVE 03073 a las 07:27"] },
      { tipo: "parrafo", lineas: ["¿Reservamos?"] },
    ]);
  });

  it("acepta viñetas *, • y varias líneas en un párrafo", () => {
    expect(bloques("* uno\n• dos\nlinea suelta")).toEqual([
      { tipo: "lista", lineas: ["uno", "dos"] },
      { tipo: "parrafo", lineas: ["linea suelta"] },
    ]);
  });

  it("no devuelve bloques vacíos", () => {
    expect(bloques("\n\n  \n")).toEqual([]);
  });
});

describe("negritas", () => {
  it("marca solo lo que va entre **", () => {
    expect(enfasis("Sale a las **06:27** y llega a las 09:56")).toEqual([
      { texto: "Sale a las ", negrita: false },
      { texto: "06:27", negrita: true },
      { texto: " y llega a las 09:56", negrita: false },
    ]);
  });

  it("sin marcas devuelve el texto tal cual", () => {
    expect(enfasis("Hola")).toEqual([{ texto: "Hola", negrita: false }]);
  });

  it("la cursiva pierde los asteriscos sin romper la negrita", () => {
    expect(enfasis("*(Hay más trenes)* y **este** sí")).toEqual([
      { texto: "(Hay más trenes)", negrita: false },
      { texto: " y ", negrita: false },
      { texto: "este", negrita: true },
      { texto: " sí", negrita: false },
    ]);
  });
});
