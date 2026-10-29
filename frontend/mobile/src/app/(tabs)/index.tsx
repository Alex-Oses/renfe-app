import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewInstance,
} from "react-native";
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
  // La portada se anima con el scroll, como el tramo sticky de la web: el tren sale hacia
  // la izquierda mientras el buscador entra desde la derecha y se asienta sobre el andén.
  const scrollY = useRef(new Animated.Value(0)).current;
  const desplazamiento = useRef<ScrollViewInstance>(null);
  const [reducir, setReducir] = useState(false);
  const [altoVista, setAltoVista] = useState(0);
  // La portada ocupa la pantalla disponible y se queda fija durante la entrada del buscador,
  // como el tramo sticky de la web. Con movimiento reducido no se fija y se acorta.
  const altoPortada = reducir ? 240 : altoVista > 0 ? altoVista : 600;
  const recorrido = Math.max(1, Math.round(altoPortada * 0.72));

  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((si) => {
        if (vivo) setReducir(si);
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, []);

  const acotar = { extrapolate: "clamp" as const };
  // El tren arranca en el primer píxel; el buscador entra desde la derecha mientras sube.
  const pinY = scrollY.interpolate({ inputRange: [0, recorrido], outputRange: [0, recorrido], ...acotar });
  const trenX = scrollY.interpolate({ inputRange: [0, recorrido * 0.55], outputRange: [0, -402], ...acotar });
  const panelX = scrollY.interpolate({
    inputRange: [recorrido * 0.05, recorrido * 0.45],
    outputRange: [320, 0],
    ...acotar,
  });
  const panelOpacidad = scrollY.interpolate({
    inputRange: [recorrido * 0.05, recorrido * 0.22, recorrido * 0.45],
    outputRange: [0, 0.35, 1],
    ...acotar,
  });
  const pistaOpacidad = scrollY.interpolate({ inputRange: [0, recorrido * 0.16], outputRange: [1, 0], ...acotar });

  const irAlBuscador = () => {
    desplazamiento.current?.scrollTo({ y: recorrido, animated: !reducir });
  };

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
    <Pantalla
      scrollY={scrollY}
      scrollRef={desplazamiento}
      onLayoutVista={setAltoVista}
      contenido={{ paddingHorizontal: 0, paddingTop: 0, gap: 0 }}
    >
      <View style={{ height: altoPortada }}>
        <Animated.View
          style={[styles.portada, { height: altoPortada }, reducir ? null : { transform: [{ translateY: pinY }] }]}
        >
          <LinearGradient colors={gradientes.heroe} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.paisaje} pointerEvents="none">
            <View style={[styles.colina, { left: "4%", width: "48%", height: "100%", backgroundColor: "#dcc9d6" }]} />
            <View style={[styles.colina, { left: "36%", width: "44%", height: "72%", backgroundColor: "#e6d7e1" }]} />
            <View style={[styles.colina, { left: "64%", width: "48%", height: "94%", backgroundColor: "#d9c6d3" }]} />
          </View>
          <View style={styles.catenaria} pointerEvents="none">
            <View style={styles.cable} />
            {[-2, 21, 44, 67, 90].map((x) => (
              <View key={x} style={[styles.poste, { left: `${x}%` }]} />
            ))}
          </View>
          <Text style={styles.lema}>Renfe</Text>
          {!reducir ? (
            <Animated.View style={[styles.tren, { transform: [{ translateX: trenX }] }]} pointerEvents="none">
              <TrenSvg ancho={760} />
            </Animated.View>
          ) : null}
          <View style={styles.anden} pointerEvents="none">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} style={[styles.raya, { left: `${8 + i * 14}%` }]} />
            ))}
          </View>
          <View style={styles.sombraTren} pointerEvents="none" />
          {!reducir ? (
            <Animated.View style={[styles.pista, { opacity: pistaOpacidad }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ir al buscador"
                onPress={irAlBuscador}
                style={({ pressed }) => [styles.pistaBoton, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <Text style={styles.pistaTexto}>Desliza o toca para buscar</Text>
                <View style={{ transform: [{ rotate: "-90deg" }] }}>
                  <Icono nombre="chevron" tamano={15} color={colores.marca} grosor={2.2} />
                </View>
              </Pressable>
            </Animated.View>
          ) : null}
        </Animated.View>
      </View>

      <Animated.View
        style={{
          marginHorizontal: 12,
          marginTop: -26,
          ...(reducir ? null : { opacity: panelOpacidad, transform: [{ translateX: panelX }] }),
        }}
      >
        <Cristal padding={espaciado[4]} gap={espaciado[3]}>
          <View style={{ gap: espaciado[1] }}>
            <Text style={estilos.h1}>Busca tu próximo viaje</Text>
            <Text style={[estilos.suave, { fontSize: 15, lineHeight: 21 }]}>
              Trenes de larga y media distancia. Eliges asiento y llevas el billete en el móvil.
            </Text>
          </View>
          <Buscador onBuscar={buscar} />
        </Cristal>
      </Animated.View>

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
    width: "100%",
    overflow: "hidden",
  },
  paisaje: {
    position: "absolute",
    left: "-20%",
    right: "-10%",
    bottom: "30%",
    height: "22%",
  },
  colina: {
    position: "absolute",
    bottom: 0,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  catenaria: {
    position: "absolute",
    left: -40,
    right: -40,
    bottom: "30%",
    height: "34%",
    opacity: 0.5,
  },
  cable: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "12%",
    height: 1.5,
    backgroundColor: "#464646",
  },
  poste: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#6b6b6b",
  },
  lema: {
    position: "absolute",
    top: "12%",
    left: 0,
    right: 0,
    fontFamily: fuentes.negrita,
    fontSize: 46,
    letterSpacing: -2.4,
    color: paleta.moradoOscuro,
    textAlign: "center",
    opacity: 0.92,
  },
  tren: {
    position: "absolute",
    right: 12,
    bottom: "29.5%",
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
    height: "30%",
    backgroundColor: "#dfe5ea",
    borderTopWidth: 4,
    borderTopColor: colores.accion,
  },
  raya: { position: "absolute", top: 5, bottom: 5, width: 4, backgroundColor: "#cfd6dd" },
  sombraTren: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "29.6%",
    height: 8,
    backgroundColor: "rgba(70,0,50,0.07)",
  },
  pista: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 92,
    alignItems: "center",
  },
  pistaBoton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    ...sombras[1],
  },
  pistaTexto: { fontFamily: fuentes.seminegrita, fontSize: 12.4, color: colores.marca },
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
