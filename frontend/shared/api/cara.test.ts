import { describe, expect, it } from "vitest";
import { DIMENSIONES_CARA, MODELO_CARA, cuerpoRegistrarCara, cuerpoVerificarCara, validarEmbedding } from "./cara";

const vector = (n = DIMENSIONES_CARA) => Array.from({ length: n }, () => 0.01);

describe("cuerpo de /auth/cara/*", () => {
  it("registrar manda el vector y el modelo de config_cara", () => {
    expect(cuerpoRegistrarCara(vector())).toEqual({ embedding: vector(), modelo: MODELO_CARA });
  });

  it("verificar manda el email normalizado y el vector", () => {
    expect(cuerpoVerificarCara("  Ana@Ejemplo.es ", vector(3))).toEqual({
      email: "ana@ejemplo.es",
      embedding: vector(3),
    });
  });
});

describe("validarEmbedding", () => {
  it("acepta un vector ArcFace de 512 floats", () => {
    expect(() => validarEmbedding(vector())).not.toThrow();
  });

  it("rechaza otra dimensión y dice cuál ha llegado", () => {
    expect(() => validarEmbedding(vector(1024))).toThrow(/1024.*512/);
    expect(() => validarEmbedding([])).toThrow(/512/);
  });

  it("rechaza valores que no son números finitos", () => {
    const roto = vector();
    roto[7] = Number.NaN;
    expect(() => validarEmbedding(roto)).toThrow(/inválidos/);
  });
});
