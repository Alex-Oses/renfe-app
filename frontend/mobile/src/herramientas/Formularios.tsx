// Formularios de trámites: se validan en el teléfono y el envío es simulado (devuelve nº de expediente).
// Mismos campos y mensajes que la web (componentes/herramientas/Formularios.tsx).
import { useState } from "react";
import { Text, View } from "react-native";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import { Boton } from "@/components/Boton";
import { Campo } from "@/components/Campo";
import { estilos } from "@/tema";
import { CampoHerr, Exito, Herramienta, Selector, SelectorDia, useEnvio } from "./comun";
import { emailValido, franjasLibres, hoyIso, LOCALIZADOR, movilValido, nifValido, telefonoValido } from "./logica";

type Def = {
  nombre: string;
  etiqueta: string;
  tipo?: "text" | "email" | "tel" | "date" | "fecha-pasada" | "number" | "textarea" | "select";
  opciones?: string[];
  opcional?: boolean;
  ayuda?: string;
  validar?: (v: string, todo: Record<string, string>) => string | null;
};

const estaciones = ESTACIONES.map((e) => e.nombre);
const fechaFutura = (v: string) => (v && v >= hoyIso() ? null : "Elige una fecha a partir de hoy.");
const texto = (min: number) => (v: string) => (v.trim().length >= min ? null : `Escribe al menos ${min} caracteres.`);

const LOC: Def = {
  nombre: "loc",
  etiqueta: "Localizador",
  validar: (v) => (LOCALIZADOR.test(v.trim()) ? null : "El localizador tiene 6 letras o números, con o sin «R-» delante."),
};
const NOMBRE: Def = { nombre: "nombre", etiqueta: "Nombre y apellidos", validar: (v) => (v.trim().length >= 3 ? null : "Escribe tu nombre.") };
const EMAIL: Def = { nombre: "email", etiqueta: "Email", tipo: "email", validar: (v) => (emailValido(v) ? null : "Escribe un email válido.") };
const TEL: Def = {
  nombre: "tel",
  etiqueta: "Teléfono",
  tipo: "tel",
  ayuda: "9 cifras, empieza por 6, 7, 8 o 9",
  validar: (v) => (telefonoValido(v) ? null : "Teléfono español de 9 cifras."),
};

