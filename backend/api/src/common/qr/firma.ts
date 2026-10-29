// Firma de los QR de billete (`RNF1`) y de abono (`RNA1`).
//
// El contrato (endpoints.md) prevé Ed25519 con QR_SIGNING_PRIVATE_KEY; hasta que
// existan las claves, la API firma con HMAC-SHA256 y `QR_SIGNING_SECRET`, igual
// que el modo simulado de la web. Cambiar `firmar`/`verificar` por `sign`/`verify`
// de Ed25519 no toca ni los servicios ni el formato del token.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const PREFIJO_BILLETE = 'RNF1';
export const PREFIJO_ABONO = 'RNA1';

const PREFIJOS = [PREFIJO_BILLETE, PREFIJO_ABONO];

export interface QrVerificado {
  prefijo: string;
  datos: Record<string, unknown>;
}

function firma(texto: string, secreto: string): string {
  return createHmac('sha256', secreto).update(texto).digest('base64url');
}

/** `PREFIJO.<datos base64url>.<firma base64url>`: la firma cubre `PREFIJO.<datos>`. */
export function firmar(prefijo: string, datos: object, secreto: string): string {
  const cuerpo = Buffer.from(JSON.stringify(datos)).toString('base64url');
  return `${prefijo}.${cuerpo}.${firma(`${prefijo}.${cuerpo}`, secreto)}`;
}

/**
 * `null` = QR que no hemos firmado nosotros (prefijo desconocido, firma que no
 * cuadra o datos ilegibles). El llamante no distingue el motivo: todo es `falso`.
 */
export function verificar(token: string, secreto: string): QrVerificado | null {
  const [prefijo, cuerpo, firmado] = token.split('.');
  if (!prefijo || !cuerpo || !firmado || !PREFIJOS.includes(prefijo)) return null;

  const esperada = Buffer.from(firma(`${prefijo}.${cuerpo}`, secreto));
  const recibida = Buffer.from(firmado);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null;

  try {
    return { prefijo, datos: JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8')) };
  } catch {
    return null;
  }
}
