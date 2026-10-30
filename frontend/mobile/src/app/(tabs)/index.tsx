import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { fotoDeRuta, urlFoto } from "@renfe/shared/contenido/imagenes";
import { colores, espaciado, estilos, fuentes, gradientes, paleta, radios, sombras, tipografia, tonos } from "@/tema";
import { Buscador, type Criterios } from "@/components/Buscador";
import { Cristal } from "@/components/Cristal";
import { Icono, type NombreIcono } from "@/components/Icono";
import { Pantalla } from "@/components/Pantalla";
import { TrenSvg } from "@/components/TrenSvg";

const manana = () => {
  const d = new Date(Date.now() + 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const AVISOS: { titulo: string; texto: string; icono: NombreIcono }[] = [
  { titulo: "Revisa tu tren", texto: "Retrasos y cambios de andén, en directo.", icono: "reloj" },
  { titulo: "Equipaje", texto: "Una maleta grande, una de mano y un bulto.", icono: "info" },
  { titulo: "Asistencia", texto: "Pide ayuda en la estación con antelación.", icono: "cara" },
];

const DESTINOS = [
  { de: "Madrid", a: "Barcelona", origen: "60000", destino: "71801", foto: "barcelona", duracion: "2 h 30", desde: 19 },
  { de: "Madrid", a: "Sevilla", origen: "60000", destino: "51003", foto: "sevilla", duracion: "2 h 35", desde: 19 },
  { de: "Madrid", a: "València", origen: "60000", destino: "65000", foto: "valencia", duracion: "1 h 50", desde: 19 },
  { de: "Barcelona", a: "Zaragoza", origen: "71801", destino: "04040", foto: "zaragoza", duracion: "1 h 25", desde: 19 },
];

const OFERTAS = [
  { dato: "Escapadas", titulo: "Tren y hotel", texto: "Paquetes de fin de semana con estación céntrica.", colores: ["#f7d9e7", "#fbeaf2"] as const },
  { dato: "8 % menos", titulo: "Grupos de 4 a 9", texto: "Comprad juntos en el mismo trayecto.", colores: ["#eadcf4", "#f6ecf8"] as const },
  { dato: "5 €", titulo: "Menores de 14", texto: "Precio fijo viajando con un adulto.", colores: ["#fde8d8", "#fff2e8"] as const },
];

export default function Comprar() {
  const buscar = (c: Criterios) => {
    router.push({
      pathname: "/resultados",
      params: {
        origen: c.origen.id,
        destino: c.destino.id,
        fecha: c.fecha,
        pasajeros: String(c.adultos + c.ninos),
        adultos: String(c.adultos),
        ninos: String(c.ninos),
        bebes: String(c.bebes),
        descuento: c.descuento,
        ...(c.vuelta ? { vuelta: c.vuelta } : {}),
      },
    });
  };

  return (
    <Pantalla contenido={{ paddingHorizontal: 0, paddingTop: 0, gap: 0 }}>
      <View style={styles.portada}>
        <LinearGradient colors={gradientes.heroe} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={styles.catenaria} pointerEvents="none" />
        <Text style={styles.lema}>Renfe</Text>
        <View style={styles.tren} pointerEvents="none">
          <TrenSvg ancho={760} />
        </View>
        <View style={styles.anden} pointerEvents="none">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={[styles.raya, { left: `${8 + i * 14}%` }]} />
          ))}
        </View>
        <View style={styles.sombraTren} pointerEvents="none" />
      </View>

      <Cristal style={{ marginHorizontal: 12, marginTop: -26 }} padding={espaciado[4]} gap={espaciado[3]}>
        <View style={{ gap: espaciado[1] }}>
          <Text style={estilos.h1}>Busca tu próximo viaje</Text>
          <Text style={[estilos.suave, { fontSize: 15, lineHeight: 21 }]}>
            Trenes de larga y media distancia. Eliges asiento y llevas el billete en el móvil.
          </Text>
        </View>
        <Buscador onBuscar={buscar} />
      </Cristal>

      <View style={styles.seccion}>
        <Text style={estilos.h2}>Antes de viajar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 12 }}>
          {AVISOS.map((a) => (
            <View key={a.titulo} style={styles.aviso}>
              <View style={styles.avisoIcono}>
                <Icono nombre={a.icono} tamano={21} color={colores.marca} />
              </View>
              <Text style={styles.avisoTitulo}>{a.titulo}</Text>
              <Text style={styles.avisoTexto}>{a.texto}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.seccion}>
        <Text style={estilos.h2}>Destinos destacados</Text>
        <Text style={estilos.suave}>Precios para viajar mañana, por persona y trayecto.</Text>
        <View style={styles.rejilla}>
          {DESTINOS.map((d) => {
            const foto = fotoDeRuta(d.foto);
            return (
              <Pressable
                key={d.a}
                accessibilityRole="button"
                accessibilityLabel={`${d.de} a ${d.a}, desde ${d.desde} euros`}
                onPress={() =>
                  router.push({
                    pathname: "/resultados",
                    params: {
                      origen: d.origen,
                      destino: d.destino,
                      fecha: manana(),
                      pasajeros: "1",
                      adultos: "1",
                      ninos: "0",
                      bebes: "0",
                      descuento: "ninguno",
                    },
                  })
                }
                style={({ pressed }) => [styles.destino, pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }]}
              >
                <ImageBackground
                  source={foto ? { uri: urlFoto(foto.archivo, 640) } : undefined}
                  style={styles.destinoFoto}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <LinearGradient
                    colors={["rgba(40,0,30,0.02)", "rgba(40,0,30,0.78)"]}
                    style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                  />
                  <View style={styles.destinoTexto}>
                    <Text style={styles.destinoRuta}>
                      {d.de} → {d.a}
                    </Text>
                    <Text style={styles.destinoDato}>{d.duracion} de viaje</Text>
                    <Text style={styles.destinoPrecio}>
                      desde <Text style={{ fontFamily: fuentes.negrita, fontSize: 18 }}>{d.desde} €</Text>
                    </Text>
                  </View>
                </ImageBackground>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.seccion}>
        <Text style={estilos.h2}>Ofertas para viajar más por menos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 12 }}>
          {OFERTAS.map((o) => (
            <LinearGradient
              key={o.titulo}
              colors={o.colores}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.oferta}
            >
              <Text style={styles.ofertaDato}>{o.dato}</Text>
              <Text style={styles.ofertaTitulo}>{o.titulo}</Text>
              <Text style={styles.ofertaTexto}>{o.texto}</Text>
            </LinearGradient>
          ))}
        </ScrollView>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.navigate("/directo")}
        style={({ pressed }) => [styles.directo, pressed && { opacity: 0.94 }]}
      >
        <View style={{ flex: 1, gap: espaciado[1] }}>
          <Text style={styles.directoTitulo}>Sigue tu tren en directo</Text>
          <Text style={styles.directoTexto}>Posición en el mapa, próxima parada y retraso, cada pocos segundos.</Text>
        </View>
        <View style={styles.directoBoton}>
          <Icono nombre="mapa" tamano={19} color={colores.marca} />
          <Text style={styles.directoBotonTexto}>Ver mapa</Text>
        </View>
      </Pressable>

      <Text style={styles.pie}>Renfe · Andén 0 · Proyecto de clase. Precios y reservas simulados.</Text>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  portada: {
    height: 214,
    overflow: "hidden",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  lema: {
    fontFamily: fuentes.negrita,
    fontSize: 46,
    letterSpacing: -2.4,
    color: paleta.moradoOscuro,
    textAlign: "center",
    marginTop: 18,
    opacity: 0.92,
  },
  catenaria: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 112,
    height: 1.5,
    backgroundColor: "rgba(70,70,70,0.4)",
  },
  tren: {
    position: "absolute",
    left: -330,
    bottom: 22,
    width: 760,
    shadowColor: "#460032",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  anden: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 42,
    backgroundColor: "#dfe5ea",
    borderTopWidth: 4,
    borderTopColor: colores.accion,
  },
  raya: { position: "absolute", top: 5, bottom: 5, width: 4, backgroundColor: "#cfd6dd" },
  sombraTren: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 42,
    height: 10,
    backgroundColor: "rgba(70,0,50,0.08)",
  },
  seccion: { paddingHorizontal: 12, paddingTop: espaciado[6], gap: espaciado[3] },
  aviso: {
    width: 214,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 16,
    padding: espaciado[4],
    gap: espaciado[2],
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    ...sombras[1],
  },
  avisoIcono: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: tonos.moradoSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  avisoTitulo: { fontFamily: fuentes.seminegrita, fontSize: 15.5, color: colores.titulo },
  avisoTexto: { fontFamily: fuentes.normal, fontSize: 13, color: colores.textoSuave, lineHeight: 18 },
  rejilla: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  destino: {
    width: "48.4%",
    minWidth: 150,
    borderRadius: 16,
    overflow: "hidden",
    ...sombras[2],
  },
  destinoFoto: { height: 168, justifyContent: "flex-end", backgroundColor: paleta.morado },
  destinoTexto: { padding: espaciado[3], gap: 2 },
  destinoRuta: { fontFamily: fuentes.negrita, fontSize: 15.5, color: "#fff" },
  destinoDato: { fontFamily: fuentes.normal, fontSize: 11.6, color: "rgba(255,255,255,0.85)" },
  destinoPrecio: { fontFamily: fuentes.normal, fontSize: 12.4, color: "#fff", marginTop: 3 },
  oferta: {
    width: 226,
    minHeight: 132,
    borderRadius: 16,
    padding: espaciado[4],
    gap: espaciado[1],
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  ofertaDato: {
    alignSelf: "flex-start",
    fontFamily: fuentes.negrita,
    fontSize: 11.5,
    color: colores.marca,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: "hidden",
  },
  ofertaTitulo: { fontFamily: fuentes.negrita, fontSize: 19, color: colores.titulo, marginTop: 3 },
  ofertaTexto: { fontFamily: fuentes.normal, fontSize: 13, color: colores.texto, lineHeight: 18 },
  directo: {
    margin: 12,
    marginTop: espaciado[8],
    backgroundColor: paleta.morado,
    borderRadius: 20,
    padding: espaciado[4],
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[3],
    ...sombras[3],
  },
  directoTitulo: { fontFamily: fuentes.negrita, fontSize: 19, color: "#fff", letterSpacing: -0.2 },
  directoTexto: { fontFamily: fuentes.normal, fontSize: 13, color: "rgba(255,255,255,0.84)", lineHeight: 18 },
  directoBoton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  directoBotonTexto: { fontFamily: fuentes.seminegrita, fontSize: 12.6, color: colores.marca },
  pie: {
    fontFamily: fuentes.normal,
    fontSize: 11.5,
    color: colores.textoSuave,
    textAlign: "center",
    paddingHorizontal: 24,
    paddingTop: espaciado[6],
    paddingBottom: 24,
  },
});
