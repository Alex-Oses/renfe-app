// Los dos modelos ONNX viven en el bundle y corren en el teléfono con onnxruntime-react-native:
// SCRFD detecta la cara y ArcFace la convierte en 512 floats. La matemática está en ./matematica
// (probada con node --test); aquí solo está la carga de ficheros y las llamadas al runtime.
import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import jpeg from "jpeg-js";
import { InferenceSession, Tensor } from "onnxruntime-react-native";
import {
  agrupar,
  decodificar,
  LADO,
  LADO_DET,
  normalizar,
  preparar,
  recortar,
  type Deteccion,
} from "./matematica";

/** Los dos ONNX van dentro del bundle: se copian a `assets/modelos/` y se leen una vez. */
async function bytesDe(recurso: number): Promise<Uint8Array> {
  const recursoAsset = Asset.fromModule(recurso);
  if (!recursoAsset.localUri) await recursoAsset.downloadAsync();
  if (!recursoAsset.localUri) throw new Error("No se pudo copiar el modelo desde el bundle");
  return new Uint8Array(await new File(recursoAsset.localUri).arrayBuffer());
}

let modelos: Promise<{ deteccion: InferenceSession; cara: InferenceSession }> | undefined;

/** Carga los dos modelos (una vez por app). Pesa ~16 MB en total. */
export function cargarModelos() {
  modelos ??= (async () => {
    const [det, arc] = await Promise.all([
      bytesDe(require("../../assets/modelos/det-500m.onnx")),
      bytesDe(require("../../assets/modelos/arcface-w600k-mbf.onnx")),
    ]);
    return {
      deteccion: await InferenceSession.create(det),
      cara: await InferenceSession.create(arc),
    };
  })();
  modelos.catch(() => (modelos = undefined)); // si falla, el siguiente intento vuelve a probar
  return modelos;
}

/** JPEG de la cámara → píxeles RGBA, ancho y alto (o `null` si no se puede leer). */
export async function fotoDeJpeg(uri: string): Promise<{ datos: Uint8Array; ancho: number; alto: number } | null> {
  try {
    const bytes = new Uint8Array(await new File(uri).arrayBuffer());
    const dec = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true });
    return { datos: dec.data, ancho: dec.width, alto: dec.height };
  } catch {
    return null;
  }
}

/** Cara de mayor puntuación de la foto, o `null` si no se ve ninguna. */
export async function detectarCara(
  sesion: InferenceSession,
  foto: Uint8Array,
  ancho: number,
  alto: number,
): Promise<Deteccion | null> {
  const { escala, lienzo } = preparar(foto, ancho, alto);
  const salida = await sesion.run({ "input.1": new Tensor("float32", lienzo, [1, 3, LADO_DET, LADO_DET]) });
  return decodificar(agrupar(Object.values(salida) as unknown as { dims: readonly number[]; data: Float32Array }[]), escala);
}

/** Huella de 512 floats (norma 1) de la cara cuyos 5 puntos son `puntos`, en coordenadas de foto. */
export async function huellaArcFace(
  sesion: InferenceSession,
  foto: Uint8Array,
  ancho: number,
  alto: number,
  puntos: [number, number][],
): Promise<number[]> {
  const entrada = recortar(foto, ancho, alto, puntos);
  const salida = await sesion.run({ "input.1": new Tensor("float32", entrada, [1, 3, LADO, LADO]) });
  const datos = salida[Object.keys(salida)[0]!].data as Float32Array;
  return normalizar(datos);
}
