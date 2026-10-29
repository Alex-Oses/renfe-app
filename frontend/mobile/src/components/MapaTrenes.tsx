import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { colorTipo, colores } from "@/tema";
import { TrenMarcador } from "./Icono";
import type { PropsMapa } from "./mapa-tipos";

// Centro de la península; el usuario hace zoom donde quiera.
const ESPANA = { latitude: 40.2, longitude: -3.7, latitudeDelta: 9.4, longitudeDelta: 9.4 };

// Mapa nativo: OpenStreetMap/Apple Maps con un tren dibujado por cada posición real.
// El marcador del tren elegido lleva un anillo y el recorrido se pinta encima.
export function MapaTrenes({ trenes, seleccion, onElegir }: PropsMapa) {
  const mapa = useRef<MapView>(null);
  const elegido = trenes.find((t) => t.trenId === seleccion);

  useEffect(() => {
    if (!elegido) return;
    mapa.current?.animateToRegion(
      {
        latitude: elegido.lat,
        longitude: elegido.lon,
        latitudeDelta: 2.4,
        longitudeDelta: 2.4,
      },
      650,
    );
  }, [elegido?.trenId, elegido?.lat, elegido?.lon]);

  return (
    <MapView
      ref={mapa}
      style={StyleSheet.absoluteFill}
      initialRegion={ESPANA}
      showsCompass={false}
      showsScale={false}
      toolbarEnabled={false}
      loadingEnabled
      loadingBackgroundColor="#eff3f6"
      loadingIndicatorColor={colores.marca}
    >
      {elegido && elegido.ruta.length > 1 ? (
        <Polyline
          coordinates={elegido.ruta.map(([lat, lon]) => ({ latitude: lat, longitude: lon }))}
          strokeColor={colorTipo[elegido.tipo]}
          strokeWidth={4}
          lineJoin="round"
          lineCap="round"
        />
      ) : null}

      {trenes.map((t) => {
        const activo = t.trenId === seleccion;
        return (
          <Marker
            key={`${t.trenId}-${activo ? "on" : "off"}`}
            coordinate={{ latitude: t.lat, longitude: t.lon }}
            onPress={() => onElegir?.(t)}
            anchor={{ x: 0.5, y: 0.55 }}
            tracksViewChanges={activo}
            zIndex={activo ? 1000 : 1}
            accessibilityLabel={`${t.tipo} ${t.numero}, ${t.origen || "sin origen"} a ${t.destino || "sin destino"}`}
          >
            <View style={styles.marcador}>
              {activo ? <View style={styles.anillo} /> : null}
              <View
                style={{
                  transform: [{ rotate: `${Number.isFinite(t.rumbo) ? t.rumbo : 0}deg` }],
                }}
              >
                <TrenMarcador tipo={t.tipo} tamano={activo ? 32 : 24} />
              </View>
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  marcador: {
    width: 58,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  anillo: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colores.accion,
    backgroundColor: "rgba(214,45,97,0.10)",
  },
});
