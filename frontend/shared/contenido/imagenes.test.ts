import { describe, expect, it } from "vitest";
import { fotoDeRuta, fotos, urlFoto } from "./imagenes";

describe("fotoDeRuta", () => {
  it("asocia destinos, rutas, estaciones y núcleos a su ciudad", () => {
    expect(fotoDeRuta("/inspirate/destinos/sevilla")).toBe(fotos.sevilla);
    expect(fotoDeRuta("/inspirate/rutas/madrid-a-coruna")).toBe(fotos["a-coruna"]);
    expect(fotoDeRuta("/inspirate/estaciones/estacion-cordoba-julio-anguita")).toBe(fotos.cordoba);
    expect(fotoDeRuta("/inspirate/estaciones/villanueva-de-cordoba-los-pedroches")).toBe(fotos["villanueva-de-cordoba"]);
    expect(fotoDeRuta("/cercanias/rodalies-catalunya/lineas")).toBe(fotos.barcelona);
  });

  it("devuelve undefined si no hay foto", () => {
    expect(fotoDeRuta("/ayuda/contacto")).toBeUndefined();
  });

  it("monta la URL de Special:FilePath", () => {
    expect(urlFoto("A b.jpg")).toBe("https://commons.wikimedia.org/wiki/Special:FilePath/A%20b.jpg?width=800");
  });
});
