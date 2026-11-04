// Páginas informativas (Viajar, Ayuda, Cercanías...) con los mismos datos y bloques que la web.
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useRef, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import { buscarPagina, hijasDe } from "@renfe/shared/contenido";
import { fotoDeRuta, urlFoto, type Foto } from "@renfe/shared/contenido/imagenes";
import { menuPrincipal } from "@renfe/shared/contenido/navegacion";
import type { Bloque, ConImagen, Tarjeta } from "@renfe/shared/contenido/tipos";
import { colores, espaciado, estilos, fuentes, tonos } from "@/tema";
import { Boton } from "@/components/Boton";
import { Cristal } from "@/components/Cristal";
import { Icono } from "@/components/Icono";
import { Pantalla } from "@/components/Pantalla";
import { herramientas } from "@/herramientas/registro";

const WEB = "https://renfe-app-beta.vercel.app";

// Rutas de la web que tienen pantalla propia en la app.
const PANTALLAS: Record<string, string> = {
  "/": "/",
  "/trenes": "/",
  "/billetes": "/billetes",
  "/cuenta": "/cuenta",
  "/acceder": "/cuenta",
  "/abonos": "/abonos",
  "/mapa": "/directo",
  "/lineas": "/lineas",
  "/revisor": "/revisor",
  "/admin": "/admin",
};

function abrirRuta(ruta: string) {
  if (!ruta.startsWith("/")) return void WebBrowser.openBrowserAsync(ruta);
  const limpia = ruta.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (buscarPagina(limpia) || menuPrincipal.some((m) => m.ruta === limpia)) return router.push(`/contenido${limpia}` as never);
  const billete = limpia.match(/^\/billetes\/([^/]+)$/);
  if (billete) return router.push(`/billete/${billete[1]}` as never);
  if (PANTALLAS[limpia]) return router.navigate(PANTALLAS[limpia] as never);
  void WebBrowser.openBrowserAsync(WEB + ruta);
}

function fotoDe(x: ConImagen, ruta?: string): Foto | undefined {
  if (x.imagen) return { archivo: x.imagen, autor: x.autor ?? "Wikimedia Commons" };
  if (!ruta?.startsWith("/")) return undefined;
  const p = buscarPagina(ruta);
  return (p?.imagen ? { archivo: p.imagen, autor: p.autor ?? "Wikimedia Commons" } : undefined) ?? fotoDeRuta(ruta);
}

function TarjetaEnlace({ t }: { t: Tarjeta }) {
  const foto = fotoDe(t, t.enlace);
  const enlace = t.enlace;
  return (
    <Pressable
      disabled={!enlace}
      accessibilityRole={enlace ? "link" : undefined}
      onPress={() => enlace && abrirRuta(enlace)}
      style={({ pressed }) => [styles.tarjeta, pressed && { opacity: 0.85 }]}
    >
      {foto ? <Image source={{ uri: urlFoto(foto.archivo, 640) }} style={styles.tarjetaFoto} accessibilityLabel={`Imagen de ${t.titulo}`} /> : null}
      <View style={{ padding: espaciado[3], gap: 4 }}>
        {t.etiqueta ? <Text style={styles.etiqueta}>{t.etiqueta}</Text> : null}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[estilos.subtitulo, { flex: 1, fontSize: 16.5 }]}>{t.titulo}</Text>
          {enlace ? <Icono nombre="delante" tamano={18} color={colores.textoSuave} /> : null}
        </View>
        <Text style={estilos.suave}>{t.texto}</Text>
      </View>
    </Pressable>
  );
}

function Pregunta({ p, r }: { p: string; r: string }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: abierta }} onPress={() => setAbierta(!abierta)} style={styles.pregunta}>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <Text style={[estilos.textoMedio, { flex: 1 }]}>{p}</Text>
        <Icono nombre="chevron" tamano={18} color={colores.marca} />
      </View>
      {abierta ? <Text style={estilos.texto}>{r}</Text> : null}
    </Pressable>
  );
}

