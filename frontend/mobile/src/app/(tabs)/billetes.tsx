import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { misBilletes } from "@renfe/shared/api/cliente";
import type { Billete } from "@renfe/shared/api/tipos";
import { Boton } from "@/components/Boton";
import { TarjetaBillete } from "@/components/TarjetaBillete";
import { espaciado, estilos } from "@/tema";

export default function Billetes() {
  const [billetes, setBilletes] = useState<Billete[] | null>(null);
  const [error, setError] = useState("");
  // Se recarga al volver a la pestaña (p. ej. después de comprar).
  useFocusEffect(
    useCallback(() => {
      misBilletes().then(setBilletes, (e: Error) => setError(e.message));
    }, []),
  );

  const ahora = new Date().toISOString().slice(0, 19);
  const proximos = (billetes ?? []).filter((b) => b.tren.llegada >= ahora);

  return (
    <FlatList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      data={proximos}
      keyExtractor={(b) => b.id}
      ItemSeparatorComponent={() => <View style={{ height: espaciado[4] }} />}
      ListHeaderComponent={
        <Text style={error ? estilos.error : estilos.suave}>{error || (billetes ? "Toca un billete para ver el QR grande." : "Cargando tus billetes…")}</Text>
      }
      ListEmptyComponent={
        billetes ? (
          <View style={[estilos.tarjeta, { alignItems: "center" }]}>
            <Text style={estilos.texto}>Todavía no tienes billetes. Cuando compres uno aparecerá aquí.</Text>
            <Boton texto="Buscar un tren" onPress={() => router.navigate("/")} />
          </View>
        ) : undefined
      }
      renderItem={({ item }) => (
        <TarjetaBillete billete={item} onPress={() => router.push({ pathname: "/billete/[id]", params: { id: item.id } })} />
      )}
    />
  );
}
