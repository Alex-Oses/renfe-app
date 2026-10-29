// Huella facial ArcFace de 512 dimensiones en el navegador (ADR-007): Human da la malla de la cara,
// aquí se alinea a 112×112 con los 5 puntos de referencia de InsightFace y se pasa el ONNX.
// Modelo: w600k_mbf (MobileFaceNet entrenado con ArcFace, paquete buffalo_s de InsightFace).
import type { InferenceSession } from "onnxruntime-web";

export const MODELO_URL = "/modelos/arcface-w600k-mbf.onnx";
const LADO = 112;

/** Puntos de referencia de ArcFace en 112×112: ojo izq., ojo der., nariz, boca izq., boca der. (vistos en la imagen). */
export const REFERENCIA: [number, number][] = [
  [38.2946, 51.6963],
  [73.5318, 51.5014],
  [56.0252, 71.7366],
  [41.5493, 92.3655],
  [70.7299, 92.2041],
];

type Punto = ArrayLike<number | undefined>;
const xy = (p: Punto): [number, number] => [p[0] ?? 0, p[1] ?? 0];
const medio = (a: Punto, b: Punto): [number, number] => [((a[0] ?? 0) + (b[0] ?? 0)) / 2, ((a[1] ?? 0) + (b[1] ?? 0)) / 2];

/** Los 5 puntos de ArcFace a partir de la malla de MediaPipe (468 puntos) que devuelve Human. */
export function puntosDeMalla(malla: Punto[]): [number, number][] {
  // Ojos: centro entre las dos comisuras; boca: comisuras. Se ordenan por x para no depender del espejo.
  const ojos = [medio(malla[33]!, malla[133]!), medio(malla[362]!, malla[263]!)].sort((p, q) => p[0] - q[0]);
  const boca = [xy(malla[61]!), xy(malla[291]!)].sort((p, q) => p[0] - q[0]);
  return [ojos[0]!, ojos[1]!, xy(malla[1]!), boca[0]!, boca[1]!];
}

/**
 * Semejanza (escala + giro + traslación) que mejor lleva `origen` a `destino` por mínimos cuadrados
 * (Umeyama en 2D). Devuelve [a, b, tx, ty] con x' = a·x − b·y + tx, y' = b·x + a·y + ty.
 */
export function semejanza(origen: [number, number][], destino: [number, number][]): [number, number, number, number] {
  const n = origen.length;
  const mo = origen.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n], [0, 0]);
  const md = destino.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n], [0, 0]);
  let sxx = 0;
  let sxy = 0;
  let varianza = 0;
  origen.forEach((p, i) => {
    const [ox, oy] = [p[0] - mo[0], p[1] - mo[1]];
    const [dx, dy] = [destino[i]![0] - md[0], destino[i]![1] - md[1]];
    sxx += ox * dx + oy * dy;
    sxy += ox * dy - oy * dx;
    varianza += ox * ox + oy * oy;
  });
  const a = sxx / varianza;
  const b = sxy / varianza;
  return [a, b, md[0] - (a * mo[0] - b * mo[1]), md[1] - (b * mo[0] + a * mo[1])];
}

/** RGBA de un lienzo 112×112 → tensor NCHW RGB normalizado a [−1, 1], como InsightFace. */
export function aTensor(rgba: Uint8ClampedArray): Float32Array {
  const plano = LADO * LADO;
  const datos = new Float32Array(3 * plano);
  for (let i = 0; i < plano; i++) {
    for (let c = 0; c < 3; c++) datos[c * plano + i] = (rgba[i * 4 + c]! - 127.5) / 127.5;
  }
  return datos;
}

export function normalizar(v: ArrayLike<number>): number[] {
  const norma = Math.hypot(...Array.from(v)) || 1;
  return Array.from(v, (x) => x / norma);
}

let sesion: Promise<InferenceSession> | undefined;
let ort: typeof import("onnxruntime-web") | undefined;

/** Carga (una vez por página) el runtime ONNX y el modelo. Pesa ~13 MB y el navegador lo cachea. */
export function cargarArcFace(): Promise<InferenceSession> {
  sesion ??= (async () => {
    ort = await import("onnxruntime-web");
    // Los .wasm del runtime se sirven desde el CDN de la misma versión (Vite no los empaqueta solo).
    ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ort.env.versions.web}/dist/`;
    return ort.InferenceSession.create(MODELO_URL, { executionProviders: ["wasm"] });
  })();
  sesion.catch(() => (sesion = undefined)); // si falla la red, el siguiente intento vuelve a probar
  return sesion;
}

/** Huella de 512 floats (norma 1) de la cara de `fuente` cuyos 5 puntos son `puntos`. */
export async function huellaArcFace(
  modelo: InferenceSession,
  fuente: CanvasImageSource,
  puntos: [number, number][],
): Promise<number[]> {
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = LADO;
  const ctx = lienzo.getContext("2d", { willReadFrequently: true })!;
  const [a, b, tx, ty] = semejanza(puntos, REFERENCIA);
  ctx.setTransform(a, b, -b, a, tx, ty);
  ctx.drawImage(fuente, 0, 0);
  const tensor = new ort!.Tensor("float32", aTensor(ctx.getImageData(0, 0, LADO, LADO).data), [1, 3, LADO, LADO]);
  const salida = await modelo.run({ [modelo.inputNames[0]!]: tensor });
  return normalizar(salida[modelo.outputNames[0]!]!.data as Float32Array);
}