function Formulario({
  titulo,
  prefijo,
  campos,
  enviar = "Enviar",
  aviso,
}: {
  titulo: string;
  prefijo: string;
  campos: Def[];
  enviar?: string;
  aviso?: string;
}) {
  const [v, setV] = useState<Record<string, string>>({});
  const [err, setErr] = useState<Record<string, string>>({});
  const envio = useEnvio(prefijo);

  const set = (nombre: string, valor: string) => setV((s) => ({ ...s, [nombre]: valor }));

  async function alEnviar() {
    const nuevos: Record<string, string> = {};
    for (const c of campos) {
      const valor = v[c.nombre] ?? "";
      const m = !valor.trim() ? (c.opcional ? null : "Este campo es obligatorio.") : (c.validar?.(valor, v) ?? null);
      if (m) nuevos[c.nombre] = m;
    }
    setErr(nuevos);
    if (Object.keys(nuevos).length) return;
    await envio.enviar();
  }

  if (envio.exp)
    return (
      <Herramienta titulo={titulo}>
        <Exito>Recibido. Tu nº de expediente es {envio.exp}. Te escribiremos al email indicado (simulado).</Exito>
        <Boton
          texto="Enviar otro"
          variante="secundario"
          onPress={() => {
            setV({});
            setErr({});
            envio.reiniciar();
          }}
        />
      </Herramienta>
    );

  return (
    <Herramienta titulo={titulo}>
      {aviso ? <Text style={estilos.suave}>{aviso}</Text> : null}
      <View style={{ gap: 12 }}>
        {campos.map((c) => {
          const etiqueta = c.etiqueta + (c.opcional ? " (opcional)" : "");
          const valor = v[c.nombre] ?? "";
          const error = err[c.nombre];
          if (c.tipo === "select")
            return (
              <Selector
                key={c.nombre}
                etiqueta={etiqueta}
                valor={valor}
                error={error}
                opciones={[{ valor: "", texto: "Elige una opción" }, ...(c.opciones ?? []).map((o) => ({ valor: o, texto: o }))]}
                onElegir={(x) => set(c.nombre, x)}
              />
            );
          if (c.tipo === "date" || c.tipo === "fecha-pasada")
            return (
              <SelectorDia
                key={c.nombre}
                etiqueta={etiqueta}
                valor={valor}
                error={error}
                desdeDias={c.tipo === "fecha-pasada" ? -60 : 0}
                hastaDias={c.tipo === "fecha-pasada" ? 0 : 45}
                onElegir={(f) => set(c.nombre, f)}
              />
            );
          if (c.tipo === "textarea")
            return (
              <CampoHerr
                key={c.nombre}
                etiqueta={etiqueta}
                value={valor}
                onChangeText={(x) => set(c.nombre, x)}
                ayuda={c.ayuda}
                error={error}
                multiline
                numberOfLines={4}
                style={{ minHeight: 110, textAlignVertical: "top" }}
              />
            );
          return (
            <CampoHerr
              key={c.nombre}
              etiqueta={etiqueta}
              value={valor}
              onChangeText={(x) => set(c.nombre, x)}
              ayuda={c.ayuda}
              error={error}
              keyboardType={c.tipo === "email" ? "email-address" : c.tipo === "tel" ? "phone-pad" : c.tipo === "number" ? "number-pad" : "default"}
              autoCapitalize={c.tipo === "email" ? "none" : c.tipo === "number" || c.tipo === "tel" ? "none" : "sentences"}
              placeholder={c.etiqueta}
            />
          );
        })}
        <Boton texto={envio.enviando ? "Enviando…" : enviar} onPress={() => void alEnviar()} cargando={envio.enviando} desactivado={envio.enviando} />
      </View>
    </Herramienta>
  );
}

export const SolicitudGrupos = () => (
  <Formulario
    titulo="Solicitud de viaje en grupo"
    prefijo="GRU"
    enviar="Pedir presupuesto"
    campos={[
      { nombre: "origen", etiqueta: "Origen", tipo: "select", opciones: estaciones },
      { nombre: "destino", etiqueta: "Destino", tipo: "select", opciones: estaciones, validar: (d, t) => (d === t.origen ? "El destino debe ser distinto del origen." : null) },
      { nombre: "fecha", etiqueta: "Fecha de ida", tipo: "date", validar: fechaFutura },
      { nombre: "viajeros", etiqueta: "Nº de viajeros", tipo: "number", ayuda: "Entre 10 y 25", validar: (v) => (/^\d+$/.test(v) && +v >= 10 && +v <= 25 ? null : "Los grupos son de 10 a 25 viajeros.") },
      NOMBRE,
      EMAIL,
      TEL,
    ]}
  />
);

export const FormFactura = () => (
  <Formulario
    titulo="Solicita tu factura"
    prefijo="FAC"
    campos={[
      LOC,
      { nombre: "nif", etiqueta: "NIF / CIF", validar: (v) => (nifValido(v) ? null : "Formato de NIF o CIF no válido.") },
      { nombre: "razon", etiqueta: "Nombre o razón social", validar: texto(3) },
      { nombre: "direccion", etiqueta: "Dirección fiscal", validar: texto(5) },
      EMAIL,
    ]}
  />
);

export const FormReclamacion = () => (
  <Formulario
    titulo="Presenta una reclamación"
    prefijo="REC"
    campos={[
      { ...LOC, opcional: true },
      { nombre: "motivo", etiqueta: "Motivo", tipo: "select", opciones: ["Retraso", "Atención al cliente", "Limpieza", "Accesibilidad", "Compra o devolución", "Otro"] },
      { nombre: "texto", etiqueta: "Cuéntanos qué pasó", tipo: "textarea", validar: texto(20) },
      NOMBRE,
      EMAIL,
    ]}
  />
);

