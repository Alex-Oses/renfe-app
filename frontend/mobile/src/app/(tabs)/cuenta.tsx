import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { alSesionInvalida, iniciarSesion, misBilletes, registrarse, usaDatosSimulados } from "@renfe/shared/api/cliente";
import { CUENTAS_DEMO } from "@renfe/shared/api/simulado-cuenta";
import { DESCUENTOS } from "@renfe/shared/api/simulado-precios";
import type { Sesion } from "@renfe/shared/api/tipos";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { Campo, CampoBoton, CampoClave } from "@/components/Campo";
import { Cristal } from "@/components/Cristal";
import { Icono, type NombreIcono } from "@/components/Icono";
import { Pantalla } from "@/components/Pantalla";
import { SelectorDescuento } from "@/components/Selectores";
import { descuentoGuardado, guardarDescuento } from "@/components/Buscador";
import { enExpoGo } from "@/confirmarPago";
import { guardarSesion, leerSesion } from "@/sesion";
import { colores, espaciado, estilos, fuentes, gradientes, radios, sombras, tipografia, tonos } from "@/tema";

type Pestana = "entrar" | "crear";
type Errores = { nombre?: string; email?: string; contrasena?: string; general?: string };

// Reparte el mensaje de la API junto al campo al que se refiere, como en la web (Acceder.tsx).
function repartir(mensaje: string): Errores {
  if (/email/i.test(mensaje)) return { email: mensaje };
  if (/contraseña/i.test(mensaje)) return { contrasena: mensaje };
  if (/nombre/i.test(mensaje)) return { nombre: mensaje };
  return { general: mensaje };
}

// Cuentas de demostración (las mismas que la web): revisión y administración.
const DEMOS = ["revisor@renfe-app.demo", "admin@renfe-app.demo"];

const nombreDescuento = (id: string) => DESCUENTOS.find((d) => d.id === id)?.nombre ?? "Sin descuento";

const ROL: Record<string, string> = { viajero: "Viajero", revisor: "Revisor", admin: "Administración" };

const OPCIONES: { titulo: string; detalle: string; icono: NombreIcono; ruta: string }[] = [
  { titulo: "Asistente Renfe", detalle: "Pregunta por trenes, estaciones y horarios", icono: "info", ruta: "/chatbot" },
  { titulo: "Mis billetes", detalle: "QR y localizadores de tus viajes", icono: "billetes", ruta: "/billetes" },
  { titulo: "Mis abonos", detalle: "Abonos y bonos con su QR", icono: "billetes", ruta: "/abonos" },
  { titulo: "Mis líneas", detalle: "Tus trayectos habituales", icono: "lineas", ruta: "/lineas" },
  { titulo: "Trenes en directo", detalle: "Mapa, próxima parada y retrasos", icono: "mapa", ruta: "/directo" },
];

const REVISOR = { titulo: "Modo revisor", detalle: "Escanea y valida billetes y abonos", icono: "check" as NombreIcono, ruta: "/revisor" };
const ADMIN = {
  titulo: "Administración",
  detalle: "Resumen de ventas, reservas y usuarios",
  icono: "cuenta" as NombreIcono,
  ruta: "/admin",
};
const CARA = {
  titulo: "Registrar mi cara",
  detalle: "Entra sin contraseña mirando a la cámara",
  icono: "cara" as NombreIcono,
  ruta: "/cara?modo=registrar",
};

