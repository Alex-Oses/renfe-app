import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { espaciado, radios, sombraFlotante, tonos } from "@/tema";

// Superficie de cristal como la de la web: blanco translúcido, borde especular y sombra de marca.
// En iOS/Android se difumina lo de detrás con expo-blur; en web el navegador ya pinta el fondo.
export function Cristal({
  children,
  style,
  intensidad = 28,
  padding = espaciado[4],
  gap = espaciado[2],
  borde = true,
}: {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensidad?: number;
  padding?: number;
  gap?: number;
  borde?: boolean;
}) {
  return (
    <View
      style={[
        styles.base,
        borde && styles.borde,
        style,
      ]}
    >
      {Platform.OS !== "web" ? (
        <BlurView intensity={intensidad} tint="light" style={StyleSheet.absoluteFill} pointerEvents="none" />
      ) : null}
      <View style={{ padding, gap }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: tonos.cristal,
    borderRadius: radios.grande,
    overflow: "hidden",
    ...sombraFlotante,
  },
  borde: {
    borderWidth: 1,
    borderColor: tonos.bordeCristal,
  },
});