function Contenido({ b, ruta }: { b: Bloque; ruta: string }) {
  switch (b.tipo) {
    case "texto":
      return <>{b.parrafos.map((p, i) => <Text key={i} style={estilos.texto}>{p}</Text>)}</>;
    case "lista":
      return <>{b.items.map((x, i) => <Text key={i} style={estilos.texto}>{"•  "}{x}</Text>)}</>;
    case "tarjetas":
      return <>{b.tarjetas.map((t, i) => <TarjetaEnlace key={i} t={t} />)}</>;
    case "tabla":
      // En móvil, cada fila como ficha: «columna: valor».
      return (
        <>
          {b.filas.map((f, i) => (
            <View key={i} style={styles.fila}>
              <Text style={estilos.textoMedio}>{f[0]}</Text>
              {f.slice(1).map((c, j) => (
                <Text key={j} style={estilos.suave}>
                  {b.columnas[j + 1]}: <Text style={{ color: colores.texto }}>{c}</Text>
                </Text>
              ))}
            </View>
          ))}
        </>
      );
    case "faq":
      return <>{b.preguntas.map((q) => <Pregunta key={q.p} p={q.p} r={q.r} />)}</>;
    case "pasos":
      return (
        <>
          {b.pasos.map((p, i) => (
            <View key={p.titulo} style={{ flexDirection: "row", gap: 10 }}>
              <Text style={styles.numero}>{i + 1}</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={estilos.textoMedio}>{p.titulo}</Text>
                <Text style={estilos.suave}>{p.texto}</Text>
              </View>
            </View>
          ))}
        </>
      );
    case "aviso":
      return (
        <View style={[styles.aviso, b.nivel === "alerta" && { backgroundColor: tonos.avisoFondo }]} accessibilityRole={b.nivel === "alerta" ? "alert" : undefined}>
          <Icono nombre={b.nivel === "alerta" ? "aviso" : "info"} tamano={21} color={b.nivel === "alerta" ? tonos.aviso : colores.marca} />
          <Text style={[estilos.texto, { flex: 1 }]}>{b.texto}</Text>
        </View>
      );
    case "cta":
      return (
        <View style={{ gap: espaciado[2] }}>
          <Text style={estilos.texto}>{b.texto}</Text>
          <Boton texto={b.etiqueta} onPress={() => abrirRuta(b.enlace)} />
        </View>
      );
    case "herramienta": {
      const Herramienta = herramientas[b.id];
      return Herramienta ? (
        <Herramienta ruta={ruta} />
      ) : (
        <View style={{ gap: 4 }}>
          <Text style={estilos.subtitulo}>Próximamente</Text>
          <Text style={estilos.suave}>Esta herramienta interactiva todavía no está disponible.</Text>
        </View>
      );
    }
  }
}

