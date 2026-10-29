import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import {
  confirmarPagoSimulado,
  crearIntentoPago,
  crearReserva,
  obtenerAsientos,
  obtenerTren,
} from "@renfe/shared/api/cliente";
import { DESCUENTOS, EXTRAS, TARIFAS, calcularTotal, precioExtra } from "@renfe/shared/api/simulado-precios";
import { ciudadDe, type Asiento, type IdDescuento, type IdExtra, type IdTarifa, type Pasajero, type Reserva, type Tren } from "@renfe/shared/api/tipos";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { Campo } from "@/components/Campo";
import { Cristal } from "@/components/Cristal";
import { Icono } from "@/components/Icono";
import { Pantalla } from "@/components/Pantalla";
import { euros, fecha, hora } from "@/formato";
import { colores, espaciado, estilos, fuentes, gradientes, sombras, tonos } from "@/tema";

// Clase de asiento que encaja con cada tarifa: así el precio que se enseña es el que se cobra.
const CLASE_DE_TARIFA: Record<IdTarifa, Asiento["clase"]> = {
  basico: "Estándar",
  elige: "Estándar",
  "elige-confort": "Confort",
  premium: "Prémium",
};

interface DatosViajero {
  nombre: string;
  apellidos: string;
  documento: string;
}

const vacio = (): DatosViajero => ({ nombre: "", apellidos: "", documento: "" });

const validarDocumento = (v: string) => /^[A-Za-z0-9]{6,12}$/.test(v.trim());
const validarEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

const duracion = (t: Tren) => {
  const min = Math.max(0, Math.round((Date.parse(t.llegada) - Date.parse(t.salida)) / 60_000));
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;
};

