import { StyleSheet, Text, View } from "react-native";
import { useSyncExternalStore } from "react";
import { alCambiarRespaldo, usaApiRespaldo } from "@renfe/shared/api/cliente";
import { fuentes } from "@/tema";

export function AvisoRespaldo() {
  const enRespaldo = useSyncExternalStore(alCambiarRespaldo, usaApiRespaldo);
  if (!enRespaldo) return null;
  return (
    <View style={estilos.aviso} pointerEvents="none" accessibilityRole="alert">
      <Text style={estilos.texto}>Conectado a Render (respaldo): el Docker no responde.</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  aviso: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, paddingTop: 44, paddingBottom: 8, paddingHorizontal: 12, backgroundColor: "#fde68a" },
  texto: { color: "#451a03", fontFamily: fuentes.seminegrita, textAlign: "center" },
});
