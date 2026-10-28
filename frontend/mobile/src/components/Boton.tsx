import { ActivityIndicator, Pressable, Text } from "react-native";
import { colores, estilos } from "@/tema";

export function Boton({ texto, onPress, cargando }: { texto: string; onPress: () => void; cargando?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={cargando}
      onPress={onPress}
      style={({ pressed }) => [estilos.boton, pressed && { backgroundColor: colores.accionPulsada }]}
    >
      {cargando ? <ActivityIndicator color={colores.superficie} /> : <Text style={estilos.botonTexto}>{texto}</Text>}
    </Pressable>
  );
}
