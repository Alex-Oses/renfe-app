// Tokens de la web (@renfe/shared/tema/tokens) más lo que RN necesita aparte: en RN cada peso de
// Instrument Sans es una familia distinta (las carga src/app/_layout.tsx).
import { StyleSheet } from "react-native";
import { tema } from "@renfe/shared/tema/tokens";
import type { TipoTren } from "@renfe/shared/api/tipos";

export { tema };
export const { paleta, colores, espaciado, radios, sombras, cristal, tipografia, animacion } = tema;

export const fuentes = {
  normal: "InstrumentSans_400Regular",
  medio: "InstrumentSans_500Medium",
  seminegrita: "InstrumentSans_600SemiBold",
  negrita: "InstrumentSans_700Bold",
} as const;

// Colores que la web saca de degradados y estados y aquí hacen falta sueltos.
export const tonos = {
  moradoMedio: "#a52a86",
  moradoSuave: "#f3e2ee",
  rosa: "#f7e9f1",
  rosaFuerte: "#fbe3ec",
  blancoCalido: "#fffafc",
  exito: "#1d7a46",
  exitoFondo: "#e3f4e9",
  aviso: "#8a5300",
  avisoFondo: "#fff3d6",
  errorFondo: "#fde8ee",
  sombra: "#5c0043",
  cristal: "rgba(255,255,255,0.80)",
  cristalFuerte: "rgba(255,255,255,0.90)",
  bordeCristal: "rgba(255,255,255,0.85)",
  velo: "rgba(40,0,30,0.42)",
} as const;

export const gradientes = {
  fondo: ["#f7e9f1", "#f1e8ef", "#eff3f6"] as const,
  marca: ["#9b0b73", "#81005e"] as const,
  accion: ["#e04472", "#d62d61"] as const,
  cristal: ["rgba(255,255,255,0.94)", "rgba(255,255,255,0.62)"] as const,
  heroe: ["#f9e6f1", "#f3e3ec", "#e9eef4"] as const,
};

// Colores por tipo de tren, los mismos que frontend/web/src/paginas/mapa/CapaTrenes.tsx.
export const colorTipo: Record<TipoTren, string> = {
  AVE: "#81005e",
  Avlo: "#b5489a",
  Alvia: "#1f5fa8",
  Intercity: "#2e7d32",
  "Media Distancia": "#9a5a00",
  Cercanías: "#0e7c86",
  "Larga Distancia": "#5c0043",
};

export const siglaTipo: Record<TipoTren, string> = {
  AVE: "AVE",
  Avlo: "Avlo",
  Alvia: "Alvia",
  Intercity: "IC",
  "Media Distancia": "MD",
  Cercanías: "C",
  "Larga Distancia": "LD",
};

const t = tipografia.tamanos;

// Sombra de los paneles flotantes (la web usa sombras con el color de la marca).
export const sombraFlotante = {
  shadowColor: tonos.sombra,
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.18,
  shadowRadius: 24,
  elevation: 10,
} as const;

export const sombraSuave = {
  shadowColor: "#28001e",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 14,
  elevation: 4,
} as const;

export const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: paleta.niebla },
  relleno: { flex: 1 },
  contenido: { paddingHorizontal: espaciado[3], paddingTop: espaciado[3], paddingBottom: 128, gap: espaciado[3] },
  contenidoEstrecho: { paddingHorizontal: espaciado[4], paddingTop: espaciado[3], paddingBottom: 128, gap: espaciado[4] },
  titulo: {
    fontFamily: fuentes.negrita,
    fontSize: t.titulo,
    color: colores.titulo,
    lineHeight: t.titulo * tipografia.alturaLinea.titulo,
    letterSpacing: -0.4,
  },
  h1: {
    fontFamily: fuentes.negrita,
    fontSize: t.portada - 2,
    color: colores.titulo,
    lineHeight: (t.portada - 2) * tipografia.alturaLinea.titulo,
    letterSpacing: -0.6,
  },
  h2: {
    fontFamily: fuentes.negrita,
    fontSize: t.xxl,
    color: colores.titulo,
    lineHeight: t.xxl * tipografia.alturaLinea.titulo,
    letterSpacing: -0.3,
  },
  subtitulo: { fontFamily: fuentes.seminegrita, fontSize: t.xl, color: colores.titulo },
  texto: { fontFamily: fuentes.normal, fontSize: t.base, color: colores.texto, lineHeight: t.base * tipografia.alturaLinea.normal },
  textoMedio: { fontFamily: fuentes.medio, fontSize: t.base, color: colores.texto },
  suave: { fontFamily: fuentes.normal, fontSize: t.sm, color: colores.textoSuave, lineHeight: t.sm * 1.45 },
  suaveMedio: { fontFamily: fuentes.medio, fontSize: t.sm, color: colores.textoSuave },
  error: { fontFamily: fuentes.medio, fontSize: t.sm, color: colores.error },
  etiqueta: { fontFamily: fuentes.medio, fontSize: t.sm, color: colores.textoSuave },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.grande,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado[4],
    gap: espaciado[2],
    ...sombras[1],
  },
  campo: {
    fontFamily: fuentes.normal,
    fontSize: t.base,
    color: colores.texto,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.normal,
    paddingHorizontal: espaciado[4],
    minHeight: 50,
  },
  boton: {
    backgroundColor: colores.accion,
    borderRadius: radios.pildora,
    minHeight: 50,
    paddingHorizontal: espaciado[6],
    alignItems: "center",
    justifyContent: "center",
    ...sombras[2],
  },
  botonSecundario: {
    backgroundColor: colores.superficie,
    borderWidth: 1.5,
    borderColor: colores.marca,
    borderRadius: radios.pildora,
    minHeight: 46,
    paddingHorizontal: espaciado[4],
    alignItems: "center",
    justifyContent: "center",
  },
  botonTexto: { fontFamily: fuentes.seminegrita, fontSize: t.base, color: paleta.blanco },
  botonTextoSecundario: { fontFamily: fuentes.seminegrita, fontSize: t.base, color: colores.marca },
  fila: { flexDirection: "row", alignItems: "center" },
  entre: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  centro: { alignItems: "center", justifyContent: "center" },
  separador: { height: 1, backgroundColor: colores.borde },
  pildora: { borderRadius: radios.pildora },
  chip: {
    minHeight: 38,
    paddingHorizontal: espaciado[4],
    borderRadius: radios.pildora,
    borderWidth: 1,
    borderColor: "rgba(129,0,94,0.18)",
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActivo: { backgroundColor: colores.marca, borderColor: colores.marca },
  chipTexto: { fontFamily: fuentes.seminegrita, fontSize: t.sm, color: colores.texto },
  chipTextoActivo: { color: paleta.blanco },
});
