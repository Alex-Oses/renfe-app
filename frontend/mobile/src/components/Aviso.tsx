import { StyleSheet, Text, View } from "react-native";
import { colores, espaciado, fuentes, tonos } from "@/tema";
import { Icono, type NombreIcono } from "./Icono";

export function Aviso({
  texto,
  tipo = "error",
  icono,
}: {
  texto: string;
  tipo?: "error" | "info" | "ok" | "aviso";
  icono?: NombreIcono;
}) {
  const aspecto = {
    error: { fondo: tonos.errorFondo, borde: "#f3b9c9", color: colores.error, icono: "aviso" as NombreIcono },
    aviso: { fondo: tonos.avisoFondo, borde: "#f0d49b", color: tonos.aviso, icono: "aviso" as NombreIcono },
    ok: { fondo: tonos.exitoFondo, borde: "#b9e3c9", color: tonos.exito, icono: "check" as NombreIcono },
    info: { fondo: tonos.moradoSuave, borde: "#e4bfd7", color: colores.marca, icono: "info" as NombreIcono },
  }[tipo];

  return (
    <View style={[styles.caja, { backgroundColor: aspecto.fondo, borderColor: aspecto.borde }]}>
      <Icono nombre={icono ?? aspecto.icono} tamano={20} color={aspecto.color} />
      <Text style={[styles.texto, { color: aspecto.color }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espaciado[2],
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: espaciado[3],
    paddingVertical: espaciado[3],
  },
  texto: { flex: 1, fontFamily: fuentes.medio, fontSize: 13.6, lineHeight: 19 },
});
