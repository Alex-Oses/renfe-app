import { Image, Pressable, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { ciudadDe, type Billete } from "@renfe/shared/api/tipos";
import { fotoDeRuta, urlFoto } from "@renfe/shared/contenido/imagenes";
import { fecha, hora } from "@/formato";
import { colores, espaciado, estilos, fuentes, paleta, radios, sombras, tipografia } from "@/tema";

// Slug de la ciudad para su foto ("A Coruña" -> "a-coruna"), igual que MisBilletes de la web.
const slug = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const t = tipografia.tamanos;

// Billete como el .ticket de frontend/web/src/paginas/billetes.css: foto, datos y talón morado.
export function TarjetaBillete({ billete, onPress }: { billete: Billete; onPress: () => void }) {
  const { tren, localizador, qr, pasajero, asiento } = billete;
  const destino = ciudadDe(tren.destino);
  const foto = fotoDeRuta(slug(destino));
  const dato = (etiqueta: string, valor: string) => (
    <View style={{ minWidth: "45%" }}>
      <Text style={[estilos.suave, { fontSize: t.xs }]}>{etiqueta}</Text>
      <Text style={{ fontFamily: fuentes.seminegrita, fontSize: t.base, color: colores.texto }}>{valor}</Text>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Billete ${ciudadDe(tren.origen)} a ${destino}, localizador ${localizador}. Abrir QR`}
      onPress={onPress}
      style={({ pressed }) => [
        { borderRadius: radios.grande, overflow: "hidden", backgroundColor: colores.superficie, ...sombras[2] },
        pressed && { opacity: 0.9 },
      ]}
    >
      {foto ? (
        <Image source={{ uri: urlFoto(foto.archivo, 640) }} style={{ height: 120 }} accessibilityIgnoresInvertColors />
      ) : (
        <View style={{ height: 120, backgroundColor: colores.marca }} />
      )}
      <View style={{ padding: espaciado[4], gap: espaciado[2] }}>
        <Text style={[estilos.suave, { fontSize: t.xs, textTransform: "uppercase" }]}>Tu próximo tren</Text>
        <Text style={[estilos.subtitulo, { fontSize: t.xxl }]}>
          {ciudadDe(tren.origen)} → {destino}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: espaciado[2] }}>
          {dato("Fecha", fecha(tren.salida))}
          {dato("Salida", hora(tren.salida))}
          {dato("Llegada", hora(tren.llegada))}
          {dato("Tren", `${tren.tipo} ${tren.numero}`)}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: espaciado[3] }}>
          <QRCode value={qr} size={64} color={colores.texto} backgroundColor={colores.superficie} />
          <View style={{ flex: 1 }}>
            <Text style={estilos.texto}>
              {pasajero.nombre} {pasajero.apellidos}
            </Text>
            <Text style={estilos.suave}>
              Coche {asiento.coche} · {asiento.fila}
              {asiento.letra}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ backgroundColor: colores.marca, padding: espaciado[4], flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: fuentes.medio, fontSize: t.xs, color: paleta.blanco, textTransform: "uppercase" }}>Localizador</Text>
        <Text style={{ fontFamily: fuentes.negrita, fontSize: t.xl, color: paleta.blanco, letterSpacing: 3 }}>{localizador}</Text>
      </View>
    </Pressable>
  );
}
