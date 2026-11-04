// Pie de la app con el mapa del sitio, los enlaces legales y el aviso de demostración.
// Misma arquitectura de información que el Pie.tsx de la web.
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usaDatosSimulados } from "@renfe/shared/api/cliente";
import { enlacesAyuda, enlacesLegal, menuPrincipal } from "@renfe/shared/contenido/navegacion";
import { colores, espaciado, estilos, fuentes, tonos } from "@/tema";
import { Icono, type NombreIcono } from "./Icono";

const ir = (ruta: string) => router.push(`/contenido${ruta}` as never);

// Canales simulados: enlazan a contacto hasta tener cuentas reales, como en la web.
const REDES: { nombre: string; icono: NombreIcono }[] = [
  { nombre: "Vídeos", icono: "comprar" },
  { nombre: "Fotos", icono: "estrella" },
  { nombre: "Mensajes", icono: "campana" },
  { nombre: "Noticias", icono: "info" },
];

export function Pie() {
  return (
    <View style={styles.pie}>
      <Text style={estilos.subtitulo}>Mapa del sitio</Text>
      <View style={styles.columnas}>
        {menuPrincipal.map((m) => (
          <Pressable key={m.ruta} accessibilityRole="link" onPress={() => ir(m.ruta)} style={({ pressed }) => [styles.enlace, pressed && { opacity: 0.6 }]}>
            <Text style={styles.enlaceTexto}>{m.titulo}</Text>
          </Pressable>
        ))}
        <Pressable accessibilityRole="link" onPress={() => ir("/ayuda")} style={({ pressed }) => [styles.enlace, pressed && { opacity: 0.6 }]}>
          <Text style={styles.enlaceTexto}>Ayuda</Text>
        </Pressable>
      </View>

      <View style={styles.columnas}>
        {enlacesLegal.map((e) => (
          <Pressable key={e.ruta} accessibilityRole="link" onPress={() => ir(e.ruta)} style={({ pressed }) => [styles.enlace, pressed && { opacity: 0.6 }]}>
            <Text style={styles.legal}>{e.texto}</Text>
          </Pressable>
        ))}
        {enlacesAyuda.slice(0, 3).map((e) => (
          <Pressable key={e.ruta} accessibilityRole="link" onPress={() => ir(e.ruta)} style={({ pressed }) => [styles.enlace, pressed && { opacity: 0.6 }]}>
            <Text style={styles.legal}>{e.texto}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.redes}>
        {REDES.map((r) => (
          <Pressable
            key={r.nombre}
            accessibilityRole="link"
            accessibilityLabel={`${r.nombre} (canal simulado)`}
            onPress={() => ir("/ayuda/contacto")}
            style={({ pressed }) => [styles.red, pressed && { backgroundColor: tonos.rosaFuerte }]}
          >
            <Icono nombre={r.icono} tamano={18} color={colores.marca} />
          </Pressable>
        ))}
      </View>

      <Text style={styles.aviso}>
        Andén 0, sin relación con Renfe. Horarios basados en datos abiertos GTFS de Renfe (CC BY 4.0).
        {usaDatosSimulados ? " Ahora mismo los trenes, precios, pagos y posiciones son simulados." : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pie: {
    marginHorizontal: 12,
    marginTop: espaciado[8],
    padding: espaciado[4],
    gap: espaciado[3],
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  columnas: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  enlace: { width: "48.4%", minHeight: 36, justifyContent: "center" },
  enlaceTexto: { fontFamily: fuentes.seminegrita, fontSize: 13.6, color: colores.marca },
  legal: { fontFamily: fuentes.normal, fontSize: 12.4, color: colores.textoSuave },
  redes: { flexDirection: "row", gap: espaciado[2] },
  red: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(129,0,94,0.14)",
  },
  aviso: { fontFamily: fuentes.normal, fontSize: 11.6, lineHeight: 16.5, color: colores.textoSuave },
});
