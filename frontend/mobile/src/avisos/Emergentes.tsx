// Avisos emergentes, como componentes/AvisosEmergentes.tsx de la web: apilados arriba,
// se cierran solos a los 6 s y entran deslizando salvo con «reducir movimiento».
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icono } from "@/components/Icono";
import { colores, espaciado, fuentes, tonos } from "@/tema";
import { cerrarEmergente, marcarLeido, rutaApp, useAvisos, type AvisoLocal } from "./avisos";

const DURACION = 6000;
const SALIDA = 200;

const ACCION: Record<AvisoLocal["tipo"], string> = {
  retraso: "Ver en el mapa",
  llegada: "Ver en el mapa",
  cambio: "Ver detalles",
  info: "Ver",
};

function Emergente({ aviso }: { aviso: AvisoLocal }) {
  const anim = useRef(new Animated.Value(0)).current;
  const reducir = useRef(false);

  const cerrar = () => {
    if (reducir.current) return cerrarEmergente(aviso.id);
    Animated.timing(anim, { toValue: 0, duration: SALIDA, useNativeDriver: true }).start(() => cerrarEmergente(aviso.id));
  };

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then((r) => {
      reducir.current = r;
      if (r) anim.setValue(1);
      else Animated.timing(anim, { toValue: 1, duration: SALIDA, useNativeDriver: true }).start();
    });
    if (aviso.grave) AccessibilityInfo.announceForAccessibility(`${aviso.titulo}. ${aviso.texto}`);
    const t = setTimeout(cerrar, DURACION);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ver = () => {
    if (!aviso.enlace) return;
    marcarLeido(aviso.id);
    cerrar();
    router.navigate(rutaApp(aviso.enlace) as never);
  };

  return (
    <Animated.View
      accessibilityLiveRegion={aviso.grave ? "assertive" : "polite"}
      style={[
        styles.caja,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }] },
      ]}
    >
      <View style={[styles.icono, { backgroundColor: aviso.tipo === "retraso" ? tonos.avisoFondo : tonos.rosaFuerte }]}>
        <Icono nombre={aviso.tipo === "retraso" ? "aviso" : "tren"} tamano={20} color={aviso.tipo === "retraso" ? tonos.aviso : colores.marca} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.titulo}>{aviso.titulo}</Text>
        <Text style={styles.texto}>{aviso.texto}</Text>
        {aviso.enlace ? (
          <Pressable accessibilityRole="button" onPress={ver} hitSlop={6}>
            <Text style={styles.accion}>{ACCION[aviso.tipo]}</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Cerrar aviso" onPress={cerrar} hitSlop={8} style={styles.cerrar}>
        <Icono nombre="cerrar" tamano={16} color={colores.textoSuave} />
      </Pressable>
    </Animated.View>
  );
}

export function Emergentes() {
  const { avisos, emergentes } = useAvisos();
  const insets = useSafeAreaInsets();
  const visibles = emergentes.map((id) => avisos.find((a) => a.id === id)).filter((a): a is AvisoLocal => !!a);
  if (!visibles.length) return null;
  return (
    <View pointerEvents="box-none" style={[styles.pila, { top: insets.top + espaciado[2] }]} accessibilityLabel="Avisos recientes">
      {visibles.map((a) => (
        <Emergente key={a.id} aviso={a} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pila: { position: "absolute", left: espaciado[3], right: espaciado[3], gap: espaciado[2], zIndex: 100, elevation: 100 },
  caja: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espaciado[3],
    padding: espaciado[3],
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.97)",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  icono: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  titulo: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.titulo },
  texto: { fontFamily: fuentes.normal, fontSize: 13.4, color: colores.textoSuave, lineHeight: 18.5 },
  accion: { fontFamily: fuentes.seminegrita, fontSize: 13.6, color: colores.marca, marginTop: 4 },
  cerrar: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
});
