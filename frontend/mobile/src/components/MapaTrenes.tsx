import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ParadaRuta, PosicionTren } from "@renfe/shared/api/tipos";
import { extremos } from "@renfe/shared/estado/estado-tren";
import { partirRuta, type PuntoRuta } from "@renfe/shared/estado/partir-ruta";
import { colorTipo, colores, fuentes } from "@/tema";
import { SimboloEstacion } from "./mapa/SimboloEstacion";
import { TrenAnimado } from "./mapa/TrenAnimado";
import { useReducirMovimiento } from "./mapa/movimiento";
import type { PropsMapa } from "./mapa-tipos";

// Centro de la península; el usuario hace zoom donde quiera.
const ESPANA = { latitude: 40.2, longitude: -3.7, latitudeDelta: 9.4, longitudeDelta: 9.4 };

// Por debajo de este ancho de mapa (grados) se ve de cerca: salen los nombres de las ciudades.
const DELTA_CERCA = 4;

const dibujable = (p: ParadaRuta) => Number.isFinite(p.lat) && Number.isFinite(p.lon);

// Puntos con los que se encuadra el tren elegido: su recorrido si lo hay y, si no, su posición.
function puntosDe(t: PosicionTren): PuntoRuta[] {
  const puntos =
    t.ruta.length > 1
      ? t.ruta
      : t.paradas.filter(dibujable).map((p): PuntoRuta => [p.lat, p.lon]);
  return puntos.length ? puntos : [[t.lat, t.lon]];
}

// fitToCoordinates encuadra la caja de lo que se le pasa: con la envolvente basta y se evita
// mandar al mapa nativo los miles de puntos de un trazado real de GTFS.
function envolvente(puntos: PuntoRuta[]): { latitude: number; longitude: number }[] {
  let arriba = -Infinity;
  let abajo = Infinity;
  let izquierda = Infinity;
  let derecha = -Infinity;
  for (const [lat, lon] of puntos) {
    arriba = Math.max(arriba, lat);
    abajo = Math.min(abajo, lat);
    izquierda = Math.min(izquierda, lon);
    derecha = Math.max(derecha, lon);
  }
  return [
    { latitude: abajo, longitude: izquierda },
    { latitude: arriba, longitude: derecha },
  ];
}

