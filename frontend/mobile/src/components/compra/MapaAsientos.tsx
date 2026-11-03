import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Asiento } from "@renfe/shared/api/tipos";
import { euros } from "@renfe/shared/formato/formato";
import { Icono } from "@/components/Icono";
import { colores, espaciado, estilos, fuentes, tonos } from "@/tema";

interface Props {
  asientos: Asiento[];
  n: number;
  elegidos: string[];
  onCambio: (ids: string[]) => void;
}

// Mapa de asientos por coche, igual que PasoAsientos.tsx de la web: 2 + pasillo + 2.
export function MapaAsientos({ asientos, n, elegidos, onCambio }: Props) {
  const coches = [...new Set(asientos.map((a) => a.coche))];
  const [coche, setCoche] = useState(() => (elegidos[0] ? Number(elegidos[0].split("-")[0]) : coches[coches.length - 1]));
  const [aviso, setAviso] = useState("");
  const delCoche = asientos.filter((a) => a.coche === coche);
  const filas = [...new Set(delCoche.map((a) => a.fila))];
  const clase = delCoche[0]?.clase;
  const precio = delCoche[0]?.precio ?? 0;

  const alternar = (a: Asiento) => {
    if (!a.libre) return;
    if (elegidos.includes(a.id)) {
      onCambio(elegidos.filter((x) => x !== a.id));
      setAviso("");
    } else if (elegidos.length >= n) {
      setAviso(`Ya tienes ${n} ${n === 1 ? "asiento" : "asientos"}. Quita uno para elegir otro.`);
    } else {
      onCambio([...elegidos, a.id]);
      setAviso("");
    }
  };

  return (
    <View style={{ gap: espaciado[3] }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: espaciado[2], paddingRight: 4 }}
        accessibilityRole="tablist"
        accessibilityLabel="Coches"
      >
        {coches.map((c) => {
          const a = asientos.find((x) => x.coche === c)!;
          const mios = elegidos.filter((x) => x.startsWith(`${c}-`)).length;
          const activo = c === coche;
          return (
            <Pressable
              key={c}
              accessibilityRole="tab"
              accessibilityState={{ selected: activo }}
              accessibilityLabel={`Coche ${c}, ${a.clase}${mios ? `, ${mios} elegidos` : ""}`}
              onPress={() => setCoche(c)}
              style={({ pressed }) => [styles.tab, activo && styles.tabActiva, pressed && { opacity: 0.8 }]}
            >
              <Text style={[styles.tabTitulo, activo && { color: colores.marca }]}>Coche {c}</Text>
              <Text style={estilos.suave}>{a.clase}</Text>
              {mios > 0 ? (
                <View style={styles.marca}>
                  <Text style={styles.marcaTexto}>{mios}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.leyenda} accessibilityLabel="Leyenda: libre, elegido, ocupado">
        <View style={styles.leyendaItem} importantForAccessibility="no-hide-descendants">
          <View style={[styles.muestra, styles.libre]} />
          <Text style={estilos.suave}>Libre</Text>
        </View>
        <View style={styles.leyendaItem} importantForAccessibility="no-hide-descendants">
          <View style={[styles.muestra, styles.elegido]}>
            <Icono nombre="check" tamano={12} color="#fff" grosor={3} />
          </View>
          <Text style={estilos.suave}>Elegido</Text>
        </View>
        <View style={styles.leyendaItem} importantForAccessibility="no-hide-descendants">
          <View style={[styles.muestra, styles.ocupado]}>
            <Icono nombre="cerrar" tamano={10} color={colores.textoSuave} grosor={2.5} />
          </View>
          <Text style={estilos.suave}>Ocupado</Text>
        </View>
      </View>

      <View style={styles.coche}>
        <Text style={estilos.suaveMedio}>
          <Text style={styles.clase}>{clase}</Text> · {euros(precio)} por asiento
        </Text>
        <View style={styles.fila} importantForAccessibility="no-hide-descendants">
          {["A", "B", "", "C", "D"].map((l, i) => (
            <Text key={i} style={[styles.cabeza, !l && styles.pasillo]}>
              {l}
            </Text>
          ))}
        </View>
        {filas.map((f) => (
          <View key={f} style={styles.fila}>
            {delCoche
              .filter((a) => a.fila === f)
              .flatMap((a, i) => {
                const marcado = elegidos.includes(a.id);
                const boton = (
                  <Pressable
                    key={a.id}
                    onPress={() => alternar(a)}
                    disabled={!a.libre}
                    accessibilityRole="button"
                    accessibilityLabel={`Asiento ${f}${a.letra}, ${a.letra === "A" || a.letra === "D" ? "ventana" : "pasillo"}, ${a.libre ? euros(a.precio) : "ocupado"}`}
                    accessibilityState={{
                      selected: marcado,
                      disabled: !a.libre,
                    }}
                    style={({ pressed }) => [
                      styles.asiento,
                      styles.libre,
                      marcado && styles.elegido,
                      !a.libre && styles.ocupado,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    {marcado ? (
                      <Icono nombre="check" tamano={18} color="#fff" grosor={3} />
                    ) : a.libre ? (
                      <Text style={styles.asientoTexto}>{f}</Text>
                    ) : (
                      <Icono nombre="cerrar" tamano={13} color={colores.textoSuave} grosor={2.5} />
                    )}
                  </Pressable>
                );
                return i === 1
                  ? [
                      boton,
                      <Text key={`p${f}`} style={[styles.cabeza, styles.pasillo]} importantForAccessibility="no">
                        {f}
                      </Text>,
                    ]
                  : [boton];
              })}
          </View>
        ))}
      </View>

      <Text style={estilos.suaveMedio} accessibilityLiveRegion="polite">
        {aviso || `${elegidos.length} de ${n} ${n === 1 ? "asiento elegido" : "asientos elegidos"}.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    minWidth: 96,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colores.borde,
    backgroundColor: "rgba(255,255,255,0.76)",
    paddingHorizontal: espaciado[3],
    paddingVertical: espaciado[2],
  },
  tabActiva: { borderColor: colores.marca, backgroundColor: "#fff" },
  tabTitulo: {
    fontFamily: fuentes.negrita,
    fontSize: 14.5,
    color: colores.titulo,
  },
  marca: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colores.marca,
    alignItems: "center",
    justifyContent: "center",
  },
  marcaTexto: { fontFamily: fuentes.negrita, fontSize: 11, color: "#fff" },
  leyenda: { flexDirection: "row", gap: espaciado[4] },
  leyendaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  muestra: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  coche: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: espaciado[3],
    gap: 8,
    alignItems: "center",
  },
  clase: { fontFamily: fuentes.negrita, color: colores.marca },
  fila: { flexDirection: "row", gap: 8, alignItems: "center" },
  cabeza: {
    width: 44,
    textAlign: "center",
    fontFamily: fuentes.seminegrita,
    fontSize: 12,
    color: colores.textoSuave,
  },
  pasillo: { width: 26 },
  asiento: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  asientoTexto: {
    fontFamily: fuentes.seminegrita,
    fontSize: 12.5,
    color: colores.marca,
  },
  libre: { backgroundColor: "#fff", borderColor: "rgba(129,0,94,0.35)" },
  elegido: { backgroundColor: colores.marca, borderColor: colores.marca },
  ocupado: { backgroundColor: tonos.moradoSuave, borderColor: "transparent" },
});
