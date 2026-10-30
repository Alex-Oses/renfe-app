import { forwardRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { colores, espaciado, fuentes, tipografia, tonos } from "@/tema";
import { Icono, type NombreIcono } from "./Icono";

// Campo con etiqueta encima, como los .campo de la web (label + input).
export const Campo = forwardRef<TextInputInstance, { etiqueta: string; error?: string; contenedor?: ViewStyle } & TextInputProps>(
  function Campo({ etiqueta, error, contenedor, style, ...props }, ref) {
    return (
      <View style={[{ gap: espaciado[2] }, contenedor]}>
        <Text style={styles.etiqueta}>{etiqueta}</Text>
        <TextInput
          ref={ref}
          placeholderTextColor="#8a8a8a"
          {...props}
          style={[styles.input, error ? { borderColor: colores.error, borderWidth: 1.5 } : null, style]}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  },
);

// Campo que abre una hoja (fecha, viajeros, descuento). Se ve igual que un input pero es un botón.
export function CampoBoton({
  etiqueta,
  valor,
  placeholder,
  onPress,
  icono = "chevron",
  alineado,
}: {
  etiqueta: string;
  valor?: string;
  placeholder: string;
  onPress: () => void;
  icono?: NombreIcono;
  alineado?: "izquierda" | "derecha";
}) {
  const vacio = !valor;
  return (
    <View style={{ gap: espaciado[2] }}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${etiqueta}: ${valor || placeholder}`}
        onPress={onPress}
        style={({ pressed }) => [styles.input, styles.fila, pressed && { backgroundColor: tonos.rosa }]}
      >
        <Text style={[styles.valor, vacio && styles.placeholder, { flex: 1, textAlign: alineado === "derecha" ? "right" : "left" }]} numberOfLines={1}>
          {valor || placeholder}
        </Text>
        <Icono nombre={icono} tamano={20} color={colores.textoSuave} />
      </Pressable>
    </View>
  );
}

// Campo de contraseña con el ojo para enseñarla, igual que en Acceder de la web.
export function CampoClave(props: { etiqueta: string; valor: string; alCambiar: (v: string) => void; error?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: espaciado[2] }}>
      <Text style={styles.etiqueta}>{props.etiqueta}</Text>
      <View style={{ position: "relative", justifyContent: "center" }}>
        <TextInput
          value={props.valor}
          onChangeText={props.alCambiar}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoComplete="password"
          placeholderTextColor="#8a8a8a"
          style={[styles.input, { paddingRight: 52 }, props.error ? { borderColor: colores.error, borderWidth: 1.5 } : null]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onPress={() => setVisible((v) => !v)}
          hitSlop={10}
          style={{ position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" }}
        >
          <Icono nombre={visible ? "ojoCerrado" : "ojo"} tamano={21} color={colores.textoSuave} />
        </Pressable>
      </View>
      {props.error ? <Text style={styles.error}>{props.error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  etiqueta: { fontFamily: fuentes.medio, fontSize: tipografia.tamanos.sm, color: colores.textoSuave },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: espaciado[4],
    paddingVertical: 12,
    color: colores.texto,
    fontFamily: fuentes.normal,
    fontSize: tipografia.tamanos.base,
  },
  fila: { flexDirection: "row", alignItems: "center", gap: espaciado[2] },
  valor: { fontFamily: fuentes.normal, fontSize: tipografia.tamanos.base, color: colores.texto },
  placeholder: { color: "#8a8a8a" },
  error: { fontFamily: fuentes.medio, fontSize: 12.8, color: colores.error },
});
