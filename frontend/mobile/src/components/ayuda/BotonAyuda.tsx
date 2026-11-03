import { router, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, type LayoutChangeEvent } from "react-native";
import { colores, fuentes, radios, sombraSuave } from "@/tema";

// Botón flotante «¿Necesitas ayuda?» como el de la web (Chatbot.tsx): abre el asistente.
// Va por encima de la barra de pestañas (que ocupa ~128 px abajo) para no tapar sus botones.
// Si nadie lo toca, se aparta solo hacia la derecha y deja asomar una pestaña: así no tapa
// contenido en pantallas pequeñas. Tocar la pestaña lo saca otra vez (y reinicia la espera).
const ESPERA_MS = 4000; // quieto este tiempo y se aparta
const ASOMA = 26; // px que quedan a la vista a la derecha cuando está escondido

export function BotonAyuda() {
  const ruta = usePathname();
  const [ancho, setAncho] = useState(0);
  const [escondido, setEscondido] = useState(false);
  const avance = useRef(new Animated.Value(0)).current;

  const deslizar = (destino: 0 | 1) =>
    Animated.timing(avance, { toValue: destino, duration: 260, useNativeDriver: true }).start();

  // Mientras está a la vista se programa solo: si no lo tocan, se aparta.
  useEffect(() => {
    if (ruta === "/chatbot" || escondido || ancho === 0) return;
    const reloj = setTimeout(() => {
      setEscondido(true);
      deslizar(1);
    }, ESPERA_MS);
    return () => clearTimeout(reloj);
  }, [ruta, escondido, ancho, avance]);

  if (ruta === "/chatbot") return null;

  const desplazamiento = avance.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, ancho - ASOMA)],
  });

  const alPulsar = () => {
    if (escondido) {
      setEscondido(false);
      deslizar(0);
      return;
    }
    router.push("/chatbot");
  };

  return (
    <Animated.View
      style={[styles.capa, { transform: [{ translateX: desplazamiento }] }]}
      onLayout={(e: LayoutChangeEvent) => setAncho(e.nativeEvent.layout.width)}
      pointerEvents="box-none"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={escondido ? "Mostrar el botón de ayuda" : "¿Necesitas ayuda? Abrir el asistente"}
        onPress={alPulsar}
        hitSlop={10}
        style={({ pressed }) => [styles.boton, escondido && styles.recogido, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.texto} numberOfLines={1}>
          {escondido ? "?" : "¿Necesitas ayuda?"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // La capa no pinta nada: solo coloca el botón a la derecha y lo desliza.
  capa: { position: "absolute", right: 14, bottom: 136, zIndex: 20 },
  boton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: radios.pildora,
    backgroundColor: colores.marca,
    ...sombraSuave,
  },
  // Recogido: redondo y justo en el borde, para que se vea que se puede volver a sacar.
  recogido: { paddingHorizontal: 0, width: 44, alignItems: "center", opacity: 0.92 },
  texto: { fontFamily: fuentes.seminegrita, color: "#fff", fontSize: 14 },
});
