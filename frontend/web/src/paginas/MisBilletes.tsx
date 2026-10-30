import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Link, Navigate, useLocation } from "react-router-dom";
import { misAbonos, misBilletes, usaDatosSimulados } from "@renfe/shared/api/cliente";
import type { Abono, Billete } from "@renfe/shared/api/tipos";
import { agrupar, unirTransbordos, type Viaje } from "./billetes/agrupar";
import { TarjetaAbono } from "./billetes/TarjetaAbono";
import { fecha, hora } from "./reserva/formato";
import RetrasoVivo from "./billetes/RetrasoVivo";
import "./billetes.css";
import { ciudadDe } from "@renfe/shared/api/tipos";
import { fotoDeRuta, urlFoto } from "@renfe/shared/contenido/imagenes";
import { useSesion } from "../estado/sesion";

export default function MisBilletes() {
  const { sesion } = useSesion();
  const { pathname, search } = useLocation();
  const [billetes, setBilletes] = useState<Billete[] | null>(null);
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [error, setError] = useState("");
  // Con la API real /billetes exige sesión (401 sin token): sin sesión no se piden datos.
  const conSesion = usaDatosSimulados || Boolean(sesion);
  useEffect(() => {
    if (!conSesion) return;
    misBilletes().then(setBilletes, (e: Error) => setError(e.message));
    // Los abonos son un extra de la página: si fallan, los billetes se siguen viendo.
    misAbonos().then(setAbonos, () => setAbonos([]));
  }, [conSesion]);

  if (!conSesion) return <Navigate to={`/acceder?volver=${encodeURIComponent(pathname + search)}`} replace />;
  if (error) return <p className="contenedor seccion" role="alert">{error}</p>;
  if (!billetes) return <p className="contenedor seccion cargando">Cargando tus billetes…</p>;

  const ahora = new Date().toISOString().slice(0, 19);
  const viajes = unirTransbordos(agrupar(billetes));
  const proximos = viajes.filter((v) => v.billetes[0].tren.llegada >= ahora);
  const pasados = viajes.filter((v) => v.billetes[0].tren.llegada < ahora).reverse();

  return (
    <div className="contenedor seccion billetes">
      <h1>Mis billetes</h1>
      {abonos.length > 0 && (
        <section aria-labelledby="mis-abonos">
          <h2 id="mis-abonos">Mis abonos</h2>
          <ul className="abonos-tarjetas">
            {abonos.map((a) => (
              <li key={a.id}>
                <TarjetaAbono abono={a} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {billetes.length === 0 ? (
        <div className="billetes__vacio">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" />
            <path d="M14 6v12" strokeDasharray="2 2" />
          </svg>
          <p>Todavía no tienes billetes. Cuando compres uno aparecerá aquí, listo para enseñar en el andén.</p>
          <Link className="boton" to="/">
            Buscar un tren
          </Link>
        </div>
      ) : (
        <>
          <Lista titulo="Próximos viajes" viajes={proximos} vacio="No tienes viajes pendientes." />
          {pasados.length > 0 && <Lista titulo="Viajes pasados" viajes={pasados} pasado />}
        </>
      )}
    </div>
  );
}

function Lista({ titulo, viajes, vacio, pasado }: { titulo: string; viajes: Viaje[]; vacio?: string; pasado?: boolean }) {
  const id = `t-${titulo.replace(/\s+/g, "-")}`;
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{titulo}</h2>
      {viajes.length === 0 ? (
        <p>{vacio}</p>
      ) : (
        <ul className="billetes__lista">
          {viajes.map((v) => (
            <li key={v.reservaId}>
              <TarjetaViaje viaje={v} pasado={pasado} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Slug de la ciudad para buscar su foto ("Málaga" -> "malaga", "A Coruña" -> "a-coruna").
const slug = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Barras decorativas del talón sacadas del localizador: siempre las mismas para el mismo billete.
const barras = (codigo: string) => [...codigo.repeat(3)].map((c, i) => ({ x: i * 4, w: 1 + (c.charCodeAt(0) % 3) }));

function TarjetaViaje({ viaje, pasado }: { viaje: Viaje; pasado?: boolean }) {
  const { tren, localizador, qr } = viaje.billetes[0];
  const n = viaje.billetes.length;
  const idT = `viaje-${viaje.reservaId}`;
  const ultimo = viaje.enlace?.billetes[0].tren ?? tren;
  const destino = ciudadDe(ultimo.destino);
  const foto = fotoDeRuta(slug(destino));
  const [qrSvg, setQrSvg] = useState("");
  useEffect(() => {
    if (pasado) return;
    let vivo = true;
    QRCode.toString(qr, { type: "svg", margin: 0, errorCorrectionLevel: "M" }).then(
      (s) => vivo && setQrSvg(s),
      () => {},
    );
    return () => {
      vivo = false;
    };
  }, [qr, pasado]);
  const hoy = tren.salida.slice(0, 10) === new Date().toISOString().slice(0, 10);

  return (
    <article className={`ticket${pasado ? " ticket--pasado" : ""}`} aria-labelledby={idT}>
      <div className="ticket__foto">
        {foto ? (
          <img src={urlFoto(foto.archivo, 640)} alt="" loading="lazy" decoding="async" title={`Foto: ${foto.autor} (Wikimedia Commons)`} />
        ) : (
          <span className="ticket__relleno" aria-hidden="true" />
        )}
        {hoy && !pasado && <span className="ticket__hoy">Sale hoy</span>}
        {pasado && <span className="ticket__hoy ticket__hoy--hecho">Realizado</span>}
      </div>

      <div className="ticket__cuerpo">
        <p className="ticket__antetitulo">
          {pasado ? "Viaje realizado" : "Tu próximo tren"} {!pasado && <RetrasoVivo tren={tren} />}
        </p>
        <h3 id={idT} className="ticket__ruta">
          {ciudadDe(tren.origen)} <span aria-hidden="true">→</span>
          <span className="sr-solo"> a </span> {destino}
        </h3>
        {viaje.enlace && (
          <p className="ticket__transbordo">
            <strong>Con transbordo en {tren.destino.nombre}</strong>: {Math.round((Date.parse(ultimo.salida) - Date.parse(tren.llegada)) / 60_000)} min de espera.{" "}
            Sigue en {ultimo.tipo} {ultimo.numero}, sale a las {hora(ultimo.salida)}.
          </p>
        )}
        <dl className="ticket__datos">
          <div>
            <dt>Fecha</dt>
            <dd>{fecha(tren.salida)}</dd>
          </div>
          <div>
            <dt>Salida</dt>
            <dd>{hora(tren.salida)}</dd>
          </div>
          <div>
            <dt>Llegada</dt>
            <dd>{hora(ultimo.llegada)}</dd>
          </div>
          <div>
            <dt>Tren</dt>
            <dd>
              {tren.tipo} {tren.numero}
            </dd>
          </div>
        </dl>
        <div className="ticket__pie">
          {qrSvg && <span className="ticket__qr" aria-hidden="true" dangerouslySetInnerHTML={{ __html: qrSvg }} />}
          <ul className="ticket__viajeros" aria-label={`${n} ${n === 1 ? "viajero" : "viajeros"}`}>
            {[...viaje.billetes, ...(viaje.enlace?.billetes ?? [])].map((b: Billete) => (
              <li key={b.id}>
                <Link to={`/billetes/${encodeURIComponent(b.id)}`} className="ticket__viajero">
                  <span>
                    {b.pasajero.nombre} {b.pasajero.apellidos}
                  </span>
                  <span className="ticket__asiento">
                    {viaje.enlace && `${b.tren.tipo} ${b.tren.numero} · `}Coche {b.asiento.coche} · {b.asiento.fila}
                    {b.asiento.letra}
                  </span>
                  <span className="sr-solo">. Abrir billete</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ticket__talon">
        <span className="ticket__etiqueta">Localizador</span>
        <span className="ticket__loc">{localizador}</span>
        {viaje.enlace && <span className="ticket__loc">{viaje.enlace.billetes[0].localizador}</span>}
        <span className="ticket__etiqueta">
          Total {[...viaje.billetes, ...(viaje.enlace?.billetes ?? [])].reduce((suma, b) => suma + b.asiento.precio, 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
        </span>
        <svg className="ticket__barras" viewBox={`0 0 ${localizador.length * 12} 40`} preserveAspectRatio="none" aria-hidden="true">
          {barras(localizador).map((b) => (
            <rect key={b.x} x={b.x} width={b.w} height="40" />
          ))}
        </svg>
      </div>
    </article>
  );
}
