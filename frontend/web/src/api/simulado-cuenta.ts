// Cuenta y login facial simulados. Dueño: agente de cuenta.
import type { EmbeddingFacial, Sesion } from "./tipos";

const pendiente = (): never => {
  throw new Error("Pendiente de implementar");
};

export const registrarse = (_d: { nombre: string; email: string; contrasena: string }): Sesion => pendiente();
export const iniciarSesion = (_d: { email: string; contrasena: string }): Sesion => pendiente();
export const registrarCara = (_e: EmbeddingFacial): { ok: true } => pendiente();
export const verificarCara = (_d: { email: string; embedding: EmbeddingFacial }): Sesion => pendiente();