// Mapa nativo: OpenStreetMap/Apple Maps con un tren dibujado por cada posición real.
// El marcador del tren elegido lleva un anillo y, como en la web, su recorrido se pinta encima:
// lo ya recorrido en trazo discontinuo y lo que queda con un halo blanco y el color del tipo.
export function MapaTrenes({ trenes, seleccion, onElegir, espacioInferior = 300, siguiendo = false, onSoltar }: PropsMapa) {
  const mapa = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const { height: altoPantalla } = useWindowDimensions();
  const elegido = trenes.find((t) => t.trenId === seleccion);
  const encuadrado = useRef("");
  const reducir = useReducirMovimiento();
  const [cerca, setCerca] = useState(false);

  // Seguir en el mapa: la cámara acompaña cada lectura del elegido (como CapaTrenes.tsx de la web).
  const seguidoLat = elegido?.lat;
  const seguidoLon = elegido?.lon;
  useEffect(() => {
    if (!siguiendo || seguidoLat === undefined || seguidoLon === undefined) return;
    mapa.current?.animateCamera(
      { center: { latitude: seguidoLat, longitude: seguidoLon } },
      { duration: reducir ? 0 : 1200 },
    );
  }, [siguiendo, seguidoLat, seguidoLon, reducir]);

  // Encuadra el recorrido al elegir el tren y otra vez cuando llega el trazado completo: el
  // snapshot solo trae la posición y el recorrido se pide después a la API.
  useEffect(() => {
    if (!elegido) return;
    const puntos = puntosDe(elegido);
    const clave = `${elegido.trenId}:${puntos.length}`;
    if (encuadrado.current === clave) return;
    encuadrado.current = clave;
    // El panel inferior tapa parte del mapa: se le deja su hueco para que la ruta se vea entera.
    const margenInferior = Math.max(0, Math.min(espacioInferior, altoPantalla * 0.6));
    if (puntos.length > 1) {
      mapa.current?.fitToCoordinates(envolvente(puntos), {
        edgePadding: { top: insets.top + 88, right: 44, bottom: margenInferior, left: 44 },
        animated: true,
      });
    } else {
      const [latitude, longitude] = puntos[0]!;
      mapa.current?.animateToRegion({ latitude, longitude, latitudeDelta: 1.4, longitudeDelta: 1.4 }, 600);
    }
  }, [elegido, espacioInferior, insets.top, altoPantalla]);

  const color = elegido ? colorTipo[elegido.tipo] : colores.marca;
  const corte = elegido && elegido.ruta.length > 1 ? partirRuta(elegido.ruta, elegido.lat, elegido.lon) : null;
  const paradas = elegido ? elegido.paradas.filter(dibujable) : [];
  const { salida, llegada } = extremos(paradas);
  const esExtremo = (p: ParadaRuta) => p.estacionId === salida?.estacionId || p.estacionId === llegada?.estacionId;
  // Con una sola parada, salida y llegada son la misma: se pinta una vez, como en la web.
  const extremosDibujo =
    salida && llegada && salida.estacionId === llegada.estacionId
      ? [{ parada: salida, etiqueta: "Parada" }]
      : [
          ...(salida ? [{ parada: salida, etiqueta: "Sale de" }] : []),
          ...(llegada ? [{ parada: llegada, etiqueta: "Llega a" }] : []),
        ];
  const aCoordenadas = (puntos: PuntoRuta[]) =>
    puntos.map(([latitude, longitude]) => ({ latitude, longitude }));

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
      // Solo el gesto del usuario suelta el seguimiento; las animaciones propias no lo disparan.
      onPanDrag={siguiendo ? onSoltar : undefined}
      onRegionChangeComplete={(r) => setCerca(r.longitudeDelta < DELTA_CERCA)}
    >
      {ESTACIONES.map((e, i) => {
        // Etiqueta de ciudad una sola vez por ciudad, y solo con el mapa cerca (como la web).
        const etiqueta = cerca && ESTACIONES.findIndex((x) => x.ciudad === e.ciudad) === i;
        return (
          <Marker
            key={`estacion-${e.id}-${etiqueta}`}
            coordinate={{ latitude: e.lat, longitude: e.lon }}
            anchor={{ x: 0.5, y: etiqueta ? 0.78 : 0.5 }}
            tracksViewChanges={false}
            title={e.nombre}
            accessibilityLabel={`Estación ${e.nombre}`}
            zIndex={2}
          >
            <View style={styles.estacion}>
              {etiqueta ? <Text style={styles.ciudad}>{e.ciudad}</Text> : null}
              <SimboloEstacion tamano={18} />
            </View>
          </Marker>
        );
      })}

      {corte && corte.hecho.length > 1 ? (
        <Polyline
          coordinates={aCoordenadas(corte.hecho)}
          strokeColor={color}
          strokeWidth={4}
          lineDashPattern={[6, 6]}
          lineJoin="round"
          lineCap="round"
          zIndex={3}
        />
      ) : null}

      {corte && corte.pendiente.length > 1 ? (
        <>
          <Polyline
            coordinates={aCoordenadas(corte.pendiente)}
            strokeColor="#fff"
            strokeWidth={9}
            lineJoin="round"
            lineCap="round"
            zIndex={4}
          />
          <Polyline
            coordinates={aCoordenadas(corte.pendiente)}
            strokeColor={color}
            strokeWidth={5}
            lineJoin="round"
            lineCap="round"
            zIndex={5}
          />
        </>
      ) : null}

      {paradas.map((p) =>
        esExtremo(p) ? null : (
          <Marker
            key={`parada-${p.estacionId}`}
            coordinate={{ latitude: p.lat, longitude: p.lon }}
            anchor={{ x: 0.04, y: 0.5 }}
            tracksViewChanges={false}
            accessibilityLabel={p.pasada ? `${p.nombre}, ya pasada` : `Parada en ${p.nombre}`}
            zIndex={6}
          >
            <View style={styles.extremo}>
              <View style={[styles.parada, { borderColor: color }, p.pasada && styles.paradaPasada]} />
              <Text style={[styles.extremoTexto, styles.paradaTexto, p.pasada && styles.paradaTextoPasada]} numberOfLines={1}>
                {p.nombre}
              </Text>
            </View>
          </Marker>
        ),
      )}

      {extremosDibujo.map(({ parada: p, etiqueta }) => (
        <Marker
          key={`extremo-${etiqueta}-${p.estacionId}`}
          coordinate={{ latitude: p.lat, longitude: p.lon }}
          anchor={{ x: 0.1, y: 0.5 }}
          accessibilityLabel={`${etiqueta} ${p.nombre}`}
          zIndex={7}
        >
          <View style={styles.extremo}>
            <View style={[styles.extremoPunto, { backgroundColor: color, borderColor: color }]} />
            <Text style={styles.extremoTexto} numberOfLines={1}>
              {etiqueta} {p.nombre}
            </Text>
          </View>
        </Marker>
      ))}

      {trenes.map((t) => {
        const activo = t.trenId === seleccion;
        // La clave cambia al elegirlo para que el marcador nativo rehaga su tamaño.
        return (
          <TrenAnimado
            key={`${t.trenId}-${activo ? "on" : "off"}`}
            tren={t}
            activo={activo}
            reducir={reducir}
            onPress={() => onElegir?.(t)}
          />
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  estacion: { alignItems: "center", gap: 1 },
  ciudad: {
    fontFamily: fuentes.seminegrita,
    fontSize: 10,
    color: "#464646",
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: 3,
    borderRadius: 4,
    overflow: "hidden",
  },
  parada: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    backgroundColor: "#fff",
  },
  paradaPasada: { backgroundColor: "#d9dde2", opacity: 0.5 },
  paradaTexto: { fontFamily: fuentes.medio, fontSize: 9.5 },
  paradaTextoPasada: { opacity: 0.55 },
  extremo: { flexDirection: "row", alignItems: "center", gap: 4 },
  extremoPunto: { width: 16, height: 16, borderRadius: 8, borderWidth: 3 },
  extremoTexto: {
    maxWidth: 150,
    fontFamily: fuentes.seminegrita,
    fontSize: 10.5,
    color: colores.texto,
    backgroundColor: "rgba(255,255,255,0.88)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
    overflow: "hidden",
  },
});
