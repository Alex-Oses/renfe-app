// El facial corre en el propio dispositivo: SCRFD detecta la cara, ArcFace la convierte en 512
// floats y solo esa huella viaja a la API (ADR-007). Sin navegador ni WebView: la imagen no sale
// del teléfono. Al usar onnxruntime-react-native hace falta build propio, no Expo Go.
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { registrarCara, usarToken, verificarCara } from "@renfe/shared/api/cliente";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { Campo } from "@/components/Campo";
import { Cristal } from "@/components/Cristal";
import { cargarModelos, detectarCara, fotoDeJpeg, huellaArcFace } from "@/fotos/ficha";
import { normalizar } from "@/fotos/matematica";
import { resolverCara } from "@/confirmarPago";
import { guardarSesion, leerSesion } from "@/sesion";
import { colores, espaciado, estilos, fuentes } from "@/tema";

// shortcut: se promedian 5 capturas y no hay liveness (con los 5 puntos de SCRFD no se mide el
// parpadeo, que sí hace la web). Para endurecer la demo: subir MUESTRAS o añadir un reto de
// movimiento pidiendo un giro de cabeza.
const MUESTRAS = 5;
const PAUSA_MS = 400;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const pausa = () => new Promise((r) => setTimeout(r, PAUSA_MS));

async function capturar(ref: CameraView | null) {
  try {
    const foto = await ref?.takePictureAsync({ quality: 0.5 });
    return foto?.uri ? await fotoDeJpeg(foto.uri) : null;
  } catch {
    return null; // la cámara aún no está lista: se reintenta en la siguiente vuelta
  }
}

