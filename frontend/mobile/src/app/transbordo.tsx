import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import {
  buscarTransbordos,
} from "@renfe/shared/api/cliente";
import { buscarOpcion, comprarDosTramos } from "@renfe/shared/api/comprar-transbordo";
import { DESCUENTOS, calcularTotal } from "@renfe/shared/api/simulado-precios";
import type { IdDescuento, NuevaReserva, OpcionTransbordo, Pasajero, Reserva, TipoViajero } from "@renfe/shared/api/tipos";
import { Aviso } from "@/components/Aviso";
import { confirmarPagoConCara } from "@/confirmarPago";
import { Boton } from "@/components/Boton";
import { Campo } from "@/components/Campo";
import { Cristal } from "@/components/Cristal";
import { Pantalla } from "@/components/Pantalla";
import { euros, horaLocal } from "@renfe/shared/formato/formato";
import { colores, espaciado, estilos } from "@/tema";

interface DatosViajero {
  nombre: string;
  apellidos: string;
  documento: string;
}
const vacio = (): DatosViajero => ({ nombre: "", apellidos: "", documento: "" });
const validarDocumento = (v: string) => /^[A-Za-z0-9]{6,12}$/.test(v.trim());
const validarEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

export default function Transbordo() {
  const params = useLocalSearchParams<Record<string, string>>();
  // La API admite de 1 a 6 pasajeros por reserva.
  const n = Math.min(Math.max(Number(params.pasajeros) || 1, 1), 6);
  const ninos = Math.min(Math.max(Number(params.ninos) || 0, 0), n - 1);
  const bebes = Math.max(Number(params.bebes) || 0, 0);
  const descuento = (DESCUENTOS.find((d) => d.id === params.descuento)?.id ?? "ninguno") as IdDescuento;
  // Como en la reserva directa: los últimos viajeros son los niños.
  const tipos: TipoViajero[] = Array.from({ length: n }, (_, i) => (i >= n - ninos ? "nino" : "adulto"));
  const { origen = "", destino = "", fecha = "", a, b } = params;

  const [opcion, setOpcion] = useState<OpcionTransbordo | null>(null);
  const [datos, setDatos] = useState<DatosViajero[]>(() => Array.from({ length: n }, vacio));
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pagando, setPagando] = useState(false);
  const [compradas, setCompradas] = useState<[Reserva, Reserva] | null>(null);

  useEffect(() => {
    let vivo = true;
    buscarTransbordos({ origen, destino, fecha }).then(
      (lista) => {
        if (!vivo) return;
        const elegida = buscarOpcion(lista, a, b);
        if (elegida) setOpcion(elegida);
        else setError("Esa combinación ya no está disponible. Vuelve a buscar.");
      },
      (e: Error) => vivo && setError(e.message),
    );
    return () => {
      vivo = false;
    };
  }, [origen, destino, fecha, a, b]);

  const cambiar = (i: number, campo: keyof DatosViajero, valor: string) =>
    setDatos((d) => d.map((p, j) => (j === i ? { ...p, [campo]: valor } : p)));

  const pagar = async () => {
    if (!opcion) return;
    if (datos.some((p) => !p.nombre.trim() || !p.apellidos.trim() || !validarDocumento(p.documento))) {
      setError("Rellena nombre, apellidos y documento (6 a 12 letras o números) de cada viajero.");
      return;
    }
    if (!validarEmail(email)) {
      setError("Escribe un correo de contacto válido.");
      return;
    }
    const importe = opcion.tramos.reduce(
      (s, t) => s + calcularTotal({ precios: Array(n).fill(t.precioDesde), tipos, descuento }).total,
      0,
    );
    if (!(await confirmarPagoConCara(importe))) return;
    setError("");
    setPagando(true);
    const pasajeros: Pasajero[] = datos.map((p, i) => ({
      nombre: p.nombre.trim(),
      apellidos: p.apellidos.trim(),
      documento: p.documento.trim().toUpperCase(),
      email: email.trim(),
      tipo: tipos[i],
    }));
    try {
      const datos: NuevaReserva = { trenId: opcion.tramos[0].id, asientos: [], pasajeros, descuento, bebes };
      setCompradas(await comprarDosTramos(opcion.tramos, datos));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la compra.");
    } finally {
      setPagando(false);
    }
  };

  if (compradas) {
    return (
      <Pantalla volver={() => router.replace("/")} sinAviso>
        <Cristal padding={espaciado[4]} gap={espaciado[3]}>
          <Text style={estilos.h1} accessibilityRole="header">
            Viaje comprado
          </Text>
          <Text style={estilos.texto}>Tienes un billete por cada tren.</Text>
          {compradas.map((r) => (
            <Text key={r.id} style={estilos.suave}>
              {r.localizador} · {r.tren.tipo} {r.tren.numero} · {horaLocal(r.tren.salida)}–{horaLocal(r.tren.llegada)}
            </Text>
          ))}
        </Cristal>
        <Boton texto="Ver mis billetes" icono="billetes" onPress={() => router.replace("/billetes")} />
        <Boton texto="Volver al inicio" variante="secundario" onPress={() => router.replace("/")} />
      </Pantalla>
    );
  }

  if (!opcion) {
    return (
      <Pantalla volver={() => router.back()}>
        <Cristal padding={espaciado[4]} gap={espaciado[3]} style={{ alignItems: "center" }}>
          {error ? <Aviso texto={error} /> : <ActivityIndicator color={colores.marca} size="large" />}
          {error ? <Boton texto="Volver a los resultados" variante="secundario" onPress={() => router.back()} /> : null}
        </Cristal>
      </Pantalla>
    );
  }

  const [ida, sigue] = opcion.tramos;
  // Cada tramo se cobra por separado con las mismas reglas; el total es la suma.
  const total = opcion.tramos.reduce(
    (s, t) => s + calcularTotal({ precios: Array(n).fill(t.precioDesde), tipos, descuento }).total,
    0,
  );
  return (
    <Pantalla volver={() => router.back()}>
      <Cristal padding={espaciado[4]} gap={espaciado[2]}>
        <Text style={estilos.h1} accessibilityRole="header">
          {ida.origen.nombre} a {sigue.destino.nombre}
        </Text>
        <Text style={estilos.texto}>
          {ida.tipo} {ida.numero}: {horaLocal(ida.salida)} a {horaLocal(ida.llegada)}
        </Text>
        <Text style={[estilos.texto, { color: colores.marca }]}>
          Transbordo en {opcion.transbordo.nombre}, {opcion.esperaMin} min de espera
        </Text>
        {opcion.cambioEstacion && opcion.transbordoSalida ? (
          <Text style={[estilos.texto, { color: colores.marca }]}>
            Cambias de estación: sales desde {opcion.transbordoSalida.nombre}
          </Text>
        ) : null}
        <Text style={estilos.texto}>
          {sigue.tipo} {sigue.numero}: {horaLocal(sigue.salida)} a {horaLocal(sigue.llegada)}
        </Text>
      </Cristal>

      {datos.map((p, i) => (
        <Cristal key={i} padding={espaciado[4]} gap={espaciado[3]}>
          <Text style={estilos.subtitulo}>
            Viajero {i + 1}
            {tipos[i] === "nino" ? " (niño)" : ""}
          </Text>
          <Campo etiqueta="Nombre" value={p.nombre} onChangeText={(v) => cambiar(i, "nombre", v)} autoComplete="given-name" />
          <Campo
            etiqueta="Apellidos"
            value={p.apellidos}
            onChangeText={(v) => cambiar(i, "apellidos", v)}
            autoComplete="family-name"
          />
          <Campo
            etiqueta="DNI, NIE o pasaporte"
            value={p.documento}
            onChangeText={(v) => cambiar(i, "documento", v)}
            autoCapitalize="characters"
          />
        </Cristal>
      ))}

      <Cristal padding={espaciado[4]} gap={espaciado[3]}>
        <Campo
          etiqueta="Correo de contacto"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <View style={estilos.entre}>
          <Text style={estilos.suaveMedio}>Total (pago simulado)</Text>
          <Text style={estilos.subtitulo}>{euros(total)}</Text>
        </View>
        {ninos > 0 || bebes > 0 ? (
          <Text style={estilos.suave}>
            {ninos > 0 ? `${ninos} ${ninos === 1 ? "niño" : "niños"} con descuento` : ""}
            {ninos > 0 && bebes > 0 ? " · " : ""}
            {bebes > 0 ? `${bebes} ${bebes === 1 ? "bebé" : "bebés"} gratis, sin asiento` : ""}
          </Text>
        ) : null}
        {error ? <Aviso texto={error} /> : null}
        <Boton
          texto={pagando ? "Comprando los dos billetes…" : "Comprar los dos billetes"}
          onPress={pagar}
          cargando={pagando}
        />
      </Cristal>
    </Pantalla>
  );
}