export default function Cuenta() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [pestana, setPestana] = useState<Pestana>("entrar");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [puntos, setPuntos] = useState<number | null>(null);
  const [descuento, setDescuento] = useState(descuentoGuardado);
  const [hojaDescuento, setHojaDescuento] = useState(false);

  // La sesión se guarda en sessionStorage (en la app, SQLite): sobrevive a recargar sin cerrar.
  // Se relee al volver de /cara, que es donde se escribe la sesión del facial.
  useFocusEffect(useCallback(() => setSesion(leerSesion()), []));
  useEffect(() => alSesionInvalida(() => setSesion(null)), []);

  // shortcut: 1 punto por euro de asiento, calculado en el dispositivo como en la web; la API real los guardará.
  useEffect(() => {
    if (!sesion) return setPuntos(null);
    misBilletes().then((bs) => setPuntos(Math.floor(bs.reduce((s, b) => s + b.asiento.precio, 0))), () => setPuntos(0));
  }, [sesion]);

  const entrar = (s: Sesion) => {
    guardarSesion(s);
    setSesion(s);
    setContrasena("");
  };

  const cerrarSesion = () => {
    guardarSesion(null);
    setSesion(null);
    setErrores({});
    setNombre("");
    setEmail("");
    setContrasena("");
    setPestana("entrar");
  };

  const cambiar = (p: Pestana) => {
    setPestana(p);
    setErrores({});
  };

  const validar = () => {
    const e: Errores = {};
    if (pestana === "crear" && !nombre.trim()) e.nombre = "Escribe tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Escribe un email válido.";
    if (!contrasena) e.contrasena = "Escribe tu contraseña.";
    else if (pestana === "crear" && contrasena.length < 8)
      e.contrasena = "La contraseña necesita al menos 8 caracteres.";
    return e;
  };

  const enviar = async () => {
    const fallos = validar();
    if (Object.keys(fallos).length) return setErrores(fallos);
    setErrores({});
    setEnviando(true);
    try {
      const s =
        pestana === "entrar"
          ? await iniciarSesion({ email: email.trim(), contrasena })
          : await registrarse({ nombre: nombre.trim(), email: email.trim(), contrasena });
      entrar(s);
      // Cada pago se confirma con la cara: al crear la cuenta se registra sí o sí (en Expo Go no hay
      // ONNX, así que se deja para la APK).
      if (pestana === "crear" && !s.usuario.caraRegistrada && !enExpoGo)
        router.push({ pathname: "/cara", params: { modo: "registrar", obligatorio: "1" } } as never);
    } catch (e) {
      setErrores(repartir((e as Error).message));
    } finally {
      setEnviando(false);
    }
  };

  const entrarDemo = async (email: string) => {
    setErrores({});
    setEnviando(true);
    try {
      entrar(await iniciarSesion({ email, contrasena: CUENTAS_DEMO[email].contrasena }));
    } catch (e) {
      setErrores(repartir((e as Error).message));
    } finally {
      setEnviando(false);
    }
  };

  if (sesion) {
    const { usuario } = sesion;
    const iniciales = usuario.nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
    const rol = usuario.rol ?? "viajero";

    return (
      <Pantalla>
        <View style={styles.cabecera}>
          <Text style={estilos.h1}>Mi cuenta</Text>
          <Text style={estilos.suave}>Tus datos, tus billetes y tus líneas en un solo sitio.</Text>
        </View>

        <LinearGradient
          colors={gradientes.marca}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.perfil}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{iniciales || "R"}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text style={styles.perfilNombre} numberOfLines={1}>
              {usuario.nombre}
            </Text>
            <Text style={styles.perfilEmail} numberOfLines={1}>
              {usuario.email}
            </Text>
            <View style={styles.rol}>
              <Text style={styles.rolTexto}>{ROL[rol] ?? rol}</Text>
            </View>
          </View>
        </LinearGradient>

        <Cristal gap={espaciado[1]}>
          <Text style={styles.estadoTitulo}>Tus puntos</Text>
          <Text style={styles.puntos}>
            {puntos === null ? "…" : puntos} <Text style={styles.estadoTexto}>puntos</Text>
          </Text>
          <Text style={styles.estadoTexto}>
            Sumas un punto por cada euro de tus billetes. Es una simulación: todavía no se pueden canjear.
          </Text>
        </Cristal>

        <Cristal gap={espaciado[2]}>
          <Text style={styles.estadoTitulo}>Tarjetas y descuentos</Text>
          <Text style={styles.estadoTexto}>
            El buscador usará este descuento por defecto. Llévalo encima al viajar: el interventor puede pedírtelo.
          </Text>
          <CampoBoton
            etiqueta="Tu tarjeta o descuento"
            valor={nombreDescuento(descuento)}
            placeholder="Sin descuento"
            onPress={() => setHojaDescuento(true)}
          />
        </Cristal>

        <Cristal gap={espaciado[2]}>
          <Text style={styles.estadoTitulo}>Acceso con tu cara</Text>
          <Text style={styles.estadoTexto}>
            {usuario.caraRegistrada
              ? "Activado: puedes entrar con tu cara. La contraseña sigue funcionando."
              : "Sin activar. Regístrala para entrar mirando a la cámara: la huella se calcula en este teléfono."}
          </Text>
          <Boton
            texto={usuario.caraRegistrada ? "Volver a registrar mi cara" : "Registrar mi cara"}
            variante="secundario"
            icono="cara"
            onPress={() => router.navigate({ pathname: "/cara", params: { modo: "registrar" } } as never)}
          />
        </Cristal>

        <View style={styles.opciones}>
          {[
            CARA,
            ...OPCIONES,
            ...(rol === "revisor" || rol === "admin" ? [REVISOR] : []),
            ...(rol === "admin" ? [ADMIN] : []),
          ].map((o) => (
            <Pressable
              key={o.ruta}
              accessibilityRole="button"
              accessibilityLabel={`${o.titulo}. ${o.detalle}`}
              onPress={() => router.navigate(o.ruta as never)}
              style={({ pressed }) => [styles.opcion, pressed && { backgroundColor: "rgba(214,45,97,0.07)" }]}
            >
              <View style={styles.opcionIcono}>
                <Icono nombre={o.icono} tamano={21} color={colores.marca} />
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                <Text style={styles.opcionTitulo}>{o.titulo}</Text>
                <Text style={styles.opcionDetalle}>{o.detalle}</Text>
              </View>
              <Icono nombre="delante" tamano={18} color={colores.textoSuave} />
            </Pressable>
          ))}
        </View>

        <Cristal gap={espaciado[2]}>
          <View style={styles.estadoFila}>
            <View style={styles.estadoIcono}>
              <Icono nombre="cuenta" tamano={20} color={colores.marca} />
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={styles.estadoTitulo}>Sesión iniciada</Text>
              <Text style={styles.estadoTexto}>
                {usaDatosSimulados
                  ? "Modo demo: la cuenta se guarda solo en este dispositivo."
                  : "Tus billetes se guardan en tu cuenta."}
              </Text>
            </View>
          </View>
        </Cristal>

        <Boton texto="Cerrar sesión" variante="secundario" icono="cerrar" onPress={cerrarSesion} />

        <SelectorDescuento
          visible={hojaDescuento}
          valor={descuento}
          onCerrar={() => setHojaDescuento(false)}
          onElegir={(id) => {
            setDescuento(id);
            guardarDescuento(id);
          }}
        />
      </Pantalla>
    );
  }

  const creando = pestana === "crear";

  return (
    <Pantalla>
      <View style={styles.cabecera}>
        <Text style={estilos.h1}>{creando ? "Crea tu cuenta" : "Entra en tu cuenta"}</Text>
        <Text style={estilos.suave}>
          {creando
            ? "Guarda tus billetes y tus líneas para tenerlos siempre a mano."
            : "Accede para ver tus billetes, tus líneas y tus datos."}
        </Text>
      </View>

      <View style={styles.pestanas}>
        {(["entrar", "crear"] as const).map((p) => {
          const activa = pestana === p;
          return (
            <Pressable
              key={p}
              accessibilityRole="tab"
              accessibilityState={{ selected: activa }}
              onPress={() => cambiar(p)}
              style={({ pressed }) => [styles.pestana, activa && styles.pestanaActiva, pressed && { opacity: 0.8 }]}
            >
              <Text style={[styles.pestanaTexto, activa && styles.pestanaTextoActivo]}>
                {p === "entrar" ? "Entrar" : "Crear cuenta"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Cristal gap={espaciado[3]}>
        {creando ? (
          <Campo
            etiqueta="Nombre"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            autoComplete="name"
            error={errores.nombre}
          />
        ) : null}
        <Campo
          etiqueta="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="tucorreo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errores.email}
        />
        <CampoClave
          etiqueta="Contraseña"
          valor={contrasena}
          alCambiar={setContrasena}
          error={errores.contrasena}
          conFuerza={creando}
        />
        {errores.general ? <Aviso texto={errores.general} tipo="error" /> : null}
        <Boton
          texto={creando ? "Crear cuenta" : "Entrar"}
          onPress={enviar}
          cargando={enviando}
          desactivado={enviando}
        />
      </Cristal>

      {!creando ? (
        <Cristal gap={espaciado[2]}>
          <Text style={styles.estadoTitulo}>Entrar con tu cara</Text>
          <Text style={styles.estadoTexto}>
            La cámara y la huella de tu cara se quedan en este teléfono. Solo se envía la huella a tu cuenta.
          </Text>
          <Boton
            texto="Entrar con tu cara"
            variante="secundario"
            icono="cara"
            onPress={() => router.navigate({ pathname: "/cara", params: { email } } as never)}
          />
        </Cristal>
      ) : null}

      {usaDatosSimulados ? (
        <View style={styles.demo}>
          <View style={styles.demoIcono}>
            <Icono nombre="info" tamano={20} color={colores.marca} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: espaciado[1] }}>
            <Text style={styles.demoTitulo}>¿Solo quieres probar?</Text>
            <Text style={styles.demoTexto}>Entra con una cuenta de la demo: revisión o administración.</Text>
            <View style={styles.demoBotones}>
              {DEMOS.map((d) => (
                <Pressable
                  key={d}
                  accessibilityRole="button"
                  accessibilityLabel={`Entrar con la cuenta de prueba ${CUENTAS_DEMO[d].rol}`}
                  disabled={enviando}
                  onPress={() => entrarDemo(d)}
                  style={({ pressed }) => [styles.demoBoton, pressed && { opacity: 0.65 }]}
                >
                  <Text style={styles.demoBotonTexto}>
                    {CUENTAS_DEMO[d].rol === "admin" ? "Administración" : "Revisión"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      ) : null}

      <Text style={styles.pie}>
        Al entrar aceptas que esta es una demo de clase: los pagos, asientos y cuentas son simulados.
      </Text>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  cabecera: { gap: espaciado[2], paddingTop: espaciado[2] },
  pestanas: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: radios.pildora,
    backgroundColor: "rgba(255,255,255,0.62)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
  },
  pestana: {
    flex: 1,
    minHeight: 44,
    borderRadius: radios.pildora,
    alignItems: "center",
    justifyContent: "center",
  },
  pestanaActiva: { backgroundColor: colores.marca, ...sombras[1] },
  pestanaTexto: { fontFamily: fuentes.seminegrita, fontSize: 14.4, color: colores.textoSuave },
  pestanaTextoActivo: { color: "#fff" },
  demo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[3],
    padding: espaciado[3],
    borderRadius: 16,
    backgroundColor: tonos.rosa,
    borderWidth: 1,
    borderColor: "rgba(129,0,94,0.12)",
  },
  demoIcono: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  demoTitulo: { fontFamily: fuentes.seminegrita, fontSize: 14, color: colores.titulo },
  demoTexto: { fontFamily: fuentes.normal, fontSize: 12.2, color: colores.textoSuave },
  demoBotones: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  demoBoton: {
    minHeight: 36,
    borderRadius: radios.pildora,
    borderWidth: 1,
    borderColor: colores.marca,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  demoBotonTexto: { fontFamily: fuentes.seminegrita, fontSize: 12.6, color: colores.marca },
  pie: {
    fontFamily: fuentes.normal,
    fontSize: 11.6,
    lineHeight: 16.5,
    color: colores.textoSuave,
    textAlign: "center",
    paddingHorizontal: espaciado[3],
  },
  perfil: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[3],
    borderRadius: 22,
    padding: espaciado[4],
    ...sombras[3],
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: { fontFamily: fuentes.negrita, fontSize: 23, color: "#fff", letterSpacing: -0.5 },
  perfilNombre: { fontFamily: fuentes.negrita, fontSize: 20.5, color: "#fff", letterSpacing: -0.4 },
  perfilEmail: { fontFamily: fuentes.normal, fontSize: 12.8, color: "rgba(255,255,255,0.82)" },
  rol: {
    alignSelf: "flex-start",
    marginTop: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  rolTexto: { fontFamily: fuentes.negrita, fontSize: 10, letterSpacing: 0.5, color: "#fff", textTransform: "uppercase" },
  opciones: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    overflow: "hidden",
  },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[3],
    paddingHorizontal: espaciado[3],
    paddingVertical: espaciado[3],
    borderBottomWidth: 1,
    borderBottomColor: "rgba(217,223,229,0.7)",
  },
  opcionIcono: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: tonos.moradoSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  opcionTitulo: { fontFamily: fuentes.seminegrita, fontSize: 14.6, color: colores.texto },
  opcionDetalle: { fontFamily: fuentes.normal, fontSize: 11.8, color: colores.textoSuave },
  estadoFila: { flexDirection: "row", alignItems: "center", gap: espaciado[3] },
  estadoIcono: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: tonos.exitoFondo,
    alignItems: "center",
    justifyContent: "center",
  },
  estadoTitulo: { fontFamily: fuentes.seminegrita, fontSize: 14, color: colores.texto },
  puntos: { fontFamily: fuentes.negrita, fontSize: 28, color: colores.marca, letterSpacing: -0.6 },
  estadoTexto: { fontFamily: fuentes.normal, fontSize: 12.2, color: colores.textoSuave, lineHeight: 17 },
});
