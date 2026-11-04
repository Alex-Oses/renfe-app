import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type PanResponderGestureState,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colores, espaciado, fuentes, paleta, tipografia, tonos } from "@/tema";
import { Icono } from "./Icono";

// Arrastre para cerrar una hoja por el asa/cabecera: sigue al dedo con Animated y, al soltar,
// cierra si se ha bajado más de un tercio de la hoja o si el gesto iba rápido (vy > 0.5).
// Se comparte con el panel del mapa (directo.tsx), que se maneja igual con el pulgar.
// Con onAbrir, deslizar hacia arriba (más de 40 px o rápido) lo llama: sirve para subir un panel escondido.
export function useArrastreCierre(onCerrar?: () => void, onAbrir?: () => void) {
  const altura = useRef(0);
  const avance = useRef(new Animated.Value(0)).current;
  const cerrar = useRef(onCerrar);
  const abrir = useRef(onAbrir);

  useEffect(() => {
    cerrar.current = onCerrar;
    abrir.current = onAbrir;
  }, [onCerrar, onAbrir]);

  const responder = useMemo(() => {
    const volverArriba = () =>
      Animated.spring(avance, { toValue: 0, bounciness: 0, useNativeDriver: true }).start();
    // Solo se queda el gesto si es claramente vertical: un toque o un desliz horizontal no cuentan.
    const vertical = (_: unknown, gesto: PanResponderGestureState) =>
      Math.abs(gesto.dy) > 6 && Math.abs(gesto.dy) > Math.abs(gesto.dx);
    return PanResponder.create({
      onMoveShouldSetPanResponder: vertical,
      onMoveShouldSetPanResponderCapture: vertical,
      // Si el usuario vuelve a agarrar la hoja mientras rebota, manda el dedo.
      onPanResponderGrant: () => avance.stopAnimation(),
      onPanResponderMove: (_, gesto) => avance.setValue(Math.max(0, gesto.dy)),
      onPanResponderRelease: (_, gesto) => {
        // Sin onLayout (por ejemplo, en el primer toque) se usa un alto de referencia.
        const alto = altura.current || 480;
        // Sin onCerrar (el panel ya está escondido) deslizar abajo no hace nada: antes animaba el
        // cierre, lo devolvía a su sitio y el panel parecía volver a subir solo.
        if (cerrar.current && (gesto.dy > alto / 3 || gesto.vy > 0.5)) {
          Animated.timing(avance, {
            toValue: Math.max(alto, gesto.dy),
            duration: 170,
            useNativeDriver: true,
          }).start(() => {
            avance.setValue(0);
            cerrar.current?.();
          });
          return;
        }
        if (abrir.current && (gesto.dy < -40 || gesto.vy < -0.5)) abrir.current();
        volverArriba();
      },
      onPanResponderTerminate: volverArriba,
    });
  }, [avance]);

  return {
    panHandlers: responder.panHandlers,
    estilo: { transform: [{ translateY: avance }] },
    alMedir: (e: LayoutChangeEvent) => {
      altura.current = e.nativeEvent.layout.height;
    },
  };
}

/**
 * Arrastre de una hoja que crece y encoge: el borde de arriba sigue al dedo y al soltar se avisa
 * del alto al que ha quedado para que encaje en un nivel. Solo se anima `height` y con driver JS:
 * no hay translateY nativo en la misma vista, que es justo lo que rompía RN al mezclar los dos.
 */
export function useHojaArrastrable({
  alto,
  minimo,
  maximo,
  alSoltar,
}: {
  alto: number;
  minimo: number;
  maximo: number;
  alSoltar: (altura: number, velocidad: number) => void;
}) {
  const altura = useRef(new Animated.Value(alto)).current;
  const desde = useRef(alto);
  const ultima = useRef(alto);
  const soltar = useRef(alSoltar);

  useEffect(() => {
    soltar.current = alSoltar;
  }, [alSoltar]);

  // Cambio de nivel pedido por la app (botón, arrastre o tren elegido): se anima al objetivo.
  useEffect(() => {
    Animated.timing(altura, { toValue: alto, duration: 220, useNativeDriver: false }).start();
  }, [alto, altura]);

  const responder = useMemo(() => {
    const acotar = (v: number) => Math.min(maximo, Math.max(minimo, v));
    const vertical = (_: unknown, gesto: PanResponderGestureState) =>
      Math.abs(gesto.dy) > 5 && Math.abs(gesto.dy) > Math.abs(gesto.dx);
    return PanResponder.create({
      onMoveShouldSetPanResponder: vertical,
      onMoveShouldSetPanResponderCapture: vertical,
      // Al agarrar se parte del alto que hay ahora mismo, aunque estuviera animándose.
      onPanResponderGrant: () =>
        altura.stopAnimation((v) => {
          desde.current = v;
          ultima.current = v;
        }),
      onPanResponderMove: (_, gesto) => {
        ultima.current = acotar(desde.current - gesto.dy);
        altura.setValue(ultima.current);
      },
      onPanResponderRelease: (_, gesto) => {
        // Se usa el último alto real (no se recalcula con dy): en un gesto rápido los eventos se
        // agrupan y dy puede saltar, mientras que el valor aplicado ya viene acotado.
        const final = ultima.current;
        soltar.current(final, gesto.vy);
        Animated.timing(altura, { toValue: final, duration: 160, useNativeDriver: false }).start();
      },
      onPanResponderTerminate: () => soltar.current(ultima.current, 0),
    });
  }, [altura, maximo, minimo]);

  return { altura, panHandlers: responder.panHandlers };
}

// Hoja inferior para elegir estaciones, fechas, viajeros o descuentos. En la web el buscador
// despliega una lista; en el móvil una hoja se maneja mejor con el pulgar.
export function Hoja({
  visible,
  onCerrar,
  titulo,
  children,
  maximo = 0.82,
}: {
  visible: boolean;
  onCerrar: () => void;
  titulo: string;
  children: React.ReactNode;
  maximo?: number;
}) {
  const insets = useSafeAreaInsets();
  const arrastre = useArrastreCierre(onCerrar);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.raiz}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.velo} accessibilityLabel="Cerrar" onPress={onCerrar} />
        <Animated.View
          style={[
            styles.hoja,
            { maxHeight: `${Math.round(maximo * 100)}%`, paddingBottom: Math.max(insets.bottom, espaciado[3]) },
            arrastre.estilo,
          ]}
          onLayout={arrastre.alMedir}
        >
          <View {...arrastre.panHandlers}>
            <View style={styles.asa} />
            <View style={styles.cabecera}>
              <Text style={styles.titulo} accessibilityRole="header">
                {titulo}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={onCerrar}
                hitSlop={12}
                style={({ pressed }) => [styles.cerrar, pressed && { backgroundColor: tonos.rosaFuerte }]}
              >
                <Icono nombre="cerrar" tamano={20} color={colores.marca} />
              </Pressable>
            </View>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: espaciado[4] }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, justifyContent: "flex-end" },
  velo: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: tonos.velo },
  hoja: {
    backgroundColor: paleta.niebla,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: espaciado[4],
    paddingTop: espaciado[2],
    overflow: "hidden",
  },
  asa: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(129,0,94,0.22)",
    marginBottom: espaciado[3],
  },
  cabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: espaciado[3] },
  titulo: {
    fontFamily: fuentes.negrita,
    fontSize: tipografia.tamanos.xxl,
    color: colores.titulo,
    flex: 1,
    paddingRight: espaciado[3],
  },
  cerrar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
});
