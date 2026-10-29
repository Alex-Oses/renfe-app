import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { posicionesTrenes } from "@renfe/shared/api/cliente";
import { posicionesEn } from "@renfe/shared/api/simulado-tiempo-real";
import type { PosicionTren } from "@renfe/shared/api/tipos";
import { Cristal } from "@/components/Cristal";
import { Icono } from "@/components/Icono";
import { MapaTrenes } from "@/components/MapaTrenes";
import { colorTipo, colores, espaciado, estilos, fuentes, paleta, siglaTipo, sombraFlotante, sombras, tonos } from "@/tema";

const REFRESCO_MS = 7000;
const ESPERA_PRIMERA_MS = 12_000;
const ESPERA_RESTO_MS = 6000;

type Fuente = "cargando" | "real" | "simulado";

function conLimite<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((ok, ko) => {
    const t = setTimeout(() => ko(new Error("La API tarda demasiado en responder.")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        ok(v);
      },
      (e: Error) => {
        clearTimeout(t);
        ko(e);
      },
    );
  });
}

const sinTildes = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// "Madrid-Puerta de Atocha" → "Madrid"; respeta "A Coruña".
function ciudadCorta(estacion: string): string {
  if (!estacion) return "";
  const [base] = estacion.split("-");
  const [primera, segunda] = base.split(" ");
  return primera.length > 1 || !segunda ? primera : `${primera} ${segunda}`;
}

const horaCorta = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

function Retraso({ min, compacto }: { min: number; compacto?: boolean }) {
  const nivel = min === 0 ? "ok" : min <= 15 ? "medio" : "alto";
  const fondo = nivel === "ok" ? tonos.exitoFondo : nivel === "medio" ? tonos.avisoFondo : tonos.errorFondo;
  const color = nivel === "ok" ? tonos.exito : nivel === "medio" ? tonos.aviso : colores.error;
  return (
    <View style={[styles.retraso, { backgroundColor: fondo }, compacto && styles.retrasoCompacto]}>
      {min === 0 ? <View style={[styles.puntoEstado, { backgroundColor: color }]} /> : null}
      <Text style={[styles.retrasoTexto, { color }]}>{min === 0 ? "Puntual" : `+${min} min`}</Text>
    </View>
  );
}

