import { useEffect, useState } from "react";
import { AppState, StyleSheet, Text } from "react-native";
import { posicionesTrenes } from "@renfe/shared/api/cliente";
import { emparejarTren, seguirRetraso, textoRetraso } from "@renfe/shared/api/retraso-billete";
import type { PosicionTren, Tren } from "@renfe/shared/api/tipos";
import { fuentes } from "@/tema";

const CADA_MS = 30_000;

// «Puntual» o «+N min» del tren del billete, en directo (como RetrasoVivo.tsx de la web). Sin coincidencia no pinta nada.
export function RetrasoVivo({ tren }: { tren: Pick<Tren, "numero" | "salida" | "llegada"> }) {
  const [pos, setPos] = useState<PosicionTren | null>(null);
  const activo = seguirRetraso(tren);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    let reloj: ReturnType<typeof setInterval> | undefined;
    const pedir = () =>
      posicionesTrenes().then(
        (p) => vivo && setPos(emparejarTren(tren, p)),
        () => {},
      );
    // Solo se consulta con la app en primer plano; al volver se actualiza en el momento.
    const sincronizar = (estado: string | null | undefined) => {
      clearInterval(reloj);
      reloj = undefined;
      if (estado !== "active") return;
      void pedir();
      reloj = setInterval(pedir, CADA_MS);
    };
    sincronizar(AppState.currentState);
    const sub = AppState.addEventListener("change", sincronizar);
    return () => {
      vivo = false;
      clearInterval(reloj);
      sub.remove();
    };
  }, [activo, tren]);

  if (!activo || !pos) return null;
  return (
    <Text
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Estado del tren: ${textoRetraso(pos)}`}
      style={[styles.chip, pos.retrasoMin > 0 ? styles.tarde : styles.puntual]}
    >
      {textoRetraso(pos)}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontFamily: fuentes.negrita,
    fontSize: 11,
    color: "#fff",
  },
  puntual: { backgroundColor: "rgba(26,127,55,0.92)" },
  tarde: { backgroundColor: "rgba(192,57,43,0.95)" },
});
