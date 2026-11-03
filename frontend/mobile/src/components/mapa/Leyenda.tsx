import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TipoTren } from "@renfe/shared/api/tipos";
import { colorTipo, colores, fuentes } from "@/tema";
import { Cristal } from "../Cristal";
import { TrenMarcador } from "../Icono";
import { SimboloEstacion } from "./SimboloEstacion";

const TIPOS = Object.keys(colorTipo) as TipoTren[];

// Leyenda desplegable del mapa, como la <details> de Mapa.tsx en la web.
export function Leyenda() {
  const [abierta, setAbierta] = useState(false);
  return (
    <Cristal intensidad={55} padding={0} gap={0} style={styles.caja}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: abierta }}
        onPress={() => setAbierta((a) => !a)}
        style={styles.titulo}
        hitSlop={6}
      >
        <Text style={styles.tituloTexto}>Leyenda {abierta ? "▴" : "▾"}</Text>
      </Pressable>
      {abierta ? (
        <View style={styles.lista}>
          {TIPOS.map((t) => (
            <View key={t} style={styles.fila}>
              <TrenMarcador tipo={t} tamano={18} />
              <View style={[styles.linea, { backgroundColor: colorTipo[t] }]} />
              <Text style={styles.texto}>{t}</Text>
            </View>
          ))}
          <View style={styles.fila}>
            <SimboloEstacion />
            <Text style={styles.texto}>Estación principal</Text>
          </View>
        </View>
      ) : null}
    </Cristal>
  );
}

const styles = StyleSheet.create({
  caja: { borderRadius: 14, overflow: "hidden" },
  titulo: { paddingHorizontal: 12, paddingVertical: 7 },
  tituloTexto: { fontFamily: fuentes.seminegrita, fontSize: 12.5, color: colores.texto },
  lista: { paddingHorizontal: 12, paddingBottom: 9, gap: 5 },
  fila: { flexDirection: "row", alignItems: "center", gap: 7 },
  linea: { width: 16, height: 4, borderRadius: 2 },
  texto: { fontFamily: fuentes.medio, fontSize: 11.5, color: colores.texto },
});
