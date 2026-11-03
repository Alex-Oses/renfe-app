// Firma de los QR de billete (`RNF1`) y de abono (`RNA1`) con Ed25519 (ADR-001, endpoints.md §5.4).
//
// `QR_SIGNING_PRIVATE_KEY` es la clave privada en PKCS8/DER codificada en base64 (una sola línea,
// cómoda en Render):
//   openssl genpkey -algorithm ed25519 -outform der | base64 -w0
// La clave pública se deriva de la privada: solo la API firma y solo la API verifica.
import { createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import type { KeyObject } from 'node:crypto';

export const PREFIJO_BILLETE = 'RNF1';
export const PREFIJO_ABONO = 'RNA1';

const PREFIJOS = [PREFIJO_BILLETE, PREFIJO_ABONO];

export interface QrVerificado {
  prefijo: string;
  datos: Record<string, unknown>;
}

function claves(base64: string): { privada: KeyObject; publica: KeyObject } {
  const privada = createPrivateKey({
    key: Buffer.from(base64, 'base64'),
    format: 'der',
    type: 'pkcs8',
  });
  return { privada, publica: createPublicKey(privada) };
}

/** `false` si la cadena no es una clave Ed25519 válida (lo comprueba `config/entorno.ts`). */
export function claveValida(base64: string): boolean {
  try {
    claves(base64);
    return true;
  } catch {
    return false;
  }
}

/** `PREFIJO.<datos base64url>.<firma base64url>`: la firma cubre `PREFIJO.<datos>`. */
export function firmar(prefijo: string, datos: object, clavePrivada: string): string {
  const cuerpo = Buffer.from(JSON.stringify(datos)).toString('base64url');
  const firma = sign(null, Buffer.from(`${prefijo}.${cuerpo}`), claves(clavePrivada).privada);
  return `${prefijo}.${cuerpo}.${firma.toString('base64url')}`;
}

/**
 * `null` = QR que no hemos firmado nosotros (prefijo desconocido, firma que no
 * cuadra o datos ilegibles). El llamante no distingue el motivo: todo es `falso`.
 */
export function verificar(token: string, clavePrivada: string): QrVerificado | null {
  try {
    const [prefijo, cuerpo, firmado] = token.split('.');
    if (!prefijo || !cuerpo || !firmado || !PREFIJOS.includes(prefijo)) return null;

    const datos = Buffer.from(cuerpo, 'base64url');
    const firma = Buffer.from(firmado, 'base64url');
    if (!verify(null, Buffer.from(`${prefijo}.${cuerpo}`), claves(clavePrivada).publica, firma)) {
      return null;
    }
    return { prefijo, datos: JSON.parse(datos.toString('utf8')) };
  } catch {
    // Token con firma de longitud rara o base64 roto: no es nuestro.
    return null;
  }
}
