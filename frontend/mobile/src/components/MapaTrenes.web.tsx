import { Text, View } from "react-native";
import type { PosicionTren } from "@renfe/shared/api/tipos";
import { estilos } from "@/tema";

// react-native-maps no tiene versión web: en el navegador está la web de verdad (frontend/web).
export function MapaTrenes({ trenes }: { trenes: PosicionTren[] }) {
  return (
    <View style={[estilos.pantalla, { alignItems: "center", justifyContent: "center" }]}>
      <Text style={estilos.texto}>El mapa solo está en iOS y Android ({trenes.length} trenes).</Text>
    </View>
  );
}
