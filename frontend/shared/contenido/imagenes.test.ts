import { describe, expect, it } from "vitest";
import { fijarSemilla, fotoDe, fotoDeNucleo, fotoDeRuta, fotos, fotosSeccion, urlFoto, variantes } from "./imagenes";

// Variante fija por ciudad: con semilla 0 + hash da siempre la misma; se compara contra fotoDe.

describe("fotoDeRuta", () => {
  it("asocia destinos, rutas, estaciones y núcleos a su ciudad", () => {
    expect(fotoDeRuta("/inspirate/destinos/sevilla")).toBe(fotoDe("sevilla"));
    expect(fotoDeRuta("/inspirate/rutas/madrid-a-coruna")).toBe(fotoDe("a-coruna"));
    expect(fotoDeRuta("/inspirate/estaciones/estacion-cordoba-julio-anguita")).toBe(fotoDe("cordoba"));
    expect(fotoDeRuta("/inspirate/estaciones/villanueva-de-cordoba-los-pedroches")).toBe(fotoDe("villanueva-de-cordoba"));
    expect(fotoDeRuta("/cercanias/rodalies-catalunya")).toBe(fotoDe("barcelona"));
  });

  it("dentro de un núcleo manda la sección, no la ciudad", () => {
    expect(fotoDeRuta("/cercanias/rodalies-catalunya/lineas")).toBe(fotosSeccion.lineas);
    expect(fotoDeRuta("/cercanias/madrid/lineas/c1")).toBe(fotosSeccion.lineas);
    expect(fotoDeRuta("/cercanias/bilbao/estaciones")).toBe(fotosSeccion.estaciones);
    expect(fotoDeRuta("/cercanias/bilbao/tarifas/descuentos/ninos-y-jovenes")).toBe(fotosSeccion.tarifas);
    expect(fotoDeRuta("/cercanias/bilbao/informacion-de-viaje/horarios")).toBe(fotosSeccion["informacion-de-viaje"]);
  });

  it("asigna fotos aprobadas a Experiencias y a sus categorías", () => {
    expect(fotoDeRuta("/inspirate/experiencias")).toBe(fotos.madrid);
    expect(fotoDeRuta("/inspirate/experiencias/carreras-y-maratones")).toBe(fotos.valencia);
    expect(fotoDeRuta("/inspirate/experiencias/fiestas-populares/fallas")).toBe(fotos.valencia);
    expect(fotoDeRuta("/inspirate/experiencias/planes-de-fin-de-semana/48-horas-en-alicante")).toBe(fotos.alicante);
    expect(fotoDeRuta("/inspirate/experiencias/no-existe")).toBe(fotos.madrid);
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
    expect(fotoDeNucleo("/cercanias/madrid")).toBe(fotoDe("madrid"));
    expect(fotoDeNucleo("/cercanias/rodalies-catalunya")).toBe(fotoDe("barcelona"));
    expect(fotoDeNucleo("/cercanias/madrid/lineas")).toBeUndefined();
    expect(fotoDeNucleo("/cercanias")).toBeUndefined();
    expect(fotoDeNucleo("/inspirate/destinos/sevilla")).toBeUndefined();
  });
});

describe("fotoDe", () => {
  it("siempre devuelve una foto de la ciudad y la misma mientras no cambie la semilla", () => {
    fijarSemilla(3);
    const a = fotoDe("sevilla");
    expect(variantes("sevilla")).toContain(a);
    expect(fotoDe("sevilla")).toBe(a);
    expect(variantes("sevilla")[0]).toBe(fotos.sevilla);
  });

  it("con varias fotos, cambiar la semilla cambia la elegida", () => {
    const lista = variantes("madrid");
    if (lista.length < 2) return;
    const vistas = new Set(lista.map((_, i) => (fijarSemilla(i), fotoDe("madrid"))));
    expect(vistas.size).toBe(lista.length);
  });

  it("sin foto, undefined", () => {
    expect(fotoDe("no-existe")).toBeUndefined();
  });
});
