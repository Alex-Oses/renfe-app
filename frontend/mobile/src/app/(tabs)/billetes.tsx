import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { misBilletes } from "@renfe/shared/api/cliente";
import type { Billete } from "@renfe/shared/api/tipos";
import { agrupar, type Viaje } from "@/billetes";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { IconoBilleteGrande } from "@/components/Icono";
import { Pantalla } from "@/components/Pantalla";
import { TarjetaBillete } from "@/components/TarjetaBillete";
import { colores, espaciado, estilos, fuentes, tipografia } from "@/tema";

// Los billetes de una misma compra se enseñan juntos, como en la web (MisBilletes.tsx).
export default function Billetes() {
  const [billetes, setBilletes] = useState<Billete[] | null>(null);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    setError("");
    misBilletes().then(setBilletes, (e: Error) => setError(e.message));
  }, []);

  // Se recarga al volver a la pestaña (por ejemplo, después de comprar).
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const reintentar = () => {
    setBilletes(null);
    cargar();
  };

  const ahora = Date.now();
  const viajes = agrupar(billetes ?? []);
  const proximos = viajes.filter((v) => Date.parse(v.billetes[0].tren.llegada) >= ahora);
  const pasados = viajes.filter((v) => Date.parse(v.billetes[0].tren.llegada) < ahora).reverse();

  const abrir = (b: Billete) => router.push({ pathname: "/billete/[id]", params: { id: b.id } });

  return (
    <Pantalla>
      <View style={styles.cabecera}>
        <Text style={estilos.h1}>Mis billetes</Text>
        <Text style={estilos.suave}>
          Tus viajes con el QR y el localizador siempre a mano, sin imprimir nada.
        </Text>
      </View>

      {error && billetes === null ? (
        <>
          <Aviso texto={error} tipo="error" />
          <Boton texto="Reintentar" icono="refrescar" onPress={reintentar} />
        </>
      ) : billetes === null ? (
        <View style={styles.cargando}>
          <ActivityIndicator color={colores.marca} size="large" />
          <Text style={estilos.suave}>Cargando tus billetes…</Text>
        </View>
      ) : billetes.length === 0 ? (
        <View style={styles.vacio}>
          <View style={styles.vacioIcono}>
            <IconoBilleteGrande tamano={54} />
          </View>
          <Text style={styles.vacioTitulo}>Aún no tienes billetes</Text>
          <Text style={styles.vacioTexto}>
            Cuando compres uno aparecerá aquí, listo para enseñar en el andén.
          </Text>
          <Boton texto="Buscar un tren" icono="comprar" onPress={() => router.navigate("/")} />
        </View>
      ) : (
        <>
          {error ? <Aviso texto={error} tipo="aviso" /> : null}

          <View style={styles.seccion}>
            <View style={styles.seccionCabecera}>
              <Text style={estilos.h2}>Próximos viajes</Text>
              {proximos.length > 0 ? (
                <Text style={styles.cuenta}>
                  {proximos.length} {proximos.length === 1 ? "viaje" : "viajes"}
                </Text>
              ) : null}
            </View>
            {proximos.length === 0 ? (
              <View style={styles.pendientes}>
                <Text style={estilos.suave}>No tienes viajes pendientes.</Text>
              </View>
            ) : (
              <View style={styles.lista}>
                {proximos.map((v) => (
                  <TarjetaBillete key={v.reservaId} viaje={v} onAbrir={abrir} />
                ))}
              </View>
            )}
          </View>

          {pasados.length > 0 ? (
            <View style={styles.seccion}>
              <View style={styles.seccionCabecera}>
                <Text style={estilos.h2}>Viajes pasados</Text>
                <Text style={styles.cuenta}>
                  {pasados.length} {pasados.length === 1 ? "viaje" : "viajes"}
                </Text>
              </View>
              <View style={styles.lista}>
                {pasados.map((v) => (
                  <TarjetaBillete key={v.reservaId} viaje={v} pasado onAbrir={abrir} />
                ))}
              </View>
            </View>
          ) : null}
        </>
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  cabecera: { gap: espaciado[2], paddingTop: espaciado[2] },
  cargando: { alignItems: "center", gap: espaciado[3], paddingVertical: 40 },
  vacio: {
    alignItems: "center",
    gap: espaciado[3],
    paddingHorizontal: 20,
    paddingVertical: espaciado[8],
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
  },
  vacioIcono: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(129,0,94,0.08)",
    marginBottom: espaciado[1],
  },
  vacioTitulo: {
    fontFamily: fuentes.negrita,
    fontSize: tipografia.tamanos.xl,
    color: colores.titulo,
    textAlign: "center",
  },
  vacioTexto: {
    fontFamily: fuentes.normal,
    fontSize: tipografia.tamanos.base,
    lineHeight: 22,
    color: colores.textoSuave,
    textAlign: "center",
  },
  seccion: { gap: espaciado[3], marginTop: espaciado[2] },
  seccionCabecera: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: espaciado[2] },
  cuenta: { fontFamily: fuentes.medio, fontSize: tipografia.tamanos.sm, color: colores.textoSuave },
  pendientes: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: "rgba(255,255,255,0.62)",
    padding: espaciado[4],
  },
  lista: { gap: espaciado[4] },
});
