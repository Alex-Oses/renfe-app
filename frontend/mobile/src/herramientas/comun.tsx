// Piezas compartidas por los widgets informativos de la app: campo con ayuda, selector en hoja,
// búsqueda de reserva y confirmación. Mismos textos que la web (componentes/herramientas/comun.tsx).
import { useState, type ComponentProps, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { buscarReservaPorLocalizador, usaDatosSimulados } from "@renfe/shared/api/cliente";
import type { Reserva } from "@renfe/shared/api/tipos";
import { fechaCorta, horaLocal } from "@renfe/shared/formato/formato";
import { colores, espaciado, estilos, fuentes, tipografia, tonos } from "@/tema";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { Campo, CampoBoton } from "@/components/Campo";
import { Hoja } from "@/components/Hoja";
import { Icono } from "@/components/Icono";
import { textoFecha } from "@/components/Selectores";
import { emailValido, espera, expediente, LOCALIZADOR, reservaPorLocalizador } from "./logica";

export function Herramienta({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={styles.herramienta} accessibilityLabel={titulo}>
      <Text style={estilos.h2}>{titulo}</Text>
      {children}
    </View>
  );
}

export function Exito({ children }: { children: ReactNode }) {
  return (
    <View accessibilityRole="alert" style={styles.exito}>
      <Icono nombre="check" tamano={20} color={tonos.exito} />
      <Text style={styles.exitoTexto}>{children}</Text>
    </View>
  );
}

export function Ayuda({ children }: { children: ReactNode }) {
  return <Text style={estilos.suave}>{children}</Text>;
}

/** Campo con texto de ayuda o error debajo, como el .campo de la web. */
export function CampoHerr({
  etiqueta,
  ayuda,
  error,
  ...props
}: { etiqueta: string; ayuda?: string; error?: string } & ComponentProps<typeof Campo>) {
  return (
    <View style={{ gap: 4 }}>
      <Campo etiqueta={etiqueta} error={error} {...props} />
      {ayuda && !error ? <Text style={estilos.suave}>{ayuda}</Text> : null}
    </View>
  );
}

type Opcion = { valor: string; texto: string };

/** Select nativo de la web convertido en campo + hoja inferior, que se maneja mejor con el pulgar. */
export function Selector({
  etiqueta,
  valor,
  opciones,
  onElegir,
  error,
  desactivado,
  placeholder = "Elige una opción",
}: {
  etiqueta: string;
  valor: string;
  opciones: Opcion[];
  onElegir: (valor: string) => void;
  error?: string;
  desactivado?: boolean;
  placeholder?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const elegida = opciones.find((o) => o.valor === valor);
  return (
    <View style={{ gap: 4 }}>
      <CampoBoton
        etiqueta={etiqueta}
        valor={elegida?.texto}
        placeholder={desactivado ? "No disponible" : placeholder}
        onPress={() => !desactivado && setAbierto(true)}
      />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Hoja visible={abierto} onCerrar={() => setAbierto(false)} titulo={etiqueta}>
        <View style={{ gap: 6 }}>
          {opciones.map((o) => {
            const activa = o.valor === valor;
            return (
              <Pressable
                key={o.valor}
                accessibilityRole="radio"
                accessibilityState={{ selected: activa }}
                onPress={() => {
                  onElegir(o.valor);
                  setAbierto(false);
                }}
                style={({ pressed }) => [styles.opcion, activa && styles.opcionActiva, pressed && { opacity: 0.75 }]}
              >
                <Text style={[estilos.textoMedio, { flex: 1 }]}>{o.texto}</Text>
                {activa ? <Icono nombre="check" tamano={19} color={colores.marca} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Hoja>
    </View>
  );
}

/** Selector de día en hoja, desde hace `desdeDias` hasta dentro de `hastaDias` (fechas ISO). */
export function SelectorDia({
  etiqueta,
  valor,
  onElegir,
  error,
  desdeDias = -30,
  hastaDias = 45,
}: {
  etiqueta: string;
  valor: string;
  onElegir: (fecha: string) => void;
  error?: string;
  desdeDias?: number;
  hastaDias?: number;
}) {
  const [abierto, setAbierto] = useState(false);
  const dias = Array.from({ length: hastaDias - desdeDias + 1 }, (_, i) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + desdeDias + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  return (
    <View style={{ gap: 4 }}>
      <CampoBoton etiqueta={etiqueta} valor={valor ? textoFecha(valor) : undefined} placeholder="Elige fecha" icono="calendario" onPress={() => setAbierto(true)} />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Hoja visible={abierto} onCerrar={() => setAbierto(false)} titulo={etiqueta} maximo={0.86}>
        <View style={{ gap: 6 }}>
          {dias.map((f) => {
            const activa = f === valor;
            return (
              <Pressable
                key={f}
                accessibilityRole="button"
                accessibilityState={{ selected: activa }}
                onPress={() => {
                  onElegir(f);
                  setAbierto(false);
                }}
                style={({ pressed }) => [styles.opcion, activa && styles.opcionActiva, pressed && { opacity: 0.75 }]}
              >
                <Text style={[estilos.textoMedio, { flex: 1, textTransform: "capitalize" }]}>{textoFecha(f)}</Text>
                {activa ? <Icono nombre="check" tamano={19} color={colores.marca} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Hoja>
    </View>
  );
}

/** Formulario de localizador (y email opcional) que entrega la reserva encontrada. */
export function BuscaReserva({
  conEmail,
  filtro,
  onReserva,
}: {
  conEmail?: boolean;
  filtro?: (r: Reserva) => string | null;
  onReserva: (r: Reserva) => void;
}) {
  const [loc, setLoc] = useState("");
  const [email, setEmail] = useState("");
  const [errores, setErrores] = useState<{ loc?: string; email?: string; general?: string }>({});
  const [enviando, setEnviando] = useState(false);
  // Con API la reserva ya es del usuario con sesión: el email solo hace falta en el simulado.
  const pideEmail = conEmail && usaDatosSimulados;

  async function enviar() {
    const err: typeof errores = {};
    if (!LOCALIZADOR.test(loc.trim())) err.loc = "El localizador tiene 6 letras o números, con o sin «R-» delante.";
    if (pideEmail && !emailValido(email)) err.email = "Escribe un email válido.";
    setErrores(err);
    if (Object.keys(err).length) return;
    setEnviando(true);
    let r: Reserva | undefined;
    if (usaDatosSimulados) {
      await espera();
      r = reservaPorLocalizador(loc);
    } else {
      try {
        r = await buscarReservaPorLocalizador(loc);
      } catch {
        setEnviando(false);
        return setErrores({ general: "Inicia sesión para consultar tus reservas." });
      }
    }
    setEnviando(false);
    if (!r || (pideEmail && !r.pasajeros.some((p) => p.email.toLowerCase() === email.trim().toLowerCase())))
      return setErrores({ general: "No encontramos ninguna reserva con esos datos. Revisa el localizador del email de compra." });
    const motivo = filtro?.(r);
    if (motivo) return setErrores({ general: motivo });
    onReserva(r);
  }

  return (
    <View style={{ gap: espaciado[3] }}>
      <CampoHerr
        etiqueta="Localizador"
        value={loc}
        onChangeText={(v) => setLoc(v.toUpperCase())}
        maxLength={8}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder="ABC123"
        error={errores.loc}
      />
      {pideEmail ? (
        <CampoHerr
          etiqueta="Email de la compra"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="tucorreo@ejemplo.com"
          error={errores.email}
        />
      ) : null}
      <Boton texto={enviando ? "Buscando…" : "Buscar reserva"} onPress={() => void enviar()} cargando={enviando} desactivado={enviando} />
      {errores.general ? <Aviso texto={errores.general} /> : null}
    </View>
  );
}

const ESTADOS: Record<Reserva["estado"], string> = {
  pendiente_pago: "Pendiente de pago",
  pagada: "Pagada",
  cancelada: "Cancelada",
};

export function ResumenReserva({ r }: { r: Reserva }) {
  const filas: [string, string][] = [
    ["Localizador", r.localizador],
    ["Tren", `${r.tren.tipo} ${r.tren.numero}`],
    ["Trayecto", `${r.tren.origen.nombre} → ${r.tren.destino.nombre}`],
    ["Salida", `${fechaCorta(r.tren.salida)}, ${horaLocal(r.tren.salida)}`],
    ["Viajeros", r.pasajeros.map((p) => `${p.nombre} ${p.apellidos}`).join(", ")],
    ["Asientos", r.asientos.map((a) => `${a.id} (${a.clase})`).join(", ")],
    ["Estado", ESTADOS[r.estado]],
  ];
  return (
    <View style={styles.resumen}>
      {filas.map(([k, v]) => (
        <View key={k} style={styles.resumenFila}>
          <Text style={styles.resumenClave}>{k}</Text>
          <Text style={styles.resumenValor}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

/** Envío simulado con número de expediente, igual que en la web. */
export function useEnvio(prefijo: string) {
  const [enviando, setEnviando] = useState(false);
  const [exp, setExp] = useState<string | null>(null);
  async function enviar() {
    setEnviando(true);
    await espera(600);
    setEnviando(false);
    setExp(expediente(prefijo));
  }
  return { enviando, exp, enviar, reiniciar: () => setExp(null) };
}

const styles = StyleSheet.create({
  herramienta: { gap: espaciado[3] },
  exito: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espaciado[2],
    backgroundColor: tonos.exitoFondo,
    borderWidth: 1,
    borderColor: "#b9e3c9",
    borderRadius: 14,
    padding: espaciado[3],
  },
  exitoTexto: { flex: 1, fontFamily: fuentes.medio, fontSize: tipografia.tamanos.sm, color: tonos.exito, lineHeight: 19 },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[2],
    minHeight: 46,
    paddingHorizontal: espaciado[3],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  opcionActiva: { borderColor: "rgba(129,0,94,0.35)", backgroundColor: tonos.rosaFuerte },
  resumen: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.66)",
    padding: espaciado[3],
    gap: 5,
  },
  resumenFila: { flexDirection: "row", gap: espaciado[2] },
  resumenClave: { width: 92, fontFamily: fuentes.medio, fontSize: 12.6, color: colores.textoSuave },
  resumenValor: { flex: 1, fontFamily: fuentes.normal, fontSize: 12.6, color: colores.texto },
});
