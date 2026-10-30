import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { gradientes } from "@/tema";

// Fondo de la app: el mismo degradado rosa de la portada de la web más unas manchas suaves
// (allí son radial-gradient; en RN se aproximan con círculos desenfocados).
export function Fondo() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={gradientes.fondo}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.mancha, styles.mancha1]} />
      <View style={[styles.mancha, styles.mancha2]} />
      <View style={[styles.mancha, styles.mancha3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  mancha: { position: "absolute", borderRadius: 999 },
  mancha1: {
    width: 420,
    height: 420,
    top: -140,
    left: -120,
    backgroundColor: "rgba(214,45,97,0.13)",
  },
  mancha2: {
    width: 460,
    height: 460,
    top: 120,
    right: -220,
    backgroundColor: "rgba(129,0,94,0.12)",
  },
  mancha3: {
    width: 380,
    height: 380,
    bottom: -160,
    left: -80,
    backgroundColor: "rgba(129,0,94,0.09)",
  },
});
