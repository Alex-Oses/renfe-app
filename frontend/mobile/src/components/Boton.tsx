import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, Text, View, type ViewStyle, type StyleProp } from "react-native";
import { colores, espaciado, estilos, fuentes, gradientes, paleta, radios, sombras } from "@/tema";
import { Icono, type NombreIcono } from "./Icono";

type Variante = "primario" | "secundario" | "peligro" | "texto";

export function Boton({
  texto,
  onPress,
  cargando,
  variante = "primario",
  icono,
  estilo,
  desactivado,
  compacto,
}: {
  texto: string;
  onPress: () => void;
  cargando?: boolean;
  variante?: Variante;
  icono?: NombreIcono;
  estilo?: StyleProp<ViewStyle>;
  desactivado?: boolean;
  compacto?: boolean;
}) {
  const apagado = desactivado || cargando;
  const colorTexto =
    variante === "primario" || variante === "peligro"
      ? paleta.blanco
      : variante === "texto"
        ? colores.marca
        : colores.marca;
  const contenido = cargando ? (
    <ActivityIndicator color={colorTexto} />
  ) : (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: espaciado[2] }}>
      {icono ? <Icono nombre={icono} tamano={compacto ? 18 : 20} color={colorTexto} /> : null}
      <Text
        style={[
          variante === "primario" || variante === "peligro" ? estilos.botonTexto : estilos.botonTextoSecundario,
          compacto && { fontSize: 14.4 },
          variante === "peligro" && { color: paleta.blanco },
        ]}
      >
        {texto}
      </Text>
    </View>
  );

  if (variante === "primario" || variante === "peligro") {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={apagado}
        onPress={onPress}
        style={({ pressed }) => [
          {
            borderRadius: radios.pildora,
            minHeight: compacto ? 42 : 52,
            paddingHorizontal: compacto ? espaciado[3] : espaciado[6],
            alignItems: "center",
            justifyContent: "center",
            opacity: apagado ? 0.55 : 1,
            transform: [{ scale: pressed && !apagado ? 0.98 : 1 }],
          },
          estilo,
        ]}
      >
        <LinearGradient
          colors={variante === "peligro" ? (["#b3123f", "#8f0b31"] as const) : gradientes.accion}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: radios.pildora,
              ...sombras[2],
            },
          ]}
        />
        {contenido}
      </Pressable>
    );
  }

  if (variante === "texto") {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={apagado}
        onPress={onPress}
        style={({ pressed }) => [{ paddingVertical: espaciado[2], opacity: pressed ? 0.6 : 1 }, estilo]}
      >
        <Text style={{ fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.marca }}>{texto}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={apagado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.botonSecundario,
        { minHeight: compacto ? 42 : 50, opacity: pressed ? 0.72 : apagado ? 0.5 : 1 },
        estilo,
      ]}
    >
      {contenido}
    </Pressable>
  );
}
