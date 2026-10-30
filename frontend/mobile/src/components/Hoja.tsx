import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colores, espaciado, fuentes, paleta, radios, tipografia, tonos } from "@/tema";
import { Icono } from "./Icono";

// Hoja inferior para elegir estaciones, fechas, viajeros o descuentos. En la web el buscador
// despliega una lista; en el móvil una hoja se maneja mejor con el pulgar.
export function Hoja({
  visible,
  onCerrar,
  titulo,
  children,
  maximo = 0.82,
}: {
  visible: boolean;
  onCerrar: () => void;
  titulo: string;
  children: React.ReactNode;
  maximo?: number;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.raiz}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.velo} accessibilityLabel="Cerrar" onPress={onCerrar} />
        <View
          style={[
            styles.hoja,
            { maxHeight: `${Math.round(maximo * 100)}%`, paddingBottom: Math.max(insets.bottom, espaciado[3]) },
          ]}
        >
          <View style={styles.asa} />
          <View style={styles.cabecera}>
            <Text style={styles.titulo} accessibilityRole="header">
              {titulo}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              onPress={onCerrar}
              hitSlop={12}
              style={({ pressed }) => [styles.cerrar, pressed && { backgroundColor: tonos.rosaFuerte }]}
            >
              <Icono nombre="cerrar" tamano={20} color={colores.marca} />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: espaciado[4] }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, justifyContent: "flex-end" },
  velo: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: tonos.velo },
  hoja: {
    backgroundColor: paleta.niebla,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: espaciado[4],
    paddingTop: espaciado[2],
    overflow: "hidden",
  },
  asa: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(129,0,94,0.22)",
    marginBottom: espaciado[3],
  },
  cabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: espaciado[3] },
  titulo: {
    fontFamily: fuentes.negrita,
    fontSize: tipografia.tamanos.xxl,
    color: colores.titulo,
    flex: 1,
    paddingRight: espaciado[3],
  },
  cerrar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
});
