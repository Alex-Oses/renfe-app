import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { obtenerAbono } from "@renfe/shared/api/cliente";
import { estadoAbono } from "@renfe/shared/api/simulado-abonos";
import type { Abono } from "@renfe/shared/api/tipos";
import { Aviso } from "@/components/Aviso";
import { Cristal } from "@/components/Cristal";
import { Pantalla } from "@/components/Pantalla";
import { colores, espaciado, estilos, fuentes } from "@/tema";
import { TEXTO_ESTADO, aFecha } from "@/formato";

// Detalle de un abono con su QR firmado (GET /abonos/:id lo trae; la lista puede venir sin él).
export default function VerAbono() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [abono, setAbono] = useState<Abono | null>(null);
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();

  useEffect(() => {
    let vivo = true;
    obtenerAbono(id).then(
      (a) => vivo && setAbono(a),
      (e: Error) => vivo && setError(e.message),
    );
    return () => {
      vivo = false;
    };
  }, [id]);

  return (
    <Pantalla volver={() => router.back()}>
      {error ? <Aviso texto={error} /> : null}
      {!abono && !error ? <ActivityIndicator color={colores.marca} size="large" /> : null}
      {abono ? (
        <>
          <View style={{ gap: espaciado[2] }}>
            <Text style={estilos.h1}>{abono.nombre}</Text>
            {abono.origen ? <Text style={estilos.suave}>{abono.origen.nombre} – {abono.destino?.nombre}</Text> : null}
          </View>
          <Cristal gap={espaciado[3]}>
            <View style={styles.qr} accessible accessibilityRole="image" accessibilityLabel={`Código QR de ${abono.nombre}`}>
              {abono.qr ? <QRCode value={abono.qr} size={Math.min(width - 118, 240)} ecl="M" /> : <Text style={estilos.suave}>Este abono no tiene QR.</Text>}
            </View>
            <Text style={styles.dato}>Estado: {TEXTO_ESTADO[estadoAbono(abono)]}</Text>
            <Text style={styles.dato}>Válido del {aFecha(abono.inicio)} al {aFecha(abono.fin)}</Text>
            <Text style={styles.dato}>
              {abono.viajesRestantes === null ? "Viajes ilimitados" : `Te quedan ${abono.viajesRestantes} de ${abono.viajesTotales} viajes`}
            </Text>
          </Cristal>
        </>
      ) : null}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  qr: { alignItems: "center", padding: espaciado[3], backgroundColor: "#fff", borderRadius: 16 },
  dato: { fontFamily: fuentes.normal, fontSize: 14, color: colores.texto },
});
