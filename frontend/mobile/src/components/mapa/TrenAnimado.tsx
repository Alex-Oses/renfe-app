import { useEffect, useRef, type ComponentType } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { AnimatedRegion, MarkerAnimated, type MapMarkerProps } from "react-native-maps";
import type { PosicionTren } from "@renfe/shared/api/tipos";
import { colores } from "@/tema";
import { TrenMarcador } from "../Icono";

// Un tren no debería tardar más que esto entre lecturas; si tarda más, se recoloca sin animar.
const MAX_DESLIZAR_MS = 15_000;

// Los tipos de MarkerAnimated no admiten hijos ni una coordenada animada; en ejecución sí.
const Marcador = MarkerAnimated as unknown as ComponentType<
  Omit<MapMarkerProps, "coordinate"> & { coordinate: AnimatedRegion }
>;

interface Props {
  tren: PosicionTren;
  activo: boolean;
  reducir: boolean;
  onPress: () => void;
}

// Marcador de un tren que se desliza de la lectura anterior a la nueva durante el tiempo que hubo
// entre ambas (como CapaTrenes.tsx de la web) y, si es el elegido, late con el pulso 'tren-pulso'.
export function TrenAnimado({ tren: t, activo, reducir, onPress }: Props) {
  const posicion = useRef(
    new AnimatedRegion({ latitude: t.lat, longitude: t.lon, latitudeDelta: 0, longitudeDelta: 0 }),
  ).current;
  const ultimaLectura = useRef(Date.now());

  useEffect(() => {
    const ahora = Date.now();
    const duracion = ahora - ultimaLectura.current;
    ultimaLectura.current = ahora;
    const destino = { latitude: t.lat, longitude: t.lon, latitudeDelta: 0, longitudeDelta: 0 };
    posicion.stopAnimation(() => {});
    if (reducir || duracion > MAX_DESLIZAR_MS) posicion.setValue(destino);
    else posicion.timing({ ...destino, toValue: 0, duration: duracion, easing: Easing.linear, useNativeDriver: false }).start();
  }, [t.lat, t.lon, reducir, posicion]);

  const pulso = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!activo || reducir) {
      pulso.setValue(0);
      return;
    }
    // Driver JS: el mapa nativo hace una captura del marcador y no ve las animaciones nativas.
    const bucle = Animated.loop(
      Animated.timing(pulso, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: false }),
    );
    bucle.start();
    return () => bucle.stop();
  }, [activo, reducir, pulso]);

  return (
    <Marcador
      coordinate={posicion}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.55 }}
      // Por encima de las ~1.000 estaciones (zIndex 2): si no, el toque se lo quedaba la estación
      // y el tren no se podía seleccionar desde el mapa.
      tracksViewChanges={activo}
      zIndex={activo ? 1000 : 20}
      accessibilityLabel={`${t.tipo} ${t.numero}, ${t.origen || "sin origen"} a ${t.destino || "sin destino"}`}
    >
      <View style={styles.marcador}>
        {activo ? (
          <>
            {reducir ? null : (
              <Animated.View
                style={[
                  styles.anillo,
                  styles.onda,
                  {
                    opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
                    transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }],
                  },
                ]}
              />
            )}
            <View style={styles.anillo} />
          </>
        ) : null}
        <View style={{ transform: [{ rotate: `${Number.isFinite(t.rumbo) ? t.rumbo : 0}deg` }] }}>
          <TrenMarcador tipo={t.tipo} tamano={activo ? 32 : 24} />
        </View>
      </View>
    </Marcador>
  );
}

const styles = StyleSheet.create({
  marcador: { width: 62, height: 66, alignItems: "center", justifyContent: "center" },
  anillo: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colores.accion,
    backgroundColor: "rgba(214,45,97,0.10)",
  },
  onda: { backgroundColor: "transparent" },
});
