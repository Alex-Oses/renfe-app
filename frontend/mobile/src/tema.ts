// Tokens de la web (@renfe/shared/tema/tokens) más lo que RN necesita aparte: en RN cada peso de
// Instrument Sans es una familia distinta (las carga src/app/_layout.tsx).
import { StyleSheet } from "react-native";
import { tema } from "@renfe/shared/tema/tokens";

export { tema };
export const { paleta, colores, espaciado, radios, sombras, cristal, tipografia } = tema;

export const fuentes = {
  normal: "InstrumentSans_400Regular",
  medio: "InstrumentSans_500Medium",
  seminegrita: "InstrumentSans_600SemiBold",
  negrita: "InstrumentSans_700Bold",
} as const;

const t = tipografia.tamanos;
export const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: espaciado[4], gap: espaciado[3], paddingBottom: 120 },
  titulo: { fontFamily: fuentes.negrita, fontSize: t.titulo, color: colores.titulo, lineHeight: t.titulo * tipografia.alturaLinea.titulo },
  subtitulo: { fontFamily: fuentes.seminegrita, fontSize: t.xl, color: colores.titulo },
  texto: { fontFamily: fuentes.normal, fontSize: t.base, color: colores.texto, lineHeight: t.base * tipografia.alturaLinea.normal },
  suave: { fontFamily: fuentes.normal, fontSize: t.sm, color: colores.textoSuave },
  error: { fontFamily: fuentes.medio, fontSize: t.sm, color: colores.error },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.normal,
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
    minHeight: 48,
  },
  boton: {
    backgroundColor: colores.accion,
    borderRadius: radios.pildora,
    minHeight: 48,
    paddingHorizontal: espaciado[6],
    alignItems: "center",
    justifyContent: "center",
  },
  botonTexto: { fontFamily: fuentes.seminegrita, fontSize: t.base, color: colores.superficie },
});
