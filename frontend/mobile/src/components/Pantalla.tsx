import { useRef, useState } from "react";
import { Animated, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent, type StyleProp, type ViewStyle } from "react-native";
import { estilos } from "@/tema";
import { BotonAyuda } from "./ayuda/BotonAyuda";
import { Cabecera } from "./Cabecera";
import { Fondo } from "./Fondo";

// Envoltorio común: fondo, cabecera y contenido desplazable. La barra inferior de pestañas
// flota encima, así que el contenido deja 128 px abajo para no quedar tapado.
// Con scroll, la cabecera flota y se esconde al bajar (>8 px) y vuelve al subir, como la web.
export function Pantalla({
  children,
  scroll = true,
  volver,
  sinAviso,
  contenido,
  estilo,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  volver?: () => void;
  sinAviso?: boolean;
  contenido?: StyleProp<ViewStyle>;
  estilo?: StyleProp<ViewStyle>;
}) {
  const [alto, setAlto] = useState(0);
  const desplazamiento = useRef(new Animated.Value(0)).current;
  const ultimo = useRef(0);
  const oculta = useRef(false);

  const mirar = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (Math.abs(y - ultimo.current) <= 8) return;
    // Arriba del todo siempre visible.
    const ocultar = y > ultimo.current && y > alto;
    ultimo.current = y;
    if (ocultar === oculta.current) return;
    oculta.current = ocultar;
    Animated.timing(desplazamiento, { toValue: ocultar ? -alto : 0, duration: 200, useNativeDriver: true }).start();
  };

  return (
    <View style={[estilos.pantalla, estilo]}>
      <Fondo />
      {scroll ? (
        <>
          <Animated.ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[styles.contenido, contenido, { paddingTop: alto + 4 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScroll={mirar}
            scrollEventThrottle={16}
          >
            {children}
          </Animated.ScrollView>
          <Animated.View
            style={[styles.flotante, { transform: [{ translateY: desplazamiento }] }]}
            onLayout={(e) => setAlto(e.nativeEvent.layout.height)}
          >
            <Cabecera volver={volver} sinAviso={sinAviso} />
          </Animated.View>
        </>
      ) : (
        <>
          <Cabecera volver={volver} sinAviso={sinAviso} />
          <View style={[{ flex: 1 }, contenido]}>{children}</View>
        </>
      )}
      <BotonAyuda />
    </View>
  );
}

const styles = StyleSheet.create({
  contenido: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 132, gap: 12 },
  flotante: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
});
