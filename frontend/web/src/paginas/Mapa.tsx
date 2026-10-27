import "leaflet/dist/leaflet.css";
import "./mapa/mapa.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { useSearchParams } from "react-router-dom";
import { posicionesReales, posicionesTrenes } from "../api/cliente";
import type { PosicionTren, TipoTren } from "../api/tipos";
import { useAvisos } from "../estado/avisos";
import { CapaTrenes, COLOR_TIPO, SIGLA_TIPO, svgTren } from "./mapa/CapaTrenes";
import { Estaciones, RutaElegida, RutasTodas } from "./mapa/CapasRuta";

const TIPOS = Object.keys(COLOR_TIPO) as TipoTren[];

function Leyenda() {
  return (
    <details className="mapa-leyenda cristal">
      <summary>Leyenda</summary>
      <ul>
        {TIPOS.map((t) => (
          <li key={t}>
            <span className="mapa-leyenda__icono" dangerouslySetInnerHTML={{ __html: svgTren(t) }} />
            <span className="mapa-leyenda__linea" style={{ background: COLOR_TIPO[t] }} aria-hidden="true" />
            {t}
          </li>
        ))}
        <li>
          <span className="mapa-leyenda__icono mapa-leyenda__estacion" aria-hidden="true" />
          Estación principal
        </li>
      </ul>
    </details>
  );
}

