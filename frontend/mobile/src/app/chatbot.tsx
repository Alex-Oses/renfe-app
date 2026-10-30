import { router } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { aTren, nombreDeTren } from "@renfe/shared/api/adaptador-trenes";
import { enviarMensajeChatbot } from "@renfe/shared/api/cliente";
import type { RespuestaChatbot, TrenApi } from "@renfe/shared/api/tipos";
import { Boton } from "@/components/Boton";
import { Cristal } from "@/components/Cristal";
import { Pantalla } from "@/components/Pantalla";
import { euros, hora } from "@/formato";
import { colores, espaciado, estilos, fuentes, radios, sombraSuave, tonos } from "@/tema";

type Mensaje = {
  id: number;
  autor: "usuario" | "asistente";
  texto: string;
  trenes?: TrenApi[];
};

const SALUDO: Mensaje = {
  id: 0,
  autor: "asistente",
  texto: "¡Hola! Puedo ayudarte a encontrar trenes, estaciones y horarios.",
};

const duracion = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;

function TextoAsistente({ texto }: { texto: string }) {
  const bloques = texto.split(/\n{2,}/).filter(Boolean);
  return (
    <View style={styles.textoBloques}>
      {(bloques.length ? bloques : [texto]).map((bloque, i) => {
        const lineas = bloque.split("\n").filter(Boolean);
        const lista = lineas.every((linea) => /^[-*]\s/.test(linea));
        return lista ? (
          <View key={i} style={styles.lista}>
            {lineas.map((linea, j) => (
              <Text key={j} style={estilos.texto}>
                • {linea.replace(/^[-*]\s/, "")}
              </Text>
            ))}
          </View>
        ) : (
          <Text key={i} style={estilos.texto}>
            {lineas.join(" ")}
          </Text>
        );
      })}
    </View>
  );
}

