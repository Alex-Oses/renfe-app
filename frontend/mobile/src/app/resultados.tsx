import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { buscarTrenes, usaDatosSimulados } from "@renfe/shared/api/cliente";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import { TARIFAS, precioViajero } from "@renfe/shared/api/simulado-precios";
import { ciudadDe, type IdDescuento, type IdTarifa, type TipoTren, type Tren } from "@renfe/shared/api/tipos";
import { Aviso } from "@/components/Aviso";
import { Buscador, type Criterios } from "@/components/Buscador";
import { Cristal } from "@/components/Cristal";
import { Icono } from "@/components/Icono";
import { Pantalla } from "@/components/Pantalla";
import { textoFecha, textoFechaCorta } from "@/components/Selectores";
import { euros, hora } from "@/formato";
import { colores, espaciado, estilos, fuentes, gradientes, radios, sombras, tipografia, tonos } from "@/tema";
import { LinearGradient } from "expo-linear-gradient";

const FRANJAS = [
  { id: "manana", texto: "Mañana", desde: 0, hasta: 12 * 60 },
  { id: "tarde", texto: "Tarde", desde: 12 * 60, hasta: 18 * 60 },
  { id: "noche", texto: "Noche", desde: 18 * 60, hasta: 24 * 60 },
] as const;
const ORDENES = [
  { id: "hora", texto: "Hora" },
  { id: "precio", texto: "Precio" },
  { id: "duracion", texto: "Duración" },
] as const;
type Orden = (typeof ORDENES)[number]["id"];

const minutos = (iso: string) => {
  const m = /T(\d{2}):(\d{2})/.exec(iso);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
};
const duracion = (t: Tren) => (new Date(t.llegada).getTime() - new Date(t.salida).getTime()) / 60_000;
const textoDuracion = (min: number) =>
  min < 60 ? `${Math.round(min)} min` : `${Math.floor(min / 60)} h ${String(Math.round(min % 60)).padStart(2, "0")}`;
const hoyIso = () => new Date().toISOString().slice(0, 10);
const moverDia = (fecha: string, dias: number) => {
  const f = new Date(`${fecha}T12:00:00`);
  f.setDate(f.getDate() + dias);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
};
const fechaLarga = (fecha: string) => {
  const t = textoFecha(fecha);
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const alternar = <T,>(lista: T[], v: T) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);

