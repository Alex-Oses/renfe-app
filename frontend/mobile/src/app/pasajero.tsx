import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput } from "react-native";
import { confirmarPagoSimulado, crearReserva, obtenerAsientos, obtenerTren } from "@renfe/shared/api/cliente";
import { ciudadDe, type Tren } from "@renfe/shared/api/tipos";
import { Boton } from "@/components/Boton";
import { euros, fecha, hora } from "@/formato";
import { estilos } from "@/tema";

// Reserva simulada de un viajero: primer asiento libre, tarifa básica y pago simulado.
export default function Pasajero() {
  const { trenId } = useLocalSearchParams<{ trenId: string }>();
  const [tren, setTren] = useState<Tren | null>(null);
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerTren(trenId).then(setTren, (e: Error) => setError(e.message));
  }, [trenId]);

  const pagar = async () => {
    if (!nombre.trim() || !apellidos.trim() || !documento.trim() || !/\S+@\S+\.\S+/.test(email))
      return setError("Rellena todos los datos con un email válido.");
    setError("");
    setCargando(true);
    try {
      const libre = (await obtenerAsientos(trenId)).find((a) => a.libre);
      if (!libre) throw new Error("No quedan asientos libres en este tren.");
      const pasajero = { nombre: nombre.trim(), apellidos: apellidos.trim(), documento: documento.trim(), email: email.trim() };
      const reserva = await crearReserva({ trenId, asientos: [libre.id], pasajeros: [pasajero] });
      await confirmarPagoSimulado(reserva.id);
      router.dismissAll();
      router.navigate("/billetes");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      {tren && (
        <>
          <Text style={estilos.titulo}>
            {ciudadDe(tren.origen)} → {ciudadDe(tren.destino)}
          </Text>
          <Text style={estilos.suave}>
            {fecha(tren.salida)} · {hora(tren.salida)}–{hora(tren.llegada)} · {tren.tipo} {tren.numero} · desde {euros(tren.precioDesde)}
          </Text>
        </>
      )}
      <TextInput style={estilos.campo} value={nombre} onChangeText={setNombre} placeholder="Nombre" accessibilityLabel="Nombre" />
      <TextInput style={estilos.campo} value={apellidos} onChangeText={setApellidos} placeholder="Apellidos" accessibilityLabel="Apellidos" />
      <TextInput style={estilos.campo} value={documento} onChangeText={setDocumento} placeholder="DNI, NIE o pasaporte" accessibilityLabel="Documento" autoCapitalize="characters" />
      <TextInput style={estilos.campo} value={email} onChangeText={setEmail} placeholder="Email" accessibilityLabel="Email" keyboardType="email-address" autoCapitalize="none" />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Boton texto="Pagar (simulado)" onPress={pagar} cargando={cargando} />
      <Text style={estilos.suave}>Pago de prueba: no se cobra nada.</Text>
    </ScrollView>
  );
}
