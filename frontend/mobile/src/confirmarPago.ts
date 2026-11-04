// Antes de cobrar: confirmación del importe y luego la cara del titular (pantalla /cara?modo=pago).
// La pantalla de la cara avisa del resultado con resolverCara; aquí se espera como una promesa.
// En Expo Go no existe onnxruntime-react-native (hace falta la APK), así que allí se salta la cara.
import Constants, { ExecutionEnvironment } from "expo-constants";
import { router } from "expo-router";
import { Alert } from "react-native";
import { euros } from "@renfe/shared/formato/formato";

export const enExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let pendiente: ((ok: boolean) => void) | null = null;

// La llama cara.tsx: true si la cara se comprobó, false si se canceló o salió de la pantalla.
export function resolverCara(ok: boolean) {
  pendiente?.(ok);
  pendiente = null;
}

const preguntar = (titulo: string, texto: string, si: string) =>
  new Promise<boolean>((ok) =>
    Alert.alert(titulo, texto, [
      { text: "Cancelar", style: "cancel", onPress: () => ok(false) },
      { text: si, onPress: () => ok(true) },
    ], { cancelable: true, onDismiss: () => ok(false) }),
  );

// true = se puede cobrar.
export async function confirmarPagoConCara(total: number): Promise<boolean> {
  const si = await preguntar(
    "¿Confirmas el pago?",
    `Vas a pagar ${euros(total)} (simulado). Para terminar, mira a la cámara: solo viaja una huella numérica, nunca la imagen.`,
    "Confirmar",
  );
  if (!si) return false;
  if (enExpoGo) {
    // shortcut: sin ONNX en Expo Go no hay cara; en la APK (build propio) sí se pide.
    return preguntar("Cara no disponible en Expo Go", "En la APK aquí se abre la cámara. ¿Sigues sin verificar la cara?", "Seguir");
  }
  resolverCara(false); // por si quedó otra petición colgada
  return new Promise<boolean>((ok) => {
    pendiente = ok;
    router.push({ pathname: "/cara", params: { modo: "pago" } } as never);
  });
}
