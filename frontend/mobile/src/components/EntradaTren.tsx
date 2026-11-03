import { useEffect, useState, type ComponentProps, type ComponentType, type ReactNode } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { colores, espaciado, fuentes, gradientes, paleta, radios } from "@/tema";
import { Icono } from "./Icono";
import { TrenSvg } from "./TrenSvg";

type VistaAnimadaProps = Omit<ComponentProps<typeof View>, "style"> & {
  style?: unknown;
  children?: ReactNode;
};
const VistaAnimada = Animated.View as unknown as ComponentType<VistaAnimadaProps>;

// Entrada del tren de la portada, copiada del tramo sticky de la web
// (frontend/web/src/paginas/inicio/EntradaTren.tsx + inicio.css):
//
//   --p      progreso del tramo, 0..1 (scroll / recorrido del tramo)
//   --t      --p × 1,6: la animación termina antes de que acabe el tramo
//   --avance clamp(0, --t × 1,7, 1)      → lo que avanza el tren, la catenaria y el paisaje
//   --velocidad clamp(0, 1 - (--t - 0,3)² × 16, 1) → estela de velocidad (campana)
//
// El tramo es sticky: la escena se queda pegada arriba mientras el resto de la portada
// sube por detrás. Se consigue desplazando la escena hacia abajo lo mismo que se ha
// desplazado la lista, hasta que se agota el recorrido del tramo.

// La web usa 220vh de tramo con una escena de 100vh: el tren recorre 1,2 escenas.
export const FACTOR_TRAMO = 2.2;

// Movimientos de inicio.css, en múltiplos del ancho de la pantalla (vw).
const AVANCE_TREN = -1.03; // translateX(calc(var(--avance) * -103vw))
const AVANCE_CATENARIA = 0.6; // translateX(calc(var(--avance) * 60vw))
const AVANCE_PAISAJE = 0.12; // translateX(calc(var(--avance) * 12vw))
// inicio.css: width: max(115vw, 820px)
const ANCHO_TREN_MINIMO = 820;

// Umbrales de inicio.css, ya con --t dentro.
const CLAVE_EMPEZADO = 0.005; // data-empezado="si": se esconde el aviso de gesto

/** Alto de la escena cuando no hay animación (reducir movimiento). */
function altoEscenaFija(altoVentana: number) {
  return Math.round(Math.min(Math.max(altoVentana * 0.42, 250), 360));
}

// La escena no puede medir la ventana entera: la cabecera va en flujo normal y la barra de
// pestañas flota encima, así que el andén acababa detrás de la barra y el tren salía muy abajo.
// Por debajo de este alto la escena no deja ver el lema y el tren a la vez.
const ESCENA_MINIMA = 320;
// Solo se usan hasta que la pantalla mide su hueco real (primer fotograma): cabecera de cristal
// (~96 px) y barra de pestañas (~70 px) más el área segura del móvil.
const ALTO_CABECERA_ESTIMADA = 96;
const ALTO_BARRA_ESTIMADO = 70;

const escenaDisponible = (hueco: number) => Math.max(ESCENA_MINIMA, Math.round(hueco));

/**
 * Medidas del tramo. La escena ocupa justo la ventana del ScrollView (por eso el tramo
 * sticky la tapa entera) y el tramo mide 2,2 escenas, como los 220vh de la web.
 */
// La escena sale del alto de la ventana, no del ScrollView: medir el ScrollView (que en web crece con su
// contenido) y agrandar la escena con esa medida entra en bucle y cuelga la página.
// Móvil: la escena es la primera página de un carrusel horizontal y el tren avanza al deslizar a la
// izquierda (contentOffset.x), en vez del tramo sticky vertical de la web.
export function useEntradaTren(altoDisponible?: number) {
  const { height: altoVentana } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducir = useReducirMovimiento();
  // Con el alto medido por la pantalla se descuenta solo la barra flotante; sin medir todavía,
  // se estiman cabecera y barra a partir de la ventana.
  const hueco =
    altoDisponible && altoDisponible > 0
      ? altoDisponible - (ALTO_BARRA_ESTIMADO + Math.max(insets.bottom, 8))
      : altoVentana - ALTO_CABECERA_ESTIMADA - ALTO_BARRA_ESTIMADO - Math.max(insets.bottom, 8);
  const escena = reducir ? altoEscenaFija(escenaDisponible(hueco)) : escenaDisponible(hueco);
  const tramo = reducir ? escena : Math.round(escena * FACTOR_TRAMO);

  const desplazamiento = useSharedValue(0);
  const alScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      desplazamiento.value = e.contentOffset.x;
    },
  });

  return { estatico: reducir, escena, tramo, desplazamiento, alScroll };
}

