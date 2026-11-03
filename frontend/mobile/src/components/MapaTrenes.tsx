import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { ESTACIONES } from "@renfe/shared/api/simulado";
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

// Mapa nativo: OpenStreetMap/Apple Maps con un tren dibujado por cada posición real.
// El marcador del tren elegido lleva un anillo y, como en la web, su recorrido se pinta encima:
// lo ya recorrido en trazo discontinuo y lo que queda con un halo blanco y el color del tipo.
export function MapaTrenes({ trenes, seleccion, onElegir, espacioInferior = 300, siguiendo = false, onSoltar }: PropsMapa) {
  const mapa = useRef<MapView>(null);
  const { height: altoPantalla, width: anchoPantalla } = useWindowDimensions();
  // Región visible: sirve para pasar de grados a píxeles (buscar el tren tocado y centrar sin que
  // la hoja lo tape). En un ref para no repintar el mapa en cada movimiento.
  const regionActual = useRef(ESPANA);
  const elegido = trenes.find((t) => t.trenId === seleccion);
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

  // Al elegir un tren se centra la cámara en él, sin tocar el zoom (antes se encuadraba el recorrido
  // entero y el mapa saltaba de escala). El centro se sube medio hueco de la hoja para que el tren
  // quede en la mitad de lo que se ve, no en la mitad de la pantalla, donde lo taparía el panel.
  const centrado = useRef("");
  useEffect(() => {
    if (!elegido) {
      centrado.current = "";
      return;
    }
    if (centrado.current === elegido.trenId) return;
    centrado.current = elegido.trenId;
    const tapado = Math.min(Math.max(espacioInferior, 0), altoPantalla * 0.55);
    const gradosPorPx = Math.abs(regionActual.current.latitudeDelta) / Math.max(1, altoPantalla);
    mapa.current?.animateCamera(
      { center: { latitude: elegido.lat - (tapado / 2) * gradosPorPx, longitude: elegido.lon } },
      { duration: 450 },
    );
  }, [elegido, espacioInferior, altoPantalla]);

  // Al elegir un tren no se mueve la cámara: el usuario ve el recorrido donde está mirando y no
  // se le cambia el zoom. Solo se sigue al tren si él lo pide con «Seguir en el mapa».

  const color = elegido ? colorTipo[elegido.tipo] : colores.marca;
  // Con el tiempo real solo llegan paradas con coordenadas: se unen para marcar el recorrido, que
  // antes no se pintaba porque `ruta` llegaba vacía.
  const trazado = elegido ? puntosDe(elegido) : [];
  const corte = elegido && trazado.length > 1 ? partirRuta(trazado, elegido.lat, elegido.lon) : null;
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

  // El marcador nativo no siempre recibe el toque (va dentro de un mapa con cientos de pines), así
  // que el toque se resuelve en el propio mapa: se elige el tren más cercano al punto pulsado.
  const alTocarMapa = (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    if (!onElegir || !trenes.length) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const latPorPx = Math.abs(regionActual.current.latitudeDelta) / Math.max(1, altoPantalla);
    const lonPorPx = Math.abs(regionActual.current.longitudeDelta) / Math.max(1, anchoPantalla);
    let mejor: { tren: PosicionTren; distancia: number } | null = null;
    for (const t of trenes) {
      const distancia = Math.hypot((t.lat - latitude) / latPorPx, (t.lon - longitude) / lonPorPx);
      if (!mejor || distancia < mejor.distancia) mejor = { tren: t, distancia };
    }
    // Radio de 26 px (el icono mide 62×66 y la distancia está en píxeles de pantalla): con 44 px,
    // con el mapa alejado, cualquier toque en el mapa pillaba un tren a decenas de km y abría su
    // detalle. Ahora hay que tocar de verdad encima del tren.
    if (mejor && mejor.distancia <= 26) onElegir(mejor.tren);
  };

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
      onPress={alTocarMapa}
      onRegionChangeComplete={(r) => {
        regionActual.current = r;
        setCerca(r.longitudeDelta < DELTA_CERCA);
      }}
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
