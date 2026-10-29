import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

const INSTRUCCIONES_SISTEMA = /\b(ignore|omite|ignora|salta)\b.{0,40}\b(instrucciones|reglas|prompt|contexto)\b/i;
const SECRETOS = /\b(api[_ -]?key|token|password|contraseña|prompt del sistema|system prompt)\b/i;

export function comprobarEntrada(mensaje: string): void {
  if (INSTRUCCIONES_SISTEMA.test(mensaje) || SECRETOS.test(mensaje)) {
    throw new BadRequestException('La petición no está dentro del alcance del asistente');
  }
}

export function comprobarRespuesta(respuesta: string): string {
  if (respuesta.length > 4000 || SECRETOS.test(respuesta)) {
    throw new ServiceUnavailableException('El chatbot generó una respuesta no válida');
  }
  return respuesta;
}
