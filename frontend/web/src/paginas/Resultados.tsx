import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { buscarTransbordos, buscarTrenes, usaDatosSimulados } from "@renfe/shared/api/cliente";
import type { OpcionTransbordo, TipoTren, Tren } from "@renfe/shared/api/tipos";
import { nombreDeTren } from "@renfe/shared/api/adaptador-trenes";
import { Buscador } from "../componentes/Buscador";
import { TARIFAS, precioViajero } from "@renfe/shared/api/simulado-precios";
import "./resultados.css";
import { ciudadDe } from "@renfe/shared/api/tipos";
import { ESTACIONES } from "@renfe/shared/api/simulado";

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
  // Sin fecha o con una fecha mal escrita en la URL se busca para hoy, en vez de romper la página.
  const fechaUrl = params.get("fecha") ?? "";
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(fechaUrl) && !Number.isNaN(Date.parse(fechaUrl)) ? fechaUrl : new Date().toISOString().slice(0, 10);
  const pasajeros = Math.min(9, Math.max(1, Number(params.get("pasajeros")) || 1));
  const vuelta = params.get("vuelta") ?? "";
  const tramo = params.get("tramo") === "vuelta" ? "vuelta" : "ida";
  // Viajeros y descuento pasan tal cual a la reserva y a los enlaces de otros días.
  const extra = new URLSearchParams();
  for (const k of ["ninos", "bebes", "descuento", "vuelta", "tramo"]) if (params.get(k)) extra.set(k, params.get(k)!);
  // shortcut: compara con las estaciones simuladas; con la API real habría que usar GET /estaciones.
  const desconocidas = (usaDatosSimulados ? [origen, destino] : []).filter((id) => !ESTACIONES.some((e) => e.id === id)).map((id) => id || "(vacío)");
  const [abierto, setAbierto] = useState<string | null>(null);
  // Al abrir las tarifas de un tren, se colocan en pantalla para no tener que buscarlas.
  useEffect(() => {
    if (!abierto) return;
    const marco = requestAnimationFrame(() =>
      document.querySelector(".tarifas")?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
    );
    return () => cancelAnimationFrame(marco);
  }, [abierto]);
  const [preciosDia, setPreciosDia] = useState<Record<string, number | null>>({});
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

  // Sin directos se ofrecen opciones con un transbordo.
  const [transbordos, setTransbordos] = useState<OpcionTransbordo[] | null>(null);
  useEffect(() => {
    setTransbordos(null);
    if (trenes?.length !== 0) return;
    let vivo = true;
    buscarTransbordos({ origen, destino, fecha }).then(
      (o) => vivo && setTransbordos(o),
      () => vivo && setTransbordos([]),
    );
    return () => {
      vivo = false;
    };
  }, [trenes, origen, destino, fecha]);

  // Calendario con el precio más barato de cada día, como el de Renfe.
  useEffect(() => {
    if (!fecha) return;
    let vivo = true;
    const dias = [-3, -2, -1, 0, 1, 2, 3].map((d) => moverDia(fecha, d));
    Promise.all(dias.map((f) => buscarTrenes({ origen, destino, fecha: f }).catch(() => [] as Tren[]))).then((rs) => {
      if (!vivo) return;
      const libres = (ts: Tren[]) => ts.filter((t) => t.plazasLibres >= pasajeros).map((t) => t.precioDesde);
      setPreciosDia(Object.fromEntries(dias.map((f, i) => [f, libres(rs[i]).length ? Math.min(...libres(rs[i])) : null])));
    });
    return () => {
      vivo = false;
    };
  }, [origen, destino, fecha, pasajeros]);

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
  const enlaceFecha = (f: string) => `/trenes?${new URLSearchParams({ origen, destino, fecha: f, pasajeros: String(pasajeros), ...Object.fromEntries(extra) })}`;
  const enlaceDia = (d: number) => enlaceFecha(moverDia(fecha, d));
  const hoy = new Date().toISOString().slice(0, 10);
  const limpiar = () => {
    setTipos(new Set());
    setFranjas(new Set());
  };

  return (
    <div className="contenedor seccion">
      <Buscador
        key={params.toString()}
        inicial={{
          origen,
          destino,
          fecha,
          pasajeros,
          vuelta: tramo === "ida" ? vuelta : undefined,
          ninos: Number(params.get("ninos")) || 0,
          bebes: Number(params.get("bebes")) || 0,
          descuento: params.get("descuento") ?? undefined,
        }}
        compacto
      />

      <div className="resultados__cabecera">
        <h1>
          {vuelta && <span className="resultados__tramo">{tramo === "ida" ? "Ida" : "Vuelta"}</span>}
          {trenes?.[0] ? `${ciudadDe(trenes[0].origen)} a ${ciudadDe(trenes[0].destino)}` : "Trenes"}
          <span className="resultados__fecha">
            {fechaLarga} · {pasajeros} {pasajeros === 1 ? "pasajero" : "pasajeros"}
          </span>
        </h1>
        {!desconocidas.length && (
          <nav className="dias" aria-label="Cambiar de día">
            <Link to={enlaceDia(-1)}>Día anterior</Link>
            <Link to={enlaceDia(1)}>Día siguiente</Link>
          </nav>
        )}
      </div>

      {desconocidas.length > 0 && (
        <div className="aviso vacio" role="status">
          <p>
            No reconocemos {desconocidas.map((x) => `«${x}»`).join(" ni ")} como estación. Escribe arriba el nombre de la estación o la ciudad
            (por ejemplo, Madrid-Puerta de Atocha) y elígela de la lista.
          </p>
        </div>
      )}

      {fecha && !desconocidas.length && (
        <nav className="calendario-precios" aria-label="Precios por día">
          <ul>
            {[-3, -2, -1, 0, 1, 2, 3].map((d) => {
              const f = moverDia(fecha, d);
              if (f < hoy) return null;
              const p = preciosDia[f];
              const texto = new Date(`${f}T12:00:00`).toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
              return (
                <li key={f}>
                  <Link to={enlaceFecha(f)} aria-current={d === 0 ? "date" : undefined}>
                    <span>{texto}</span>
                    <strong>{p === undefined ? "…" : p === null ? "Sin directos" : `desde ${euros.format(p)}`}</strong>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

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

      {error && (
        <div className="aviso vacio" role="alert">
          <p>No se han podido cargar los trenes: {error}. Vuelve a intentarlo.</p>
          <button type="button" className="boton boton--secundario" onClick={() => location.reload()}>
            Reintentar
          </button>
        </div>
      )}
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
      {trenes?.length === 0 && transbordos === null && <p className="cargando">Buscando opciones con transbordo…</p>}
      {transbordos && transbordos.length > 0 && (
        <section aria-labelledby="con-transbordo">
          <h2 id="con-transbordo">No hay trenes directos: opciones con transbordo</h2>
          <ol className="transbordos">
            {transbordos.map((o) => {
              const [a, b] = o.tramos;
              const q = new URLSearchParams({ origen, destino, fecha, a: a.id, b: b.id, pasajeros: String(pasajeros) });
              return (
                <li key={`${a.id}|${b.id}`} className="transbordo tarjeta">
                  <div className="transbordo__horas">
                    <time dateTime={a.salida}>{a.salida.slice(11, 16)}</time>
                    <span>{textoDuracion(o.duracionMin)}</span>
                    <time dateTime={b.llegada}>{b.llegada.slice(11, 16)}</time>
                  </div>
                  <p className="transbordo__ruta">
                    <span className="tren__tipo">{a.tipo}</span> {a.numero || a.linea} hasta {a.destino.nombre} ({a.llegada.slice(11, 16)})
                    <br />
                    <strong>Transbordo en {o.transbordo.nombre}: {textoDuracion(o.esperaMin)} de espera</strong>
                    <br />
                    <span className="tren__tipo">{b.tipo}</span> {b.numero || b.linea} sale a las {b.salida.slice(11, 16)}
                  </p>
                  <div className="tren__compra">
                    <span className="tren__precio">{euros.format(o.precio)}</span>
                    <Link className="boton" to={`/transbordo?${q}`}>
                      Elegir
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}
      {trenes?.length === 0 && transbordos?.length === 0 && !desconocidas.length && (
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
                  <span className="tren__tipo">{t.tipo}</span> {t.numero || t.linea}
                </div>
                <div className="tren__compra">
                  {completo ? (
                    <span className="tren__agotado">{t.plazasLibres === 0 ? "Completo" : `Solo ${t.plazasLibres} plazas`}</span>
                  ) : (
                    <>
                      <span className="tren__precio">{euros.format(t.precioDesde)}</span>
                      <button
                        type="button"
                        className="boton boton--secundario"
                        aria-expanded={abierto === t.id}
                        aria-controls={`tarifas-${i}`}
                        onClick={() => setAbierto((a) => (a === t.id ? null : t.id))}
                        aria-label={`Ver tarifas del ${nombreDeTren(t)} de las ${t.salida.slice(11, 16)}`}
                      >
                        {abierto === t.id ? "Cerrar" : "Elegir"}
                      </button>
                    </>
                  )}
                </div>
                {abierto === t.id && (
                  <ul className="tarifas" id={`tarifas-${i}`} aria-label={`Tarifas del ${nombreDeTren(t)}`}>
                    {TARIFAS.map((ta) => {
                      const q = new URLSearchParams({ origen, destino, pasajeros: String(pasajeros), tarifa: ta.id, ...Object.fromEntries(extra) });
                      return (
                        <li key={ta.id} className={`tarifa cristal tarifa--${ta.id}`}>
                          <h3>{ta.nombre}</h3>
                          <p className="tarifa__precio">
                            <span>desde</span> {euros.format(precioViajero(t.precioDesde, ta.id))}
                          </p>
                          <ul className="tarifa__incluye">
                            {ta.incluye.map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                          <Link className="boton" to={`/reserva/${encodeURIComponent(t.id)}?${q}`} aria-label={`Elegir tarifa ${ta.nombre}`}>
                            Elegir {ta.nombre}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
