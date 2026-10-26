import "leaflet/dist/leaflet.css";
import "./mapa/mapa.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import { useSearchParams } from "react-router-dom";
import { posicionesTrenes } from "../api/cliente";
import { ESTACIONES } from "../api/simulado";
import type { PosicionTren } from "../api/tipos";
import { CapaTrenes, COLOR_TIPO } from "./mapa/CapaTrenes";

const sinTildes = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const reducidoInicial = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

function Retraso({ min }: { min: number }) {
  const nivel = min === 0 ? "ok" : min <= 15 ? "medio" : "alto";
  return <span className={`retraso retraso--${nivel}`}>{min === 0 ? "Puntual" : `+${min} min`}</span>;
}

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
          {ESTACIONES.map((e) => (
            <CircleMarker key={e.id} center={[e.lat, e.lon]} radius={4} pathOptions={{ color: "#464646", weight: 1.5, fillColor: "#fff", fillOpacity: 1 }}>
              <Tooltip>{e.nombre}</Tooltip>
            </CircleMarker>
          ))}
          <CapaTrenes trenes={trenes} seleccion={seleccion} siguiendo={siguiendo} reducido={reducido} alElegir={elegir} />
        </MapContainer>
        {cargando && <p className="mapa-aviso cristal">Cargando posiciones…</p>}
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
                </h2>
                <p className="mapa-detalle__ruta">
                  {elegido.origen} → {elegido.destino}
                </p>
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
                <dl className="mapa-detalle__datos">
                  <div>
                    <dt>Retraso</dt>
                    <dd>
                      <Retraso min={elegido.retrasoMin} />
                    </dd>
                  </div>
                  <div>
                    <dt>Velocidad</dt>
                    <dd>{elegido.velocidad} km/h</dd>
                  </div>
                  <div>
                    <dt>Próxima parada</dt>
                    <dd>{elegido.proximaParada}</dd>
                  </div>
                </dl>
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
          {visibles.length} de {trenes.length} trenes
        </p>
        <ul className="mapa-lista">
          {visibles.map((t) => (
            <li key={t.trenId}>
              <button className="mapa-tren" aria-current={t.trenId === seleccion} onClick={() => elegir(t.trenId)}>
                <span className="mapa-tren__tipo" style={{ background: COLOR_TIPO[t.tipo] }}>
                  {t.tipo === "Media Distancia" ? "MD" : t.tipo}
                </span>
                <span className="mapa-tren__info">
                  <strong>
                    {t.numero} · {t.origen.split(/[- ]/)[0]} → {t.destino.split(/[- ]/)[0]}
                  </strong>
                  <span>
                    Próxima: {t.proximaParada} · {t.velocidad} km/h
                  </span>
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