/** `AccessibilityInfo.isReduceMotionEnabled()` con su aviso de cambio (como Revela). */
function useReducirMovimiento() {
  const [reducir, setReducir] = useState(false);

  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((valor) => {
        if (vivo) setReducir(valor);
      });
    const suscripcion = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducir);
    return () => {
      vivo = false;
      suscripcion.remove();
    };
  }, []);

  return reducir;
}

export function EntradaTren({
  escena,
  tramo,
  estatico,
  desplazamiento,
  onIrAlBuscador,
}: {
  escena: number;
  tramo: number;
  estatico: boolean;
  desplazamiento: SharedValue<number>;
  onIrAlBuscador?: () => void;
}) {
  const { width: ancho } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [empezado, setEmpezado] = useState(false);

  // El recorrido es el ancho de la página: con la página pasada, el tren ha terminado su entrada.
  const recorrido = Math.max(1, ancho);
  const anchoTren = Math.max(Math.round(ancho * 1.15), ANCHO_TREN_MINIMO);
  const anchoEstela = Math.round(ancho * 0.7);
  // Andén más alto que en la web (30 %): en el móvil la escena es más baja, así que el tren
  // quedaba pegado abajo. Con 40 % sube y la composición queda centrada.
  const altoAnden = Math.round(escena * 0.4);
  const altoCatenaria = Math.round(escena * 0.34);
  const altoPaisaje = Math.round(escena * 0.22);
  const tamanoLema = Math.round(Math.min(96, Math.max(40, ancho * 0.09)));

  // --p
  const progreso = useDerivedValue(() =>
    interpolate(desplazamiento.value, [0, recorrido], [0, 1], Extrapolation.CLAMP),
  );
  // --t = --p × 1,6
  const t = useDerivedValue(() => progreso.value * 1.6);
  // --avance
  const avance = useDerivedValue(() => Math.min(1, Math.max(0, t.value * 1.7)));
  // --velocidad (campana: 0 al principio, 1 hacia --t = 0,3 y 0 otra vez al final)
  const velocidad = useDerivedValue(() =>
    Math.min(1, Math.max(0, 1 - (t.value - 0.3) * (t.value - 0.3) * 16)),
  );

  // El tramo sticky: la escena baja lo mismo que sube la lista y se suelta al agotarse.
  // La escena se queda quieta mientras el carrusel la arrastra: se compensa el desplazamiento horizontal
  // para que solo se mueva el tren y su decorado, como el tramo sticky de la web.
  const estiloTramo = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(desplazamiento.value, [0, recorrido], [0, recorrido * 0.6], Extrapolation.CLAMP) },
    ],
  }));

  const estiloTren = useAnimatedStyle(() => ({
    transform: [{ translateX: avance.value * AVANCE_TREN * ancho }],
  }));

  const estiloCatenaria = useAnimatedStyle(() => ({
    transform: [{ translateX: avance.value * AVANCE_CATENARIA * ancho }],
  }));

  const estiloPaisaje = useAnimatedStyle(() => ({
    transform: [{ translateX: avance.value * AVANCE_PAISAJE * ancho }],
  }));

  // transform: scaleX(0.3 + --velocidad); transform-origin: left; + opacity: --velocidad.
  // RN escala desde el centro, así que se compensa con translateX para anclar el borde izquierdo.
  const estiloEstela = useAnimatedStyle(() => {
    const escala = 0.3 + velocidad.value;
    return {
      opacity: velocidad.value,
      transform: [{ translateX: (anchoEstela / 2) * (escala - 1) }, { scaleX: escala }],
    };
  });

  // El aviso de gesto se desvanece al primer píxel de scroll (transición de 280 ms de la web).
  useAnimatedReaction(
    () => progreso.value > CLAVE_EMPEZADO,
    (avanzado, previo) => {
      if (avanzado !== previo) runOnJS(setEmpezado)(avanzado);
    },
  );
  const estiloAviso = useAnimatedStyle(() => ({
    opacity: withTiming(empezado ? 0 : 1, { duration: 280 }),
  }));

  return (
    <View style={{ height: escena, width: ancho, overflow: "hidden" }}>
      <VistaAnimada style={[styles.escena, { height: escena }, estatico ? null : estiloTramo]}>
        <LinearGradient colors={gradientes.heroe} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />

        {/* Paisaje: tres lomas suaves, como los radial-gradient de la web. */}
        <VistaAnimada
          style={[styles.paisaje, { bottom: altoAnden + Math.round(escena * 0.03), height: altoPaisaje }, estatico ? null : estiloPaisaje]}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={[styles.loma, { left: "2%", width: ancho * 0.5, height: altoPaisaje, backgroundColor: "#d9c6d3" }]} />
          <View style={[styles.loma, { left: "34%", width: ancho * 0.42, height: altoPaisaje * 0.92, backgroundColor: "#e3d3dd" }]} />
          <View style={[styles.loma, { left: "70%", width: ancho * 0.4, height: altoPaisaje * 0.8, backgroundColor: "#d9c6d3" }]} />
        </VistaAnimada>

        {/* Catenaria: un cable arriba y un poste cada 23vw. */}
        <VistaAnimada
          style={[styles.catenaria, { bottom: altoAnden, height: altoCatenaria, width: ancho * 3 }, estatico ? null : estiloCatenaria]}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={styles.cable} />
          {Array.from({ length: Math.ceil(ancho * 3 / (ancho * 0.23)) }, (_, i) => (
            <View key={i} style={[styles.poste, { left: i * ancho * 0.23 }]} />
          ))}
        </VistaAnimada>

        <Text
          style={[styles.lema, { top: Math.round(escena * 0.14), fontSize: tamanoLema, lineHeight: Math.round(tamanoLema * 1.05) }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          Renfe
        </Text>

        {/* El tren arranca con el morro en el borde derecho y sale por la izquierda. */}
        <VistaAnimada
          style={[styles.tren, { width: anchoTren, bottom: altoAnden - 4 }, estatico ? null : estiloTren]}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <VistaAnimada style={[styles.estela, { width: anchoEstela }, estatico ? null : estiloEstela]}>
            {Array.from({ length: 4 }, (_, i) => (
              <View key={i} style={styles.estelaLinea} />
            ))}
          </VistaAnimada>
          <TrenSvg ancho={anchoTren} />
        </VistaAnimada>

        {/* Andén: línea roja, marcas de borde y losas. */}
        <View
          style={[styles.anden, { height: altoAnden }]}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={styles.andenBorde} />
          {Array.from({ length: Math.ceil(1 / 0.09) + 1 }, (_, i) => (
            <View key={i} style={[styles.raya, { left: i * ancho * 0.09 }]} />
          ))}
        </View>

        {estatico ? null : (
          <VistaAnimada
            style={[styles.aviso, { bottom: Math.max(insets.bottom, 8) + 82 }, estiloAviso]}
            pointerEvents={empezado ? "none" : "box-none"}
          >
            <View style={styles.avisoGesto} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Text style={styles.avisoTexto}>Desliza a la izquierda</Text>
              <Icono nombre="delante" tamano={18} color={paleta.moradoOscuro} grosor={2.2} />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ir al buscador"
              onPress={onIrAlBuscador}
              style={({ pressed }) => [styles.saltar, pressed && { opacity: 0.75 }]}
            >
              <Text style={styles.saltarTexto}>Ir al buscador</Text>
            </Pressable>
          </VistaAnimada>
        )}
      </VistaAnimada>
    </View>
  );
}

const styles = StyleSheet.create({
  escena: { overflow: "hidden" },
  paisaje: { position: "absolute", left: "-60%", right: "-10%" },
  loma: { position: "absolute", bottom: 0, borderTopLeftRadius: 999, borderTopRightRadius: 999 },
  catenaria: { position: "absolute", left: 0, opacity: 0.55 },
  cable: { position: "absolute", top: "12%", left: 0, right: 0, height: 2, backgroundColor: "#464646" },
  poste: { position: "absolute", top: 0, bottom: 0, width: 4, backgroundColor: "#6b6b6b" },
  lema: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: fuentes.negrita,
    letterSpacing: -1.5,
    color: paleta.moradoOscuro,
  },
  tren: {
    position: "absolute",
    right: "3%",
    shadowColor: "#460032",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  estela: { position: "absolute", left: "100%", top: "20%", height: "60%", justifyContent: "space-evenly" },
  estelaLinea: { height: 2, backgroundColor: "rgba(129,0,94,0.35)" },
  anden: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#dfe5ea", overflow: "hidden" },
  andenBorde: { height: 6, backgroundColor: colores.accion },
  raya: { position: "absolute", top: 6, width: 4, height: 14, backgroundColor: "#cfd6dd" },
  aviso: { position: "absolute", left: 0, right: 0, alignItems: "center", gap: espaciado[3] },
  avisoGesto: { flexDirection: "row", alignItems: "center", gap: espaciado[1] },
  avisoTexto: { fontFamily: fuentes.seminegrita, fontSize: 13.4, color: paleta.moradoOscuro },
  saltar: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: espaciado[4],
    borderRadius: radios.pildora,
    borderWidth: 1,
    borderColor: "rgba(129,0,94,0.35)",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  saltarTexto: { fontFamily: fuentes.negrita, fontSize: 13.4, color: colores.marca },
});
