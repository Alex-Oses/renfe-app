import {
  Animated,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ScrollViewInstance,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { estilos } from "@/tema";
import { Cabecera } from "./Cabecera";
import { Fondo } from "./Fondo";

// Envoltorio común: fondo, cabecera fija y contenido desplazable. La barra inferior de pestañas
// flota encima, así que el contenido deja 128 px abajo para no quedar tapado.
// Si se pasa `scrollY`, el scroll se publica en ese Animated.Value para animar la portada.
export function Pantalla({
  children,
  scroll = true,
  scrollY,
  scrollRef,
  onLayoutVista,
  volver,
  sinAviso,
  contenido,
  estilo,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  scrollY?: Animated.Value;
  scrollRef?: React.RefObject<ScrollViewInstance | null>;
  onLayoutVista?: (alto: number) => void;
  volver?: () => void;
  sinAviso?: boolean;
  contenido?: StyleProp<ViewStyle>;
  estilo?: StyleProp<ViewStyle>;
}) {
  const propiedades = {
    style: { flex: 1 } as const,
    contentContainerStyle: [styles.contenido, contenido],
    keyboardShouldPersistTaps: "handled" as const,
    showsVerticalScrollIndicator: false,
  };

  return (
    <View style={[estilos.pantalla, estilo]}>
      <Fondo />
      <Cabecera volver={volver} sinAviso={sinAviso} />
      <View
        style={{ flex: 1 }}
        onLayout={(e: LayoutChangeEvent) => onLayoutVista?.(e.nativeEvent.layout.height)}
      >
        {scroll ? (
          scrollY ? (
            <Animated.ScrollView
              ref={scrollRef}
              {...propiedades}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                useNativeDriver: true,
              })}
              scrollEventThrottle={16}
            >
              {children}
            </Animated.ScrollView>
          ) : (
            <ScrollView ref={scrollRef} {...propiedades}>
              {children}
            </ScrollView>
          )
        ) : (
          <View style={[{ flex: 1 }, contenido]}>{children}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenido: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 132, gap: 12 },
});