export default function Resultados() {
  const params = useLocalSearchParams<Record<string, string>>();
  const origen = params.origen ?? "";
  const destino = params.destino ?? "";
  const fechaUrl = /^\d{4}-\d{2}-\d{2}$/.test(params.fecha ?? "") ? params.fecha! : hoyIso();
  const ninos = Math.max(Number(params.ninos) || 0, 0);
  const adultos = Math.max(Number(params.adultos) || Math.max((Number(params.pasajeros) || 1) - ninos, 1), 1);
  const bebes = Math.max(Number(params.bebes) || 0, 0);
  const pasajeros = Math.min(adultos + ninos, 9);
  const descuento = (params.descuento ?? "ninguno") as IdDescuento;
  const vuelta = params.vuelta ?? "";

  const [fecha, setFecha] = useState(fechaUrl);
  useEffect(() => setFecha(fechaUrl), [fechaUrl]);

  const [trenes, setTrenes] = useState<Tren[] | null>(null);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const [tipos, setTipos] = useState<TipoTren[]>([]);
  const [franjas, setFranjas] = useState<string[]>([]);
  const [orden, setOrden] = useState<Orden>("hora");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [preciosDia, setPreciosDia] = useState<Record<string, number | null>>({});

  const desconocidas = (usaDatosSimulados ? [origen, destino] : []).filter((id) => !ESTACIONES.some((e) => e.id === id));

  useEffect(() => {
    if (!origen || !destino) return;
    let vivo = true;
    setTrenes(null);
    setError("");
    buscarTrenes({ origen, destino, fecha }).then(
      (l) => vivo && setTrenes(l),
      (e: Error) => vivo && setError(e.message),
    );
    return () => {
      vivo = false;
    };
  }, [origen, destino, fecha, intento]);

  useEffect(() => {
    if (!origen || !destino) return;
    let vivo = true;
    const dias = [-3, -2, -1, 0, 1, 2, 3].map((d) => moverDia(fecha, d));
    Promise.all(dias.map((f) => buscarTrenes({ origen, destino, fecha: f }).catch(() => [] as Tren[]))).then((rs) => {
      if (!vivo) return;
      const libres = (ts: Tren[]) => ts.filter((t) => t.plazasLibres >= pasajeros).map((t) => t.precioDesde);
      setPreciosDia(
        Object.fromEntries(
          dias.map((f, i) => [f, libres(rs[i]).length ? Math.min(...libres(rs[i])) : null] as const),
        ),
      );
    });
    return () => {
      vivo = false;
    };
  }, [origen, destino, fecha, pasajeros]);

  const tiposDisponibles = useMemo(() => [...new Set((trenes ?? []).map((t) => t.tipo))], [trenes]);
  const visibles = useMemo(
    () =>
      (trenes ?? [])
        .filter((t) => !tipos.length || tipos.includes(t.tipo))
        .filter(
          (t) =>
            !franjas.length ||
            FRANJAS.some((f) => franjas.includes(f.id) && minutos(t.salida) >= f.desde && minutos(t.salida) < f.hasta),
        )
        .sort((a, b) => {
          if (orden === "precio") return a.precioDesde - b.precioDesde;
          if (orden === "duracion") return duracion(a) - duracion(b);
          return a.salida.localeCompare(b.salida);
        }),
    [trenes, tipos, franjas, orden],
  );
  const inicio = trenes?.length ? Math.min(...trenes.map((t) => minutos(t.salida))) : 0;
  const fin = trenes?.length ? Math.max(...trenes.map((t) => minutos(t.salida) + duracion(t))) : 1;
  const origenNombre = ESTACIONES.find((e) => e.id === origen);
  const destinoNombre = ESTACIONES.find((e) => e.id === destino);
  const semanas = [-3, -2, -1, 0, 1, 2, 3].map((d) => moverDia(fecha, d));
  const hoy = hoyIso();

  const buscar = (c: Criterios) =>
    router.replace({
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

  const elegirTarifa = (tren: Tren, tarifa: IdTarifa) =>
    router.push({
      pathname: "/pasajero",
      params: {
        trenId: tren.id,
        pasajeros: String(pasajeros),
        adultos: String(adultos),
        ninos: String(ninos),
        bebes: String(bebes),
        descuento,
        tarifa,
        ...(vuelta ? { vuelta } : {}),
      },
    });

  return (
    <Pantalla volver={() => router.back()}>
      <Cristal padding={espaciado[4]} gap={espaciado[3]}>
        <Buscador
          key={`${origen}-${destino}-${fecha}-${adultos}-${ninos}-${bebes}-${descuento}-${vuelta}`}
          inicial={{
            origen,
            destino,
            fecha,
            adultos,
            ninos,
            bebes,
            descuento,
            vuelta: vuelta || undefined,
          }}
          onBuscar={buscar}
        />
      </Cristal>

      <View style={{ gap: espaciado[1], paddingHorizontal: espaciado[1] }}>
        <Text style={estilos.h1} accessibilityRole="header">
          {origenNombre && destinoNombre
            ? `${ciudadDe(origenNombre)} a ${ciudadDe(destinoNombre)}`
            : "Trenes"}
        </Text>
        <Text style={estilos.suave}>
          {fechaLarga(fecha)} · {pasajeros} {pasajeros === 1 ? "pasajero" : "pasajeros"}
          {ninos > 0 ? ` (${ninos} ${ninos === 1 ? "niño" : "niños"})` : ""}
          {bebes > 0 ? ` · ${bebes} ${bebes === 1 ? "bebé" : "bebés"}` : ""}
        </Text>
      </View>

      {desconocidas.length > 0 ? (
        <Aviso
          tipo="aviso"
          texto={`No reconocemos ${desconocidas.map((x) => `«${x || "(vacío)"}»`).join(" ni ")} como estación. Vuelve a elegirla en el buscador.`}
        />
      ) : null}

      <View style={{ gap: espaciado[2] }}>
        <View style={estilos.entre}>
          <Text style={estilos.subtitulo}>Precios por día</Text>
          <View style={{ flexDirection: "row", gap: espaciado[2] }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Día anterior"
              onPress={() => setFecha(moverDia(fecha, -1))}
              style={({ pressed }) => [styles.flechaDia, pressed && { backgroundColor: tonos.rosaFuerte }]}
            >
              <Icono nombre="atras" tamano={18} color={colores.marca} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Día siguiente"
              onPress={() => setFecha(moverDia(fecha, 1))}
              style={({ pressed }) => [styles.flechaDia, pressed && { backgroundColor: tonos.rosaFuerte }]}
            >
              <Icono nombre="delante" tamano={18} color={colores.marca} />
            </Pressable>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: espaciado[2] }}>
          {semanas.map((f) => {
            if (f < hoy) return null;
            const activo = f === fecha;
            const p = preciosDia[f];
            return (
              <Pressable
                key={f}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                onPress={() => setFecha(f)}
                style={({ pressed }) => [
                  styles.dia,
                  activo && { backgroundColor: colores.marca, borderColor: colores.marca },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.diaTexto, activo && { color: "rgba(255,255,255,0.86)" }]}>{textoFechaCorta(f)}</Text>
                <Text style={[styles.diaPrecio, activo && { color: "#fff" }]}>
                  {p === undefined ? "…" : p === null ? "Sin plazas" : `desde ${euros(p)}`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {trenes && trenes.length > 0 ? (
        <View style={{ gap: espaciado[3] }}>
          <View style={{ gap: espaciado[2] }}>
            <View style={styles.grupo}>
              {tiposDisponibles.map((t) => (
                <Pressable
                  key={t}
                  accessibilityRole="button"
                  accessibilityState={{ selected: tipos.includes(t) }}
                  onPress={() => setTipos((s) => alternar(s, t))}
                  style={({ pressed }) => [
                    estilos.chip,
                    tipos.includes(t) && estilos.chipActivo,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Text style={[estilos.chipTexto, tipos.includes(t) && estilos.chipTextoActivo]}>{t}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.grupo}>
              {FRANJAS.map((f) => (
                <Pressable
                  key={f.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: franjas.includes(f.id) }}
                  onPress={() => setFranjas((s) => alternar(s, f.id))}
                  style={({ pressed }) => [
                    estilos.chip,
                    franjas.includes(f.id) && estilos.chipActivo,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Text style={[estilos.chipTexto, franjas.includes(f.id) && estilos.chipTextoActivo]}>{f.texto}</Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.grupo, { alignItems: "center" }]}>
              <Text style={[estilos.etiqueta, { marginRight: 2 }]}>Ordenar por</Text>
              {ORDENES.map((o) => (
                <Pressable
                  key={o.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: orden === o.id }}
                  onPress={() => setOrden(o.id)}
                  style={({ pressed }) => [
                    estilos.chip,
                    orden === o.id && estilos.chipActivo,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Text style={[estilos.chipTexto, orden === o.id && estilos.chipTextoActivo]}>{o.texto}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {visibles.length === 0 ? (
            <Cristal padding={espaciado[5 as 4]} gap={espaciado[3]}>
              <Text style={estilos.subtitulo}>Ningún tren cumple los filtros</Text>
              <Text style={estilos.texto}>Quita algún filtro para ver todos los trenes del día.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setTipos([]);
                  setFranjas([]);
                }}
                style={({ pressed }) => [estilos.botonSecundario, pressed && { opacity: 0.7 }]}
              >
                <Text style={estilos.botonTextoSecundario}>Quitar filtros</Text>
              </Pressable>
            </Cristal>
          ) : (
            <View style={styles.lista}>
              {visibles.map((t, i) => {
                const dur = duracion(t);
                const izquierda = ((minutos(t.salida) - inicio) / Math.max(fin - inicio, 1)) * 100;
                const ancho = Math.max((dur / Math.max(fin - inicio, 1)) * 100, 6);
                const completo = t.plazasLibres < pasajeros;
                const expandido = abierto === t.id;
                return (
                  <View key={t.id} style={[styles.filaTren, i > 0 && styles.filaTrenBorde]}>
                    <View style={styles.horas}>
                      <Text style={[styles.hora, completo && { opacity: 0.45 }]}>{hora(t.salida)}</Text>
                      <Text style={styles.duracion}>{textoDuracion(dur)}</Text>
                      <Text style={[styles.hora, completo && { opacity: 0.45 }]}>{hora(t.llegada)}</Text>
                    </View>
                    <View style={styles.via} pointerEvents="none">
                      <View
                        style={[
                          styles.viaTramo,
                          { left: `${izquierda}%`, width: `${Math.min(ancho, 100 - izquierda)}%` },
                          completo && { opacity: 0.45 },
                        ]}
                      />
                    </View>
                    <View style={styles.compra}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.tipo} numberOfLines={1}>
                          <Text style={{ fontFamily: fuentes.negrita }}>{t.tipo}</Text> {t.numero}
                        </Text>
                        {completo ? (
                          <Text style={styles.agotado}>
                            {t.plazasLibres === 0 ? "Completo" : `Solo ${t.plazasLibres} plazas`}
                          </Text>
                        ) : null}
                      </View>
                      {completo ? null : (
                        <>
                          <Text style={styles.precio}>{euros(t.precioDesde)}</Text>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Ver tarifas del ${t.tipo} ${t.numero} de las ${hora(t.salida)}`}
                            accessibilityState={{ expanded: expandido }}
                            onPress={() => setAbierto((a) => (a === t.id ? null : t.id))}
                            style={({ pressed }) => [styles.elegir, pressed && { transform: [{ scale: 0.96 }] }]}
                          >
                            <LinearGradient
                              colors={gradientes.marca}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={[StyleSheet.absoluteFill, { borderRadius: radios.pildora }]}
                            />
                            <Text style={styles.elegirTexto}>{expandido ? "Cerrar" : "Elegir"}</Text>
                          </Pressable>
                        </>
                      )}
                    </View>

                    {expandido ? (
                      <View style={{ paddingTop: espaciado[3], gap: espaciado[2] }}>
                        <Text style={[estilos.etiqueta, { marginLeft: 2 }]}>
                          Elige tarifa · {pasajeros} {pasajeros === 1 ? "viajero" : "viajeros"}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: espaciado[2] }}>
                          {TARIFAS.map((ta) => (
                            <View key={ta.id} style={[styles.tarifa, ta.id === "premium" && { borderColor: colores.marca, borderWidth: 1.5 }]}>
                              <Text style={styles.tarifaNombre}>{ta.nombre}</Text>
                              <Text style={styles.tarifaPrecio}>
                                <Text style={styles.tarifaDesde}>desde </Text>
                                {euros(precioViajero(t.precioDesde, ta.id))}
                              </Text>
                              <View style={{ gap: 2 }}>
                                {ta.incluye.slice(0, 2).map((x) => (
                                  <Text key={x} style={styles.tarifaIncluye}>
                                    · {x}
                                  </Text>
                                ))}
                              </View>
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Elegir tarifa ${ta.nombre}`}
                                onPress={() => elegirTarifa(t, ta.id)}
                                style={({ pressed }) => [styles.tarifaBoton, pressed && { opacity: 0.75 }]}
                              >
                                <Text style={styles.tarifaBotonTexto}>Elegir</Text>
                              </Pressable>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      ) : null}

      {!error && trenes === null ? (
        <Cristal padding={espaciado[5 as 4]} gap={espaciado[3]} style={{ alignItems: "center" }}>
          <ActivityIndicator color={colores.marca} size="large" />
          <Text style={estilos.suave}>Buscando trenes para ese día…</Text>
        </Cristal>
      ) : null}

      {error ? (
        <Cristal padding={espaciado[4]} gap={espaciado[3]}>
          <Aviso texto={`No se han podido cargar los trenes: ${error}`} />
          <Pressable
            accessibilityRole="button"
            onPress={() => setIntento((n) => n + 1)}
            style={({ pressed }) => [estilos.botonSecundario, pressed && { opacity: 0.7 }]}
          >
            <Text style={estilos.botonTextoSecundario}>Reintentar</Text>
          </Pressable>
        </Cristal>
      ) : null}

      {trenes?.length === 0 && !desconocidas.length ? (
        <Cristal padding={espaciado[5 as 4]} gap={espaciado[3]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: espaciado[3] }}>
            <View style={styles.vacioIcono}>
              <Icono nombre="calendario" tamano={24} color={colores.marca} />
            </View>
            <Text style={[estilos.subtitulo, { flex: 1 }]}>No hay trenes ese día</Text>
          </View>
          <Text style={estilos.texto}>
            No encontramos trenes para este trayecto. Prueba con otra estación o con el día siguiente.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setFecha(moverDia(fecha, 1))}
            style={({ pressed }) => [estilos.botonSecundario, pressed && { opacity: 0.7 }]}
          >
            <Text style={estilos.botonTextoSecundario}>Ver el día siguiente</Text>
          </Pressable>
        </Cristal>
      ) : null}

      <Text style={styles.pie}>Precios y plazas simulados · Renfe · Andén 0</Text>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  flechaDia: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colores.borde,
  },
  dia: {
    minWidth: 106,
    paddingVertical: espaciado[2],
    paddingHorizontal: espaciado[3],
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    gap: 1,
  },
  diaTexto: {
    fontFamily: fuentes.seminegrita,
    fontSize: 13,
    color: colores.texto,
    textTransform: "capitalize",
  },
  diaPrecio: { fontFamily: fuentes.negrita, fontSize: 12.6, color: colores.marca },
  grupo: { flexDirection: "row", flexWrap: "wrap", gap: espaciado[2] },
  lista: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radios.grande,
    overflow: "hidden",
    ...sombras[1],
  },
  filaTren: { paddingHorizontal: espaciado[4], paddingVertical: espaciado[4], gap: espaciado[2] },
  filaTrenBorde: { borderTopWidth: 1, borderTopColor: "rgba(129,0,94,0.10)" },
  horas: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  hora: {
    fontFamily: fuentes.negrita,
    fontSize: 22,
    color: colores.titulo,
    letterSpacing: -0.6,
    fontVariant: ["tabular-nums"],
  },
  duracion: { fontFamily: fuentes.normal, fontSize: 12.6, color: colores.textoSuave },
  via: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(129,0,94,0.10)",
    overflow: "hidden",
  },
  viaTramo: { position: "absolute", top: 0, bottom: 0, borderRadius: 3, backgroundColor: colores.marca },
  compra: { flexDirection: "row", alignItems: "center", gap: espaciado[3], minHeight: 42 },
  tipo: { fontFamily: fuentes.normal, fontSize: 14, color: colores.texto },
  agotado: { fontFamily: fuentes.seminegrita, fontSize: 12.6, color: colores.textoSuave, marginTop: 1 },
  precio: {
    fontFamily: fuentes.negrita,
    fontSize: 19,
    color: colores.accion,
    letterSpacing: -0.3,
    fontVariant: ["tabular-nums"],
  },
  elegir: {
    minWidth: 86,
    minHeight: 42,
    borderRadius: radios.pildora,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: espaciado[4],
    ...sombras[2],
  },
  elegirTexto: { fontFamily: fuentes.seminegrita, fontSize: 15, color: "#fff" },
  tarifa: {
    width: 214,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: tonos.blancoCalido,
    padding: espaciado[3],
    gap: espaciado[2],
  },
  tarifaNombre: { fontFamily: fuentes.negrita, fontSize: 17, color: colores.titulo },
  tarifaPrecio: { fontFamily: fuentes.negrita, fontSize: 19, color: colores.marca },
  tarifaDesde: { fontFamily: fuentes.medio, fontSize: 12, color: colores.textoSuave },
  tarifaIncluye: { fontFamily: fuentes.normal, fontSize: 12, color: colores.textoSuave, lineHeight: 16 },
  tarifaBoton: {
    marginTop: 2,
    minHeight: 38,
    borderRadius: radios.pildora,
    borderWidth: 1.5,
    borderColor: colores.marca,
    alignItems: "center",
    justifyContent: "center",
  },
  tarifaBotonTexto: { fontFamily: fuentes.seminegrita, fontSize: 13.6, color: colores.marca },
  vacioIcono: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: tonos.moradoSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  pie: {
    fontFamily: fuentes.normal,
    fontSize: 11.5,
    color: colores.textoSuave,
    textAlign: "center",
    paddingTop: espaciado[2],
  },
});
