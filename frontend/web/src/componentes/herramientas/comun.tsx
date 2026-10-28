// Piezas compartidas por los widgets: campo accesible, búsqueda de reserva y confirmación.
import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import type { Reserva } from "@renfe/shared/api/tipos";
import { expediente } from "./logica";
import "./herramientas.css";

type Base = { etiqueta: string; error?: string; ayuda?: string };

export function Campo({ etiqueta, error, ayuda, ...input }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const desc = [ayuda && `${id}-a`, error && `${id}-e`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="campo herr__campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={desc} {...input} />
      {ayuda && <small id={`${id}-a`}>{ayuda}</small>}
      {error && <small id={`${id}-e`} className="herr__error">{error}</small>}
    </div>
  );
}

export function Selector({ etiqueta, error, children, ...sel }: Base & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const id = useId();
  return (
    <div className="campo herr__campo">
      <label htmlFor={id}>{etiqueta}</label>
      <select id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-e` : undefined} {...sel}>
        {children}
      </select>
      {error && <small id={`${id}-e`} className="herr__error">{error}</small>}
    </div>
  );
}

export function Herramienta({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="cristal herr" aria-label={titulo}>
      <h2 className="herr__titulo">{titulo}</h2>
      {children}
    </section>
  );
}

export function Exito({ children }: { children: ReactNode }) {
  return (
    <div className="herr__exito" role="status">
      {children}
    </div>
  );
}

export const espera = (ms = 400) => new Promise((r) => setTimeout(r, ms));
export const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

// shortcut: lee el almacén de simulado-reservas (clave "anden-reservas") porque no exporta búsqueda por localizador; usar la API cuando exista GET /reservas?localizador=.
export function reservaPorLocalizador(loc: string): Reserva | undefined {
  try {
    const a = JSON.parse(localStorage.getItem("anden-reservas") ?? "null") as { reservas: Reserva[] } | null;
    return a?.reservas.find((r) => r.localizador === loc.trim().toUpperCase());
  } catch {
    return undefined;
  }
}

/** Formulario de localizador (y email opcional) que entrega la reserva encontrada. */
export function BuscaReserva({ conEmail, filtro, onReserva }: { conEmail?: boolean; filtro?: (r: Reserva) => string | null; onReserva: (r: Reserva) => void }) {
  const [loc, setLoc] = useState("");
  const [email, setEmail] = useState("");
  const [errores, setErrores] = useState<{ loc?: string; email?: string; general?: string }>({});
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const err: typeof errores = {};
    if (!/^[A-Z0-9]{6}$/i.test(loc.trim())) err.loc = "El localizador tiene 6 letras o números.";
    if (conEmail && !emailValido(email)) err.email = "Escribe un email válido.";
    setErrores(err);
    if (Object.keys(err).length) return;
    setEnviando(true);
    await espera();
    setEnviando(false);
    const r = reservaPorLocalizador(loc);
    if (!r || (conEmail && !r.pasajeros.some((p) => p.email.toLowerCase() === email.trim().toLowerCase())))
      return setErrores({ general: "No encontramos ninguna reserva con esos datos. Revisa el localizador del email de compra." });
    const motivo = filtro?.(r);
    if (motivo) return setErrores({ general: motivo });
    onReserva(r);
  }

  return (
    <form className="herr__form" onSubmit={enviar} noValidate>
      <Campo etiqueta="Localizador" value={loc} onChange={(e) => setLoc(e.target.value.toUpperCase())} maxLength={6} autoComplete="off" error={errores.loc} required />
      {conEmail && <Campo etiqueta="Email de la compra" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" error={errores.email} required />}
      <button className="boton" disabled={enviando}>{enviando ? "Buscando…" : "Buscar reserva"}</button>
      {errores.general && <p className="herr__error" role="alert">{errores.general}</p>}
    </form>
  );
}

export function ResumenReserva({ r }: { r: Reserva }) {
  const f = new Date(r.tren.salida);
  return (
    <dl className="herr__resumen">
      <dt>Localizador</dt><dd>{r.localizador}</dd>
      <dt>Tren</dt><dd>{r.tren.tipo} {r.tren.numero}</dd>
      <dt>Trayecto</dt><dd>{r.tren.origen.nombre} → {r.tren.destino.nombre}</dd>
      <dt>Salida</dt><dd>{f.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}</dd>
      <dt>Viajeros</dt><dd>{r.pasajeros.map((p) => `${p.nombre} ${p.apellidos}`).join(", ")}</dd>
      <dt>Asientos</dt><dd>{r.asientos.map((a) => `${a.id} (${a.clase})`).join(", ")}</dd>
      <dt>Estado</dt><dd>{{ pendiente_pago: "Pendiente de pago", pagada: "Pagada", cancelada: "Cancelada" }[r.estado]}</dd>
    </dl>
  );
}

/** Formulario genérico: valida campos, simula el envío y muestra nº de expediente. */
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
