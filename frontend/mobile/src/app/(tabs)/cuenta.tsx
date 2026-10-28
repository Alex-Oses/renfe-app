import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { iniciarSesion, registrarse, usaDatosSimulados, usarToken } from "@renfe/shared/api/cliente";
import type { Sesion } from "@renfe/shared/api/tipos";
import { Boton } from "@/components/Boton";
import { estilos } from "@/tema";

// shortcut: la sesión vive en memoria y se pierde al cerrar la app; guardarla en SecureStore cuando haga falta.
export default function Cuenta() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [registro, setRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const entrar = async () => {
    if (!/\S+@\S+\.\S+/.test(email) || contrasena.length < 6) return setError("Email válido y contraseña de 6 caracteres o más.");
    if (registro && !nombre.trim()) return setError("Escribe tu nombre.");
    setError("");
    setCargando(true);
    try {
      const s = registro
        ? await registrarse({ nombre: nombre.trim(), email: email.trim(), contrasena })
        : await iniciarSesion({ email: email.trim(), contrasena });
      usarToken(s.token);
      setSesion(s);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  if (sesion)
    return (
      <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
        <View style={estilos.tarjeta}>
          <Text style={estilos.subtitulo}>Hola, {sesion.usuario.nombre}</Text>
          <Text style={estilos.suave}>{sesion.usuario.email}</Text>
          <Boton
            texto="Cerrar sesión"
            onPress={() => {
              usarToken(null);
              setSesion(null);
            }}
          />
        </View>
      </ScrollView>
    );

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <Text style={estilos.titulo}>{registro ? "Crea tu cuenta" : "Inicia sesión"}</Text>
      {usaDatosSimulados && <Text style={estilos.suave}>Cuenta de prueba: se guarda solo en este móvil.</Text>}
      {registro && <TextInput style={estilos.campo} value={nombre} onChangeText={setNombre} placeholder="Nombre" accessibilityLabel="Nombre" />}
      <TextInput style={estilos.campo} value={email} onChangeText={setEmail} placeholder="Email" accessibilityLabel="Email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <TextInput style={estilos.campo} value={contrasena} onChangeText={setContrasena} placeholder="Contraseña" accessibilityLabel="Contraseña" secureTextEntry autoComplete="password" />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Boton texto={registro ? "Registrarme" : "Entrar"} onPress={entrar} cargando={cargando} />
      <Text style={[estilos.texto, { textAlign: "center" }]} onPress={() => setRegistro(!registro)} accessibilityRole="button">
        {registro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
      </Text>
    </ScrollView>
  );
}
