import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polygon, Polyline } from "react-native-svg";
import type { PosicionTren } from "@renfe/shared/api/tipos";
import { colorTipo, colores, fuentes } from "@/tema";
import { TrenMarcador } from "./Icono";
import type { PropsMapa } from "./mapa-tipos";

// react-native-maps no funciona en el navegador. Para poder revisar la app en Expo web se pinta
// un mapa esquemático de la península con las mismas posiciones; en el móvil manda el mapa real.
const ANCHO = 1000;
const ALTO = 800;
const x = (lon: number) => ((lon + 9.8) / 14.3) * ANCHO;
const y = (lat: number) => ((44 - lat) / 8.4) * ALTO;

const COSTA: [number, number][] = [
  [-9.3, 43.0],
  [-8.8, 43.6],
  [-7.7, 43.7],
  [-6.0, 43.65],
  [-4.5, 43.45],
  [-3.0, 43.35],
  [-1.8, 43.4],
  [-1.3, 43.1],
  [0, 42.7],
  [1.5, 43.1],
  [2.6, 43.4],
  [3.2, 42.4],
  [2.2, 41.4],
  [0.9, 40.7],
  [0.2, 38.8],
  [-0.6, 38.0],
  [-2.1, 36.8],
  [-4.4, 36.7],
  [-5.6, 36.0],
  [-6.3, 36.6],
  [-7.4, 37.2],
  [-8.8, 37.0],
  [-9.5, 38.7],
  [-8.9, 41.9],
];

const ESTACIONES: { nombre: string; lat: number; lon: number; grande?: boolean }[] = [
  { nombre: "Madrid", lat: 40.406, lon: -3.69, grande: true },
  { nombre: "Barcelona", lat: 41.379, lon: 2.14, grande: true },
  { nombre: "Sevilla", lat: 37.392, lon: -5.975, grande: true },
  { nombre: "València", lat: 39.459, lon: -0.383, grande: true },
  { nombre: "Málaga", lat: 36.712, lon: -4.432 },
  { nombre: "Bilbao", lat: 43.26, lon: -2.928 },
  { nombre: "A Coruña", lat: 43.352, lon: -8.409 },
  { nombre: "Zaragoza", lat: 41.659, lon: -0.921 },
  { nombre: "Alicante", lat: 38.344, lon: -0.495 },
  { nombre: "Valladolid", lat: 41.642, lon: -4.727 },
  { nombre: "Granada", lat: 37.184, lon: -3.609 },
  { nombre: "Santander", lat: 43.456, lon: -3.81 },
];

const VIAS: [number, number, number, number][] = [
  [40.406, -3.69, 41.659, -0.921],
  [41.659, -0.921, 41.379, 2.14],
  [40.406, -3.69, 39.459, -0.383],
  [39.459, -0.383, 38.344, -0.495],
  [40.406, -3.69, 37.392, -5.975],
  [37.392, -5.975, 36.712, -4.432],
  [40.406, -3.69, 41.642, -4.727],
  [41.642, -4.727, 43.26, -2.928],
  [41.642, -4.727, 43.352, -8.409],
  [41.642, -4.727, 43.456, -3.81],
  [40.406, -3.69, 37.184, -3.609],
];

const puntos = (lista: [number, number][]) => lista.map(([lat, lon]) => `${x(lon)},${y(lat)}`).join(" ");