export default function Directo() {
  const insets = useSafeAreaInsets();
  const [trenes, setTrenes] = useState<PosicionTren[]>([]);
  const [fuente, setFuente] = useState<Fuente>("cargando");
  const [avisoApi, setAvisoApi] = useState("");
  const [cargando, setCargando] = useState(true);
  const [ultima, setUltima] = useState<number | null>(null);
  const [ahora, setAhora] = useState(Date.now());
  const [filtro, setFiltro] = useState("");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);

  const vivo = useRef(true);
  const enVuelo = useRef(false);
  const fuenteRef = useRef<Fuente>("cargando");
  const trenesRef = useRef<PosicionTren[]>([]);
  const fallos = useRef(0);

  const cargar = useCallback(async (primera: boolean) => {
    if (enVuelo.current) return;
    enVuelo.current = true;
    try {
      const p = await conLimite(posicionesTrenes(), primera ? ESPERA_PRIMERA_MS : ESPERA_RESTO_MS);
      if (!vivo.current) return;
      trenesRef.current = p;
      setTrenes(p);
      setFuente("real");
      fuenteRef.current = "real";
      fallos.current = 0;
      setAvisoApi("");
      setUltima(Date.now());
    } catch {
      if (!vivo.current) return;
      fallos.current += 1;
      const yaHayReales = fuenteRef.current === "real";
      if (yaHayReales && fallos.current < 3) {
        setAvisoApi("No hemos podido actualizar la posición. Seguimos con la última conocida.");
      } else {
        const simulados = posicionesEn(Date.now());
        trenesRef.current = simulados;
        setTrenes(simulados);
        setFuente("simulado");
        fuenteRef.current = "simulado";
        setAvisoApi("La API de Renfe no responde. Mostramos trenes simulados y lo reintentamos cada pocos segundos.");
        setUltima(Date.now());
      }
    } finally {
      enVuelo.current = false;
      if (vivo.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    vivo.current = true;
    void cargar(true);
    const id = setInterval(() => void cargar(false), REFRESCO_MS);
    return () => {
      vivo.current = false;
      clearInterval(id);
    };
  }, [cargar]);

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const visibles = useMemo(() => {
    const q = sinTildes(filtro.trim());
    if (!q) return trenes;
    return trenes.filter((t) => sinTildes(`${t.numero} ${t.tipo} ${t.origen} ${t.destino} ${t.proximaParada} ${t.linea ?? ""}`).includes(q));
  }, [trenes, filtro]);

  const elegido = trenes.find((t) => t.trenId === seleccion);
  const hace = ultima === null ? null : Math.max(0, Math.round((ahora - ultima) / 1000));

  const elegir = (t: PosicionTren) => {
    setSeleccion(t.trenId);
    setAbierto(true);
  };

  const cerrarDetalle = () => {
    setSeleccion(null);
    setAbierto(false);
  };

  const alto: `${number}%` = seleccion ? "61%" : abierto ? "64%" : "43%";

  const colorFuente = fuente === "real" ? tonos.exito : fuente === "simulado" ? tonos.aviso : colores.textoSuave;
  const textoFuente = fuente === "real" ? "Tiempo real" : fuente === "simulado" ? "Simulados" : "Conectando";

  return (
    <View style={{ flex: 1 }}>
      <MapaTrenes trenes={trenes} seleccion={seleccion} onElegir={elegir} />

      <View style={[styles.superior, { top: insets.top + 8 }]} pointerEvents="box-none">
        <Cristal intensidad={55} padding={0} gap={0} style={styles.pastilla}>
          <View style={styles.pastillaFila}>
            <Text style={styles.marca}>Renfe</Text>
            <View style={styles.separadorVertical} />
            <View style={[styles.puntoVivo, { backgroundColor: colorFuente }]} />
            <Text style={styles.enDirecto}>En directo</Text>
            <View style={{ flex: 1 }} />
            {cargando ? <ActivityIndicator size="small" color={colores.marca} /> : null}
            <View style={[styles.fuentePastilla, { backgroundColor: `${colorFuente}18` }]}>
              <Text style={[styles.fuentePastillaTexto, { color: colorFuente }]}>{textoFuente}</Text>
            </View>
          </View>
        </Cristal>
      </View>

      <View style={[styles.hoja, { bottom: Math.max(insets.bottom, 8) + 82, height: alto }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={abierto ? "Bajar el panel" : "Subir el panel"}
          onPress={() => setAbierto((a) => !a)}
          style={styles.zonaAsa}
        >
          <View style={styles.asa} />
        </Pressable>

        <View style={styles.hojaCabecera}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.hojaTitulo} accessibilityRole="header">
              {elegido ? `${elegido.tipo} ${elegido.numero}` : "Trenes en circulación"}
            </Text>
            <Text style={estilos.suave} numberOfLines={1}>
              {elegido
                ? elegido.linea
                  ? `Línea ${elegido.linea} · ${elegido.origen || "origen sin datos"} → ${elegido.destino || "destino sin datos"}`
                  : elegido.origen
                    ? `${elegido.origen} → ${elegido.destino}`
                    : "Renfe aún no publica el recorrido de este tren"
                : `${visibles.length} de ${trenes.length} trenes · ${hace === null ? "conectando…" : `actualizado hace ${hace} s`}`}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={seleccion ? "Cerrar detalle" : abierto ? "Bajar el panel" : "Subir el panel"}
            onPress={seleccion ? cerrarDetalle : () => setAbierto((a) => !a)}
            style={({ pressed }) => [styles.botonRedondo, pressed && { backgroundColor: tonos.rosaFuerte }]}
          >
            <Icono nombre={seleccion ? "cerrar" : abierto ? "chevron" : "atras"} tamano={19} color={colores.marca} />
          </Pressable>
        </View>

        {avisoApi ? (
          <View style={styles.avisoApi}>
            <Icono nombre="info" tamano={15} color={tonos.aviso} />
            <Text style={styles.avisoApiTexto}>{avisoApi}</Text>
          </View>
        ) : null}

        {seleccion ? (
          elegido ? (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.detalle}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.detalleCabecera}>
                <View style={[styles.tipoGrande, { backgroundColor: colorTipoDe(elegido.tipo) }]}>
                  <Text style={styles.tipoGrandeTexto}>{elegido.tipo}</Text>
                </View>
                <Retraso min={elegido.retrasoMin} />
              </View>

              {elegido.progreso > 0 ? (
                <View style={styles.progresoCaja} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(elegido.progreso * 100) }}>
                  <View style={[styles.progreso, { width: `${Math.round(elegido.progreso * 100)}%`, backgroundColor: colorTipoDe(elegido.tipo) }]} />
                </View>
              ) : null}

              <View style={styles.datosViaje}>
                {elegido.origen ? (
                  <View style={styles.datoFila}>
                    <Text style={styles.datoEtiqueta}>Sale de</Text>
                    <Text style={styles.datoValor}>{elegido.origen}</Text>
                  </View>
                ) : null}
                {elegido.destino ? (
                  <View style={styles.datoFila}>
                    <Text style={styles.datoEtiqueta}>Va a</Text>
                    <Text style={styles.datoValor}>
                      {elegido.destino}
                      {elegido.llegadaDestino ? ` · ${horaCorta(elegido.llegadaDestino)}` : ""}
                    </Text>
                  </View>
                ) : null}
                {elegido.proximaParada ? (
                  <View style={styles.datoFila}>
                    <Text style={styles.datoEtiqueta}>Próxima parada</Text>
                    <Text style={styles.datoValor}>
                      {elegido.proximaParada}
                      {elegido.llegadaProxima ? ` · ${horaCorta(elegido.llegadaProxima)}` : ""}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.datoFila}>
                  <Text style={styles.datoEtiqueta}>Última señal</Text>
                  <Text style={styles.datoValor}>{horaCorta(elegido.actualizado)}</Text>
                </View>
              </View>

              {elegido.paradas.length > 0 ? (
                <View style={{ gap: espaciado[2] }}>
                  <Text style={estilos.subtitulo}>Paradas del recorrido</Text>
                  <View>
                    {elegido.paradas.map((p, i) => {
                      const min = Math.max(0, Math.round((Date.parse(p.llegada) - ahora) / 60_000));
                      return (
                        <View key={`${p.estacionId}-${i}`} style={[styles.parada, p.pasada && { opacity: 0.5 }]}>
                          <View style={styles.paradaVia}>
                            <View style={[styles.paradaPunto, { borderColor: colorTipoDe(elegido.tipo) }, p.pasada && { backgroundColor: colorTipoDe(elegido.tipo) }]} />
                            {i < elegido.paradas.length - 1 ? <View style={styles.paradaLinea} /> : null}
                          </View>
                          <View style={{ flex: 1, paddingBottom: espaciado[3] }}>
                            <Text style={styles.paradaNombre}>{p.nombre}</Text>
                            <Text style={estilos.suave}>
                              {horaCorta(p.llegada)} · {p.pasada ? "pasada" : min === 0 ? "llegando" : `en ${min} min`}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <Text style={estilos.suave}>Renfe todavía no publica las paradas de este tren en tiempo real.</Text>
              )}

              <View style={{ flexDirection: "row", gap: espaciado[2] }}>
                <Pressable
                  accessibilityRole="button"
                  onPress={cerrarDetalle}
                  style={({ pressed }) => [estilos.botonSecundario, { flex: 1 }, pressed && { opacity: 0.72 }]}
                >
                  <Text style={estilos.botonTextoSecundario}>Volver a la lista</Text>
                </Pressable>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.detalleVacio}>
              <Text style={estilos.subtitulo}>Este tren ya no está circulando</Text>
              <Text style={estilos.texto}>Puede que haya llegado a su destino o que la API haya actualizado las posiciones.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={cerrarDetalle}
                style={({ pressed }) => [estilos.botonSecundario, pressed && { opacity: 0.72 }]}
              >
                <Text style={estilos.botonTextoSecundario}>Ver todos los trenes</Text>
              </Pressable>
            </View>
          )
        ) : (
          <>
            <View style={styles.buscadorCaja}>
              <Icono nombre="mapa" tamano={18} color={colores.textoSuave} />
              <TextInput
                value={filtro}
                onChangeText={setFiltro}
                placeholder="Busca AVE, 3021, Sevilla…"
                placeholderTextColor="#8a8a8a"
                returnKeyType="search"
                autoCapitalize="none"
                style={styles.buscador}
                accessibilityLabel="Buscar tren por número, tipo o ciudad"
              />
              {filtro ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Borrar búsqueda" onPress={() => setFiltro("")} hitSlop={8}>
                  <Icono nombre="cerrar" tamano={17} color={colores.textoSuave} />
                </Pressable>
              ) : null}
            </View>

            <FlatList
              data={visibles}
              keyExtractor={(t) => t.trenId}
              style={{ flex: 1, marginTop: espaciado[2] }}
              contentContainerStyle={{ gap: 5, paddingBottom: espaciado[3] }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={10}
              windowSize={7}
              ListEmptyComponent={
                <View style={styles.vacioLista}>
                  <Text style={estilos.subtitulo}>{trenes.length ? "Ningún tren coincide" : "Buscando trenes…"}</Text>
                  <Text style={estilos.suave}>
                    {trenes.length ? "Prueba con otro número, tipo o ciudad." : "En cuanto lleguen las posiciones aparecerán aquí."}
                  </Text>
                </View>
              }
              renderItem={({ item: t }) => {
                const activo = t.trenId === seleccion;
                const ruta =
                  t.origen && t.destino
                    ? `${ciudadCorta(t.origen)} → ${ciudadCorta(t.destino)}`
                    : t.proximaParada
                      ? `Próxima: ${t.proximaParada}`
                      : "Posición en tiempo real";
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: activo }}
                    accessibilityLabel={`${t.tipo} ${t.numero}. ${ruta}. ${t.retrasoMin ? `Retraso de ${t.retrasoMin} minutos` : "Puntual"}`}
                    onPress={() => elegir(t)}
                    style={({ pressed }) => [styles.filaTren, activo && styles.filaTrenActiva, pressed && { backgroundColor: "rgba(129,0,94,0.06)" }]}
                  >
                    <View style={[styles.sigla, { backgroundColor: colorTipoDe(t.tipo) }]}>
                      <Text style={styles.siglaTexto}>{siglaDe(t.tipo)}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                      <Text style={styles.filaTitulo} numberOfLines={1}>
                        {t.numero} · {ruta}
                      </Text>
                      <Text style={estilos.suave} numberOfLines={1}>
                        {t.proximaParada && t.origen
                          ? `Próxima: ${t.proximaParada}${t.llegadaProxima ? ` · ${horaCorta(t.llegadaProxima)}` : ""}`
                          : t.linea
                            ? `Línea ${t.linea}`
                            : "Señal GPS recibida"}
                      </Text>
                    </View>
                    <Retraso min={t.retrasoMin} compacto />
                  </Pressable>
                );
              }}
            />
          </>
        )}
      </View>
    </View>
  );
}

