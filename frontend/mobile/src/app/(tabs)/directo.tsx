import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { posicionesTrenes } from "@renfe/shared/api/cliente";
import type { PosicionTren } from "@renfe/shared/api/tipos";
import { MapaTrenes } from "@/components/MapaTrenes";
import { cristal, espaciado, estilos, radios } from "@/tema";

const REFRESCO_MS = 5000;

export default function Directo() {
  const [trenes, setTrenes] = useState<PosicionTren[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let vivo = true;
    const cargar = () =>
      posicionesTrenes().then(
        (l) => {
          if (!vivo) return;
          setTrenes(l);
          setError("");
        },
        (e: Error) => vivo && setError(e.message),
      );
    cargar();
    const id = setInterval(cargar, REFRESCO_MS);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, []);

  return (
    <View style={estilos.pantalla}>
      <MapaTrenes trenes={trenes} />
      <View
        style={{
          position: "absolute",
          top: espaciado[3],
          left: espaciado[3],
          right: espaciado[3],
          padding: espaciado[3],
          borderRadius: radios.normal,
          backgroundColor: cristal.fondo[2],
          ...cristal.sombras[1],
        }}
      >
        <Text style={error ? estilos.error : estilos.suave}>{error || `${trenes.length} trenes en circulación · se actualiza cada 5 s`}</Text>
      </View>
    </View>
  );
}
