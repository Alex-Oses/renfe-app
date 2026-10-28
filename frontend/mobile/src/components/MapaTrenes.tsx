import MapView, { Marker } from "react-native-maps";
import type { PosicionTren } from "@renfe/shared/api/tipos";
import { colores } from "@/tema";

// Centro de la península; el usuario hace zoom donde quiera.
const ESPANA = { latitude: 40.2, longitude: -3.7, latitudeDelta: 9, longitudeDelta: 9 };

export function MapaTrenes({ trenes }: { trenes: PosicionTren[] }) {
  return (
    <MapView style={{ flex: 1 }} initialRegion={ESPANA}>
      {trenes.map((t) => (
        <Marker
          key={t.trenId}
          coordinate={{ latitude: t.lat, longitude: t.lon }}
          title={`${t.tipo} ${t.numero}`}
          description={`${t.origen} → ${t.destino}${t.retrasoMin > 0 ? ` · +${t.retrasoMin} min` : ""}`}
          pinColor={t.retrasoMin > 5 ? colores.accion : colores.marca}
          tracksViewChanges={false}
        />
      ))}
    </MapView>
  );
}