// Igual que COLOR_TIPO/SIGLA_TIPO de la web; se importan de tema para no duplicar la paleta.
const colorTipoDe = (t: PosicionTren["tipo"]) => colorTipo[t];
const siglaDe = (t: PosicionTren["tipo"]) => siglaTipo[t];

const styles = StyleSheet.create({
  superior: {
    position: "absolute",
    left: espaciado[3],
    right: espaciado[3],
    zIndex: 30,
  },
  pastilla: { borderRadius: 999, ...sombraFlotante },
  pastillaFila: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: espaciado[3],
  },
  marca: { fontFamily: fuentes.negrita, fontSize: 19, color: paleta.morado, letterSpacing: -0.8 },
  separadorVertical: { width: 1, height: 18, backgroundColor: "rgba(129,0,94,0.16)", marginHorizontal: 1 },
  puntoVivo: { width: 7, height: 7, borderRadius: 4 },
  enDirecto: { fontFamily: fuentes.seminegrita, fontSize: 12.5, color: colores.texto },
  fuentePastilla: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  fuentePastillaTexto: { fontFamily: fuentes.seminegrita, fontSize: 10.5 },

  hoja: {
    position: "absolute",
    left: espaciado[3],
    right: espaciado[3],
    zIndex: 25,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 26,
    paddingHorizontal: espaciado[4],
    paddingBottom: espaciado[3],
    overflow: "hidden",
    ...sombras[3],
  },
  zonaAsa: { alignItems: "center", paddingTop: 7, paddingBottom: 4 },
  asa: { width: 40, height: 4.5, borderRadius: 3, backgroundColor: "rgba(129,0,94,0.19)" },
  hojaCabecera: { flexDirection: "row", alignItems: "center", gap: espaciado[2], paddingBottom: espaciado[2] },
  hojaTitulo: { fontFamily: fuentes.negrita, fontSize: 18, color: colores.titulo, letterSpacing: -0.3 },
  botonRedondo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(129,0,94,0.06)",
  },
  avisoApi: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: tonos.avisoFondo,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginBottom: espaciado[2],
  },
  avisoApiTexto: { flex: 1, fontFamily: fuentes.medio, fontSize: 10.8, lineHeight: 14.5, color: tonos.aviso },
  buscadorCaja: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[2],
    minHeight: 44,
    paddingHorizontal: espaciado[3],
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  buscador: { flex: 1, fontFamily: fuentes.normal, fontSize: 14.5, color: colores.texto, paddingVertical: 0 },
  vacioLista: { paddingVertical: espaciado[6], gap: espaciado[2] },
  filaTren: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[3],
    minHeight: 54,
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filaTrenActiva: { backgroundColor: tonos.rosa, borderColor: "rgba(129,0,94,0.22)" },
  sigla: { minWidth: 42, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 3, alignItems: "center" },
  siglaTexto: { fontFamily: fuentes.negrita, fontSize: 10.5, color: "#fff" },
  filaTitulo: { fontFamily: fuentes.seminegrita, fontSize: 13.4, color: colores.texto },
  retraso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  retrasoCompacto: { paddingHorizontal: 6, paddingVertical: 2.5 },
  retrasoTexto: { fontFamily: fuentes.negrita, fontSize: 10.8 },
  puntoEstado: { width: 5, height: 5, borderRadius: 3 },

  detalle: { gap: espaciado[3], paddingBottom: espaciado[3] },
  detalleCabecera: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: espaciado[2] },
  tipoGrande: { borderRadius: 7, paddingHorizontal: 9, paddingVertical: 4 },
  tipoGrandeTexto: { fontFamily: fuentes.negrita, fontSize: 12, color: "#fff" },
  progresoCaja: { height: 7, borderRadius: 4, backgroundColor: "rgba(129,0,94,0.10)", overflow: "hidden" },
  progreso: { height: "100%", borderRadius: 4 },
  datosViaje: { borderRadius: 12, backgroundColor: "rgba(239,243,246,0.85)", paddingHorizontal: espaciado[3], paddingVertical: 4 },
  datoFila: { flexDirection: "row", alignItems: "baseline", gap: espaciado[3], paddingVertical: 6 },
  datoEtiqueta: { width: 98, fontFamily: fuentes.medio, fontSize: 11.5, color: colores.textoSuave },
  datoValor: { flex: 1, fontFamily: fuentes.seminegrita, fontSize: 13, color: colores.texto },
  parada: { flexDirection: "row", gap: espaciado[2] },
  paradaVia: { width: 14, alignItems: "center" },
  paradaPunto: { width: 12, height: 12, borderRadius: 6, borderWidth: 2.6, backgroundColor: "#fff", marginTop: 3 },
  paradaLinea: { flex: 1, width: 2, backgroundColor: "rgba(129,0,94,0.15)", marginVertical: 1 },
  paradaNombre: { fontFamily: fuentes.seminegrita, fontSize: 13, color: colores.texto },
  detalleVacio: { flex: 1, justifyContent: "center", gap: espaciado[3], paddingBottom: espaciado[4] },
});