export const FormObjetosPerdidos = () => (
  <Formulario
    titulo="Declara un objeto perdido"
    prefijo="OBJ"
    campos={[
      { nombre: "fecha", etiqueta: "Fecha del viaje", tipo: "fecha-pasada", validar: (v) => (v && v <= hoyIso() ? null : "La fecha no puede ser futura.") },
      { nombre: "estacion", etiqueta: "Estación o tren", tipo: "select", opciones: [...estaciones, "Dentro del tren"] },
      { nombre: "objeto", etiqueta: "Describe el objeto", tipo: "textarea", validar: texto(10) },
      NOMBRE,
      EMAIL,
      { ...TEL, opcional: true },
    ]}
  />
);

export const FormContacto = () => (
  <Formulario
    titulo="Contacta con nosotros"
    prefijo="CON"
    campos={[
      NOMBRE,
      EMAIL,
      { nombre: "asunto", etiqueta: "Asunto", tipo: "select", opciones: ["Información", "Sugerencia", "Billetes", "Otro"] },
      { nombre: "texto", etiqueta: "Mensaje", tipo: "textarea", validar: texto(10) },
    ]}
  />
);

export const AltaAvisos = () => (
  <Formulario
    titulo="Avisos por WhatsApp"
    prefijo="WAP"
    enviar="Darme de alta"
    aviso="Te avisaremos de cambios y retrasos de tus trenes (simulado: no se envía ningún mensaje)."
    campos={[
      {
        ...TEL,
        etiqueta: "Teléfono móvil",
        ayuda: "9 cifras, empieza por 6 o 7",
        validar: (v) => (movilValido(v) ? null : "Móvil español de 9 cifras que empiece por 6 o 7."),
      },
    ]}
  />
);

// Cita previa: las franjas libres dependen de estación y fecha, siempre las mismas.
export function FormCitaPrevia() {
  const [estacion, setEstacion] = useState("");
  const [fecha, setFecha] = useState("");
  const [franja, setFranja] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const envio = useEnvio("CIT");
  const libres = franjasLibres(estacion, fecha);

  async function enviar() {
    const n: Record<string, string> = {};
    if (!estacion) n.estacion = "Elige una estación.";
    if (fechaFutura(fecha)) n.fecha = "Elige una fecha a partir de hoy.";
    if (!libres.includes(franja)) n.franja = "Elige una franja libre.";
    setErr(n);
    if (!Object.keys(n).length) await envio.enviar();
  }

  if (envio.exp)
    return (
      <Herramienta titulo="Pide cita previa">
        <Exito>
          Cita confirmada el {fecha} a las {franja} en {estacion}. Nº {envio.exp}.
        </Exito>
      </Herramienta>
    );

  return (
    <Herramienta titulo="Pide cita previa">
      <View style={{ gap: 12 }}>
        <Selector
          etiqueta="Estación"
          valor={estacion}
          error={err.estacion}
          placeholder="Elige estación"
          opciones={estaciones.map((s) => ({ valor: s, texto: s }))}
          onElegir={(v) => {
            setEstacion(v);
            setFranja("");
          }}
        />
        <SelectorDia
          etiqueta="Fecha"
          valor={fecha}
          error={err.fecha}
          desdeDias={0}
          onElegir={(f) => {
            setFecha(f);
            setFranja("");
          }}
        />
        <Selector
          etiqueta="Franja horaria"
          valor={franja}
          error={err.franja}
          desactivado={!libres.length}
          placeholder={libres.length ? "Elige franja" : "Elige estación y fecha"}
          opciones={libres.map((f) => ({ valor: f, texto: f }))}
          onElegir={setFranja}
        />
        <Boton texto={envio.enviando ? "Reservando…" : "Reservar cita"} onPress={() => void enviar()} cargando={envio.enviando} desactivado={envio.enviando} />
      </View>
    </Herramienta>
  );
}
