// Cuerpo de las rutas /auth/cara/* (obsidian/02-contratos-api/endpoints.md).
// El vector lo calcula el dispositivo y la imagen nunca sale de él (ADR-007).
import type { EmbeddingFacial } from "./tipos";

// Tiene que ser el de `config_cara` en la base de datos; si cambia, todo el mundo se registra otra vez.
export const MODELO_CARA = "arcface/buffalo_l";
export const DIMENSIONES_CARA = 512;

// La API rechaza cualquier vector que no sea de 512 floats. Se comprueba antes de salir a la red
// para que el error diga qué pasa (hoy Human da 1024: falta cambiar su `description` por ArcFace).
export function validarEmbedding(embedding: EmbeddingFacial): void {
  if (embedding.length !== DIMENSIONES_CARA)
    throw new Error(
      `La cámara ha calculado una huella de ${embedding.length} números y la API necesita ${DIMENSIONES_CARA} (ArcFace). No se envía nada: falta cambiar el modelo del navegador.`,
    );
  if (embedding.some((n) => !Number.isFinite(n)))
    throw new Error("La huella de tu cara tiene valores inválidos. Vuelve a intentarlo con más luz.");
}

// POST /auth/cara/registrar: se manda una sola vez por usuario.
export const cuerpoRegistrarCara = (embedding: EmbeddingFacial, modelo = MODELO_CARA) => ({ embedding, modelo });

// POST /auth/cara/verificar: el email identifica la plantilla contra la que se compara.
export const cuerpoVerificarCara = (email: string, embedding: EmbeddingFacial) => ({
  email: email.trim().toLowerCase(),
  embedding,
});
