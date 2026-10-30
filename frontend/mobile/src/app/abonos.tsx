import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { misAbonos } from "@renfe/shared/api/cliente";
import { estadoAbono } from "@renfe/shared/api/simulado-abonos";
import type { Abono } from "@renfe/shared/api/tipos";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { Icono } from "@/components/Icono";
import { Pantalla } from "@/components/Pantalla";
import { TEXTO_ESTADO, aFecha } from "@/formato";
import { leerSesion } from "@/sesion";
import { colores, espaciado, estilos, fuentes, tonos } from "@/tema";

// Mis abonos (como MisAbonos.tsx de la web): lista, estado y acceso al QR.
export default function Abonos() {
  const [abonos, setAbonos] = useState<Abono[] | null>(null);
  const [error, setError] = useState("");
  const conSesion = Boolean(leerSesion());

  // Se recarga al volver de comprar uno.
  useFocusEffect(
    useCallback(() => {
      if (!conSesion) return;
      setError("");
      misAbonos().then(setAbonos, (e: Error) => setError(e.message));
    }, [conSesion]),
  );

  return (
    <Pantalla volver={() => router.back()}>
      <View style={{ gap: espaciado[2] }}>
        <Text style={estilos.h1}>Mis abonos</Text>
        <Text style={estilos.suave}>Abonos y bonos para viajar a menudo. Enseña su QR al revisor.</Text>
      </View>

      {!conSesion ? (
        <>
          <Aviso tipo="info" texto="Entra en tu cuenta para ver y comprar abonos." />
          <Boton texto="Ir a mi cuenta" icono="cuenta" onPress={() => router.navigate("/cuenta")} />
        </>
      ) : (
        <>
          <Boton texto="Comprar un abono o bono" icono="mas" onPress={() => router.push("/comprar-abono" as never)} />
          {error ? <Aviso texto={error} /> : null}
          {!abonos && !error ? <ActivityIndicator color={colores.marca} /> : null}
          {abonos?.length === 0 ? <Text style={estilos.suave}>Todavía no tienes abonos ni bonos.</Text> : null}
          {abonos?.map((a) => {
            const estado = estadoAbono(a);
            return (
              <Pressable
                key={a.id}
                accessibilityRole="button"
                accessibilityLabel={`${a.nombre}, ${TEXTO_ESTADO[estado]}. Ver QR`}
                onPress={() => router.push({ pathname: "/abono/[id]", params: { id: a.id } } as never)}
                style={({ pressed }) => [styles.tarjeta, pressed && { opacity: 0.8 }]}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.titulo}>{a.nombre}</Text>
                  {a.origen ? <Text style={styles.texto}>{a.origen.nombre} – {a.destino?.nombre}</Text> : null}
                  <Text style={styles.texto}>
                    <Text style={[styles.estado, estado === "vigente" ? styles.ok : styles.mal]}>{TEXTO_ESTADO[estado]}</Text>
                    {`  Del ${aFecha(a.inicio)} al ${aFecha(a.fin)}`}
                  </Text>
                  <Text style={styles.texto}>
                    {a.viajesRestantes === null ? "Viajes ilimitados" : `Te quedan ${a.viajesRestantes} de ${a.viajesTotales} viajes`}
                  </Text>
                </View>
                <Icono nombre="delante" tamano={18} color={colores.textoSuave} />
              </Pressable>
            );
          })}
        </>
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[3],
    padding: espaciado[3],
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
  },
  titulo: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.titulo },
  texto: { fontFamily: fuentes.normal, fontSize: 12.6, color: colores.textoSuave },
  estado: { fontFamily: fuentes.seminegrita },
  ok: { color: tonos.exito },
  mal: { color: tonos.aviso },
});
