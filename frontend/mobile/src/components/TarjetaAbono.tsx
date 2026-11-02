import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { estadoAbono } from "@renfe/shared/api/simulado-abonos";
import type { Abono, TipoAbono } from "@renfe/shared/api/tipos";
import { TEXTO_ESTADO, aFecha } from "@/formato";
import { colores, fuentes, radios, sombras } from "@/tema";

// Etiqueta y color por tipo, los mismos que TarjetaAbono.tsx y billetes.css de la web.
const ETIQUETA: Record<TipoAbono, string> = {
  "ave-ld-mensual": "AVE y Larga Distancia",
  "avant-mensual": "Avant",
  "cercanias-recurrente": "Cercanías",
  "bono-10": "Bono 10",
};
const DEGRADADO: Record<TipoAbono, readonly [string, string]> = {
  "ave-ld-mensual": ["#81005e", "#4d0038"],
  "avant-mensual": ["#a3123f", "#6b0a29"],
  "cercanias-recurrente": ["#b81f50", "#81005e"],
  "bono-10": ["#3b3b4f", "#1f1f2b"],
};

export function TarjetaAbono({ abono, onAbrir }: { abono: Abono; onAbrir: (a: Abono) => void }) {
  const estado = estadoAbono(abono);
  const inactivo = estado === "caducado" || estado === "agotado";
  const { viajesRestantes: quedan, viajesTotales: total } = abono;
  const viajes = total === null ? "Ilimitados" : `${quedan} de ${total}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${ETIQUETA[abono.tipo]}: ${abono.nombre}, ${TEXTO_ESTADO[estado]}. Válido hasta ${aFecha(abono.fin)}. Viajes: ${viajes}. Ver QR`}
      onPress={() => onAbrir(abono)}
      style={({ pressed }) => [styles.tarjeta, inactivo && { opacity: 0.65 }, pressed && { opacity: 0.85 }]}
    >
      <LinearGradient
        colors={inactivo ? (["#6b6b6b", "#4a4a4a"] as const) : DEGRADADO[abono.tipo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fondo}
      >
        <View style={styles.cabeza}>
          <Text style={styles.marca}>Renfe</Text>
          <Text style={styles.tipo}>{ETIQUETA[abono.tipo]}</Text>
        </View>
        <Text style={styles.nombre}>{abono.nombre}</Text>
        {abono.origen && abono.destino ? (
          <Text style={styles.ruta}>
            {abono.origen.nombre} ↔ {abono.destino.nombre}
          </Text>
        ) : null}
        <View style={styles.pie}>
          <View style={styles.datos}>
            <View>
              <Text style={styles.etiqueta}>Válido hasta</Text>
              <Text style={styles.valor}>{aFecha(abono.fin)}</Text>
            </View>
            <View>
              <Text style={styles.etiqueta}>Viajes</Text>
              <Text style={styles.valor}>{viajes}</Text>
            </View>
            {estado !== "vigente" ? (
              <View>
                <Text style={styles.etiqueta}>Estado</Text>
                <Text style={styles.valor}>{TEXTO_ESTADO[estado]}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.qr} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <QRCode value={abono.qr} size={58} color={colores.texto} backgroundColor="#fff" />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: { borderRadius: radios.grande + 4, overflow: "hidden", ...sombras[2] },
  fondo: { padding: 16, gap: 6, minHeight: 170 },
  cabeza: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  marca: { fontFamily: fuentes.negrita, fontSize: 13, color: "#fff", letterSpacing: 0.5 },
  tipo: {
    fontFamily: fuentes.negrita,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.85)",
  },
  nombre: { fontFamily: fuentes.negrita, fontSize: 19, color: "#fff", marginTop: 6 },
  ruta: { fontFamily: fuentes.medio, fontSize: 13, color: "rgba(255,255,255,0.9)" },
  pie: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto", gap: 12 },
  datos: { flexDirection: "row", flexWrap: "wrap", gap: 16, flex: 1 },
  etiqueta: {
    fontFamily: fuentes.medio,
    fontSize: 9.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.75)",
  },
  valor: { fontFamily: fuentes.negrita, fontSize: 13.5, color: "#fff" },
  qr: { backgroundColor: "#fff", padding: 4, borderRadius: 8 },
});