function TarjetaTren({ tren }: { tren: TrenApi }) {
  const t = aTren(tren);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${nombreDeTren(t)} de ${t.origen.nombre} a ${t.destino.nombre}`}
      onPress={() =>
        router.push({
          pathname: "/pasajero",
          params: { trenId: t.id, pasajeros: "1", adultos: "1", ninos: "0", bebes: "0", descuento: "ninguno", tarifa: "basica" },
        })
      }
      style={({ pressed }) => [styles.tren, pressed && { opacity: 0.72 }]}
    >
      <View style={styles.trenCabecera}>
        <Text style={styles.trenNombre}>{nombreDeTren(t)}</Text>
        <Text style={styles.trenPrecio}>{euros(t.precioDesde)}</Text>
      </View>
      <Text style={estilos.suave} numberOfLines={1}>
        {t.origen.nombre} → {t.destino.nombre}
      </Text>
      <Text style={styles.trenHoras}>
        {hora(t.salida)} → {hora(t.llegada)} · {duracion(t.duracionMin ?? 0)}
      </Text>
      <Text style={styles.verTren}>Ver tren y continuar ›</Text>
    </Pressable>
  );
}

export default function Chatbot() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([SALUDO]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>();
  const siguienteId = useRef(1);

  const enviar = async () => {
    const mensaje = texto.trim();
    if (!mensaje || cargando) return;
    setTexto("");
    setError(null);
    setMensajes((actuales) => [...actuales, { id: siguienteId.current++, autor: "usuario", texto: mensaje }]);
    setCargando(true);
    try {
      const respuesta: RespuestaChatbot = await enviarMensajeChatbot(mensaje, conversationId);
      setConversationId(respuesta.conversationId);
      setMensajes((actuales) => [
        ...actuales,
        { id: siguienteId.current++, autor: "asistente", texto: respuesta.respuesta, trenes: respuesta.trenes },
      ]);
    } catch (razon) {
      setError(razon instanceof Error ? razon.message : "No se ha podido contactar con el asistente.");
    } finally {
      setCargando(false);
    }
  };

  const nueva = () => {
    setMensajes([SALUDO]);
    setConversationId(undefined);
    setError(null);
    setTexto("");
  };

  return (
    <Pantalla volver={() => router.back()} scroll={false} contenido={styles.contenido}>
      <View style={styles.cabecera}>
        <View>
          <Text style={estilos.h1}>Asistente Renfe</Text>
          <Text style={estilos.suave}>Trenes, estaciones y horarios en un solo lugar.</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={nueva} style={styles.nueva}>
          <Text style={styles.nuevaTexto}>Nueva</Text>
        </Pressable>
      </View>

      <FlatList
        data={mensajes}
        keyExtractor={(item) => String(item.id)}
        style={styles.listaMensajes}
        contentContainerStyle={styles.mensajes}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={[styles.burbuja, item.autor === "usuario" ? styles.usuario : styles.asistente]}>
            {item.autor === "usuario" ? <Text style={styles.usuarioTexto}>{item.texto}</Text> : <TextoAsistente texto={item.texto} />}
            {item.trenes?.length ? (
              <View style={styles.trenes}>
                {item.trenes.map((tren) => <TarjetaTren key={tren.id} tren={tren} />)}
              </View>
            ) : null}
          </View>
        )}
        ListFooterComponent={
          <>
            {cargando ? (
              <View style={[styles.burbuja, styles.asistente]}>
                <Text style={estilos.suave}>Analizando tu pregunta…</Text>
              </View>
            ) : null}
            {error ? <Text style={estilos.error}>{error}</Text> : null}
          </>
        }
      />

      <Cristal padding={espaciado[2]} gap={espaciado[2]} style={styles.compositor}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          onSubmitEditing={enviar}
          editable={!cargando}
          placeholder="Pregunta por un tren o estación…"
          placeholderTextColor={colores.textoSuave}
          returnKeyType="send"
          multiline
          maxLength={500}
          style={styles.entrada}
          accessibilityLabel="Pregunta al asistente"
        />
        <Boton texto="Enviar" compacto onPress={enviar} cargando={cargando} desactivado={!texto.trim()} />
      </Cristal>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  contenido: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 12, gap: espaciado[2] },
  cabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: espaciado[2] },
  nueva: { borderWidth: 1, borderColor: colores.marca, borderRadius: radios.pildora, paddingHorizontal: 14, paddingVertical: 9 },
  nuevaTexto: { fontFamily: fuentes.seminegrita, color: colores.marca, fontSize: 14 },
  listaMensajes: { flex: 1 },
  mensajes: { gap: espaciado[3], paddingVertical: espaciado[2] },
  burbuja: { maxWidth: "92%", borderRadius: radios.grande, padding: espaciado[3], gap: espaciado[2] },
  usuario: { alignSelf: "flex-end", backgroundColor: colores.marca, borderBottomRightRadius: radios.normal },
  asistente: { alignSelf: "flex-start", backgroundColor: tonos.cristal, borderWidth: 1, borderColor: tonos.bordeCristal, ...sombraSuave },
  usuarioTexto: { fontFamily: fuentes.normal, color: "#fff", fontSize: 16, lineHeight: 23 },
  textoBloques: { gap: espaciado[2] },
  lista: { gap: 5 },
  trenes: { gap: espaciado[2], marginTop: 3 },
  tren: { backgroundColor: "#fff", borderRadius: radios.normal, padding: espaciado[3], gap: 4, ...sombraSuave },
  trenCabecera: { flexDirection: "row", justifyContent: "space-between", gap: espaciado[2] },
  trenNombre: { fontFamily: fuentes.seminegrita, color: colores.marca, fontSize: 16 },
  trenPrecio: { fontFamily: fuentes.negrita, color: colores.titulo },
  trenHoras: { fontFamily: fuentes.medio, color: colores.texto, fontSize: 14 },
  verTren: { fontFamily: fuentes.seminegrita, color: colores.accion, fontSize: 13, marginTop: 4 },
  compositor: { flexDirection: "row", alignItems: "flex-end", marginBottom: 2 },
  entrada: { flex: 1, maxHeight: 90, minHeight: 42, fontFamily: fuentes.normal, fontSize: 16, color: colores.texto, paddingHorizontal: 8, paddingVertical: 9 },
});
