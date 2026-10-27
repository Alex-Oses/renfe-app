import jsQR from "jsqr";

// Lector de QR: el nativo del navegador si existe (Chrome Android, rápido) y si no, jsQR (todos).
interface Detector {
  detect(fuente: CanvasImageSource): Promise<{ rawValue: string }[]>;
}
type ConstructorDetector = new (o: { formats: string[] }) => Detector;

let nativo: Detector | null | undefined;
function detectorNativo(): Detector | null {
  if (nativo !== undefined) return nativo;
  const Ctor = (window as unknown as { BarcodeDetector?: ConstructorDetector }).BarcodeDetector;
  try {
    nativo = Ctor ? new Ctor({ formats: ["qr_code"] }) : null;
  } catch {
    nativo = null;
  }
  return nativo;
}

// Devuelve el texto del QR que haya en el lienzo, o null.
export async function leerDeLienzo(lienzo: HTMLCanvasElement): Promise<string | null> {
  const det = detectorNativo();
  if (det) {
    try {
      const [r] = await det.detect(lienzo);
      if (r?.rawValue) return r.rawValue;
    } catch {
      /* cae a jsQR */
    }
  }
  const ctx = lienzo.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const img = ctx.getImageData(0, 0, lienzo.width, lienzo.height);
  return jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" })?.data ?? null;
}

// Lee el QR de una foto (por si la cámara no va o el viajero manda captura).
export async function leerDeArchivo(archivo: File): Promise<string | null> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(bitmap.width * escala);
  lienzo.height = Math.round(bitmap.height * escala);
  lienzo.getContext("2d")!.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
  return leerDeLienzo(lienzo);
}
