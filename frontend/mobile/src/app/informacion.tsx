// Índice de las secciones informativas: el menú principal de la web con sus grupos.
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { menuPrincipal } from "@renfe/shared/contenido/navegacion";
import { colores, espaciado, estilos } from "@/tema";
import { Cristal } from "@/components/Cristal";
import { Icono } from "@/components/Icono";
import { Pantalla } from "@/components/Pantalla";

const SECCIONES = [...menuPrincipal, { titulo: "Ayuda", ruta: "/ayuda", grupos: [] }];
const ir = (ruta: string) => router.push(`/contenido${ruta}` as never);

function Fila({ texto, ruta, fuerte }: { texto: string; ruta: string; fuerte?: boolean }) {
  return (
    <Pressable accessibilityRole="link" onPress={() => ir(ruta)} style={({ pressed }) => [styles.fila, pressed && { opacity: 0.7 }]}>
      <Text style={[fuerte ? estilos.subtitulo : estilos.textoMedio, { flex: 1 }]}>{texto}</Text>
      <Icono nombre="delante" tamano={18} color={colores.textoSuave} />
    </Pressable>
  );
}

export default function Informacion() {
  return (
    <Pantalla volver={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
      <Text style={estilos.h1}>Información y ayuda</Text>
      {SECCIONES.map((m) => (
        <Cristal key={m.ruta} gap={espaciado[1]}>
          <Fila texto={m.titulo} ruta={m.ruta} fuerte />
          {m.grupos
            .filter((g) => g.ruta !== m.ruta)
            .map((g) => (
              <View key={g.ruta} style={styles.grupo}>
                <Fila texto={g.titulo} ruta={g.ruta} />
              </View>
            ))}
        </Cristal>
      ))}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", minHeight: 44, gap: 8 },
  grupo: { borderTopWidth: 1, borderTopColor: colores.borde, paddingLeft: espaciado[2] },
});
