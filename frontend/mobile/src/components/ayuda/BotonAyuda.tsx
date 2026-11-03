import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { colores, fuentes, radios, sombraSuave } from "@/tema";

// Botón flotante «¿Necesitas ayuda?» como el de la web (Chatbot.tsx): abre el asistente.
// Va por encima de la barra de pestañas (que ocupa ~128 px abajo) para no tapar sus botones.
export function BotonAyuda() {
  if (usePathname() === "/chatbot") return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="¿Necesitas ayuda? Abrir el asistente"
      onPress={() => router.push("/chatbot")}
      hitSlop={6}
      style={({ pressed }) => [styles.boton, pressed && { opacity: 0.8 }]}
    >
      <Text style={styles.texto}>¿Necesitas ayuda?</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    position: "absolute",
    right: 14,
    bottom: 136,
    zIndex: 20,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: radios.pildora,
    backgroundColor: colores.marca,
    ...sombraSuave,
  },
  texto: { fontFamily: fuentes.seminegrita, color: "#fff", fontSize: 14 },
});
