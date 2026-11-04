import { Pressable, StyleSheet, Text, View } from "react-native";
import { colores, fuentes, tonos } from "@/tema";

export const PASOS = ["Asientos", "Viajeros", "Pago", "Listo"] as const;

// Indicador de pasos como el de la web (Reserva.tsx): ✓ en los hechos y se puede volver a ellos.
export function PasosCompra({ indice, onIr }: { indice: number; onIr?: (i: number) => void }) {
  return (
    <View style={styles.fila} accessibilityRole="list" accessibilityLabel="Pasos de la reserva">
      {PASOS.map((p, i) => {
        const hecho = i < indice;
        const actual = i === indice;
        const volver = hecho && indice < 3 && onIr;
        return (
          <Pressable
            key={p}
            disabled={!volver}
            onPress={() => volver && onIr(i)}
            accessibilityRole={volver ? "button" : "text"}
            accessibilityLabel={`Paso ${i + 1} de ${PASOS.length}, ${p}${hecho ? ", hecho" : actual ? ", actual" : ""}`}
            accessibilityHint={volver ? "Vuelve a este paso" : undefined}
            accessibilityState={{
              selected: actual,
              disabled: !volver && !actual,
            }}
            hitSlop={6}
            style={styles.paso}
          >
            <View style={[styles.num, hecho && styles.numHecho, actual && styles.numActual]}>
              <Text style={[styles.numTexto, (hecho || actual) && { color: "#fff" }]}>{hecho ? "✓" : i + 1}</Text>
            </View>
            <Text style={[styles.nombre, actual && styles.nombreActual]} numberOfLines={1}>
              {p}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  paso: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    minHeight: 44,
    justifyContent: "center",
  },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(129,0,94,0.3)",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  numHecho: { backgroundColor: tonos.exito, borderColor: tonos.exito },
  numActual: { backgroundColor: colores.marca, borderColor: colores.marca },
  numTexto: { fontFamily: fuentes.negrita, fontSize: 13, color: colores.marca },
  nombre: {
    fontFamily: fuentes.medio,
    fontSize: 12,
    color: colores.textoSuave,
  },
  nombreActual: { fontFamily: fuentes.negrita, color: colores.marca },
});
