import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

const INSTRUCCIONES_SISTEMA =
  /\b(ignore|omite|ignora|salta|reemplaza)\b.{0,80}\b(instrucciones|reglas|prompt|contexto|guardrails)\b/i;
const SECRETOS =
  /\b(api[_ -]?key|token|password|contraseña|prompt del sistema|system prompt|cabecera|header)\b/i;
const ESTRUCTURA_INTERNA = /```(?:json|sql|typescript|javascript)?\s*[\s\S]*```/i;

export function comprobarEntrada(mensaje: string): void {
  if (INSTRUCCIONES_SISTEMA.test(mensaje) || SECRETOS.test(mensaje)) {
    throw new BadRequestException('La petición no está dentro del alcance del asistente');
  }
}

export function comprobarRespuesta(respuesta: string, usoHerramienta: boolean): string {
  if (
    respuesta.length > 4000 ||
    SECRETOS.test(respuesta) ||
    ESTRUCTURA_INTERNA.test(respuesta) ||
    (!usoHerramienta && contieneDatoOperativo(respuesta))
  ) {
    throw new ServiceUnavailableException('El chatbot generó una respuesta no válida');
  }
  return respuesta;
}

function contieneDatoOperativo(respuesta: string): boolean {
  return (
    /\b(?:tren|estación|viaje|horario|retraso|posición|AVE|Alvia|Cercanías)\b/i.test(respuesta) &&
    /\b\d{1,2}:\d{2}\b|\b\d+\s*(?:minutos?|km\/h)\b/i.test(respuesta)
  );
}
