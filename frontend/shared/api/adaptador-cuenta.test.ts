import { describe, expect, it } from "vitest";
import { cuerpoLogin, cuerpoRegistro } from "./adaptador-cuenta";

describe("cuerpoLogin y cuerpoRegistro", () => {
  it("mandan `password`, que es lo que valida la API, no `contrasena`", () => {
    const login = cuerpoLogin({ email: "ana@ejemplo.es", contrasena: "contrasena-larga" });
    expect(login).toEqual({ email: "ana@ejemplo.es", password: "contrasena-larga" });
    expect(login).not.toHaveProperty("contrasena");

    const alta = cuerpoRegistro({ nombre: "Ana", email: "ana@ejemplo.es", contrasena: "contrasena-larga" });
    expect(alta).toEqual({ nombre: "Ana", email: "ana@ejemplo.es", password: "contrasena-larga" });
  });

  it("quita los espacios de nombre y email, pero no de la contraseña", () => {
    const alta = cuerpoRegistro({ nombre: "  Ana  ", email: " ana@ejemplo.es ", contrasena: " con espacios " });
    expect(alta.nombre).toBe("Ana");
    expect(alta.email).toBe("ana@ejemplo.es");
    expect(alta.password).toBe(" con espacios ");
  });
});