export default function PaginaContenidoMovil() {
  const { ruta } = useLocalSearchParams<{ ruta: string[] }>();
  const camino = "/" + (Array.isArray(ruta) ? ruta : [ruta]).filter(Boolean).join("/");
  const volver = () => (router.canGoBack() ? router.back() : router.replace("/"));
  const pagina = buscarPagina(camino);
  const scroll = useRef<ScrollViewInstance>(null);
  const posiciones = useRef<Record<number, number>>({});
  const menu = menuPrincipal.find((m) => m.ruta === camino);

  if (!pagina && !menu)
    return (
      <Pantalla volver={volver}>
        <Cristal padding={espaciado[6]} gap={espaciado[3]}>
          <Text style={styles.codigo}>404</Text>
          <Text style={estilos.h1}>Este tren no para aquí</Text>
          <Text style={estilos.suave}>La dirección no lleva a ninguna página. Puede que el enlace sea antiguo o tenga una errata.</Text>
          <Boton texto="Volver" onPress={volver} />
          <Boton texto="Ir a Ayuda" variante="secundario" onPress={() => router.replace("/contenido/ayuda" as never)} />
        </Cristal>
      </Pantalla>
    );

  const titulo = pagina?.titulo ?? menu!.titulo;
  const portada = pagina ? fotoDe(pagina, pagina.ruta) : fotoDeRuta(camino);
  const hijas = hijasDe(camino);
  // Índice «En esta página»: bloques con título; se guarda la Y de cada uno al medirse.
  const indice = (pagina?.bloques ?? []).flatMap((b, i) => ("titulo" in b && b.titulo ? [{ i, titulo: b.titulo }] : []));

  return (
    // Pantalla sin scroll propio para poder usar scrollTo con nuestra ScrollView (mismo relleno que Pantalla).
    <Pantalla volver={volver} scroll={false}>
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={styles.cuerpo} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={estilos.suave} numberOfLines={1}>
        Inicio ›{" "}
        {camino
          .split("/")
          .filter(Boolean)
          .map((_, i, t) => {
            const r = "/" + t.slice(0, i + 1).join("/");
            return buscarPagina(r)?.titulo ?? menuPrincipal.find((m) => m.ruta === r)?.titulo ?? t[i];
          })
          .join(" › ")}
      </Text>
      <Cristal padding={0} gap={0}>
        {portada ? <Image source={{ uri: urlFoto(portada.archivo, 800) }} style={styles.portada} accessibilityLabel={`Vista de ${titulo}`} /> : null}
        <View style={{ padding: espaciado[4], gap: espaciado[2] }}>
          <Text style={estilos.h1} accessibilityRole="header">{titulo}</Text>
          {pagina ? <Text style={estilos.texto}>{pagina.resumen}</Text> : null}
        </View>
      </Cristal>

      {indice.length > 1 ? (
        <Cristal gap={espaciado[2]}>
          <Text style={estilos.subtitulo} accessibilityRole="header">En esta página</Text>
          {indice.map((x) => (
            <Pressable
              key={x.i}
              accessibilityRole="link"
              onPress={() => scroll.current?.scrollTo({ y: Math.max(0, (posiciones.current[x.i] ?? 0) - 8), animated: true })}
              hitSlop={6}
              style={({ pressed }) => [{ paddingVertical: 4 }, pressed && { opacity: 0.6 }]}
            >
              <Text style={[estilos.textoMedio, { color: colores.marca }]}>{x.titulo}</Text>
            </Pressable>
          ))}
        </Cristal>
      ) : null}

      {pagina?.bloques.map((b, i) => {
        const t = "titulo" in b ? b.titulo : undefined;
        return (
          <View key={i} onLayout={(e) => (posiciones.current[i] = e.nativeEvent.layout.y)}>
            <Cristal gap={espaciado[3]}>
              {t ? <Text style={estilos.h2} accessibilityRole="header">{t}</Text> : null}
              <Contenido b={b} ruta={camino} />
            </Cristal>
          </View>
        );
      })}

      {/* Menú sin página propia: sus grupos y enlaces */}
      {!pagina && menu
        ? menu.grupos.map((g) => (
            <Cristal key={g.titulo} gap={espaciado[2]}>
              <TarjetaEnlace t={{ titulo: g.titulo, texto: "", enlace: g.ruta }} />
              {g.enlaces.map((e) => <TarjetaEnlace key={e.ruta} t={{ titulo: e.texto, texto: "", enlace: e.ruta }} />)}
            </Cristal>
          ))
        : null}

      {hijas.length > 0 ? (
        <Cristal gap={espaciado[3]}>
          <Text style={estilos.h2}>En esta sección</Text>
          {hijas.map((h) => <TarjetaEnlace key={h.ruta} t={{ titulo: h.titulo, texto: h.resumen, enlace: h.ruta }} />)}
        </Cristal>
      ) : null}
      </ScrollView>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  cuerpo: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 132, gap: 12 },
  tarjeta: { backgroundColor: "rgba(255,255,255,0.78)", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: colores.borde },
  tarjetaFoto: { height: 140, backgroundColor: tonos.moradoSuave },
  portada: { height: 180, backgroundColor: tonos.moradoSuave },
  etiqueta: { alignSelf: "flex-start", fontFamily: fuentes.negrita, fontSize: 11.5, color: colores.marca, backgroundColor: tonos.moradoSuave, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2, overflow: "hidden" },
  pregunta: { backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 14, padding: espaciado[3], gap: espaciado[2] },
  fila: { borderTopWidth: 1, borderTopColor: colores.borde, paddingTop: espaciado[2], gap: 2 },
  numero: { width: 28, height: 28, borderRadius: 14, textAlign: "center", lineHeight: 28, backgroundColor: tonos.moradoSuave, color: colores.marca, fontFamily: fuentes.negrita, overflow: "hidden" },
  aviso: { flexDirection: "row", gap: 10, padding: espaciado[3], borderRadius: 14, backgroundColor: tonos.moradoSuave },
  codigo: { fontFamily: fuentes.negrita, fontSize: 56, color: colores.marca, letterSpacing: -2 },
});