function Paradas({ tren, ahora }: { tren: PosicionTren; ahora: number }) {
  const { seguimientos, seguir, dejarDeSeguir } = useAvisos();
  const activo = seguimientos.find((s) => s.trenId === tren.trenId);
  return (
    <ol className="mapa-paradas" aria-label="Paradas del recorrido">
      {tren.paradas.map((p) => {
        const llegada = Date.parse(p.llegada);
        const min = Math.max(0, Math.round((llegada - ahora) / 60_000));
        const avisa = activo?.estacionId === p.estacionId;
        return (
          <li key={p.estacionId} className={p.pasada ? "mapa-parada mapa-parada--pasada" : "mapa-parada"}>
            <span className="mapa-parada__punto" style={{ borderColor: COLOR_TIPO[tren.tipo] }} aria-hidden="true" />
            <span className="mapa-parada__info">
              <strong>{p.nombre}</strong>
              <span>
                {new Date(llegada).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                {p.pasada ? "pasada" : min === 0 ? "llegando" : `en ${min} min`}
              </span>
            </span>
            {!p.pasada && (
              <button
                className={`boton boton--secundario mapa-parada__aviso${avisa ? " mapa-parada__aviso--activo" : ""}`}
                aria-pressed={avisa}
                onClick={() => (avisa ? dejarDeSeguir(tren.trenId) : seguir({ trenId: tren.trenId, estacionId: p.estacionId, minutosAntes: 5 }))}
              >
                {avisa ? "Quitar aviso" : "Avísame al llegar"}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}

const sinTildes = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const reducidoInicial = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

function Retraso({ min }: { min: number }) {
  const nivel = min === 0 ? "ok" : min <= 15 ? "medio" : "alto";
  return <span className={`retraso retraso--${nivel}`}>{min === 0 ? "Puntual" : `+${min} min`}</span>;
}

// "Madrid-Puerta de Atocha" → "Madrid"; respeta ciudades de dos palabras como "A Coruña".
function ciudadCorta(estacion: string): string {
  const [base] = estacion.split("-");
  const [primera, segunda] = base.split(" ");
  return primera.length > 1 || !segunda ? primera : `${primera} ${segunda}`;
}

// "2026-10-27T12:41:00+01:00" → "12:41" (mismo formato que la lista de paradas).
const horaCorta = (iso: string) => new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

export default function Mapa() {
  const [params, setParams] = useSearchParams();
  const seleccion = params.get("tren");
  const [trenes, setTrenes] = useState<PosicionTren[]>([]);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [ultima, setUltima] = useState<number | null>(null);
  const [ahora, setAhora] = useState(Date.now());
  const [filtro, setFiltro] = useState("");
  const [siguiendo, setSiguiendo] = useState(true);
  const [reducido, setReducido] = useState(reducidoInicial);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const cambio = () => setReducido(mq.matches);
    mq?.addEventListener("change", cambio);
    return () => mq?.removeEventListener("change", cambio);
  }, []);

  useEffect(() => {
    let vivo = true;
    let temporizador = 0;
    const leer = () =>
      posicionesTrenes().then(
        (p) => {
          if (!vivo) return;
          setTrenes(p);
          setUltima(Date.now());
          setError(false);
          setCargando(false);
          temporizador = window.setTimeout(leer, 5000);
        },
        () => {
          if (!vivo) return;
          setError(true);
          setCargando(false);
        },
      );
    void leer();
    return () => {
      vivo = false;
      clearTimeout(temporizador);
    };
  }, [intento]);

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elegir = useCallback(
    (id: string | null) => {
      setSiguiendo(true);
      setParams(id ? { tren: id } : {}, { replace: true });
    },
    [setParams],
  );

  const visibles = useMemo(() => {
    const q = sinTildes(filtro.trim());
    if (!q) return trenes;
    return trenes.filter((t) => sinTildes(`${t.numero} ${t.tipo} ${t.origen} ${t.destino} ${t.proximaParada}`).includes(q));
  }, [trenes, filtro]);

  const elegido = trenes.find((t) => t.trenId === seleccion);
  const hace = ultima === null ? null : Math.max(0, Math.round((ahora - ultima) / 1000));

  return (
    <div className="mapa-pagina">
      <h1 className="solo-lectores">Mapa de trenes en tiempo real</h1>
      <div className="mapa-lienzo">
        <MapContainer center={[40.2, -3.7]} zoom={6} minZoom={5} className="mapa-leaflet" aria-label="Mapa de trenes">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {elegido ? <RutaElegida tren={elegido} /> : <RutasTodas trenes={trenes} />}
          <Estaciones etiquetas={!elegido} />
          <CapaTrenes trenes={trenes} seleccion={seleccion} siguiendo={siguiendo} reducido={reducido} alElegir={elegir} />
        </MapContainer>
        {cargando && <p className="mapa-aviso cristal">Cargando posiciones…</p>}
        <Leyenda />
      </div>

      <aside className="mapa-panel cristal" aria-label="Trenes en circulación">
        <div className="mapa-panel__cabecera">
          <label className="mapa-filtro">
            <span>Buscar por número, tipo o ciudad</span>
            <input type="search" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Ej.: AVE, 3021, Sevilla" />
          </label>
          <p className="mapa-actualizado">
            <span aria-hidden="true">{hace === null ? "Sin datos todavía" : `Actualizado hace ${hace} s`}</span>
            <span className="solo-lectores" aria-live="polite" aria-atomic="true">
              {ultima && `Posiciones actualizadas a las ${new Date(ultima).toLocaleTimeString("es-ES")}`}
            </span>
          </p>
        </div>

        {error && (
          <div className="mapa-error" role="alert">
            <p>No se han podido cargar las posiciones de los trenes.</p>
            <button className="boton" onClick={() => setIntento((n) => n + 1)}>
              Reintentar
            </button>
          </div>
        )}

        {seleccion && (
          <section className="mapa-detalle" aria-labelledby="detalle-titulo">
            {elegido ? (
              <>
                <h2 id="detalle-titulo">
                  {elegido.tipo} {elegido.numero}
                  {elegido.linea && <span className="mapa-detalle__linea"> · Línea {elegido.linea}</span>}
                </h2>
                {elegido.progreso > 0 && (
                <div
                  className="progreso"
                  role="progressbar"
                  aria-label="Progreso del trayecto"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(elegido.progreso * 100)}
                >
                  <span style={{ width: `${elegido.progreso * 100}%`, background: COLOR_TIPO[elegido.tipo] }} />
                </div>
                )}
                <dl className="mapa-detalle__datos mapa-detalle__viaje">
                  {elegido.origen && (
                    <div>
                      <dt>Sale de</dt>
                      <dd>{elegido.origen}</dd>
                    </div>
                  )}
                  {elegido.destino && (
                    <div>
                      <dt>Va a</dt>
                      <dd>
                        {elegido.destino}
                        {elegido.llegadaDestino && <> · llega a las {horaCorta(elegido.llegadaDestino)}</>}
                      </dd>
                    </div>
                  )}
                  {elegido.proximaParada && (
                    <div>
                      <dt>Próxima parada</dt>
                      <dd>
                        {elegido.proximaParada}
                        {elegido.llegadaProxima && <> · a las {horaCorta(elegido.llegadaProxima)}</>}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt>Retraso</dt>
                    <dd>
                      <Retraso min={elegido.retrasoMin} />
                    </dd>
                  </div>
                </dl>
                {!elegido.origen && (
                  <p className="mapa-detalle__nota">Renfe todavía no publica el origen y el destino de este tren en tiempo real.</p>
                )}
                <Paradas tren={elegido} ahora={ahora} />
              </>
            ) : (
              <h2 id="detalle-titulo">{cargando ? "Buscando el tren…" : "Este tren ya no está circulando."}</h2>
            )}
            <div className="mapa-detalle__acciones">
              {elegido && (
                <button className="boton boton--secundario" onClick={() => setSiguiendo((s) => !s)} aria-pressed={!siguiendo}>
                  {siguiendo ? "Dejar de seguir" : "Seguir en el mapa"}
                </button>
              )}
              <button className="boton boton--secundario" onClick={() => elegir(null)}>
                Cerrar
              </button>
            </div>
          </section>
        )}

        <p className="mapa-cuenta">
          {visibles.length} de {trenes.length} trenes ·{" "}
          {posicionesReales ? "en tiempo real (datos abiertos de Renfe)" : "simulados"}
        </p>
        <ul className="mapa-lista">
          {visibles.map((t) => (
            <li key={t.trenId}>
              <button className="mapa-tren" aria-current={t.trenId === seleccion} onClick={() => elegir(t.trenId)}>
                <span className="mapa-tren__tipo" style={{ background: COLOR_TIPO[t.tipo] }}>
                  {SIGLA_TIPO[t.tipo]}
                </span>
                <span className="mapa-tren__info">
                  <strong>
                    {t.origen ? `${t.numero} · ${ciudadCorta(t.origen)} → ${ciudadCorta(t.destino)}` : `${t.tipo} ${t.numero}`}
                  </strong>
                  {t.proximaParada && (
                    <span>
                      Próxima: {t.proximaParada}
                      {t.llegadaProxima && ` · ${horaCorta(t.llegadaProxima)}`}
                    </span>
                  )}
                </span>
                <Retraso min={t.retrasoMin} />
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
