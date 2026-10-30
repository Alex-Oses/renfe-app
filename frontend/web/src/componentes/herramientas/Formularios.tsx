// Formularios de trámites: se validan en el navegador y el envío es simulado (devuelve nº de expediente).
import { useId, useState, type FormEvent } from "react";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import { semilla } from "./logica";
import { Campo, emailValido, Exito, Herramienta, LOCALIZADOR, Selector, useEnvio } from "./comun";

type Def = {
  nombre: string;
  etiqueta: string;
  tipo?: "text" | "email" | "tel" | "date" | "number" | "textarea" | "select";
  opciones?: string[];
  opcional?: boolean;
  ayuda?: string;
  validar?: (v: string, todo: Record<string, string>) => string | null;
};

const hoy = () => new Date().toISOString().slice(0, 10);
const estaciones = ESTACIONES.map((e) => e.nombre);
const LOC: Def = { nombre: "loc", etiqueta: "Localizador", validar: (v) => (LOCALIZADOR.test(v.trim()) ? null : "El localizador tiene 6 letras o números, con o sin «R-» delante.") };
const NOMBRE: Def = { nombre: "nombre", etiqueta: "Nombre y apellidos", validar: (v) => (v.trim().length >= 3 ? null : "Escribe tu nombre.") };
const EMAIL: Def = { nombre: "email", etiqueta: "Email", tipo: "email", validar: (v) => (emailValido(v) ? null : "Escribe un email válido.") };
const TEL: Def = { nombre: "tel", etiqueta: "Teléfono", tipo: "tel", ayuda: "9 cifras, empieza por 6, 7, 8 o 9", validar: (v) => (/^[6-9]\d{8}$/.test(v.replace(/\s/g, "")) ? null : "Teléfono español de 9 cifras.") };
const fechaFutura = (v: string) => (v && v >= hoy() ? null : "Elige una fecha a partir de hoy.");
const texto = (min: number) => (v: string) => (v.trim().length >= min ? null : `Escribe al menos ${min} caracteres.`);

