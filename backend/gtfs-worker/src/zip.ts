/**
 * Lector ZIP mínimo, sin dependencias.
 *
 * Solo necesita lo que hacen los feeds de Renfe: descomprimir entradas con
 * `deflate` (método 8) o sin comprimir (método 0). No soporta ZIP64 ni cifrado:
 * si el fichero los usara, se lanza un error claro en vez de devolver basura.
 *
 * Se lee el directorio central (no los encabezados locales) porque es el único
 * sitio donde están los tamaños reales de las entradas comprimidas.
 */
import { inflateRawSync } from "node:zlib";

const FIRMA_EOCD = 0x06054b50;
const FIRMA_CENTRAL = 0x02014b50;
const FIRMA_LOCAL = 0x04034b50;

export function descomprimirZip(datos: Buffer): Map<string, Buffer> {
  const finDelDirectorio = buscarFinDelDirectorio(datos);
  const totalEntradas = datos.readUInt16LE(finDelDirectorio + 10);
  let puntero = datos.readUInt32LE(finDelDirectorio + 16);

  const entradas = new Map<string, Buffer>();
  for (let n = 0; n < totalEntradas; n += 1) {
    if (datos.readUInt32LE(puntero) !== FIRMA_CENTRAL) {
      throw new Error(`ZIP corrupto: entrada ${n} sin firma de directorio central`);
    }
    const metodo = datos.readUInt16LE(puntero + 10);
    const tamanoComprimido = datos.readUInt32LE(puntero + 20);
    const largoNombre = datos.readUInt16LE(puntero + 28);
    const largoExtra = datos.readUInt16LE(puntero + 30);
    const largoComentario = datos.readUInt16LE(puntero + 32);
    const desplazamientoLocal = datos.readUInt32LE(puntero + 42);
    const nombre = datos.toString("utf8", puntero + 46, puntero + 46 + largoNombre);

    entradas.set(nombre, leerEntrada(datos, desplazamientoLocal, metodo, tamanoComprimido));
    puntero += 46 + largoNombre + largoExtra + largoComentario;
  }
  return entradas;
}

function leerEntrada(
  datos: Buffer,
  desplazamientoLocal: number,
  metodo: number,
  tamanoComprimido: number,
): Buffer {
  if (datos.readUInt32LE(desplazamientoLocal) !== FIRMA_LOCAL) {
    throw new Error("ZIP corrupto: entrada sin firma de cabecera local");
  }
  const inicio =
    desplazamientoLocal +
    30 +
    datos.readUInt16LE(desplazamientoLocal + 26) +
    datos.readUInt16LE(desplazamientoLocal + 28);
  const contenido = datos.subarray(inicio, inicio + tamanoComprimido);

  if (metodo === 0) return Buffer.from(contenido);
  if (metodo === 8) return inflateRawSync(contenido);
  throw new Error(`ZIP con compresión no soportada (método ${metodo})`);
}

/** El fin del directorio central está al final del fichero, tras un comentario variable. */
function buscarFinDelDirectorio(datos: Buffer): number {
  const minimo = Math.max(0, datos.length - 66_000);
  for (let i = datos.length - 22; i >= minimo; i -= 1) {
    if (datos.readUInt32LE(i) === FIRMA_EOCD) return i;
  }
  throw new Error("ZIP corrupto: no se encontró el fin del directorio central");
}