export default function Cara() {
  const { modo, email: emailParam, obligatorio } = useLocalSearchParams<{ modo?: string; email?: string; obligatorio?: string }>();
  const registrar = modo === "registrar";
  // Pago: se comprueba la cara del titular (o se registra si aún no la tiene) y se vuelve a la compra.
  const pago = modo === "pago";
  // Tras crear la cuenta: no se puede salir sin registrar la cara (solo cerrando la sesión).
  const forzado = registrar && obligatorio === "1";
  // La sesión no cambia mientras la pantalla esté abierta: se lee una vez al montar.
  const sesion = useMemo(() => (registrar || pago ? leerSesion() : null), [registrar, pago]);
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [email, setEmail] = useState(emailParam ?? "");
  // Si el email viene de Cuenta no hay que volver a escribirlo.
  const [confirmado, setConfirmado] = useState(() => EMAIL_OK.test(emailParam ?? ""));
  const [listo, setListo] = useState(false); // la cámara ya puede hacer fotos
  const [fase, setFase] = useState<"camara" | "procesando" | "ok" | "error">("camara");
  const [mensaje, setMensaje] = useState("Buscando tu cara…");
  const [error, setError] = useState("");
  const [reintento, setReintento] = useState(0);
  // Tamaño de foto: el más pequeño que siga valiendo, para que decodificar el JPEG no tarde.
  const [tamano, setTamano] = useState<string | undefined>(undefined);
  const camara = useRef<CameraView>(null);
  const preparado = useRef(false);
  const activo = useRef(false);

  const sinEmail = !registrar && !pago && !(EMAIL_OK.test(email.trim()) && confirmado);

  // Salir de la pantalla del pago sin cara comprobada cancela el pago.
  useEffect(() => () => { if (pago) resolverCara(false); }, [pago]);

  // Bucle de captura: fotos seguidas, y cuando junta MUESTRAS huellas manda la media a la API.
  // Ojo: `fase` se lee en el guard pero no está en las deps a propósito, para que cambiar de fase
  // no reinicie el bucle (lo que lo reinicia es `reintento`).
  useEffect(() => {
    if (!permiso?.granted || !listo || sinEmail || fase !== "camara") return;
    let cancelado = false;
    activo.current = true;
    (async () => {
      try {
        const { deteccion, cara } = await cargarModelos();
        const huellas: number[][] = [];
        let fallos = 0;
        while (activo.current && !cancelado) {
          const foto = await capturar(camara.current);
          if (!foto) {
            if (++fallos > 8) throw new Error("La cámara no consigue hacer la foto. Vuelve a abrir esta pantalla.");
            await pausa();
            continue;
          }
          fallos = 0;
          const det = await detectarCara(deteccion, foto.datos, foto.ancho, foto.alto);
          const menor = Math.min(foto.ancho, foto.alto);
          if (!det) setMensaje("Buscando tu cara…");
          else if (Math.min(det.caja.x2 - det.caja.x1, det.caja.y2 - det.caja.y1) / menor < 0.3)
            setMensaje("Acércate un poco");
          else if (det.score < 0.75) setMensaje("Mira al frente");
          else {
            setMensaje("Mantén la cara quieta…");
            huellas.push(await huellaArcFace(cara, foto.datos, foto.ancho, foto.alto, det.puntos));
            if (huellas.length >= MUESTRAS) break;
          }
          await pausa();
        }
        if (cancelado || huellas.length < MUESTRAS) return; // no se manda nada a medias
        activo.current = false;
        setFase("procesando");
        const media = normalizar(huellas[0]!.map((_, i) => huellas.reduce((s, h) => s + h[i]!, 0) / huellas.length));
        if (pago && sesion) {
          // La API solo cobra con un token de cara recién comprobada (claim cara_en): siempre se
          // verifica, y si la cuenta aún no tiene cara se registra antes con la misma huella.
          if (!sesion.usuario.caraRegistrada) await registrarCara(media);
          guardarSesion(await verificarCara({ email: sesion.usuario.email, embedding: media }));
        } else if (registrar) {
          await registrarCara(media);
          if (sesion) guardarSesion({ ...sesion, usuario: { ...sesion.usuario, caraRegistrada: true } });
        } else if (!pago) guardarSesion(await verificarCara({ email: email.trim(), embedding: media }));
        // pago sin sesión (modo simulado, sin API): basta con haber captado la cara.
        if (cancelado) return;
        if (pago) {
          resolverCara(true);
          router.back();
          return;
        }
        setFase("ok");
      } catch (e) {
        activo.current = false;
        if (!cancelado) {
          setError((e as Error).message);
          setFase("error");
        }
      }
    })();
    return () => {
      cancelado = true;
      activo.current = false;
    };
  }, [permiso?.granted, listo, sinEmail, fase, registrar, pago, sesion, email, reintento]);

  // Antes de la primera foto: el tamaño más pequeño que siga valiendo para detectar la cara.
  const alEstarLista = async () => {
    if (preparado.current) return;
    preparado.current = true;
    try {
      const tamanos = await camara.current?.getAvailablePictureSizesAsync();
      const ancho = (t: string) => Number(t.split("x")[0]) || 0;
      // El más pequeño de al menos 640 px: sobra para SCRFD y la foto se decodifica enseguida.
      setTamano(tamanos?.filter((t) => ancho(t) >= 640).sort((a, b) => ancho(a) - ancho(b))[0]);
    } catch {
      /* sin lista de tamaños se usa el por defecto de la cámara */
    }
    setListo(true);
  };

  const volver = () => {
    if (forzado) {
      guardarSesion(null); // sin cara no hay cuenta usable: la única salida es cerrar la sesión
      usarToken(null);
    }
    router.back();
  };
  const textoSalir = forzado ? "Cerrar sesión" : pago ? "Cancelar el pago" : "Cancelar";
  const reintentar = () => {
    setError("");
    setMensaje("Buscando tu cara…");
    setFase("camara");
    setReintento((n) => n + 1);
  };

  let cuerpo: ReactNode;
  if (!permiso) {
    cuerpo = (
      <View style={styles.centro}>
        <Text style={estilos.suave}>Preparando la cámara…</Text>
      </View>
    );
  } else if (registrar && !sesion) {
    cuerpo = (
      <>
        <Text style={estilos.h1}>Registrar mi cara</Text>
        <Aviso tipo="info" texto="Para guardar tu cara tienes que estar dentro de tu cuenta." />
        <Boton texto="Volver" variante="secundario" onPress={volver} />
      </>
    );
  } else if (sinEmail) {
    cuerpo = (
      <Cristal gap={espaciado[2]}>
        <Text style={estilos.h1}>Entrar con tu cara</Text>
        <Text style={estilos.suave}>
          Escribe tu email y usa la cámara. La imagen se queda en este teléfono: solo viaja la huella numérica.
        </Text>
        <Campo
          etiqueta="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="tucorreo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Boton
          texto="Usar la cámara"
          icono="cara"
          desactivado={!EMAIL_OK.test(email.trim())}
          onPress={() => setConfirmado(true)}
        />
      </Cristal>
    );
  } else if (!permiso.granted) {
    cuerpo = (
      <Cristal gap={espaciado[2]}>
        <Text style={styles.dato}>Hace falta la cámara para reconocer tu cara.</Text>
        {permiso.canAskAgain ? (
          <Boton texto="Permitir la cámara" onPress={() => void pedirPermiso()} />
        ) : (
          <>
            <Aviso tipo="error" texto="La cámara está bloqueada. Actívala en los ajustes del teléfono." />
            <Boton texto="Abrir ajustes" variante="secundario" onPress={() => void Linking.openSettings()} />
          </>
        )}
      </Cristal>
    );
  } else if (fase === "ok") {
    cuerpo = (
      <>
        <Text style={estilos.h1}>{registrar ? "Cara registrada" : "Cara reconocida"}</Text>
        <Aviso tipo="ok" texto={registrar ? "Ya puedes entrar mirando a la cámara." : "Has entrado en tu cuenta."} />
        <Boton texto="Volver" onPress={() => router.back()} />
      </>
    );
  } else if (fase === "error") {
    cuerpo = (
      <>
        <Text style={estilos.h1}>No ha salido bien</Text>
        <Aviso tipo="error" texto={error} />
        <Boton texto="Reintentar" onPress={reintentar} />
        <Boton texto={textoSalir} variante="texto" onPress={volver} />
      </>
    );
  } else {
    cuerpo = (
      <>
        <View style={styles.camara}>
          <CameraView
            ref={camara}
            style={StyleSheet.absoluteFill}
            facing="front"
            pictureSize={tamano}
            onCameraReady={() => void alEstarLista()}
          />
          <View style={styles.overlay} pointerEvents="none">
            <Cristal style={styles.mensaje} gap={espaciado[1]}>
              <Text style={styles.mensajeTexto}>{fase === "procesando" ? "Enviando tu huella…" : mensaje}</Text>
            </Cristal>
          </View>
        </View>
        <Text style={estilos.suave}>
          {forzado ? "Último paso de tu cuenta: cada pago se confirma con tu cara. " : ""}
          La imagen se queda en el teléfono: solo se envía la huella a {registrar || pago ? "tu cuenta" : email.trim()}.
        </Text>
        <Boton texto={textoSalir} variante="texto" onPress={volver} />
      </>
    );
  }

  return (
    <View style={styles.raiz}>
      <Stack.Screen
        options={{
          title: pago ? "Confirmar el pago" : registrar ? "Registrar mi cara" : "Entrar con tu cara",
          gestureEnabled: !forzado,
          headerBackVisible: !forzado,
        }}
      />
      {cuerpo}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colores.fondo, padding: espaciado[3], gap: espaciado[3] },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: espaciado[2] },
  camara: { flex: 1, borderRadius: 20, overflow: "hidden", backgroundColor: "#000" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "flex-end", padding: espaciado[3] },
  mensaje: { alignSelf: "center" },
  mensajeTexto: { fontFamily: fuentes.seminegrita, fontSize: 14.5, color: colores.titulo, textAlign: "center" },
  dato: { fontFamily: fuentes.normal, fontSize: 13.5, color: colores.texto },
});
