import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colores, espaciado, fuentes, radios, tipografia, tonos } from "@/tema";
import { Icono, type NombreIcono } from "./Icono";

// Los mismos props que recibe la barra de pestañas de expo-router, sin depender del paquete
// @react-navigation/bottom-tabs (no está expuesto por pnpm).
type PropsBarra = Parameters<NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>>[0];

const ICONOS: Record<string, NombreIcono> = {
  index: "comprar",
  directo: "mapa",
  billetes: "billetes",
  lineas: "lineas",
  cuenta: "cuenta",
};

// Barra flotante de cristal, igual que .barra-pestanas de la web en móvil.
export function BarraPestanas({ state, descriptors, navigateToTab }: PropsBarra) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={[styles.caja, { bottom: Math.max(insets.bottom, 8) + 4 }]}
    >
      <View style={styles.barra}>
        <View style={styles.recorte}>
          {Platform.OS !== "web" ? (
            <BlurView
              intensity={92}
              tint="systemUltraThinMaterialLight"
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
          ) : null}

          <LinearGradient
            colors={[
              "rgba(255,255,255,0.58)",
              "rgba(255,255,255,0.06)",
              "rgba(214,45,97,0.12)",
            ]}
            start={{ x: 0.08, y: 0 }}
            end={{ x: 0.94, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.brillo} pointerEvents="none" />
          <View style={styles.fila}>
            {state.routes.map((route, i) => {
              const { options } = descriptors[route.key];
              const activo = state.index === i;
              const etiqueta =
                typeof options.tabBarLabel === "string"
                  ? options.tabBarLabel
                  : typeof options.title === "string"
                    ? options.title
                    : route.name;
              const alPulsar = () => {
                if (!activo) navigateToTab(route.key);
              };
              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activo }}
                  accessibilityLabel={etiqueta}
                  onPress={alPulsar}
                  style={({ pressed }) => [
                    styles.pestana,
                    activo && styles.pestanaActiva,
                    pressed && { transform: [{ scale: 0.94 }] },
                  ]}
                >
                  <Icono
                    nombre={ICONOS[route.name] ?? "comprar"}
                    tamano={23}
                    color={activo ? colores.marca : colores.textoSuave}
                    grosor={activo ? 2 : 1.7}
                  />
                  <Text style={[styles.texto, activo && styles.textoActivo]} numberOfLines={1}>
                    {etiqueta}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    position: "absolute",
    left: espaciado[3],
    right: espaciado[3],
    zIndex: 50,
  },
  // La sombra va fuera del recorte: dentro, `overflow: hidden` la borraría en iOS.
  barra: {
    borderRadius: radios.pildora,
    backgroundColor: "rgba(255,255,255,0.001)",
    shadowColor: tonos.sombra,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 26,
    elevation: 16,
  },
  recorte: {
    minHeight: 66,
    borderRadius: radios.pildora,
    overflow: "hidden",
    // En web no hay blur real: subimos el velo para que el texto de detrás no moleste.
    backgroundColor: Platform.OS === "web" ? "rgba(255,255,255,0.84)" : "rgba(255,255,255,0.30)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
  },
  brillo: {
    position: "absolute",
    top: 0,
    left: 22,
    right: 22,
    height: 1.2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  fila: { flexDirection: "row", padding: 5, gap: 2 },
  pestana: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    borderRadius: radios.pildora,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 2,
  },
  pestanaActiva: {
    backgroundColor: "rgba(129,0,94,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  texto: {
    fontFamily: fuentes.seminegrita,
    fontSize: 11.2,
    color: colores.textoSuave,
    lineHeight: 13,
    letterSpacing: 0.1,
  },
  textoActivo: { color: colores.marca },
});
