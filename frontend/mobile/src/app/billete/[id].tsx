import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { misBilletes, obtenerBillete } from "@renfe/shared/api/cliente";
import { ciudadDe, type Billete } from "@renfe/shared/api/tipos";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { Cristal } from "@/components/Cristal";
import { Icono } from "@/components/Icono";
import { Pantalla } from "@/components/Pantalla";
import { fecha, hora } from "@/formato";
import { colores, espaciado, estilos, fuentes, radios, sombras, tipografia } from "@/tema";

// "2 h 25 min" entre salida y llegada.
function duracion(salida: string, llegada: string) {
  const min = Math.max(0, Math.round((Date.parse(llegada) - Date.parse(salida)) / 60_000));
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;
}

// Etiqueta de la cabecera según cuándo es el viaje.
function estadoDe(salida: string, llegada: string) {
  const ahora = Date.now();
  if (ahora > Date.parse(llegada)) return "Viaje realizado";
  if (ahora >= Date.parse(salida)) return "En viaje";
  if (new Date(salida).toDateString() === new Date().toDateString()) return "Sale hoy";
  return "Próximo viaje";
}

// Pase de embarque de la web (Billete.tsx): cabecera degradada, ruta, datos, troquel y QR grande.
export default function VerBillete() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [billete, setBillete] = useState<Billete | null>(null);
  const [grupo, setGrupo] = useState<Billete[]>([]);
  const [todos, setTodos] = useState(false);
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();
  const ladoQr = Math.min(width - 118, 240);

  useEffect(() => {
    let vivo = true;
    setBillete(null);
    setError("");
    setTodos(false);
    obtenerBillete(id)
      .then((b) => {
        if (!vivo) return;
        setBillete(b);
        // Los demás billetes de la misma reserva, para moverse entre viajeros.
        misBilletes().then(
          (todosLosBilletes) => {
            if (!vivo) return;
            setGrupo(
              todosLosBilletes
                .filter((x) => x.reservaId === b.reservaId)
                .sort((p, q) => p.id.localeCompare(q.id, "es", { numeric: true })),
            );
          },
          () => vivo && setGrupo([]),
        );
      })
      .catch((e: Error) => vivo && setError(e.message));
    return () => {
      vivo = false;
    };
  }, [id]);

  if (error)
    return (
      <Pantalla volver={() => router.back()}>
        <Aviso texto={error} tipo="error" />
        <Boton texto="Volver a mis billetes" icono="billetes" onPress={() => router.navigate("/billetes")} />
      </Pantalla>
    );

  if (!billete)
    return (
      <Pantalla volver={() => router.back()}>
        <View style={styles.cargando}>
          <ActivityIndicator color={colores.marca} size="large" />
          <Text style={estilos.suave}>Cargando el billete…</Text>
        </View>
      </Pantalla>
    );

  const { tren, asiento, pasajero, localizador } = billete;
  const indice = grupo.findIndex((g) => g.id === billete.id);
  const anterior = indice > 0 ? grupo[indice - 1] : null;
  const siguiente = indice >= 0 && indice < grupo.length - 1 ? grupo[indice + 1] : null;

  const irA = (otro: Billete) =>
    router.replace({ pathname: "/billete/[id]", params: { id: otro.id } });

  const dato = (etiqueta: string, valor: string, ancho?: boolean) => (
    <View style={[styles.dato, ancho && styles.datoAncho]}>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text style={styles.datoValor}>{valor}</Text>
    </View>
  );

  return (
    <Pantalla volver={() => router.back()}>
      <View style={styles.cabecera}>
        <Text style={estilos.h1}>Tu billete</Text>
        <Text style={estilos.suave}>Enseña el QR en el control de acceso y al revisor.</Text>
      </View>

      {grupo.length > 1 ? (
        <Cristal padding={espaciado[2]} gap={espaciado[2]} style={{ borderRadius: radios.pildora }}>
          <View style={styles.navGrupo}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Viajero anterior"
              disabled={!anterior}
              onPress={() => anterior && irA(anterior)}
              style={({ pressed }) => [
                styles.navPaso,
                !anterior && { opacity: 0.25 },
                pressed && anterior ? { backgroundColor: "rgba(129,0,94,0.08)" } : null,
              ]}
            >
              <Icono nombre="atras" tamano={21} color={colores.marca} />
            </Pressable>
            <Text style={styles.navCuenta}>
              Viajero {indice + 1} de {grupo.length}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Viajero siguiente"
              disabled={!siguiente}
              onPress={() => siguiente && irA(siguiente)}
              style={({ pressed }) => [
                styles.navPaso,
                !siguiente && { opacity: 0.25 },
                pressed && siguiente ? { backgroundColor: "rgba(129,0,94,0.08)" } : null,
              ]}
            >
              <Icono nombre="delante" tamano={21} color={colores.marca} />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: todos }}
            onPress={() => setTodos((v) => !v)}
            style={({ pressed }) => [styles.navTodos, todos && styles.navTodosActivo, pressed && { opacity: 0.75 }]}
          >
            <Text style={[styles.navTodosTexto, todos && { color: "#fff" }]}>
              {todos ? "Ocultar los QR del grupo" : "Ver todos los QR del grupo"}
            </Text>
          </Pressable>
        </Cristal>
      ) : null}

      {todos ? (
        <View style={styles.qrGrupo}>
          {grupo.map((g) => (
            <View key={g.id} style={styles.qrGrupoItem}>
              <QRCode value={g.qr} size={104} color={colores.texto} backgroundColor="#fff" />
              <Text style={styles.qrGrupoNombre} numberOfLines={1}>
                {g.pasajero.nombre} {g.pasajero.apellidos}
              </Text>
              <Text style={styles.qrGrupoAsiento}>
                Coche {g.asiento.coche} · {g.asiento.fila}
                {g.asiento.letra}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.pase}>
        <LinearGradient
          colors={["#5c0043", "#81005e", "#d62d61"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cabeza}
        >
          <View style={styles.cabezaFila}>
            <Text style={styles.marca}>Renfe</Text>
            <Text style={styles.tren}>
              {tren.tipo} {tren.numero}
            </Text>
            <View style={styles.estado}>
              <Text style={styles.estadoTexto}>{estadoDe(tren.salida, tren.llegada)}</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.librea} />

        <View style={styles.ruta}>
          <View style={styles.rutaLado}>
            <Text style={styles.ciudad} numberOfLines={2}>
              {ciudadDe(tren.origen)}
            </Text>
            <Text style={styles.hora}>{hora(tren.salida)}</Text>
            <Text style={styles.estacion} numberOfLines={2}>
              {tren.origen.nombre}
            </Text>
          </View>
          <View style={styles.trayecto}>
            <Icono nombre="delante" tamano={26} color={colores.marca} grosor={1.7} />
            <Text style={styles.trayectoDuracion}>{duracion(tren.salida, tren.llegada)}</Text>
          </View>
          <View style={[styles.rutaLado, { alignItems: "flex-end" }]}>
            <Text style={[styles.ciudad, { textAlign: "right" }]} numberOfLines={2}>
              {ciudadDe(tren.destino)}
            </Text>
            <Text style={styles.hora}>{hora(tren.llegada)}</Text>
            <Text style={[styles.estacion, { textAlign: "right" }]} numberOfLines={2}>
              {tren.destino.nombre}
            </Text>
          </View>
        </View>

        <View style={styles.datos}>
          {dato("Fecha", fecha(tren.salida))}
          {dato("Coche", String(asiento.coche))}
          {dato("Asiento", `${asiento.fila}${asiento.letra}`)}
          {dato("Clase", asiento.clase)}
          {dato("Viajero", `${pasajero.nombre} ${pasajero.apellidos}`, true)}
        </View>

        <View style={styles.corteCaja}>
          <View style={styles.muescaIzquierda} />
          <View style={styles.corte} />
          <View style={styles.muescaDerecha} />
        </View>

        <View style={styles.pie}>
          <View style={styles.qrCaja}>
            <QRCode value={billete.qr} size={ladoQr} color={colores.texto} backgroundColor="#fff" />
          </View>
          <Text style={styles.pieEtiqueta}>Localizador</Text>
          <Text style={[styles.localizador, { color: colores.marca }]}>{localizador}</Text>
          <Text style={styles.nota}>
            Enseña este código al revisor o en el control de acceso. Sube el brillo de la pantalla.
          </Text>
        </View>
      </View>

      <View style={styles.acciones}>
        <Boton texto="Ver mis billetes" variante="secundario" icono="billetes" onPress={() => router.navigate("/billetes")} />
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  cargando: { alignItems: "center", gap: espaciado[3], paddingVertical: 40 },
  cabecera: { gap: espaciado[2], paddingTop: espaciado[2] },
  navGrupo: { flexDirection: "row", alignItems: "center", gap: espaciado[1] },
  navPaso: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  navCuenta: {
    flex: 1,
    textAlign: "center",
    fontFamily: fuentes.seminegrita,
    fontSize: tipografia.tamanos.base,
    color: colores.titulo,
  },
  navTodos: {
    minHeight: 40,
    borderRadius: radios.pildora,
    borderWidth: 1,
    borderColor: colores.marca,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: espaciado[4],
  },
  navTodosActivo: { backgroundColor: colores.marca },
  navTodosTexto: { fontFamily: fuentes.seminegrita, fontSize: 13, color: colores.marca },
  qrGrupo: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  qrGrupoItem: {
    width: "48.5%",
    alignItems: "center",
    gap: 5,
    padding: espaciado[3],
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
  },
  qrGrupoNombre: { fontFamily: fuentes.seminegrita, fontSize: 12.4, color: colores.texto, textAlign: "center" },
  qrGrupoAsiento: { fontFamily: fuentes.normal, fontSize: 11.4, color: colores.textoSuave, textAlign: "center" },
  pase: {
    borderRadius: 22,
    backgroundColor: "#fff",
    overflow: "hidden",
    ...sombras[3],
  },
  cabeza: { paddingHorizontal: espaciado[4], paddingTop: espaciado[4], paddingBottom: 20 },
  cabezaFila: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  marca: { fontFamily: fuentes.negrita, fontSize: 21, color: "#fff", letterSpacing: -0.6 },
  tren: { flex: 1, fontFamily: fuentes.seminegrita, fontSize: 14, color: "rgba(255,255,255,0.95)" },
  estado: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  estadoTexto: { fontFamily: fuentes.negrita, fontSize: 11.5, color: "#fff" },
  librea: { height: 6, backgroundColor: colores.accion },
  ruta: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[2],
    paddingHorizontal: espaciado[4],
    paddingTop: 20,
    paddingBottom: espaciado[4],
  },
  rutaLado: { flex: 1, minWidth: 0, gap: 1 },
  ciudad: {
    fontFamily: fuentes.negrita,
    fontSize: 26,
    lineHeight: 29,
    letterSpacing: -0.8,
    color: colores.titulo,
  },
  hora: { fontFamily: fuentes.negrita, fontSize: 20, color: colores.accion },
  estacion: { fontFamily: fuentes.normal, fontSize: 11.2, lineHeight: 15, color: colores.textoSuave },
  trayecto: { alignItems: "center", gap: 2, paddingHorizontal: 2 },
  trayectoDuracion: { fontFamily: fuentes.medio, fontSize: 10.4, color: colores.textoSuave, textAlign: "center" },
  datos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: espaciado[4],
    paddingBottom: 20,
  },
  dato: {
    width: "48.2%",
    gap: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 11,
    backgroundColor: "rgba(239,243,246,0.92)",
  },
  datoAncho: { width: "100%" },
  datoEtiqueta: {
    fontFamily: fuentes.negrita,
    fontSize: 9.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colores.textoSuave,
  },
  datoValor: { fontFamily: fuentes.negrita, fontSize: 13.6, color: colores.texto },
  corteCaja: { position: "relative", marginHorizontal: 18, height: 2, justifyContent: "center" },
  corte: { borderTopWidth: 2, borderTopColor: colores.borde, borderStyle: "dashed" },
  muescaIzquierda: {
    position: "absolute",
    left: -31,
    top: -12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f4e7ef",
  },
  muescaDerecha: {
    position: "absolute",
    right: -31,
    top: -12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f4e7ef",
  },
  pie: { alignItems: "center", paddingHorizontal: espaciado[4], paddingTop: 20, paddingBottom: espaciado[6] },
  qrCaja: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: espaciado[4],
    ...sombras[1],
  },
  pieEtiqueta: {
    fontFamily: fuentes.negrita,
    fontSize: 10,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: colores.textoSuave,
  },
  localizador: { fontFamily: fuentes.negrita, fontSize: 27, letterSpacing: 4.2, marginTop: 1 },
  nota: {
    fontFamily: fuentes.normal,
    fontSize: 12.6,
    lineHeight: 18,
    color: colores.textoSuave,
    textAlign: "center",
    maxWidth: 280,
    marginTop: espaciado[2],
  },
  acciones: { gap: espaciado[2], marginTop: espaciado[1] },
});
