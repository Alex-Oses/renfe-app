import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { animacion, capas, colores, cristal, espaciado, paleta, radios, sombras } from "./tokens";

// Lee las variables :root de la web y resuelve var(--x).
const css = readFileSync(new URL("../../web/src/estilos/base.css", import.meta.url), "utf8");
const raiz = css.slice(css.indexOf(":root"), css.indexOf("}", css.indexOf(":root")));
const vars = new Map<string, string>();
for (const [, nombre, valor] of raiz.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/--([\w-]+):\s*([^;]+);/g)) {
  vars.set(nombre, valor.trim());
}
function v(nombre: string): string {
  const valor = vars.get(nombre);
  if (valor === undefined) throw new Error(`base.css ya no define --${nombre}`);
  const ref = /^var\(--([\w-]+)\)$/.exec(valor);
  return ref ? v(ref[1]) : valor;
}

const px = (valor: string) => (valor.endsWith("rem") ? parseFloat(valor) * 16 : parseFloat(valor));
const rgba = (valor: string) => {
  const m = /^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/.exec(valor);
  return m ? `rgba(${m[1]},${m[2]},${m[3]},${Number(m[4])})` : valor;
};
const hex = (r: string, g: string, b: string) =>
  "#" + [r, g, b].map((n) => Number(n).toString(16).padStart(2, "0")).join("");
// Primera capa de una box-shadow CSS en formato RN (sin elevation, que es a ojo).
function sombra(valor: string) {
  const m = /^0 (-?\d+)px (\d+)px -?\d*p?x? ?rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/.exec(valor);
  if (!m) throw new Error(`sombra no reconocida: ${valor}`);
  return {
    shadowColor: hex(m[3], m[4], m[5]),
    shadowOffset: { width: 0, height: Number(m[1]) },
    shadowOpacity: Number(m[6]),
    shadowRadius: Number(m[2]) / 2,
  };
}
const sinElevation = ({ elevation: _e, ...resto }: { elevation: number } & Record<string, unknown>) => resto;

describe("tokens de tema sincronizados con base.css", () => {
  it("paleta", () => {
    for (const [css, token] of [
      ["morado", paleta.morado], ["morado-oscuro", paleta.moradoOscuro], ["frambuesa", paleta.frambuesa],
      ["niebla", paleta.niebla], ["grafito", paleta.grafito], ["gris", paleta.gris],
      ["linea", paleta.linea], ["blanco", paleta.blanco],
    ]) expect(v(css), css).toBe(token);
  });

  it("colores semánticos", () => {
    for (const [css, token] of [
      ["color-texto", colores.texto], ["color-texto-suave", colores.textoSuave],
      ["color-titulo", colores.titulo], ["color-marca", colores.marca],
      ["color-accion", colores.accion], ["color-accion-hover", colores.accionPulsada],
      ["color-fondo", colores.fondo], ["color-superficie", colores.superficie],
      ["color-borde", colores.borde], ["color-error", colores.error], ["color-resalte", colores.resalte],
    ]) expect(v(css), css).toBe(token);
  });

  it("espaciado, radios y capas", () => {
    for (const k of [1, 2, 3, 4, 6, 8, 12] as const) expect(px(v(`esp-${k}`))).toBe(espaciado[k]);
    expect(px(v("radio"))).toBe(radios.normal);
    expect(px(v("radio-grande"))).toBe(radios.grande);
    expect(px(v("radio-pildora"))).toBe(radios.pildora);
    for (const k of ["panel", "cabecera", "modal", "saltar"] as const) expect(Number(v(`z-${k}`))).toBe(capas[k]);
  });

  it("animación", () => {
    for (const k of ["corta", "media", "larga"] as const) expect(parseFloat(v(`dur-${k}`))).toBe(animacion.duracion[k]);
    for (const k of ["salida", "muelle"] as const) {
      expect(v(`curva-${k}`)).toBe(`cubic-bezier(${animacion.curva[k].join(", ")})`);
    }
  });

  it("sombras y cristal", () => {
    for (const k of [1, 2, 3] as const) {
      expect(sinElevation(sombras[k])).toEqual(sombra(v(`sombra-${k}`)));
      expect(sinElevation(cristal.sombras[k])).toEqual(sombra(v(`cristal-sombra-${k}`)));
      expect(rgba(v(`cristal-${k}`))).toBe(cristal.fondo[k]);
    }
    expect(rgba(v("cristal-borde"))).toBe(cristal.borde);
    expect(v("cristal-desenfoque")).toBe(`blur(${cristal.desenfoque.normal}px) saturate(150%)`);
    expect(v("cristal-desenfoque-fuerte")).toBe(`blur(${cristal.desenfoque.fuerte}px) saturate(170%)`);
    expect(v("cristal-brillo").startsWith(`inset 0 1px 0 rgb(255 255 255 / 0.9)`)).toBe(true);
    expect(v("cristal-luz")).toBe(
      `linear-gradient(${cristal.luz.angulo}deg, rgb(255 255 255 / 0.95), rgb(255 255 255 / 0.35) 45%, rgb(214 45 97 / 0.28))`,
    );
  });
});
