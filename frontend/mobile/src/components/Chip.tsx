import { Pressable, Text } from "react-native";
import { estilos } from "@/tema";

export function Chip({
  texto,
  activo,
  onPress,
  accesible,
}: {
  texto: string;
  activo?: boolean;
  onPress: () => void;
  accesible?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!activo }}
      accessibilityLabel={accesible ?? texto}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.chip,
        activo && estilos.chipActivo,
        pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>{texto}</Text>
    </Pressable>
  );
}
