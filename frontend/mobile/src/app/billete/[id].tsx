import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { obtenerBillete } from "@renfe/shared/api/cliente";
import { ciudadDe, type Billete } from "@renfe/shared/api/tipos";
import { fecha, hora } from "@/formato";
import { colores, espaciado, estilos, fuentes, tipografia } from "@/tema";

// QR grande para enseñarlo en el andén.
export default function VerBillete() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [billete, setBillete] = useState<Billete | null>(null);
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();
  useEffect(() => {
    obtenerBillete(id).then(setBillete, (e: Error) => setError(e.message));
  }, [id]);

  if (!billete) return <Text style={[estilos.contenido, error ? estilos.error : estilos.suave]}>{error || "Cargando…"}</Text>;
  const { tren, asiento, pasajero } = billete;
  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={[estilos.contenido, { alignItems: "center" }]}>
      <Text style={estilos.titulo}>
        {ciudadDe(tren.origen)} → {ciudadDe(tren.destino)}
      </Text>
      <Text style={estilos.suave}>
        {fecha(tren.salida)} · {hora(tren.salida)} · {tren.tipo} {tren.numero}
      </Text>
      <View style={[estilos.tarjeta, { padding: espaciado[6] }]}>
        <QRCode value={billete.qr} size={Math.min(width - 96, 320)} color={colores.texto} backgroundColor={colores.superficie} />
      </View>
      <Text style={{ fontFamily: fuentes.negrita, fontSize: tipografia.tamanos.xxl, color: colores.marca, letterSpacing: 4 }}>
        {billete.localizador}
      </Text>
      <Text style={estilos.texto}>
        {pasajero.nombre} {pasajero.apellidos} · Coche {asiento.coche} · {asiento.fila}
        {asiento.letra} · {asiento.clase}
      </Text>
    </ScrollView>
  );
}
