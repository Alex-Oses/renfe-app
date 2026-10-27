import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { buscarTrenes } from "../api/cliente";
import { ciudadDe, type TipoTren, type Tren } from "../api/tipos";
import { Buscador } from "../componentes/Buscador";

const minutos = (iso: string) => {
  const [h, m] = iso.slice(11, 16).split(":").map(Number);
  return h * 60 + m;
};
const duracion = (t: Tren) => (new Date(t.llegada).getTime() - new Date(t.salida).getTime()) / 60_000;
const textoDuracion = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`;
const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

const FRANJAS = [
  { id: "manana", texto: "Mañana", desde: 0, hasta: 12 * 60 },
  { id: "tarde", texto: "Tarde", desde: 12 * 60, hasta: 18 * 60 },
  { id: "noche", texto: "Noche", desde: 18 * 60, hasta: 24 * 60 },
] as const;
const ORDENES = {
  hora: { texto: "Hora", f: (a: Tren, b: Tren) => a.salida.localeCompare(b.salida) },
  precio: { texto: "Precio", f: (a: Tren, b: Tren) => a.precioDesde - b.precioDesde },
  duracion: { texto: "Duración", f: (a: Tren, b: Tren) => duracion(a) - duracion(b) },
};
type Orden = keyof typeof ORDENES;

function moverDia(fecha: string, dias: number) {
  const f = new Date(`${fecha}T12:00:00`);
  f.setDate(f.getDate() + dias);
  return f.toISOString().slice(0, 10);
}

// Añade o quita un valor de un conjunto (chips de filtro).
const alternar = <T,>(s: Set<T>, v: T) => {
  const n = new Set(s);
  if (!n.delete(v)) n.add(v);
  return n;
};

export function Resultados() {
  const [params] = useSearchParams();
  const origen = params.get("origen") ?? "";
  const destino = params.get("destino") ?? "";
  const fecha = params.get("fecha") ?? "";
  const pasajeros = Math.min(9, Math.max(1, Number(params.get("pasajeros")) || 1));
  const [trenes, setTrenes] = useState<Tren[] | null>(null);
  const [error, setError] = useState("");
  const [tipos, setTipos] = useState<Set<TipoTren>>(new Set());
  const [franjas, setFranjas] = useState<Set<string>>(new Set());
  const [orden, setOrden] = useState<Orden>("hora");

  useEffect(() => {
    setTrenes(null);
    setError("");
    buscarTrenes({ origen, destino, fecha })
      .then(setTrenes)
      .catch((e: Error) => setError(e.message));
  }, [origen, destino, fecha]);

  const tiposDisponibles = useMemo(() => [...new Set(trenes?.map((t) => t.tipo))], [trenes]);
  const visibles = useMemo(
    () =>
      (trenes ?? [])
        .filter((t) => !tipos.size || tipos.has(t.tipo))
        .filter((t) => !franjas.size || FRANJAS.some((f) => franjas.has(f.id) && minutos(t.salida) >= f.desde && minutos(t.salida) < f.hasta))
        .sort(ORDENES[orden].f),
    [trenes, tipos, franjas, orden],
  );

  // Escala común: la barra de cada tren ocupa su franja real dentro del día.
  const inicio = trenes?.length ? Math.min(...trenes.map((t) => minutos(t.salida))) : 0;
  const fin = trenes?.length ? Math.max(...trenes.map((t) => minutos(t.salida) + duracion(t))) : 1;
  const fechaLarga = fecha
    ? new Date(`${fecha}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
    : "";
  const enlaceDia = (d: number) =>
    `/trenes?${new URLSearchParams({ origen, destino, fecha: moverDia(fecha, d), pasajeros: String(pasajeros) })}`;
  const limpiar = () => {
    setTipos(new Set());
    setFranjas(new Set());
  };

  return (
    <div className="contenedor seccion">
      <Buscador key={`${origen}${destino}${fecha}${pasajeros}`} inicial={{ origen, destino, fecha, pasajeros }} compacto />

      <div className="resultados__cabecera">
        <h1>
          {trenes?.[0] ? `${ciudadDe(trenes[0].origen)} a ${ciudadDe(trenes[0].destino)}` : "Trenes"}
          <span className="resultados__fecha">
            {fechaLarga} · {pasajeros} {pasajeros === 1 ? "pasajero" : "pasajeros"}
          </span>
        </h1>
        <nav className="dias" aria-label="Cambiar de día">
          <Link to={enlaceDia(-1)}>Día anterior</Link>
          <Link to={enlaceDia(1)}>Día siguiente</Link>
        </nav>
      </div>

      {trenes && trenes.length > 0 && (
        <div className="filtros">
          <div className="filtros__grupo" role="group" aria-label="Tipo de tren">
            {tiposDisponibles.map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={tipos.has(t)} onClick={() => setTipos((s) => alternar(s, t))}>
                {t}
              </button>
            ))}
          </div>
          <div className="filtros__grupo" role="group" aria-label="Franja horaria de salida">
            {FRANJAS.map((f) => (
              <button key={f.id} type="button" className="chip" aria-pressed={franjas.has(f.id)} onClick={() => setFranjas((s) => alternar(s, f.id))}>
                {f.texto}
              </button>
            ))}
          </div>
          <div className="filtros__grupo filtros__orden" role="radiogroup" aria-label="Ordenar por">
            <span aria-hidden="true">Ordenar por</span>
            {(Object.keys(ORDENES) as Orden[]).map((o) => (
              <button key={o} type="button" role="radio" className="chip" aria-checked={orden === o} onClick={() => setOrden(o)}>
                {ORDENES[o].texto}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="aviso" role="alert">No se han podido cargar los trenes: {error}. Vuelve a intentarlo.</p>}
      {!error && trenes === null && (
        <ol className="trenes" aria-busy="true" aria-label="Buscando trenes">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="tren tren--esqueleto" aria-hidden="true">
              <span className="esqueleto" style={{ gridArea: "horas", width: "9rem" }} />
              <span className="esqueleto" style={{ gridArea: "linea" }} />
              <span className="esqueleto" style={{ gridArea: "info", width: "6rem" }} />
              <span className="esqueleto" style={{ gridArea: "compra", width: "8rem", justifySelf: "end" }} />
            </li>
          ))}
        </ol>
      )}
      {trenes?.length === 0 && (
        <div className="aviso vacio">
          <p>No hay trenes para este trayecto ese día. Prueba con otra estación o con otro día.</p>
          <Link className="boton boton--secundario" to={enlaceDia(1)}>
            Ver el día siguiente
          </Link>
        </div>
      )}
      {trenes && trenes.length > 0 && visibles.length === 0 && (
        <div className="aviso vacio">
          <p>Ningún tren cumple los filtros elegidos.</p>
          <button type="button" className="boton boton--secundario" onClick={limpiar}>
            Quitar filtros
          </button>
        </div>
      )}

      {visibles.length > 0 && (
        <ol className="trenes" aria-live="polite">
          {visibles.map((t, i) => {
            const dur = duracion(t);
            const izquierda = ((minutos(t.salida) - inicio) / (fin - inicio)) * 100;
            const ancho = (dur / (fin - inicio)) * 100;
            const completo = t.plazasLibres < pasajeros;
            return (
              <li key={t.id} className={`tren aparece-escalonado${completo ? " tren--completo" : ""}`} style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
                <div className="tren__horas">
                  <time dateTime={t.salida}>{t.salida.slice(11, 16)}</time>
                  <span className="tren__duracion">{textoDuracion(dur)}</span>
                  <time dateTime={t.llegada}>{t.llegada.slice(11, 16)}</time>
                </div>
                <div className="tren__linea" aria-hidden="true">
                  <span style={{ left: `${izquierda}%`, width: `${ancho}%` }} />
                </div>
                <div className="tren__info">
                  <span className="tren__tipo">{t.tipo}</span> {t.numero}
                </div>
                <div className="tren__compra">
                  {completo ? (
                    <span className="tren__agotado">{t.plazasLibres === 0 ? "Completo" : `Solo ${t.plazasLibres} plazas`}</span>
                  ) : (
                    <>
                      <span className="tren__precio">{euros.format(t.precioDesde)}</span>
                      <Link
                        className="boton boton--secundario"
                        to={`/reserva/${encodeURIComponent(t.id)}?pasajeros=${pasajeros}`}
                        aria-label={`Elegir ${t.tipo} ${t.numero} de las ${t.salida.slice(11, 16)}`}
                      >
                        Elegir
                      </Link>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
