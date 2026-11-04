// Panel de administración, igual que Admin.tsx de la web: resumen de la API (propuesto) y
// las secciones que quedan por hacer. Solo para cuentas con rol admin.
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { resumenAdmin } from "@renfe/shared/api/cliente";
import type { ResumenAdmin } from "@renfe/shared/api/tipos";
import { euros } from "@renfe/shared/formato/formato";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { Cristal } from "@/components/Cristal";
import { Pantalla } from "@/components/Pantalla";
import { leerSesion } from "@/sesion";
import { colores, espaciado, estilos, fuentes, tonos } from "@/tema";

const ESTADO: Record<string, string> = {
  pendiente_pago: "pendiente pago",
  pagada: "pagada",
  cancelada: "cancelada",
};

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: number | string }) {
  return (
    <View style={styles.cifra}>
      <Text style={styles.cifraEtiqueta}>{etiqueta}</Text>
      <Text style={styles.cifraValor}>{valor}</Text>
    </View>
  );
}

export default function Admin() {
  const sesion = leerSesion();
  const esAdmin = sesion?.usuario.rol === "admin";
  const [datos, setDatos] = useState<ResumenAdmin | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!esAdmin) return;
    resumenAdmin().then(setDatos, (e: Error) => setError(e.message));
  }, [esAdmin]);

  if (!esAdmin)
    return (
      <Pantalla volver={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
        <Text style={estilos.h1}>Administración</Text>
        <Aviso tipo="info" texto="Esta zona es solo para administradores." />
        <Cristal gap={espaciado[2]}>
          <Text style={estilos.suave}>Para la demostración:</Text>
          <Text style={estilos.textoMedio}>admin@renfe-app.demo · contraseña admin1234</Text>
        </Cristal>
        <Boton texto="Entrar" icono="cuenta" onPress={() => router.navigate("/cuenta")} />
      </Pantalla>
    );

  return (
    <Pantalla volver={() => (router.canGoBack() ? router.back() : router.replace("/"))}>
      <View style={{ gap: espaciado[1] }}>
        <Text style={estilos.h1}>Administración</Text>
        <Text style={estilos.suave}>Resumen de la actividad y lo que llegará en el próximo sprint.</Text>
      </View>

      {error ? <Aviso texto={error} /> : null}
      {!datos && !error ? <Text style={estilos.suave}>Cargando…</Text> : null}

      {datos ? (
        <>
          <View style={styles.cifras}>
            <Cifra etiqueta="Billetes vendidos" valor={datos.billetesVendidos} />
            <Cifra etiqueta="Reservas" valor={datos.reservas} />
            <Cifra etiqueta="Canceladas" valor={datos.reservasCanceladas} />
            <Cifra etiqueta="Ingresos (simulados)" valor={euros(datos.ingresos)} />
            <Cifra etiqueta="Billetes validados" valor={datos.validaciones} />
            <Cifra etiqueta="Usuarios" valor={datos.usuarios} />
          </View>

          <Cristal gap={espaciado[2]}>
            <Text style={estilos.h2}>Últimas reservas</Text>
            {datos.ultimasReservas.length === 0 ? (
              <Text style={estilos.suave}>Todavía no hay reservas.</Text>
            ) : (
              datos.ultimasReservas.map((r) => (
                <View key={r.localizador} style={styles.reserva}>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={styles.reservaLocalizador}>{r.localizador}</Text>
                    <Text style={estilos.suave}>{r.trayecto}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 1 }}>
                    <Text style={styles.reservaTotal}>{euros(r.total)}</Text>
                    <Text style={estilos.suave}>{ESTADO[r.estado] ?? r.estado.replace("_", " ")}</Text>
                  </View>
                </View>
              ))
            )}
          </Cristal>
        </>
      ) : null}

      <Cristal gap={espaciado[2]}>
        <Text style={estilos.h2}>Próximamente</Text>
        {[
          "Gestión de usuarios y roles (dar o quitar el rol de revisor).",
          "Buscar una reserva por localizador, anularla o reembolsarla.",
          "Avisos e incidencias que salen en la app.",
          "Validaciones por tren y revisor.",
        ].map((t) => (
          <Text key={t} style={estilos.texto}>
            {"•  "}
            {t}
          </Text>
        ))}
        <Text style={estilos.suave}>Los endpoints están propuestos en el contrato (endpoints.md, sección de administración).</Text>
      </Cristal>

      <Boton texto="Ir al modo revisor" variante="secundario" icono="check" onPress={() => router.navigate("/revisor")} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  cifras: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cifra: {
    width: "48.4%",
    minHeight: 78,
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    padding: espaciado[3],
  },
  cifraEtiqueta: { fontFamily: fuentes.medio, fontSize: 11.6, color: colores.textoSuave },
  cifraValor: { fontFamily: fuentes.negrita, fontSize: 22, color: colores.marca, letterSpacing: -0.5 },
  reserva: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[2],
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    paddingTop: espaciado[2],
  },
  reservaLocalizador: { fontFamily: fuentes.seminegrita, fontSize: 13.6, color: colores.titulo },
  reservaTotal: { fontFamily: fuentes.negrita, fontSize: 13.6, color: tonos.moradoMedio },
});
