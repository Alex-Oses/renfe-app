import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { obtenerBillete } from "../api/cliente";
import type { Billete as TBillete } from "../api/tipos";
import { fecha, hora } from "./reserva/formato";
import "./billetes.css";

export default function Billete() {
  const { id = "" } = useParams();
  const [b, setB] = useState<TBillete | null>(null);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerBillete(id)
      .then((x) => {
        setB(x);
        return QRCode.toString(x.qr, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
      })
      .then(setQr)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error)
    return (
      <div className="contenedor seccion" role="alert">
        <p>{error}</p>
        <Link to="/billetes">Volver a mis billetes</Link>
      </div>
    );
  if (!b) return <p className="contenedor seccion cargando">Cargando el billete…</p>;

  return (
    <div className="contenedor seccion billete-pagina">
      <Link className="enlace-atras no-imprimir" to="/billetes">
        Mis billetes
      </Link>
      <h1 className="sr-solo">Billete {b.localizador}</h1>
      <article className="pase" aria-label={`Billete de ${b.tren.origen.nombre} a ${b.tren.destino.nombre}`}>
        <header className="pase__cabeza">
          <span className="pase__marca">Andén</span>
          <span>
            {b.tren.tipo} {b.tren.numero}
          </span>
        </header>
        <div className="pase__ruta">
          <div>
            <span className="pase__ciudad">{b.tren.origen.ciudad}</span>
            <span className="pase__hora">{hora(b.tren.salida)}</span>
            <span className="pase__est">{b.tren.origen.nombre}</span>
          </div>
          <svg className="pase__via" width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M2 12h34M28 5l8 7-8 7" />
          </svg>
          <div className="pase__destino">
            <span className="pase__ciudad">{b.tren.destino.ciudad}</span>
            <span className="pase__hora">{hora(b.tren.llegada)}</span>
            <span className="pase__est">{b.tren.destino.nombre}</span>
          </div>
        </div>
        <dl className="pase__datos">
          <div>
            <dt>Fecha</dt>
            <dd>{fecha(b.tren.salida)}</dd>
          </div>
          <div>
            <dt>Coche</dt>
            <dd>{b.asiento.coche}</dd>
          </div>
          <div>
            <dt>Asiento</dt>
            <dd>
              {b.asiento.fila}
              {b.asiento.letra}
            </dd>
          </div>
          <div>
            <dt>Clase</dt>
            <dd>{b.asiento.clase}</dd>
          </div>
          <div className="pase__ancho">
            <dt>Viajero</dt>
            <dd>
              {b.pasajero.nombre} {b.pasajero.apellidos}
            </dd>
          </div>
        </dl>
        <div className="pase__corte" aria-hidden="true" />
        <div className="pase__pie">
          <div className="pase__qr" role="img" aria-label="Código QR del billete" dangerouslySetInnerHTML={{ __html: qr }} />
          <div>
            <p className="pase__etiqueta">Localizador</p>
            <p className="pase__loc">{b.localizador}</p>
            <p className="pase__nota">Enseña este código en el control de acceso.</p>
          </div>
        </div>
      </article>
      <div className="reserva__acciones no-imprimir">
        <button type="button" className="boton" onClick={() => window.print()}>
          Imprimir billete
        </button>
      </div>
    </div>
  );
}
