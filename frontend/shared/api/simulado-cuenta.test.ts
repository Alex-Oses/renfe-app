import { beforeEach, describe, expect, it } from "vitest";
import {
  CLAVE_SESION,
  UMBRAL_CARA,
  hashContrasena,
  iniciarSesion,
  registrarCara,
  registrarse,
  similitudCoseno,
  verificarCara,
} from "./simulado-cuenta";

// Almacén en memoria: vitest corre en node, sin localStorage.
function almacen(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  };
}

beforeEach(() => {
  Object.assign(globalThis, { localStorage: almacen(), sessionStorage: almacen() });
});

describe("similitud facial", () => {
  it("vale 1 para vectores iguales, 0 para ortogonales y 0 si las longitudes no cuadran", () => {
    expect(similitudCoseno([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
    expect(similitudCoseno([1, 0], [0, 1])).toBe(0);
    expect(similitudCoseno([1, 2], [1, 2, 3])).toBe(0);
    expect(similitudCoseno([0, 0], [0, 0])).toBe(0);
  });
  it("el umbral es estricto", () => {
    expect(UMBRAL_CARA).toBeGreaterThanOrEqual(0.55);
    expect(UMBRAL_CARA).toBeLessThan(1);
  });
});

describe("cuenta simulada", () => {
  it("no guarda la contraseña en claro", async () => {
    await registrarse({ nombre: "Ana", email: "Ana@Ejemplo.es", contrasena: "secreta123" });
    expect(localStorage.getItem("anden.usuarios")).not.toContain("secreta123");
    expect(await hashContrasena("x", "a")).not.toBe(await hashContrasena("x", "b"));
  });

  it("entra con la contraseña correcta y da errores claros", async () => {
    await registrarse({ nombre: "Ana", email: "ana@ejemplo.es", contrasena: "secreta123" });
    expect((await iniciarSesion({ email: " ANA@ejemplo.es", contrasena: "secreta123" })).usuario.nombre).toBe("Ana");
    await expect(iniciarSesion({ email: "ana@ejemplo.es", contrasena: "mal" })).rejects.toThrow("contraseña");
    await expect(iniciarSesion({ email: "nadie@ejemplo.es", contrasena: "x" })).rejects.toThrow(
      "No hay ninguna cuenta con ese email",
    );
    await expect(registrarse({ nombre: "Ana", email: "ana@ejemplo.es", contrasena: "otra12345" })).rejects.toThrow();
  });

  it("registra la cara del usuario de la sesión y verifica con umbral", async () => {
    const s = await registrarse({ nombre: "Ana", email: "ana@ejemplo.es", contrasena: "secreta123" });
    expect(() => registrarCara([1, 0, 0])).toThrow("Entra en tu cuenta");
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(s));
    registrarCara([1, 0, 0]);
    expect(verificarCara({ email: "ana@ejemplo.es", embedding: [0.98, 0.1, 0] }).usuario.caraRegistrada).toBe(true);
    expect(() => verificarCara({ email: "ana@ejemplo.es", embedding: [0, 1, 0] })).toThrow("La cara no coincide");
    expect(() => verificarCara({ email: "x@y.es", embedding: [1, 0, 0] })).toThrow("No hay ninguna cuenta");
  });
});