export default function Pasajero() {
  const params = useLocalSearchParams<Record<string, string>>();
  const trenId = params.trenId ?? "";
  const n = Math.min(Math.max(Number(params.pasajeros) || 1, 1), 9);
  const ninos = Math.min(Math.max(Number(params.ninos) || 0, 0), n - 1);
  const bebes = Math.max(Number(params.bebes) || 0, 0);
  const adultos = Math.max(n - ninos, 1);
  const descuento = (DESCUENTOS.find((d) => d.id === params.descuento)?.id ?? "ninguno") as IdDescuento;
  const tarifaInicial = (TARIFAS.find((t) => t.id === params.tarifa)?.id ?? "basico") as IdTarifa;

  const [tren, setTren] = useState<Tren | null>(null);
  const [asientos, setAsientos] = useState<Asiento[] | null>(null);
  const [tarifa, setTarifa] = useState<IdTarifa>(tarifaInicial);
  const [datos, setDatos] = useState<DatosViajero[]>(() => Array.from({ length: n }, vacio));
  const [email, setEmail] = useState("");
  const [extras, setExtras] = useState<IdExtra[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [pagando, setPagando] = useState(false);
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    let vivo = true;
    // Los asientos se piden a partir del tren: la plantilla local necesita su precio y su id.
    obtenerTren(trenId)
      .then(async (t) => ({ t, a: await obtenerAsientos(t) }))
      .then(
        ({ t, a }) => {
          if (!vivo) return;
          setTren(t);
          setAsientos(a);
          setCargando(false);
        },
        (e: Error) => {
          if (!vivo) return;
          setError(e.message);
          setCargando(false);
        },
      );
    return () => {
      vivo = false;
    };
  }, [trenId]);

  const tipos = useMemo(() => Array.from({ length: n }, (_, i) => (i >= n - ninos ? ("nino" as const) : ("adulto" as const))), [n, ninos]);

  // Asignación automática: los primeros libres de la clase que toca. En una app real se elegirían en un plano.
  const elegidos = useMemo(() => {
    if (!asientos) return [];
    const libres = asientos.filter((a) => a.libre);
    const clase = CLASE_DE_TARIFA[tarifa];
    const deClase = libres.filter((a) => a.clase === clase);
    return (deClase.length >= n ? deClase : libres).slice(0, n);
  }, [asientos, n, tarifa]);

  const desglose = useMemo(
    () =>
      calcularTotal({
        precios: elegidos.map((a) => a.precio),
        tipos,
        tarifa,
        descuento,
        extras,
      }),
    [elegidos, tipos, tarifa, descuento, extras],
  );

  const cambiar = (i: number, campo: keyof DatosViajero, valor: string) => {
    setDatos((d) => d.map((p, j) => (j === i ? { ...p, [campo]: valor } : p)));
    setErrores((e) => {
      const clave = `${i}-${campo}`;
      if (!e[clave]) return e;
      const siguiente = { ...e };
      delete siguiente[clave];
      return siguiente;
    });
  };

  const validar = () => {
    const nuevos: Record<string, string> = {};
    datos.forEach((p, i) => {
      if (!p.nombre.trim()) nuevos[`${i}-nombre`] = "Escribe el nombre.";
      if (!p.apellidos.trim()) nuevos[`${i}-apellidos`] = "Escribe los apellidos.";
      if (!p.documento.trim()) nuevos[`${i}-documento`] = "Escribe el documento.";
      else if (!validarDocumento(p.documento)) nuevos[`${i}-documento`] = "Entre 6 y 12 letras o números, sin espacios.";
    });
    if (!email.trim()) nuevos.email = "Escribe un correo de contacto.";
    else if (!validarEmail(email)) nuevos.email = "Ese correo no parece válido.";
    if (!elegidos.length || elegidos.length < n) nuevos.asientos = "No quedan asientos libres suficientes en este tren.";
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const pagar = async () => {
    if (!tren) return;
    if (!validar()) {
      setError("");
      scroll.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setError("");
    setPagando(true);
    try {
      const pasajeros: Pasajero[] = datos.map((p, i) => ({
        nombre: p.nombre.trim(),
        apellidos: p.apellidos.trim(),
        documento: p.documento.trim().toUpperCase(),
        email: email.trim(),
        tipo: tipos[i],
      }));
      const r = await crearReserva(tren, {
        trenId,
        asientos: elegidos.map((a) => a.id),
        pasajeros,
        tarifa,
        descuento,
        extras,
        bebes,
      });
      await crearIntentoPago(r.id);
      const pagada = await confirmarPagoSimulado(r.id);
      setReserva(pagada);
      scroll.current?.scrollTo({ y: 0, animated: false });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPagando(false);
    }
  };

  if (cargando) {
    return (
      <Pantalla volver={() => router.back()}>
        <Cristal padding={espaciado[6]} gap={espaciado[3]} style={{ alignItems: "center" }}>
          <ActivityIndicator size="large" color={colores.marca} />
          <Text style={estilos.suave}>Preparando tu reserva…</Text>
        </Cristal>
      </Pantalla>
    );
  }

  if (!tren || error === "No encontramos ese tren.") {
    return (
      <Pantalla volver={() => router.back()}>
        <Cristal padding={espaciado[4]} gap={espaciado[3]}>
          <Aviso texto={error || "No hemos podido cargar el tren."} />
          <Boton texto="Volver a los resultados" variante="secundario" onPress={() => router.back()} />
        </Cristal>
      </Pantalla>
    );
  }

  if (reserva) {
    const vuelta = params.vuelta ?? "";
    return (
      <Pantalla volver={() => router.replace("/")} sinAviso>
        <View style={styles.exito}>
          <LinearGradient
            colors={gradientes.marca}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
          />
          <View style={styles.exitoIcono}>
            <Icono nombre="check" tamano={38} color={tonos.exito} grosor={2.6} />
          </View>
          <Text style={styles.exitoTitulo}>Reserva confirmada</Text>
          <Text style={styles.exitoTexto}>Ya tienes tus billetes. Llévalos en el móvil y enseña el QR en el andén.</Text>
        </View>

        <Cristal padding={espaciado[4]} gap={espaciado[3]}>
          <View style={estilos.entre}>
            <View style={{ gap: 2 }}>
              <Text style={estilos.etiqueta}>LOCALIZADOR</Text>
              <Text style={styles.localizador}>{reserva.localizador}</Text>
            </View>
            <View style={styles.selloPagado}>
              <Icono nombre="check" tamano={15} color={tonos.exito} grosor={2.4} />
              <Text style={styles.selloPagadoTexto}>Pagado</Text>
            </View>
          </View>
          <View style={styles.separador} />
          <View style={{ gap: 2 }}>
            <Text style={estilos.subtitulo}>
              {ciudadDe(reserva.tren.origen)} → {ciudadDe(reserva.tren.destino)}
            </Text>
            <Text style={estilos.suave}>
              {fecha(reserva.tren.salida)} · {hora(reserva.tren.salida)}–{hora(reserva.tren.llegada)} · {reserva.tren.tipo}{" "}
              {reserva.tren.numero}
            </Text>
          </View>
          {reserva.pasajeros.map((p, i) => (
            <View key={`${p.nombre}-${i}`} style={styles.filaViajero}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombreViajero}>
                  {p.nombre} {p.apellidos}
                </Text>
                <Text style={estilos.suave}>
                  {p.tipo === "nino" ? "Niño" : "Adulto"} · {reserva.asientos[i]?.clase}
                </Text>
              </View>
              <View style={styles.asiento}>
                <Icono nombre="tren" tamano={15} color={colores.marca} />
                <Text style={styles.asientoTexto}>
                  Coche {reserva.asientos[i]?.coche} · {reserva.asientos[i]?.fila}
                  {reserva.asientos[i]?.letra}
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.totalFila}>
            <Text style={estilos.suaveMedio}>Total pagado</Text>
            <Text style={styles.totalExito}>{euros(reserva.total)}</Text>
          </View>
        </Cristal>

        {vuelta ? (
          <Cristal padding={espaciado[4]} gap={espaciado[3]}>
            <View style={{ flexDirection: "row", gap: espaciado[3], alignItems: "center" }}>
              <View style={styles.iconoRedondo}>
                <Icono nombre="intercambiar" tamano={20} color={colores.marca} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={estilos.subtitulo}>Te falta la vuelta</Text>
                <Text style={estilos.suave}>Has comprado la ida. Elige el tren de vuelta del {fecha(`${vuelta}T12:00:00`)}.</Text>
              </View>
            </View>
            <Boton
              texto="Elegir la vuelta"
              onPress={() =>
                router.push({
                  pathname: "/resultados",
                  params: {
                    origen: reserva.tren.destino.id,
                    destino: reserva.tren.origen.id,
                    fecha: vuelta,
                    pasajeros: String(n),
                    adultos: String(adultos),
                    ninos: String(ninos),
                    bebes: String(bebes),
                    descuento,
                  },
                })
              }
            />
          </Cristal>
        ) : null}

        <Boton texto="Ver mis billetes" icono="billetes" onPress={() => router.replace("/billetes")} />
        <Boton texto="Volver al inicio" variante="secundario" onPress={() => router.replace("/")} />
        <Text style={styles.pie}>Pago simulado de prueba · no se ha cobrado nada</Text>
      </Pantalla>
    );
  }

  const tarifaActual = TARIFAS.find((t) => t.id === tarifa)!;

  return (
    <Pantalla
      volver={() => router.back()}
      sinAviso
      scroll={false}
      contenido={{ paddingHorizontal: 12, paddingTop: 4, paddingBottom: 0 }}
    >
      <ScrollView
        ref={scroll}
        contentContainerStyle={{ gap: espaciado[3], paddingBottom: 132 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: espaciado[1], paddingHorizontal: 2 }}>
          <Text style={estilos.h1} accessibilityRole="header">
            Termina tu reserva
          </Text>
          <Text style={estilos.suave}>
            {n} {n === 1 ? "viajero" : "viajeros"} · elige tarifa y rellena los datos
          </Text>
        </View>

        {error ? <Aviso texto={error} /> : null}

        <Cristal padding={espaciado[4]} gap={espaciado[2]}>
          <View style={estilos.entre}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: espaciado[2] }}>
              <View style={styles.tipoTren}>
                <Text style={styles.tipoTrenTexto}>{tren.tipo}</Text>
              </View>
              <Text style={styles.numeroTren}>{tren.numero}</Text>
            </View>
            <Text style={estilos.suaveMedio}>{fecha(tren.salida)}</Text>
          </View>
          <View style={styles.ruta}>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={styles.ciudad} numberOfLines={1}>
                {ciudadDe(tren.origen)}
              </Text>
              <Text style={styles.hora}>{hora(tren.salida)}</Text>
              <Text style={estilos.suave} numberOfLines={1}>
                {tren.origen.nombre}
              </Text>
            </View>
            <View style={styles.trayecto}>
              <Text style={styles.duracion}>{duracion(tren)}</Text>
              <View style={styles.linea}>
                <View style={styles.punto} />
                <View style={styles.raya} />
                <Icono nombre="delante" tamano={16} color={colores.marca} grosor={2.4} />
              </View>
              <Text style={estilos.suave}>directo</Text>
            </View>
            <View style={{ flex: 1, gap: 1, alignItems: "flex-end" }}>
              <Text style={[styles.ciudad, { textAlign: "right" }]} numberOfLines={1}>
                {ciudadDe(tren.destino)}
              </Text>
              <Text style={styles.hora}>{hora(tren.llegada)}</Text>
              <Text style={[estilos.suave, { textAlign: "right" }]} numberOfLines={1}>
                {tren.destino.nombre}
              </Text>
            </View>
          </View>
          <View style={styles.chipsViajeros}>
            <View style={styles.chipDato}>
              <Icono nombre="cuenta" tamano={15} color={colores.marca} />
              <Text style={styles.chipDatoTexto}>
                {adultos} {adultos === 1 ? "adulto" : "adultos"}
                {ninos ? ` · ${ninos} ${ninos === 1 ? "niño" : "niños"}` : ""}
              </Text>
            </View>
            {bebes ? (
              <View style={styles.chipDato}>
                <Icono nombre="cara" tamano={15} color={colores.marca} />
                <Text style={styles.chipDatoTexto}>
                  {bebes} {bebes === 1 ? "bebé" : "bebés"}
                </Text>
              </View>
            ) : null}
          </View>
        </Cristal>

        <View style={{ gap: espaciado[2] }}>
          <Text style={estilos.h2}>Tu tarifa</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: espaciado[2], paddingRight: 4 }}>
            {TARIFAS.map((t) => {
              const activa = t.id === tarifa;
              const precio = calcularTotal({
                precios: elegidos.map((a) => a.precio),
                tipos,
                tarifa: t.id,
                descuento,
              }).billetes;
              return (
                <Pressable
                  key={t.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activa }}
                  onPress={() => setTarifa(t.id)}
                  style={({ pressed }) => [
                    styles.tarjetaTarifa,
                    activa && styles.tarjetaTarifaActiva,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <View style={estilos.entre}>
                    <Text style={[styles.tarifaNombre, activa && { color: colores.marca }]}>{t.nombre}</Text>
                    {activa ? <Icono nombre="check" tamano={18} color={colores.marca} grosor={2.3} /> : null}
                  </View>
                  <Text style={styles.tarifaPrecio}>{euros(precio)}</Text>
                  <Text style={styles.tarifaTexto} numberOfLines={2}>
                    {t.incluye[0]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ gap: espaciado[2] }}>
          <Text style={estilos.h2}>Viajeros</Text>
          <Text style={estilos.suave}>
            Asientos asignados automáticamente ({tarifaActual.nombre}). Podrás elegir otro en el próximo sprint.
          </Text>
          {datos.map((p, i) => {
            const asiento = elegidos[i];
            return (
              <Cristal key={i} padding={espaciado[4]} gap={espaciado[3]}>
                <View style={estilos.entre}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: espaciado[2] }}>
                    <View style={styles.numeroViajero}>
                      <Text style={styles.numeroViajeroTexto}>{i + 1}</Text>
                    </View>
                    <View style={{ gap: 1 }}>
                      <Text style={estilos.subtitulo}>Viajero {i + 1}</Text>
                      <Text style={estilos.suave}>{tipos[i] === "nino" ? "Niño (4-13 años)" : "Adulto"}</Text>
                    </View>
                  </View>
                  {asiento ? (
                    <View style={styles.asiento}>
                      <Icono nombre="tren" tamano={14} color={colores.marca} />
                      <Text style={styles.asientoTexto}>
                        {asiento.coche}-{asiento.fila}
                        {asiento.letra}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Campo
                  etiqueta="Nombre"
                  value={p.nombre}
                  onChangeText={(v) => cambiar(i, "nombre", v)}
                  placeholder="Ana"
                  autoComplete="given-name"
                  error={errores[`${i}-nombre`]}
                />
                <Campo
                  etiqueta="Apellidos"
                  value={p.apellidos}
                  onChangeText={(v) => cambiar(i, "apellidos", v)}
                  placeholder="García López"
                  autoComplete="family-name"
                  error={errores[`${i}-apellidos`]}
                />
                <Campo
                  etiqueta="DNI, NIE o pasaporte"
                  value={p.documento}
                  onChangeText={(v) => cambiar(i, "documento", v)}
                  placeholder="12345678Z"
                  autoCapitalize="characters"
                  autoComplete="off"
                  error={errores[`${i}-documento`]}
                />
              </Cristal>
            );
          })}
          <Cristal padding={espaciado[4]} gap={espaciado[3]}>
            <View style={{ flexDirection: "row", gap: espaciado[2], alignItems: "center" }}>
              <Icono nombre="info" tamano={20} color={colores.marca} />
              <Text style={[estilos.subtitulo, { flex: 1 }]}>Correo de contacto</Text>
            </View>
            <Campo
              etiqueta="Email"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errores.email) setErrores((e) => ({ ...e, email: "" }));
              }}
              placeholder="ana@correo.es"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errores.email}
            />
            <Text style={estilos.suave}>Te enviaremos ahí el localizador y los cambios del viaje.</Text>
          </Cristal>
        </View>

        <View style={{ gap: espaciado[2] }}>
          <Text style={estilos.h2}>Añade a tu viaje</Text>
          <View style={styles.extras}>
            {EXTRAS.map((e) => {
              const activo = extras.includes(e.id);
              const precio = precioExtra(e.id, n, tarifa);
              return (
                <Pressable
                  key={e.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: activo }}
                  onPress={() => setExtras((s) => (activo ? s.filter((x) => x !== e.id) : [...s, e.id]))}
                  style={({ pressed }) => [styles.extra, activo && styles.extraActivo, pressed && { opacity: 0.8 }]}
                >
                  <View style={[styles.extraCheck, activo && { backgroundColor: colores.marca, borderColor: colores.marca }]}>
                    {activo ? <Icono nombre="check" tamano={13} color="#fff" grosor={2.6} /> : null}
                  </View>
                  <Text style={styles.extraNombre} numberOfLines={2}>
                    {e.nombre}
                  </Text>
                  <Text style={styles.extraPrecio}>{precio === 0 ? "Incluido" : euros(precio)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Cristal padding={espaciado[4]} gap={espaciado[3]}>
          <Text style={estilos.h2}>Resumen</Text>
          <View style={styles.resumenFila}>
            <Text style={estilos.texto}>Billetes ({n})</Text>
            <Text style={styles.resumenValor}>{euros(desglose.billetes)}</Text>
          </View>
          {desglose.extras > 0 ? (
            <View style={styles.resumenFila}>
              <Text style={estilos.texto}>Extras</Text>
              <Text style={styles.resumenValor}>{euros(desglose.extras)}</Text>
            </View>
          ) : null}
          {descuento !== "ninguno" ? (
            <View style={styles.resumenFila}>
              <Text style={estilos.suave}>
                Descuento · {DESCUENTOS.find((d) => d.id === descuento)?.nombre}
              </Text>
              <Text style={styles.descuentoTexto}>aplicado</Text>
            </View>
          ) : null}
          <View style={styles.separador} />
          <View style={estilos.entre}>
            <Text style={estilos.subtitulo}>Total</Text>
            <Text style={styles.total}>{euros(desglose.total)}</Text>
          </View>
          <Aviso
            tipo="info"
            icono="info"
            texto="Pago en modo prueba: no se pide tarjeta y no se cobra nada. La reserva se confirma al instante."
          />
          {errores.asientos ? <Aviso texto={errores.asientos} /> : null}
          <Boton
            texto={`Pagar ${euros(desglose.total)} (simulado)`}
            onPress={pagar}
            cargando={pagando}
            desactivado={!elegidos.length}
          />
          <Text style={styles.pie}>Renfe · Andén 0 · proyecto de clase</Text>
        </Cristal>
      </ScrollView>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tipoTren: {
    backgroundColor: colores.marca,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tipoTrenTexto: { fontFamily: fuentes.negrita, fontSize: 12, color: "#fff", letterSpacing: 0.2 },
  numeroTren: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.texto },
  ruta: { flexDirection: "row", alignItems: "center", gap: espaciado[2], paddingVertical: espaciado[2] },
  ciudad: { fontFamily: fuentes.negrita, fontSize: 20, color: colores.titulo, letterSpacing: -0.6 },
  hora: { fontFamily: fuentes.negrita, fontSize: 25, color: colores.accion, letterSpacing: -1, fontVariant: ["tabular-nums"] },
  trayecto: { alignItems: "center", gap: 2, flex: 1 },
  duracion: { fontFamily: fuentes.normal, fontSize: 11.5, color: colores.textoSuave },
  linea: { flexDirection: "row", alignItems: "center", gap: 3, width: "100%" },
  punto: { width: 7, height: 7, borderRadius: 4, borderWidth: 2, borderColor: colores.marca, backgroundColor: "#fff" },
  raya: { flex: 1, height: 1.5, backgroundColor: "rgba(129,0,94,0.35)" },
  chipsViajeros: { flexDirection: "row", flexWrap: "wrap", gap: espaciado[2] },
  chipDato: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: tonos.rosa,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipDatoTexto: { fontFamily: fuentes.medio, fontSize: 12.5, color: colores.texto },
  tarjetaTarifa: {
    width: 178,
    minHeight: 126,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colores.borde,
    backgroundColor: "rgba(255,255,255,0.76)",
    padding: espaciado[3],
    gap: 4,
  },
  tarjetaTarifaActiva: {
    borderColor: colores.marca,
    backgroundColor: "rgba(255,255,255,0.95)",
    ...sombras[1],
  },
  tarifaNombre: { fontFamily: fuentes.negrita, fontSize: 16.5, color: colores.titulo },
  tarifaPrecio: { fontFamily: fuentes.negrita, fontSize: 18, color: colores.accion },
  tarifaTexto: { fontFamily: fuentes.normal, fontSize: 12, color: colores.textoSuave, lineHeight: 16 },
  numeroViajero: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colores.marca,
    alignItems: "center",
    justifyContent: "center",
  },
  numeroViajeroTexto: { fontFamily: fuentes.negrita, fontSize: 15, color: "#fff" },
  asiento: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: tonos.moradoSuave,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  asientoTexto: { fontFamily: fuentes.negrita, fontSize: 12.3, color: colores.marca },
  extras: { flexDirection: "row", flexWrap: "wrap", gap: espaciado[2] },
  extra: {
    width: "48.6%",
    minHeight: 84,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: espaciado[3],
    gap: 3,
  },
  extraActivo: { borderColor: colores.marca, backgroundColor: tonos.rosaFuerte },
  extraCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(129,0,94,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  extraNombre: { fontFamily: fuentes.seminegrita, fontSize: 12.8, color: colores.texto, lineHeight: 16 },
  extraPrecio: { fontFamily: fuentes.negrita, fontSize: 12.4, color: colores.marca },
  resumenFila: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: espaciado[3] },
  resumenValor: { fontFamily: fuentes.seminegrita, fontSize: 14.5, color: colores.texto, fontVariant: ["tabular-nums"] },
  descuentoTexto: { fontFamily: fuentes.seminegrita, fontSize: 13, color: tonos.exito },
  separador: { height: 1, backgroundColor: colores.borde },
  total: { fontFamily: fuentes.negrita, fontSize: 29, color: colores.accion, letterSpacing: -0.8 },
  pie: { fontFamily: fuentes.normal, fontSize: 11, color: colores.textoSuave, textAlign: "center", paddingTop: 2 },
  exito: {
    borderRadius: 28,
    padding: espaciado[6],
    gap: espaciado[2],
    alignItems: "center",
    overflow: "hidden",
    ...sombras[2],
  },
  exitoIcono: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaciado[1],
  },
  exitoTitulo: { fontFamily: fuentes.negrita, fontSize: 25, color: "#fff", letterSpacing: -0.5 },
  exitoTexto: {
    fontFamily: fuentes.normal,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    maxWidth: 300,
  },
  localizador: { fontFamily: fuentes.negrita, fontSize: 27, color: colores.marca, letterSpacing: 4 },
  selloPagado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: tonos.exitoFondo,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  selloPagadoTexto: { fontFamily: fuentes.seminegrita, fontSize: 11.5, color: tonos.exito },
  filaViajero: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[2],
    paddingVertical: espaciado[2],
    borderTopWidth: 1,
    borderTopColor: "rgba(129,0,94,0.08)",
  },
  nombreViajero: { fontFamily: fuentes.seminegrita, fontSize: 14.5, color: colores.texto },
  totalFila: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: espaciado[2] },
  totalExito: { fontFamily: fuentes.negrita, fontSize: 23, color: colores.accion },
  iconoRedondo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: tonos.moradoSuave,
    alignItems: "center",
    justifyContent: "center",
  },
});
