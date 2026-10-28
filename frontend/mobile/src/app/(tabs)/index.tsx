import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { buscarEstaciones, buscarTrenes } from "@renfe/shared/api/cliente";
import { ciudadDe, type Estacion, type Tren } from "@renfe/shared/api/tipos";
import { Boton } from "@/components/Boton";
import { euros, hoyIso, hora } from "@/formato";
import { colores, espaciado, estilos, fuentes, radios, tipografia } from "@/tema";

export default function Comprar() {
  const [origen, setOrigen] = useState<Estacion | null>(null);
  const [destino, setDestino] = useState<Estacion | null>(null);
  const [fecha, setFecha] = useState(hoyIso());
  const [trenes, setTrenes] = useState<Tren[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const buscar = async () => {
    if (!origen || !destino) return setError("Elige origen y destino.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return setError("La fecha va como AAAA-MM-DD.");
    setError("");
    setCargando(true);
    try {
      setTrenes(await buscarTrenes({ origen: origen.id, destino: destino.id, fecha }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <FlatList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      keyboardShouldPersistTaps="handled"
      data={trenes ?? []}
      keyExtractor={(t) => t.id}
      ListHeaderComponent={
        <View style={{ gap: espaciado[3] }}>
          <Text style={estilos.titulo}>¿A dónde vas?</Text>
          <View style={estilos.tarjeta}>
            <CampoEstacion etiqueta="Origen" valor={origen} onElegir={setOrigen} />
            <CampoEstacion etiqueta="Destino" valor={destino} onElegir={setDestino} />
            <Text style={estilos.suave}>Fecha</Text>
            <TextInput style={estilos.campo} value={fecha} onChangeText={setFecha} placeholder="AAAA-MM-DD" accessibilityLabel="Fecha" />
            {error ? <Text style={estilos.error}>{error}</Text> : null}
            <Boton texto="Buscar trenes" onPress={buscar} cargando={cargando} />
          </View>
          {trenes && <Text style={estilos.subtitulo}>{trenes.length ? `${trenes.length} trenes` : "No hay trenes ese día."}</Text>}
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: espaciado[3] }} />}
      renderItem={({ item: t }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: "/pasajero", params: { trenId: t.id } })}
          style={({ pressed }) => [estilos.tarjeta, { flexDirection: "row", alignItems: "center" }, pressed && { opacity: 0.8 }]}
        >
          <View style={{ flex: 1, gap: espaciado[1] }}>
            <Text style={[estilos.subtitulo, { fontSize: tipografia.tamanos.lg }]}>
              {hora(t.salida)} → {hora(t.llegada)}
            </Text>
            <Text style={estilos.suave}>
              {t.tipo} {t.numero} · {ciudadDe(t.origen)} → {ciudadDe(t.destino)}
            </Text>
          </View>
          <Text style={{ fontFamily: fuentes.negrita, fontSize: tipografia.tamanos.lg, color: colores.marca }}>
            {euros(t.precioDesde)}
          </Text>
        </Pressable>
      )}
    />
  );
}

function CampoEstacion({ etiqueta, valor, onElegir }: { etiqueta: string; valor: Estacion | null; onElegir: (e: Estacion) => void }) {
  const [texto, setTexto] = useState("");
  const [opciones, setOpciones] = useState<Estacion[]>([]);
  useEffect(() => {
    if (texto.length < 2 || texto === valor?.nombre) return setOpciones([]);
    let vivo = true;
    buscarEstaciones(texto).then((l) => vivo && setOpciones(l.slice(0, 5)), () => vivo && setOpciones([]));
    return () => {
      vivo = false;
    };
  }, [texto, valor]);

  return (
    <View style={{ gap: espaciado[1] }}>
      <Text style={estilos.suave}>{etiqueta}</Text>
      <TextInput style={estilos.campo} value={texto} onChangeText={setTexto} placeholder="Ciudad o estación" accessibilityLabel={etiqueta} />
      {opciones.map((e) => (
        <Pressable
          key={e.id}
          accessibilityRole="button"
          onPress={() => {
            onElegir(e);
            setTexto(e.nombre);
          }}
          style={({ pressed }) => ({
            padding: espaciado[3],
            borderRadius: radios.normal,
            backgroundColor: pressed ? colores.resalte : colores.fondo,
          })}
        >
          <Text style={estilos.texto}>{e.nombre}</Text>
          <Text style={estilos.suave}>{e.ciudad}</Text>
        </Pressable>
      ))}
    </View>
  );
}
