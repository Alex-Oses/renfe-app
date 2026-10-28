import { describe, expect, it } from "vitest";
import { todasLasPaginas } from "@renfe/shared/contenido/index";
import { enlacesAyuda, enlacesLegal, menuPrincipal } from "@renfe/shared/contenido/navegacion";
import { herramientas } from "./registro";

// Rutas propias de la app (main.tsx) que no son páginas de contenido.
const RUTAS_APP = ["/", "/trenes", "/billetes", "/acceder", "/cuenta", "/abonos", "/mapa", "/lineas"];
const existe = new Set([...RUTAS_APP, ...todasLasPaginas.map((p) => p.ruta)]);
const limpia = (r: string) => r.split(/[?#]/)[0].replace(/\/+$/, "") || "/";

describe("contenido", () => {
  it("no repite rutas", () => {
    expect(todasLasPaginas.length).toBe(new Set(todasLasPaginas.map((p) => p.ruta)).size);
  });

  it("todos los enlaces internos llevan a una página que existe", () => {
    const enlaces: string[] = [];
    for (const p of todasLasPaginas)
      for (const b of p.bloques) {
        if (b.tipo === "tarjetas") b.tarjetas.forEach((t) => t.enlace && enlaces.push(`${p.ruta} -> ${t.enlace}`));
        if (b.tipo === "cta") enlaces.push(`${p.ruta} -> ${b.enlace}`);
      }
    for (const m of menuPrincipal) for (const g of m.grupos) [g.ruta, ...g.enlaces.map((e) => e.ruta)].forEach((r) => enlaces.push(`menu -> ${r}`));
    [...enlacesAyuda, ...enlacesLegal].forEach((e) => enlaces.push(`menu -> ${e.ruta}`));
    const rotos = enlaces.filter((e) => {
      const destino = e.split(" -> ")[1];
      return destino.startsWith("/") && !existe.has(limpia(destino));
    });
    expect(rotos).toEqual([]);
  });

  it("todas las herramientas usadas están registradas", () => {
    const ids = todasLasPaginas.flatMap((p) => p.bloques.flatMap((b) => (b.tipo === "herramienta" ? [b.id] : [])));
    expect([...new Set(ids)].filter((id) => !herramientas[id])).toEqual([]);
  });
});
