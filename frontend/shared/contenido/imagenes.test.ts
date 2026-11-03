import { describe, expect, it } from "vitest";
import { fotoDeNucleo, fotoDeRuta, fotos, fotosSeccion, urlFoto } from "./imagenes";

describe("fotoDeRuta", () => {
  it("asocia destinos, rutas, estaciones y núcleos a su ciudad", () => {
    expect(fotoDeRuta("/inspirate/destinos/sevilla")).toBe(fotos.sevilla);
    expect(fotoDeRuta("/inspirate/rutas/madrid-a-coruna")).toBe(fotos["a-coruna"]);
    expect(fotoDeRuta("/inspirate/estaciones/estacion-cordoba-julio-anguita")).toBe(fotos.cordoba);
    expect(fotoDeRuta("/inspirate/estaciones/villanueva-de-cordoba-los-pedroches")).toBe(fotos["villanueva-de-cordoba"]);
    expect(fotoDeRuta("/cercanias/rodalies-catalunya")).toBe(fotos.barcelona);
  });

  it("dentro de un núcleo manda la sección, no la ciudad", () => {
    expect(fotoDeRuta("/cercanias/rodalies-catalunya/lineas")).toBe(fotosSeccion.lineas);
    expect(fotoDeRuta("/cercanias/madrid/lineas/c1")).toBe(fotosSeccion.lineas);
    expect(fotoDeRuta("/cercanias/bilbao/estaciones")).toBe(fotosSeccion.estaciones);
    expect(fotoDeRuta("/cercanias/bilbao/tarifas/descuentos/ninos-y-jovenes")).toBe(fotosSeccion.tarifas);
    expect(fotoDeRuta("/cercanias/bilbao/informacion-de-viaje/horarios")).toBe(fotosSeccion["informacion-de-viaje"]);
  });

  it("devuelve undefined si no hay foto", () => {
    expect(fotoDeRuta("/ayuda/contacto")).toBeUndefined();
  });

  it("monta la URL de Special:FilePath", () => {
    expect(urlFoto("A b.jpg")).toBe("https://commons.wikimedia.org/wiki/Special:FilePath/A%20b.jpg?width=800");
  });
});

describe("fotoDeNucleo", () => {
  it("solo da foto en la portada del núcleo", () => {
    expect(fotoDeNucleo("/cercanias/madrid")).toBe(fotos.madrid);
    expect(fotoDeNucleo("/cercanias/rodalies-catalunya")).toBe(fotos.barcelona);
    expect(fotoDeNucleo("/cercanias/madrid/lineas")).toBeUndefined();
    expect(fotoDeNucleo("/cercanias")).toBeUndefined();
    expect(fotoDeNucleo("/inspirate/destinos/sevilla")).toBeUndefined();
  });
});
