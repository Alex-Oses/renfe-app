import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { validarBillete } from "@renfe/shared/api/cliente";
import type { EstadoValidacion, ResultadoValidacion } from "@renfe/shared/api/tipos";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { Campo } from "@/components/Campo";
import { Cristal } from "@/components/Cristal";
import { Pantalla } from "@/components/Pantalla";
import { aFecha, fecha, hora } from "@/formato";
import { leerSesion } from "@/sesion";
import { colores, espaciado, estilos, fuentes } from "@/tema";

type Tono = "ok" | "aviso" | "error";
// Mismos textos que Revisor.tsx de la web.
const ESTADOS: Record<EstadoValidacion, { tono: Tono; titulo: string; accion: string }> = {
  valido: { tono: "ok", titulo: "Billete válido", accion: "Puede viajar." },
  ya_validado: { tono: "aviso", titulo: "Ya validado", accion: "Este billete ya se ha validado antes. Comprueba la identidad del viajero." },
  otro_dia: { tono: "aviso", titulo: "No es para hoy", accion: "El billete es auténtico, pero de otro día." },
  caducado: { tono: "error", titulo: "Billete caducado", accion: "Ese viaje ya terminó." },
  anulado: { tono: "error", titulo: "Billete anulado", accion: "La reserva está cancelada." },
  agotado: { tono: "error", titulo: "Bono sin viajes", accion: "Este bono ya no tiene viajes. Tiene que comprar un billete." },
  falso: { tono: "error", titulo: "Billete falso", accion: "El código no es de un billete de Renfe o ha sido modificado." },
  no_existe: { tono: "error", titulo: "Billete no encontrado", accion: "El código es auténtico pero no consta en el sistema." },
};
const ESTADOS_ABONO: Partial<typeof ESTADOS> = {
  valido: { tono: "ok", titulo: "Abono válido", accion: "Puede viajar." },
  otro_dia: { tono: "aviso", titulo: "Abono aún no vigente", accion: "El abono es auténtico, pero empieza otro día." },
  caducado: { tono: "error", titulo: "Abono caducado", accion: "Su validez ya terminó. Tiene que comprar un billete." },
};
const ver = (r: ResultadoValidacion) => (r.abono && ESTADOS_ABONO[r.estado]) || ESTADOS[r.estado];

export default function Revisor() {
  const rol = leerSesion()?.usuario.rol;
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [resultado, setResultado] = useState<ResultadoValidacion | null>(null);
  const [error, setError] = useState("");
  const [codigo, setCodigo] = useState("");
  const ocupado = useRef(false); // la cámara lee el mismo QR varias veces por segundo

  async function comprobar(texto: string) {
    if (ocupado.current) return;
    ocupado.current = true;
    setError("");
    try {
      setResultado(await validarBillete(texto));
    } catch (e) {
      setError((e as Error).message);
      ocupado.current = false;
    }
  }

  const otro = () => {
    setResultado(null);
    setCodigo("");
    ocupado.current = false;
  };

  if (rol !== "revisor" && rol !== "admin")
    return (
      <Pantalla volver={() => router.back()}>
        <Text style={estilos.h1}>Modo revisor</Text>
        <Aviso tipo="info" texto="Solo el personal de revisión puede validar billetes. Entra con una cuenta de revisor." />
      </Pantalla>
    );

  if (resultado) {
    const e = ver(resultado);
    const b = resultado.billete;
    const a = resultado.abono;
    return (
      <Pantalla volver={() => router.back()}>
        <Text style={estilos.h1}>{e.titulo}</Text>
        <Aviso tipo={e.tono} texto={e.accion} />
        {b ? (
          <Cristal gap={espaciado[1]}>
            <Text style={styles.titulo}>{b.pasajero}</Text>
            <Text style={styles.dato}>Documento {b.documento} · Localizador {b.localizador}</Text>
            <Text style={styles.dato}>{b.tipo} {b.numero} · {b.origen} – {b.destino}</Text>
            <Text style={styles.dato}>{fecha(b.salida)}, {hora(b.salida)} – {hora(b.llegada)}</Text>
            <Text style={styles.dato}>Coche {b.coche} · Asiento {b.asiento} · {b.clase}</Text>
          </Cristal>
        ) : null}
        {a ? (
          <Cristal gap={espaciado[1]}>
            <Text style={styles.titulo}>{a.nombre}</Text>
            <Text style={styles.dato}>Titular {a.titular}</Text>
            <Text style={styles.dato}>{a.origen ? `${a.origen} – ${a.destino}` : "Todo el núcleo"}</Text>
            <Text style={styles.dato}>Del {aFecha(a.inicio)} al {aFecha(a.fin)}</Text>
            <Text style={styles.dato}>{a.viajesRestantes === null ? "Viajes ilimitados" : `Quedan ${a.viajesRestantes} viajes`}</Text>
          </Cristal>
        ) : null}
        {resultado.primeraValidacion ? (
          <Text style={estilos.suave}>Primera validación: {fecha(resultado.primeraValidacion)}, {hora(resultado.primeraValidacion)}</Text>
        ) : null}
        {!resultado.comprobadoEnServidor ? <Text style={estilos.suave}>Comprobado solo con la firma (sin API).</Text> : null}
        <Boton texto="Escanear otro" icono="refrescar" onPress={otro} />
      </Pantalla>
    );
  }

  return (
    <Pantalla volver={() => router.back()}>
      <View style={{ gap: espaciado[2] }}>
        <Text style={estilos.h1}>Modo revisor</Text>
        <Text style={estilos.suave}>Apunta al QR de un billete o un abono.</Text>
      </View>
      {permiso?.granted ? (
        <View style={styles.camara}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={({ data }) => void comprobar(data)}
          />
        </View>
      ) : (
        <Cristal gap={espaciado[2]}>
          <Text style={styles.dato}>Hace falta la cámara para leer los QR.</Text>
          <Boton texto="Permitir la cámara" onPress={() => void pedirPermiso()} />
        </Cristal>
      )}
      {error ? <Aviso texto={error} /> : null}
      <Cristal gap={espaciado[2]}>
        <Campo etiqueta="O pega el código" value={codigo} onChangeText={setCodigo} autoCapitalize="none" placeholder="RNF1…" />
        <Boton texto="Comprobar" variante="secundario" desactivado={!codigo.trim()} onPress={() => void comprobar(codigo.trim())} />
      </Cristal>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  camara: { height: 320, borderRadius: 20, overflow: "hidden", backgroundColor: "#000" },
  titulo: { fontFamily: fuentes.seminegrita, fontSize: 16, color: colores.titulo },
  dato: { fontFamily: fuentes.normal, fontSize: 13.5, color: colores.texto },
});
