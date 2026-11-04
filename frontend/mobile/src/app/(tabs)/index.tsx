import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState, type ComponentRef } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated from "react-native-reanimated";
import { fotoDeRuta, urlFoto } from "@renfe/shared/contenido/imagenes";
import { menuPrincipal, nucleosCercanias } from "@renfe/shared/contenido/navegacion";
import { colores, espaciado, estilos, fuentes, paleta, radios, sombras, tipografia, tonos } from "@/tema";
import { Buscador, type Criterios } from "@/components/Buscador";
import { Cristal } from "@/components/Cristal";
import { EntradaTren, useEntradaTren } from "@/components/EntradaTren";
import { Icono, type NombreIcono } from "@/components/Icono";
import { Pantalla } from "@/components/Pantalla";
import { Pie } from "@/components/Pie";
import { Aparece, Revela } from "@/components/Revela";

// El panel de cristal se monta 26 px sobre la escena del tren, como en la web.

const manana = () => {
  const d = new Date(Date.now() + 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const contenido = (ruta: string) => router.push(`/contenido${ruta}` as never);

const AVISOS: { titulo: string; texto: string; icono: NombreIcono; ruta: string }[] = [
  { titulo: "Revisa tu tren", texto: "Retrasos, cambios de andén y obras, en el estado de cada tren.", icono: "reloj", ruta: "/gestiona/tus-reservas/estado-de-tu-tren" },
  { titulo: "Equipaje", texto: "Una maleta grande, una de mano y un bulto. Cuándo reservar espacio.", icono: "info", ruta: "/viajar/informacion-util/equipajes" },
  { titulo: "Asistencia", texto: "Pide ayuda en la estación con al menos 12 horas de antelación.", icono: "cara", ruta: "/viajar/informacion-util/servicio-de-asistencia" },
];

const DESTINOS = [
  { de: "Madrid", a: "Barcelona", origen: "60000", destino: "71801", foto: "barcelona", duracion: "2 h 30", desde: 19 },
  { de: "Madrid", a: "Sevilla", origen: "60000", destino: "51003", foto: "sevilla", duracion: "2 h 35", desde: 19 },
  { de: "Madrid", a: "València", origen: "60000", destino: "65000", foto: "valencia", duracion: "1 h 50", desde: 19 },
  { de: "Madrid", a: "Málaga", origen: "60000", destino: "54413", foto: "malaga", duracion: "2 h 40", desde: 25 },
  { de: "Barcelona", a: "Zaragoza", origen: "71801", destino: "04040", foto: "zaragoza", duracion: "1 h 25", desde: 19 },
  { de: "Madrid", a: "León", origen: "17000", destino: "37606", foto: "leon", duracion: "2 h 10", desde: 32 },
];

const OFERTAS: { dato: string; titulo: string; texto: string; ruta: string; colores: readonly [string, string] }[] = [
  { dato: "Escapadas", titulo: "Tren y hotel", texto: "Paquetes de fin de semana con estación céntrica.", ruta: "/viajar/prepara-tu-viaje/viajes-paquetes", colores: ["#f7d9e7", "#fbeaf2"] },
  { dato: "8 % menos", titulo: "Grupos de 4 a 9", texto: "Comprad juntos en el mismo trayecto.", ruta: "/viajar/prepara-tu-viaje/descuentos", colores: ["#eadcf4", "#f6ecf8"] },
  { dato: "5 €", titulo: "Menores de 14", texto: "Precio fijo viajando con un adulto.", ruta: "/viajar/prepara-tu-viaje/descuentos", colores: ["#fde8d8", "#fff2e8"] },
  { dato: "Mascotas", titulo: "Tu perro o gato viaja", texto: "Tamaño, transportín y plazas por tren.", ruta: "/viajar/informacion-util/mascotas", colores: ["#e2f1e7", "#f1f8f3"] },
  { dato: "10 a 25", titulo: "Grupos grandes", texto: "Presupuesto para excursiones y empresas.", ruta: "/gestiona/tus-reservas/grupos-10-25", colores: ["#e3ecf8", "#f0f5fc"] },
  { dato: "Puntos", titulo: "Tarjeta de puntos", texto: "Suma en cada viaje y cámbialos por billetes.", ruta: "/mas-renfe", colores: ["#f3e6f6", "#faf1fb"] },
];

const RUTAS = [
  { titulo: "Norte verde", foto: "santander", texto: "Bilbao, Santander y Oviedo entre montaña y costa.", ruta: "/inspirate/rutas/norte-verde" },
  { titulo: "Mediterráneo", foto: "valencia", texto: "De Barcelona a Alicante pegados al mar.", ruta: "/inspirate/rutas/mediterraneo" },
  { titulo: "Andalucía en tren", foto: "sevilla", texto: "Sevilla, Córdoba, Granada y Málaga sin coche.", ruta: "/inspirate/rutas/andalucia" },
  { titulo: "Ciudades Patrimonio", foto: "toledo", texto: "Toledo, Segovia, Salamanca y Ávila en escapadas cortas.", ruta: "/inspirate/rutas/ciudades-patrimonio" },
];

const GESTIONA = [
  { texto: "Cambia tu billete", ruta: "/gestiona/tus-reservas/cambia-tu-billete" },
  { texto: "Anula tu billete", ruta: "/gestiona/tus-reservas/anula-tu-billete" },
  { texto: "Consulta tus viajes", ruta: "/gestiona/tus-reservas/consulta-tus-viajes" },
  { texto: "Pide tu factura", ruta: "/gestiona/posventa/factura" },
];

const VENTAJAS: { titulo: string; texto: string; icono: NombreIcono; accion: string; onPress: () => void }[] = [
  { titulo: "Billete en el móvil", texto: "Cada billete lleva un QR que se lee en el control de acceso. Sin imprimir nada.", icono: "billetes", accion: "Ver mis billetes", onPress: () => router.navigate("/billetes") },
  { titulo: "Acceso con tu cara", texto: "Si lo activas, pasas el control mirando a la cámara. Lo puedes desactivar cuando quieras.", icono: "cara", accion: "Ir a mi cuenta", onPress: () => router.navigate("/cuenta") },
  { titulo: "Sigue tu tren en directo", texto: "Mira por dónde va y si lleva retraso antes de salir hacia la estación.", icono: "mapa", accion: "Abrir el mapa", onPress: () => router.navigate("/directo") },
  { titulo: "Cambios y anulaciones", texto: "Cambia la fecha o anula el viaje desde el propio billete. Depende de la tarifa.", icono: "intercambiar", accion: "Gestionar un billete", onPress: () => router.navigate("/billetes") },
];

const PREGUNTAS = [
  { p: "¿Con cuánta antelación tengo que llegar a la estación?", r: "En alta velocidad hay control de equipaje y de acceso: cuenta con llegar unos 20 minutos antes. El acceso se cierra 2 minutos antes de la salida." },
  { p: "¿Necesito imprimir el billete?", r: "No. Basta con enseñar el código QR desde el móvil, que también funciona sin conexión una vez descargado." },
  { p: "¿Cuánto equipaje puedo llevar?", r: "Por norma general, una maleta grande, una de mano y un bulto pequeño por persona. Las tarifas básicas pueden limitarlo." },
  { p: "¿Qué pasa si el tren llega con retraso?", r: "Según el retraso y el tipo de tren puedes tener derecho a una devolución parcial o total. La solicitas desde el billete." },
  { p: "¿Cómo funciona el acceso con mi cara?", r: "Guardamos una plantilla de tu rostro, no la foto, solo si das tu permiso. Puedes borrarla desde tu cuenta y seguir usando el QR." },
];

export default function Comprar() {
  // Carrusel de dos páginas: el tren (avanza al deslizar a la izquierda) y la portada con el buscador.
  const desplazable = useRef<ComponentRef<typeof ScrollView>>(null);
  const { width: anchoPagina } = useWindowDimensions();
  // Hueco real entre la cabecera y la barra de pestañas: la escena del tren se mide con él para
  // que el andén no quede detrás de la barra (ver useEntradaTren).
  const [altoCaja, setAltoCaja] = useState(0);
  const entrada = useEntradaTren(altoCaja);

  const [abierta, setAbierta] = useState<string | null>(null);

  // «Ir al buscador»: salta al final del tramo, donde ya está el panel (como en la web).
  const irAlBuscador = () => desplazable.current?.scrollTo({ x: anchoPagina, animated: true });

  const buscar = (c: Criterios) => {
    router.push({
      pathname: "/resultados",
      params: {
        origen: c.origen.id,
        destino: c.destino.id,
        origenNombre: c.origen.nombre,
        destinoNombre: c.destino.nombre,
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

  const irADestino = (d: (typeof DESTINOS)[number]) =>
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
    });

  return (
    <Pantalla scroll={false} contenido={{ paddingHorizontal: 0, paddingTop: 0, gap: 0 }}>
      <View style={{ flex: 1 }} onLayout={(e) => setAltoCaja(e.nativeEvent.layout.height)}>
      <Animated.ScrollView
        ref={desplazable}
        horizontal
        pagingEnabled
        style={styles.desplazable}
        onScroll={entrada.alScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <EntradaTren
          escena={entrada.escena}
          tramo={entrada.tramo}
          estatico={entrada.estatico}
          desplazamiento={entrada.desplazamiento}
          onIrAlBuscador={irAlBuscador}
        />

        <ScrollView
          style={{ width: anchoPagina }}
          contentContainerStyle={styles.desplazableContenido}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
        <Cristal style={{ marginHorizontal: 12, marginTop: espaciado[3] }} padding={espaciado[4]} gap={espaciado[3]}>
          <View style={{ gap: espaciado[1] }}>
            <Text style={estilos.h1}>Busca tu próximo viaje</Text>
            <Text style={[estilos.suave, { fontSize: 15, lineHeight: 21 }]}>
              Trenes de larga y media distancia. Eliges asiento y llevas el billete en el móvil.
            </Text>
          </View>
          <Buscador onBuscar={buscar} />
        </Cristal>

        <Revela style={styles.seccion}>
          <Text style={estilos.h2}>Antes de viajar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 12 }}>
            {AVISOS.map((a) => (
              <Pressable
                key={a.titulo}
                accessibilityRole="link"
                accessibilityLabel={`${a.titulo}. ${a.texto}`}
                onPress={() => contenido(a.ruta)}
                style={({ pressed }) => [styles.aviso, pressed && styles.pulsado]}
              >
                <View style={styles.avisoIcono}>
                  <Icono nombre={a.icono} tamano={21} color={colores.marca} />
                </View>
                <Text style={styles.avisoTitulo}>{a.titulo}</Text>
                <Text style={styles.avisoTexto}>{a.texto}</Text>
                <Text style={styles.enlace}>Más información</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Revela>

        <Revela style={styles.seccion} delay={40}>
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
                  onPress={() => irADestino(d)}
                  style={({ pressed }) => [styles.destino, pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }]}
                >
                  <ImageBackground source={foto ? { uri: urlFoto(foto.archivo, 640) } : undefined} style={styles.destinoFoto} imageStyle={{ borderRadius: 16 }}>
                    <LinearGradient colors={["rgba(40,0,30,0.02)", "rgba(40,0,30,0.78)"]} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
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
        </Revela>

        <Revela style={styles.seccion} delay={60}>
          <Text style={estilos.h2}>Ofertas para viajar más por menos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 12 }}>
            {OFERTAS.map((o) => (
              <Pressable
                key={o.titulo}
                accessibilityRole="link"
                accessibilityLabel={`${o.titulo}. ${o.texto}`}
                onPress={() => contenido(o.ruta)}
                style={({ pressed }) => [pressed && { opacity: 0.88 }]}
              >
                <LinearGradient colors={o.colores} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.oferta}>
                  <Text style={styles.ofertaDato}>{o.dato}</Text>
                  <Text style={styles.ofertaTitulo}>{o.titulo}</Text>
                  <Text style={styles.ofertaTexto}>{o.texto}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>
        </Revela>

        <Revela style={styles.seccion} delay={80}>
          <Text style={estilos.h2}>Rutas para descubrir en tren</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 12 }}>
            {RUTAS.map((r) => {
              const foto = fotoDeRuta(r.foto);
              return (
                <Pressable
                  key={r.ruta}
                  accessibilityRole="link"
                  accessibilityLabel={`${r.titulo}. ${r.texto}`}
                  onPress={() => contenido(r.ruta)}
                  style={({ pressed }) => [styles.ruta, pressed && { opacity: 0.88 }]}
                >
                  <ImageBackground source={foto ? { uri: urlFoto(foto.archivo, 640) } : undefined} style={styles.rutaFoto} imageStyle={{ borderRadius: 16 }}>
                    <LinearGradient colors={["rgba(40,0,30,0.02)", "rgba(40,0,30,0.75)"]} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
                    <View style={{ padding: espaciado[3], gap: 2 }}>
                      <Text style={styles.destinoRuta}>{r.titulo}</Text>
                      <Text style={styles.destinoDato}>{r.texto}</Text>
                    </View>
                  </ImageBackground>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable accessibilityRole="link" onPress={() => contenido("/inspirate/rutas")} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Text style={styles.enlace}>Ver todas las rutas</Text>
          </Pressable>
        </Revela>

        <Revela style={styles.seccion} delay={100}>
          <Text style={estilos.h2}>Accesos rápidos</Text>
          <Cristal gap={espaciado[2]}>
            <Text style={estilos.subtitulo}>Gestiona tu billete</Text>
            {GESTIONA.map((g) => (
              <Pressable
                key={g.ruta}
                accessibilityRole="link"
                onPress={() => contenido(g.ruta)}
                style={({ pressed }) => [styles.fila, pressed && { opacity: 0.6 }]}
              >
                <Text style={[estilos.texto, { flex: 1 }]}>{g.texto}</Text>
                <Icono nombre="delante" tamano={17} color={colores.textoSuave} />
              </Pressable>
            ))}
          </Cristal>
          <Cristal gap={espaciado[2]}>
            <Text style={estilos.subtitulo}>Cercanías por núcleo</Text>
            <View style={styles.chips}>
              {nucleosCercanias.map((n) => (
                <Pressable
                  key={n.ruta}
                  accessibilityRole="link"
                  onPress={() => contenido(n.ruta)}
                  style={({ pressed }) => [styles.chip, pressed && { backgroundColor: tonos.rosaFuerte }]}
                >
                  <Text style={styles.chipTexto}>{n.texto}</Text>
                </Pressable>
              ))}
            </View>
          </Cristal>
          <Pressable accessibilityRole="link" onPress={() => contenido("/mas-renfe")} style={({ pressed }) => [styles.atajoOscuro, pressed && { opacity: 0.92 }]}>
            <Text style={styles.atajoTitulo}>Programa de puntos</Text>
            <Text style={styles.atajoTexto}>Acumula con cada viaje y canjéalos por billetes y ventajas.</Text>
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => contenido("/viajar/informacion-util/aplicaciones")} style={({ pressed }) => [styles.atajo, pressed && { opacity: 0.9 }]}>
            <Text style={styles.atajoTituloOscuro}>Lleva el viaje en el móvil</Text>
            <Text style={estilos.suave}>Billetes, avisos y cambios de última hora en la app.</Text>
          </Pressable>
        </Revela>

        <Revela style={styles.seccion} delay={120}>
          <Text style={estilos.h2}>Todo el viaje desde el móvil</Text>
          <View style={{ gap: 10 }}>
            {VENTAJAS.map((v) => (
              <Cristal key={v.titulo} gap={espaciado[2]}>
                <View style={styles.ventajaIcono}>
                  <Icono nombre={v.icono} tamano={22} color={colores.marca} />
                </View>
                <Text style={estilos.subtitulo}>{v.titulo}</Text>
                <Text style={estilos.suave}>{v.texto}</Text>
                <Pressable accessibilityRole="link" onPress={v.onPress} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
                  <Text style={styles.enlace}>{v.accion}</Text>
                </Pressable>
              </Cristal>
            ))}
          </View>
        </Revela>

        <Revela delay={140}>
          <Pressable accessibilityRole="button" onPress={() => router.navigate("/directo")} style={({ pressed }) => [styles.directo, pressed && { opacity: 0.94 }]}>
            <View style={{ flex: 1, gap: espaciado[1] }}>
              <Text style={styles.directoTitulo}>Sigue tu tren en directo</Text>
              <Text style={styles.directoTexto}>Posición en el mapa, próxima parada y retraso, cada pocos segundos.</Text>
            </View>
            <View style={styles.directoBoton}>
              <Icono nombre="mapa" tamano={19} color={colores.marca} />
              <Text style={styles.directoBotonTexto}>Ver mapa</Text>
            </View>
          </Pressable>
        </Revela>

        <Revela style={styles.seccion} delay={160}>
          <Text style={estilos.h2}>Preguntas frecuentes</Text>
          <View style={{ gap: 6 }}>
            {PREGUNTAS.map((q) => {
              const abiertaEsta = abierta === q.p;
              return (
                <Pressable
                  key={q.p}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: abiertaEsta }}
                  onPress={() => setAbierta(abiertaEsta ? null : q.p)}
                  style={({ pressed }) => [styles.pregunta, pressed && { backgroundColor: tonos.rosaFuerte }]}
                >
                  <View style={styles.fila}>
                    <Text style={[estilos.textoMedio, { flex: 1 }]}>{q.p}</Text>
                    <Icono nombre="chevron" tamano={18} color={colores.marca} />
                  </View>
                  {abiertaEsta ? (
                    <Aparece>
                      <Text style={estilos.suave}>{q.r}</Text>
                    </Aparece>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </Revela>

        <Revela style={styles.seccion} delay={180}>
          <Text style={estilos.h2}>Información y ayuda</Text>
          <View style={styles.infoRejilla}>
            {[...menuPrincipal, { titulo: "Ayuda", ruta: "/ayuda" }].map((m) => (
              <Pressable
                key={m.ruta}
                accessibilityRole="link"
                onPress={() => contenido(m.ruta)}
                style={({ pressed }) => [styles.info, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.avisoTitulo}>{m.titulo}</Text>
                <Icono nombre="delante" tamano={17} color={colores.marca} />
              </Pressable>
            ))}
          </View>
          <Pressable accessibilityRole="link" onPress={() => router.push("/informacion" as never)} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
            <Text style={styles.enlace}>Ver todas las secciones</Text>
          </Pressable>
        </Revela>

        <Pie />
        <Text style={styles.pieTexto}>Renfe · Andén 0 · Proyecto de clase. Precios y reservas simulados.</Text>
        </ScrollView>
      </Animated.ScrollView>
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  desplazable: { flex: 1 },
  desplazableContenido: { paddingBottom: 132 },
  pulsado: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  fila: { flexDirection: "row", alignItems: "center", minHeight: 40, gap: 8 },
  enlace: { fontFamily: fuentes.seminegrita, fontSize: 13.6, color: colores.marca },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: espaciado[3],
    borderRadius: radios.pildora,
    borderWidth: 1,
    borderColor: "rgba(129,0,94,0.18)",
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  chipTexto: { fontFamily: fuentes.seminegrita, fontSize: 12.6, color: colores.texto },
  atajo: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    padding: espaciado[4],
    gap: 2,
    ...sombras[1],
  },
  atajoOscuro: {
    backgroundColor: paleta.morado,
    borderRadius: 16,
    padding: espaciado[4],
    gap: 2,
    ...sombras[2],
  },
  atajoTitulo: { fontFamily: fuentes.negrita, fontSize: 17, color: "#fff" },
  atajoTexto: { fontFamily: fuentes.normal, fontSize: 12.6, color: "rgba(255,255,255,0.84)", lineHeight: 18 },
  atajoTituloOscuro: { fontFamily: fuentes.negrita, fontSize: 17, color: colores.titulo },
  ventajaIcono: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: tonos.moradoSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  pregunta: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    padding: espaciado[3],
    gap: espaciado[2],
  },
  ruta: { width: 236, borderRadius: 16, overflow: "hidden", ...sombras[2] },
  rutaFoto: { height: 150, justifyContent: "flex-end", backgroundColor: paleta.morado },
  infoRejilla: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  info: {
    width: "48.4%",
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 16,
    paddingHorizontal: espaciado[3],
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    ...sombras[1],
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
  pieTexto: {
    fontFamily: fuentes.normal,
    fontSize: 11.5,
    color: colores.textoSuave,
    textAlign: "center",
    paddingHorizontal: 24,
    paddingTop: espaciado[4],
    paddingBottom: 24,
  },
});
