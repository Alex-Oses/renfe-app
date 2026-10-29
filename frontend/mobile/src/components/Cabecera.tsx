import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
            accessibilityLabel="Avisos"
            onPress={() => setCampana(true)}
            hitSlop={6}
            style={({ pressed }) => [styles.iconoBoton, pressed && styles.pulsado]}
          >
            <Icono nombre="campana" tamano={23} color={colores.marca} grosor={1.9} />
            <View style={styles.punto} />
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
          <Pressable style={styles.aviso} onPress={() => ir("/directo")} accessibilityRole="button">
            <View style={[styles.avisoIcono, { backgroundColor: tonos.rosaFuerte }]}>
              <Icono nombre="mapa" tamano={21} color={colores.marca} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.avisoTitulo}>Tu tren, en directo</Text>
              <Text style={styles.avisoTexto}>Mira dónde va y si lleva retraso antes de salir de casa.</Text>
            </View>
          </Pressable>
          <Pressable style={styles.aviso} onPress={() => ir("/billetes")} accessibilityRole="button">
            <View style={[styles.avisoIcono, { backgroundColor: "#e6f0fb" }]}>
              <Icono nombre="billetes" tamano={21} color="#1f5fa8" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.avisoTitulo}>Billetes a mano</Text>
              <Text style={styles.avisoTexto}>Enseña el QR desde el móvil, sin imprimir nada.</Text>
            </View>
          </Pressable>
          <View style={styles.aviso}>
            <View style={[styles.avisoIcono, { backgroundColor: tonos.avisoFondo }]}>
              <Icono nombre="aviso" tamano={21} color={tonos.aviso} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.avisoTitulo}>Antes de salir</Text>
              <Text style={styles.avisoTexto}>{avisoDestacado.texto}</Text>
            </View>
          </View>
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
  punto: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colores.accion,
    borderWidth: 1.5,
    borderColor: paleta.blanco,
  },
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
  avisoTexto: { fontFamily: fuentes.normal, fontSize: 13.4, color: colores.textoSuave, lineHeight: 18.5 },
});