export function MapaTrenes({ trenes, seleccion, onElegir }: PropsMapa) {
  const elegido = trenes.find((t) => t.trenId === seleccion);

  return (
    <View style={styles.lienzo}>
      <LinearGradient
        colors={["#e8f1f4", "#eef4f6", "#e4eef2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width="100%" height="100%" viewBox={`0 0 ${ANCHO} ${ALTO}`} preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        {Array.from({ length: 10 }, (_, i) => (
          <Line key={`v${i}`} x1={(i * ANCHO) / 9} y1={0} x2={(i * ANCHO) / 9} y2={ALTO} stroke="rgba(70,110,125,0.08)" strokeWidth={1.5} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <Line key={`h${i}`} x1={0} y1={(i * ALTO) / 7} x2={ANCHO} y2={(i * ALTO) / 7} stroke="rgba(70,110,125,0.08)" strokeWidth={1.5} />
        ))}

        {/* Península y Baleares */}
        <Polygon points={puntos(COSTA)} fill="#f8fbf9" stroke="#c3d5cf" strokeWidth={4} />
        <Polygon points={puntos([[2.35, 39.85], [3.45, 39.75], [3.25, 39.3], [2.55, 39.35]])} fill="#f8fbf9" stroke="#c3d5cf" strokeWidth={3} />
        <Polygon points={puntos([[3.8, 40.05], [4.35, 39.98], [4.1, 39.8], [3.85, 39.84]])} fill="#f8fbf9" stroke="#c3d5cf" strokeWidth={3} />
        <Polygon points={puntos([[1.25, 39.12], [1.65, 39.05], [1.55, 38.83], [1.25, 38.88]])} fill="#f8fbf9" stroke="#c3d5cf" strokeWidth={3} />

        {/* Vías principales */}
        {VIAS.map(([a1, o1, a2, o2], i) => (
          <Line
            key={`via${i}`}
            x1={x(o1)}
            y1={y(a1)}
            x2={x(o2)}
            y2={y(a2)}
            stroke="rgba(129,0,94,0.17)"
            strokeWidth={2.4}
            strokeDasharray="5 7"
          />
        ))}

        {ESTACIONES.map((e) => (
          <Circle
            key={e.nombre}
            cx={x(e.lon)}
            cy={y(e.lat)}
            r={e.grande ? 10 : 7}
            fill="#fff"
            stroke="#464646"
            strokeWidth={e.grande ? 5 : 4}
          />
        ))}

        {elegido && elegido.ruta.length > 1 ? (
          <Polyline
            points={puntos(elegido.ruta)}
            fill="none"
            stroke={colorTipo[elegido.tipo]}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </Svg>

      {ESTACIONES.map((e) => (
        <Text
          key={e.nombre}
          pointerEvents="none"
          style={[
            styles.etiqueta,
            { left: `${(x(e.lon) / ANCHO) * 100}%`, top: `${(y(e.lat) / ALTO) * 100}%` },
            e.grande && styles.etiquetaGrande,
          ]}
        >
          {e.nombre}
        </Text>
      ))}

      {trenes.map((t) => {
        const activo = t.trenId === seleccion;
        return (
          <Pressable
            key={t.trenId}
            accessibilityRole="button"
            accessibilityLabel={`${t.tipo} ${t.numero}`}
            onPress={() => onElegir?.(t)}
            style={[
              styles.marcador,
              {
                left: `${(x(t.lon) / ANCHO) * 100}%`,
                top: `${(y(t.lat) / ALTO) * 100}%`,
                zIndex: activo ? 40 : 20,
              },
            ]}
          >
            {activo ? <View style={styles.anillo} /> : null}
            <View style={{ transform: [{ rotate: `${Number.isFinite(t.rumbo) ? t.rumbo : 0}deg` }] }}>
              <TrenMarcador tipo={t.tipo} tamano={activo ? 24 : 17} />
            </View>
          </Pressable>
        );
      })}

    </View>
  );
}

const styles = StyleSheet.create({
  lienzo: { flex: 1, overflow: "hidden", backgroundColor: "#e8f1f4" },
  etiqueta: {
    position: "absolute",
    marginLeft: 7,
    marginTop: 7,
    fontFamily: fuentes.medio,
    fontSize: 9.5,
    color: "rgba(40,60,66,0.72)",
  },
  etiquetaGrande: { fontFamily: fuentes.seminegrita, fontSize: 10.5, color: "#2c3c42" },
  marcador: {
    position: "absolute",
    width: 30,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -15,
    marginTop: -20,
  },
  anillo: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: colores.accion,
    backgroundColor: "rgba(214,45,97,0.12)",
  },
});
