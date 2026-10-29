import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { ciudadDe, type Billete } from "@renfe/shared/api/tipos";
import { fotoDeRuta, urlFoto } from "@renfe/shared/contenido/imagenes";
import { slug, type Viaje } from "@/billetes";
import { fecha, hora } from "@/formato";
import { colores, espaciado, estilos, fuentes, gradientes, paleta, radios, sombras, tipografia, tonos } from "@/tema";

const t = tipografia.tamanos;

// Barras decorativas del talón, siempre las mismas para el mismo localizador.
const barras = (codigo: string) =>
  Array.from({ length: Math.max(codigo.length * 5, 24) }, (_, i) => 1 + (codigo.charCodeAt(i % codigo.length) % 3));

// Billete de la web en vertical: foto del destino, datos y viajeros, y talón morado con el localizador.
export function TarjetaBillete({
  viaje,
  pasado,
  onAbrir,
}: {
  viaje: Viaje;
  pasado?: boolean;
  onAbrir: (b: Billete) => void;
}) {
  const { tren, localizador, qr } = viaje.billetes[0];
  const destino = ciudadDe(tren.destino);
  const foto = fotoDeRuta(slug(destino));
  const n = viaje.billetes.length;
  const hoy = !pasado && tren.salida.slice(0, 10) === new Date().toISOString().slice(0, 10);

  const dato = (etiqueta: string, valor: string) => (
    <View style={styles.dato}>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text style={styles.datoValor} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );

  return (
    <View style={[styles.tarjeta, pasado && { opacity: 0.72 }]}>
      <ImageBackground
        source={foto ? { uri: urlFoto(foto.archivo, 720) } : undefined}
        style={styles.foto}
        imageStyle={{ backgroundColor: paleta.moradoOscuro }}
      >
        <LinearGradient colors={["rgba(40,0,30,0.05)", "rgba(40,0,30,0.62)"]} style={StyleSheet.absoluteFill} />
        {hoy ? (
          <View style={styles.hoy}>
            <Text style={styles.hoyTexto}>Sale hoy</Text>
          </View>
        ) : null}
        <View style={styles.fotoPie}>
          <Text style={styles.antetitulo}>{pasado ? "Viaje realizado" : "Tu próximo tren"}</Text>
          <Text style={styles.ruta}>
            {ciudadDe(tren.origen)} → {destino}
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.cuerpo}>
        <View style={styles.rejillaDatos}>
          {dato("Fecha", fecha(tren.salida))}
          {dato("Tren", `${tren.tipo} ${tren.numero}`)}
          {dato("Salida", hora(tren.salida))}
          {dato("Llegada", hora(tren.llegada))}
        </View>

        <View style={styles.pie}>
          <View style={styles.qr}>
            <QRCode value={qr} size={70} color={colores.texto} backgroundColor="#fff" />
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            {viaje.billetes.map((b) => (
              <Pressable
                key={b.id}
                accessibilityRole="button"
                accessibilityLabel={`Billete de ${b.pasajero.nombre} ${b.pasajero.apellidos}, coche ${b.asiento.coche}, asiento ${b.asiento.fila}${b.asiento.letra}. Abrir QR`}
                onPress={() => onAbrir(b)}
                style={({ pressed }) => [styles.viajero, pressed && { backgroundColor: "rgba(214,45,97,0.08)" }]}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.viajeroNombre} numberOfLines={1}>
                    {b.pasajero.nombre} {b.pasajero.apellidos}
                  </Text>
                  <Text style={styles.viajeroAsiento}>
                    Coche {b.asiento.coche} · {b.asiento.fila}
                    {b.asiento.letra}
                  </Text>
                </View>
                <View style={styles.flechaCirculo}>
                  <Text style={styles.flecha}>›</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <LinearGradient
        colors={pasado ? (["#6b6b6b", "#4a4a4a"] as const) : (gradientes.marca as unknown as readonly [string, string])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.talon}
      >
        <View style={{ gap: 1 }}>
          <Text style={styles.talonEtiqueta}>Localizador</Text>
          <Text style={styles.talonLoc}>{localizador}</Text>
        </View>
        <View style={styles.barras} accessibilityElementsHidden importantForAccessibility="no">
          {barras(localizador).map((w, i) => (
            <View key={i} style={[styles.barra, { width: w, height: i % 4 === 0 ? 22 : 16 }]} />
          ))}
        </View>
        <Text style={styles.talonCuenta}>
          {n} {n === 1 ? "viajero" : "viajeros"}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    borderRadius: radios.grande + 4,
    overflow: "hidden",
    backgroundColor: "#fff",
    ...sombras[2],
  },
  foto: { height: 156, justifyContent: "flex-end" },
  hoy: {
    position: "absolute",
    left: espaciado[3],
    top: espaciado[3],
    backgroundColor: colores.accion,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hoyTexto: { fontFamily: fuentes.negrita, fontSize: 11, color: "#fff" },
  fotoPie: { padding: espaciado[3], gap: 2 },
  antetitulo: {
    fontFamily: fuentes.negrita,
    fontSize: 10.5,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.9)",
  },
  ruta: { fontFamily: fuentes.negrita, fontSize: 23, color: "#fff", letterSpacing: -0.7 },
  cuerpo: { padding: espaciado[3], gap: espaciado[3] },
  rejillaDatos: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  dato: {
    width: "48.5%",
    backgroundColor: "rgba(239,243,246,0.9)",
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 6,
    gap: 1,
  },
  datoEtiqueta: {
    fontFamily: fuentes.negrita,
    fontSize: 9.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colores.textoSuave,
  },
  datoValor: { fontFamily: fuentes.negrita, fontSize: 12.8, color: colores.texto },
  pie: { flexDirection: "row", alignItems: "flex-start", gap: espaciado[3] },
  qr: { backgroundColor: "#fff", padding: 4, borderRadius: 8, borderWidth: 1, borderColor: colores.borde },
  viajero: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[2],
    minHeight: 38,
    paddingHorizontal: espaciado[2],
    paddingVertical: 4,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  viajeroNombre: { fontFamily: fuentes.seminegrita, fontSize: 12.2, color: colores.texto },
  viajeroAsiento: { fontFamily: fuentes.normal, fontSize: 10.8, color: colores.textoSuave },
  flechaCirculo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tonos.moradoSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  flecha: { fontFamily: fuentes.negrita, fontSize: 18, color: colores.marca, marginTop: -2 },
  talon: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[3],
    paddingHorizontal: espaciado[4],
    paddingVertical: espaciado[3],
  },
  talonEtiqueta: {
    fontFamily: fuentes.medio,
    fontSize: 8.8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.78)",
  },
  talonLoc: { fontFamily: fuentes.negrita, fontSize: 18, color: "#fff", letterSpacing: 2.6 },
  barras: { flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 1.5, height: 24 },
  barra: { backgroundColor: "rgba(255,255,255,0.82)", borderRadius: 0.5 },
  talonCuenta: { fontFamily: fuentes.medio, fontSize: 10.5, color: "rgba(255,255,255,0.82)" },
});
