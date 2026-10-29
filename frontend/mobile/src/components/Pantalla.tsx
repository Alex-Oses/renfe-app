import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { estilos } from "@/tema";
import { Cabecera } from "./Cabecera";
import { Fondo } from "./Fondo";

// Envoltorio común: fondo, cabecera fija y contenido desplazable. La barra inferior de pestañas
// flota encima, así que el contenido deja 128 px abajo para no quedar tapado.
export function Pantalla({
  children,
  scroll = true,
  volver,
  sinAviso,
  contenido,
  estilo,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  volver?: () => void;
  sinAviso?: boolean;
  contenido?: StyleProp<ViewStyle>;
  estilo?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[estilos.pantalla, estilo]}>
      <Fondo />
      <Cabecera volver={volver} sinAviso={sinAviso} />
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.contenido, contenido]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, contenido]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenido: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 132, gap: 12 },
});
