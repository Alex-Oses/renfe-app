// Compartir un billete o abono como imagen, como «Guardar el billete como imagen» de la web (Cartera.tsx).
// Si no se puede capturar o compartir archivos (web, permisos), se comparte el texto con el QR.
import * as Sharing from "expo-sharing";
import type { ComponentRef, RefObject } from "react";
import { Share, View } from "react-native";
import { captureRef } from "react-native-view-shot";

export async function compartirImagen(vista: RefObject<ComponentRef<typeof View> | null>, titulo: string, texto: string): Promise<void> {
  try {
    if (vista.current && (await Sharing.isAvailableAsync())) {
      const uri = await captureRef(vista as Parameters<typeof captureRef>[0], { format: "png", quality: 1, result: "tmpfile" });
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: titulo, UTI: "public.png" });
      return;
    }
  } catch {
    // Sigue con el texto: mejor compartir algo que fallar en silencio.
  }
  await Share.share({ message: texto, title: titulo }).catch(() => {});
}
