import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  borrarHistorial,
  marcarLeido,
  marcarTodosLeidos,
  pedirPermiso,
  rutaApp,
  useAvisos,
} from "@/avisos/avisos";
import { avisoDestacado } from "@renfe/shared/contenido/navegacion";
import { colores, espaciado, fuentes, paleta, tipografia, tonos } from "@/tema";
import { Cristal } from "./Cristal";
import { Hoja } from "./Hoja";
import { Icono, type NombreIcono } from "./Icono";

const CLAVE_AVISO = "anden-aviso";

const leerAviso = () => {
  try {
    return localStorage.getItem(CLAVE_AVISO) !== "0";
  } catch {
    return true;
  }
};

const MENU: { texto: string; ruta: string; icono: NombreIcono }[] = [
  { texto: "Comprar", ruta: "/", icono: "comprar" },
  { texto: "Trenes en directo", ruta: "/directo", icono: "mapa" },
  { texto: "Mis billetes", ruta: "/billetes", icono: "billetes" },
  { texto: "Mis líneas", ruta: "/lineas", icono: "lineas" },
  { texto: "Mi cuenta", ruta: "/cuenta", icono: "cuenta" },
];

// Cabecera de la web en móvil: barra de aviso morada + pastilla de cristal flotante.
export function Cabecera({ volver, sinAviso }: { volver?: () => void; sinAviso?: boolean }) {
  const insets = useSafeAreaInsets();
  const [aviso, setAviso] = useState(leerAviso);
  const [menu, setMenu] = useState(false);
  const [campana, setCampana] = useState(false);
  const { avisos, permiso } = useAvisos();
  const sinLeer = avisos.filter((a) => !a.leido).length;

  const cerrarAviso = () => {
    setAviso(false);
    try {
      localStorage.setItem(CLAVE_AVISO, "0");
    } catch {
      /* sin almacenamiento: se oculta solo en esta pantalla */
    }
  };

  const ir = (ruta: string) => {
    setMenu(false);
    setCampana(false);
    router.navigate(ruta as never);
  };

  const verAviso = (id: string, enlace: string) => {
    marcarLeido(id);
    ir(rutaApp(enlace));
  };

  return (
    <View style={{ paddingTop: sinAviso || !aviso ? insets.top + 4 : 0 }}>
      <StatusBar style={aviso && !sinAviso ? "light" : "dark"} />
      {aviso && !sinAviso ? (
        <View style={[styles.barra, { paddingTop: insets.top + 8 }]}>
          <Icono nombre="aviso" tamano={19} color={paleta.blanco} grosor={2} />
          <Text style={styles.barraTexto}>{avisoDestacado.texto}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ocultar aviso"
            onPress={cerrarAviso}
            hitSlop={8}
            style={({ pressed }) => [styles.barraCerrar, pressed && { backgroundColor: "rgba(255,255,255,0.16)" }]}
          >
            <Icono nombre="cerrar" tamano={17} color={paleta.blanco} grosor={2} />
          </Pressable>
        </View>
      ) : null}

      <Cristal
        intensidad={46}
        padding={0}
        gap={0}
        style={styles.pastilla}
      >
        <View style={styles.fila}>
          {volver ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              onPress={volver}
              hitSlop={8}
              style={({ pressed }) => [styles.iconoBoton, { marginLeft: 4 }, pressed && styles.pulsado]}
            >
              <Icono nombre="atras" tamano={23} color={colores.marca} grosor={2.1} />
            </Pressable>
          ) : null}
          <Text style={styles.marca} accessibilityRole="header">
            Renfe
          </Text>
          <View style={{ flex: 1 }} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={sinLeer ? `Avisos, ${sinLeer} sin leer` : "Avisos"}
            onPress={() => setCampana(true)}
            hitSlop={6}
            style={({ pressed }) => [styles.iconoBoton, pressed && styles.pulsado]}
          >
            <Icono nombre="campana" tamano={23} color={colores.marca} grosor={1.9} />
            {sinLeer ? (
              <View style={styles.contador}>
                <Text style={styles.contadorTexto}>{sinLeer > 9 ? "9+" : sinLeer}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir menú"
            onPress={() => setMenu(true)}
            hitSlop={6}
            style={({ pressed }) => [styles.iconoBoton, pressed && styles.pulsado]}
          >
            <Icono nombre="menu" tamano={24} color={colores.marca} grosor={1.9} />
          </Pressable>
        </View>
      </Cristal>

      <Hoja visible={menu} onCerrar={() => setMenu(false)} titulo="Menú">
        <View style={{ gap: espaciado[2] }}>
          {MENU.map((m) => (
            <Pressable
              key={m.ruta}
              accessibilityRole="button"
              onPress={() => ir(m.ruta)}
              style={({ pressed }) => [styles.opcion, pressed && { backgroundColor: "rgba(255,255,255,0.75)" }]}
            >
              <View style={styles.opcionIcono}>
                <Icono nombre={m.icono} tamano={22} color={colores.marca} />
              </View>
              <Text style={styles.opcionTexto}>{m.texto}</Text>
              <Icono nombre="delante" tamano={18} color={colores.textoSuave} />
            </Pressable>
          ))}
          <View style={styles.separador} />
          <Text style={styles.sello}>Renfe · Andén 0 · demo de clase</Text>
        </View>
      </Hoja>

      <Hoja visible={campana} onCerrar={() => setCampana(false)} titulo="Avisos">
        <View style={{ gap: espaciado[3] }}>
          {permiso === "undetermined" ? (
            <Pressable accessibilityRole="button" onPress={() => void pedirPermiso()} style={styles.botonPermiso}>
              <Icono nombre="campana" tamano={19} color={paleta.blanco} />
              <Text style={styles.botonPermisoTexto}>Activar notificaciones</Text>
            </Pressable>
          ) : null}
          {permiso === "denied" ? (
            <View style={[styles.aviso, { backgroundColor: tonos.avisoFondo }]} accessibilityRole="alert">
              <Icono nombre="aviso" tamano={20} color={tonos.aviso} />
              <Text style={[styles.avisoTexto, { flex: 1, color: colores.texto }]}>
                Las notificaciones están bloqueadas. Actívalas en los ajustes del móvil para recibir avisos con la app cerrada.
              </Text>
            </View>
          ) : null}
          {avisos.length ? (
            <View style={styles.acciones}>
              <Pressable accessibilityRole="button" onPress={marcarTodosLeidos} disabled={!sinLeer} hitSlop={6}>
                <Text style={[styles.accionTexto, !sinLeer && { opacity: 0.45 }]}>Marcar todo leído</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={borrarHistorial} hitSlop={6}>
                <Text style={styles.accionTexto}>Borrar historial</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={[styles.avisoTexto, { textAlign: "center", paddingVertical: espaciado[4] }]}>
              Sin avisos. Te avisaremos de retrasos y cambios en tus billetes y líneas.
            </Text>
          )}
          {avisos.map((a) => (
            <View key={a.id} style={[styles.aviso, a.leido && { opacity: 0.7 }]}>
              <View style={[styles.avisoIcono, { backgroundColor: a.tipo === "retraso" ? tonos.avisoFondo : tonos.rosaFuerte }]}>
                <Icono nombre={a.tipo === "retraso" ? "aviso" : "tren"} tamano={21} color={a.tipo === "retraso" ? tonos.aviso : colores.marca} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.avisoTitulo}>
                  {a.leido ? "" : "● "}
                  {a.titulo}
                </Text>
                <Text style={styles.avisoTexto}>{a.texto}</Text>
                <Text style={styles.avisoHora}>
                  {new Date(a.creado).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
              {a.enlace ? (
                <Pressable accessibilityRole="button" accessibilityLabel={`Ver: ${a.titulo}`} onPress={() => verAviso(a.id, a.enlace!)} hitSlop={6}>
                  <Text style={styles.accionTexto}>Ver</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      </Hoja>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    backgroundColor: paleta.moradoOscuro,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espaciado[3],
    paddingHorizontal: espaciado[4],
    paddingBottom: espaciado[3],
  },
  barraTexto: {
    flex: 1,
    color: paleta.blanco,
    fontFamily: fuentes.medio,
    fontSize: 13.6,
    lineHeight: 19,
    textDecorationLine: "underline",
    textDecorationColor: "rgba(255,255,255,0.55)",
  },
  barraCerrar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -4,
  },
  pastilla: {
    marginHorizontal: espaciado[3],
    marginTop: espaciado[3],
    marginBottom: espaciado[2],
    borderRadius: 28,
  },
  fila: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: espaciado[4],
    gap: espaciado[1],
  },
  marca: {
    fontFamily: fuentes.negrita,
    fontSize: 26,
    color: paleta.morado,
    letterSpacing: -1.2,
    paddingLeft: 2,
  },
  iconoBoton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  pulsado: { backgroundColor: "rgba(129,0,94,0.10)" },
  contador: {
    position: "absolute",
    top: 5,
    right: 4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.accion,
    borderWidth: 1.5,
    borderColor: paleta.blanco,
  },
  contadorTexto: { fontFamily: fuentes.negrita, fontSize: 10, color: paleta.blanco },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[3],
    paddingVertical: espaciado[2],
    paddingHorizontal: espaciado[2],
    borderRadius: 14,
  },
  opcionIcono: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  opcionTexto: {
    flex: 1,
    fontFamily: fuentes.seminegrita,
    fontSize: tipografia.tamanos.base,
    color: colores.texto,
  },
  separador: { height: 1, backgroundColor: colores.borde, marginVertical: espaciado[2] },
  sello: {
    fontFamily: fuentes.medio,
    fontSize: tipografia.tamanos.xs,
    color: colores.textoSuave,
    textAlign: "center",
    paddingBottom: espaciado[2],
  },
  aviso: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espaciado[3],
    padding: espaciado[3],
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  avisoIcono: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avisoTitulo: { fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.titulo },
  avisoHora: { fontFamily: fuentes.medio, fontSize: 12, color: colores.textoSuave },
  acciones: { flexDirection: "row", justifyContent: "space-between" },
  accionTexto: { fontFamily: fuentes.seminegrita, fontSize: 14, color: colores.marca },
  botonPermiso: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado[2],
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: colores.marca,
  },
  botonPermisoTexto: { fontFamily: fuentes.seminegrita, fontSize: 15, color: paleta.blanco },
  avisoTexto: { fontFamily: fuentes.normal, fontSize: 13.4, color: colores.textoSuave, lineHeight: 18.5 },
});