function Formulario({ titulo, prefijo, campos, enviar = "Enviar", aviso }: { titulo: string; prefijo: string; campos: Def[]; enviar?: string; aviso?: string }) {
  const [v, setV] = useState<Record<string, string>>({});
  const [err, setErr] = useState<Record<string, string>>({});
  const envio = useEnvio(prefijo);
  const idArea = useId();

  async function alEnviar(e: FormEvent) {
    e.preventDefault();
    const nuevos: Record<string, string> = {};
    for (const c of campos) {
      const valor = v[c.nombre] ?? "";
      const m = !valor.trim() ? (c.opcional ? null : "Este campo es obligatorio.") : c.validar?.(valor, v) ?? null;
      if (m) nuevos[c.nombre] = m;
    }
    setErr(nuevos);
    if (Object.keys(nuevos).length) {
      (e.currentTarget as HTMLFormElement).querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    await envio.enviar();
  }

  if (envio.exp)
    return (
      <Herramienta titulo={titulo}>
        <Exito>
          Recibido. Tu nº de expediente es <strong>{envio.exp}</strong>. Te escribiremos al email indicado (simulado).
        </Exito>
        <button className="boton boton--secundario" onClick={() => { setV({}); envio.reiniciar(); }}>Enviar otro</button>
      </Herramienta>
    );

  return (
    <Herramienta titulo={titulo}>
      {aviso && <p>{aviso}</p>}
      <form className="herr__form" onSubmit={alEnviar} noValidate>
        {campos.map((c) => {
          const comun = { etiqueta: c.etiqueta + (c.opcional ? " (opcional)" : ""), error: err[c.nombre], value: v[c.nombre] ?? "", required: !c.opcional };
          const set = (x: string) => setV((s) => ({ ...s, [c.nombre]: x }));
          if (c.tipo === "select")
            return (
              <Selector key={c.nombre} {...comun} onChange={(e) => set(e.target.value)}>
                <option value="">Elige una opción</option>
                {c.opciones?.map((o) => <option key={o}>{o}</option>)}
              </Selector>
            );
          if (c.tipo === "textarea")
            return (
              <div key={c.nombre} className="campo herr__campo herr__ancho">
                <label htmlFor={idArea + c.nombre}>{comun.etiqueta}</label>
                <textarea id={idArea + c.nombre} rows={4} value={comun.value} onChange={(e) => set(e.target.value)} aria-invalid={comun.error ? true : undefined} aria-describedby={comun.error ? `${idArea}${c.nombre}-e` : undefined} />
                {comun.error && <small id={`${idArea}${c.nombre}-e`} className="herr__error">{comun.error}</small>}
              </div>
            );
          return <Campo key={c.nombre} {...comun} type={c.tipo ?? "text"} ayuda={c.ayuda} min={c.tipo === "date" ? hoy() : undefined} onChange={(e) => set(e.target.value)} />;
        })}
        <button className="boton" disabled={envio.enviando}>{envio.enviando ? "Enviando…" : enviar}</button>
      </form>
    </Herramienta>
  );
}

export const SolicitudGrupos = () => (
  <Formulario titulo="Solicitud de viaje en grupo" prefijo="GRU" enviar="Pedir presupuesto" campos={[
    { nombre: "origen", etiqueta: "Origen", tipo: "select", opciones: estaciones },
    { nombre: "destino", etiqueta: "Destino", tipo: "select", opciones: estaciones, validar: (d, t) => (d === t.origen ? "El destino debe ser distinto del origen." : null) },
    { nombre: "fecha", etiqueta: "Fecha de ida", tipo: "date", validar: fechaFutura },
    { nombre: "viajeros", etiqueta: "Nº de viajeros", tipo: "number", ayuda: "Entre 10 y 25", validar: (v) => (/^\d+$/.test(v) && +v >= 10 && +v <= 25 ? null : "Los grupos son de 10 a 25 viajeros.") },
    NOMBRE, EMAIL, TEL,
  ]} />
);

export const FormFactura = () => (
  <Formulario titulo="Solicita tu factura" prefijo="FAC" campos={[
    LOC,
    { nombre: "nif", etiqueta: "NIF / CIF", validar: (v) => (/^[A-Z0-9]\d{7}[A-Z0-9]$/i.test(v) ? null : "Formato de NIF o CIF no válido.") },
    { nombre: "razon", etiqueta: "Nombre o razón social", validar: texto(3) },
    { nombre: "direccion", etiqueta: "Dirección fiscal", validar: texto(5) },
    EMAIL,
  ]} />
);

export const FormReclamacion = () => (
  <Formulario titulo="Presenta una reclamación" prefijo="REC" campos={[
    { ...LOC, opcional: true },
    { nombre: "motivo", etiqueta: "Motivo", tipo: "select", opciones: ["Retraso", "Atención al cliente", "Limpieza", "Accesibilidad", "Compra o devolución", "Otro"] },
    { nombre: "texto", etiqueta: "Cuéntanos qué pasó", tipo: "textarea", validar: texto(20) },
    NOMBRE, EMAIL,
  ]} />
);

export const FormObjetosPerdidos = () => (
  <Formulario titulo="Declara un objeto perdido" prefijo="OBJ" campos={[
    { nombre: "fecha", etiqueta: "Fecha del viaje", tipo: "date", validar: (v) => (v && v <= hoy() ? null : "La fecha no puede ser futura.") },
    { nombre: "estacion", etiqueta: "Estación o tren", tipo: "select", opciones: [...estaciones, "Dentro del tren"] },
    { nombre: "objeto", etiqueta: "Describe el objeto", tipo: "textarea", validar: texto(10) },
    NOMBRE, EMAIL, { ...TEL, opcional: true },
  ]} />
);

export const FormContacto = () => (
  <Formulario titulo="Contacta con nosotros" prefijo="CON" campos={[
    NOMBRE, EMAIL,
    { nombre: "asunto", etiqueta: "Asunto", tipo: "select", opciones: ["Información", "Sugerencia", "Billetes", "Otro"] },
    { nombre: "texto", etiqueta: "Mensaje", tipo: "textarea", validar: texto(10) },
  ]} />
);

export const AltaAvisos = () => (
  <Formulario titulo="Avisos por WhatsApp" prefijo="WAP" enviar="Darme de alta" aviso="Te avisaremos de cambios y retrasos de tus trenes (simulado: no se envía ningún mensaje)." campos={[
    { ...TEL, etiqueta: "Teléfono móvil", ayuda: "9 cifras, empieza por 6 o 7", validar: (v) => (/^[67]\d{8}$/.test(v.replace(/\s/g, "")) ? null : "Móvil español de 9 cifras que empiece por 6 o 7.") },
  ]} />
);

// Cita previa: las franjas libres dependen de estación y fecha, siempre las mismas.
const FRANJAS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "16:00", "16:30", "17:00", "17:30"];

export function FormCitaPrevia() {
  const [estacion, setEstacion] = useState("");
  const [fecha, setFecha] = useState("");
  const [franja, setFranja] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const envio = useEnvio("CIT");
  const libres = estacion && fecha ? FRANJAS.filter((f) => semilla(`${estacion}-${fecha}-${f}`) % 3 !== 0) : [];

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!estacion) n.estacion = "Elige una estación.";
    if (fechaFutura(fecha)) n.fecha = "Elige una fecha a partir de hoy.";
    if (!libres.includes(franja)) n.franja = "Elige una franja libre.";
    setErr(n);
    if (!Object.keys(n).length) await envio.enviar();
  }

  return (
    <Herramienta titulo="Pide cita previa">
      {envio.exp ? (
        <Exito>Cita confirmada el {fecha} a las {franja} en {estacion}. Nº <strong>{envio.exp}</strong>.</Exito>
      ) : (
        <form className="herr__form" onSubmit={enviar} noValidate>
          <Selector etiqueta="Estación" value={estacion} error={err.estacion} onChange={(e) => { setEstacion(e.target.value); setFranja(""); }}>
            <option value="">Elige estación</option>
            {estaciones.map((s) => <option key={s}>{s}</option>)}
          </Selector>
          <Campo etiqueta="Fecha" type="date" min={hoy()} value={fecha} error={err.fecha} onChange={(e) => { setFecha(e.target.value); setFranja(""); }} />
          <Selector etiqueta="Franja horaria" value={franja} error={err.franja} disabled={!libres.length} onChange={(e) => setFranja(e.target.value)}>
            <option value="">{libres.length ? "Elige franja" : "Elige estación y fecha"}</option>
            {libres.map((f) => <option key={f}>{f}</option>)}
          </Selector>
          <button className="boton" disabled={envio.enviando}>{envio.enviando ? "Reservando…" : "Reservar cita"}</button>
        </form>
      )}
    </Herramienta>
  );
}
