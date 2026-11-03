import { generateKeyPairSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { PREFIJO_BILLETE, claveValida, firmar, verificar } from './firma.js';

const clave = () =>
  generateKeyPairSync('ed25519').privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64');

const CLAVE = clave();
const OTRA_CLAVE = clave();

describe('QR firmados con Ed25519', () => {
  it('firma y verifica el mismo token', () => {
    const qr = firmar(PREFIJO_BILLETE, { v: 1, id: 'b-1' }, CLAVE);

    expect(qr.startsWith('RNF1.')).toBe(true);
    expect(verificar(qr, CLAVE)).toEqual({ prefijo: 'RNF1', datos: { v: 1, id: 'b-1' } });
  });

  it('rechaza datos manipulados y firmas de otra clave', () => {
    const [prefijo, , firma] = firmar(PREFIJO_BILLETE, { v: 1, id: 'b-1' }, CLAVE).split('.');
    const falso = Buffer.from(JSON.stringify({ v: 1, id: 'b-2' })).toString('base64url');

    expect(verificar(`${prefijo}.${falso}.${firma}`, CLAVE)).toBeNull();
    expect(verificar(firmar(PREFIJO_BILLETE, { v: 1 }, OTRA_CLAVE), CLAVE)).toBeNull();
  });

  it('rechaza prefijos desconocidos y tokens rotos sin lanzar', () => {
    expect(verificar(firmar('XXX1', { v: 1 }, CLAVE), CLAVE)).toBeNull();
    expect(verificar('basura', CLAVE)).toBeNull();
    expect(verificar('RNF1.abc.!!!', CLAVE)).toBeNull();
  });

  it('claveValida distingue una clave Ed25519 de cualquier cadena', () => {
    expect(claveValida(CLAVE)).toBe(true);
    expect(claveValida('secreto-de-pruebas-con-mas-de-32-caracteres')).toBe(false);
  });
});
