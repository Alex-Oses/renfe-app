import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Abono, TipoAbono } from "@renfe/shared/api/tipos";

const ETIQUETA: Record<TipoAbono, string> = {
  "ave-ld-mensual": "AVE y Larga Distancia",
  "avant-mensual": "Avant",
  "cercanias-recurrente": "Cercanías",
  "bono-10": "Bono 10",
};
const fechaCorta = (f: string) =>
  new Date(`${f}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

export function TarjetaAbono({ abono }: { abono: Abono }) {
  const [qr, setQr] = useState("");
  useEffect(() => {
    let vivo = true;
    QRCode.toString(abono.qr, { type: "svg", margin: 0, errorCorrectionLevel: "M" }).then(
      (s) => vivo && setQr(s),
      () => {},
    );
    return () => {
      vivo = false;
    };
  }, [abono.qr]);
  const caducado = abono.fin < new Date().toISOString().slice(0, 10);
  const agotado = abono.viajesRestantes === 0;
  const { viajesRestantes: quedan, viajesTotales: total } = abono;

  return (
    <article className={`abono-tarjeta abono-tarjeta--${abono.tipo}${caducado || agotado ? " abono-tarjeta--inactiva" : ""}`}>
      <div className="abono-tarjeta__cabeza">
        <span className="abono-tarjeta__marca">Renfe</span>
        <span className="abono-tarjeta__tipo">{ETIQUETA[abono.tipo]}</span>
      </div>
      <h3>{abono.nombre}</h3>
      {abono.origen && abono.destino && (
        <p className="abono-tarjeta__ruta">
          {abono.origen.nombre} <span aria-hidden="true">↔</span>
          <span className="sr-solo"> y </span> {abono.destino.nombre}
        </p>
      )}
      <div className="abono-tarjeta__pie">
        <dl>
          <div>
            <dt>Válido hasta</dt>
            <dd>{fechaCorta(abono.fin)}</dd>
          </div>
          <div>
            <dt>Viajes</dt>
            <dd>{total === null ? "Ilimitados" : `${quedan} de ${total}`}</dd>
          </div>
          {(caducado || agotado) && (
            <div>
              <dt>Estado</dt>
              <dd>{caducado ? "Caducado" : "Agotado"}</dd>
            </div>
          )}
        </dl>
        {qr && <span className="abono-tarjeta__qr" role="img" aria-label="Código QR del abono" dangerouslySetInnerHTML={{ __html: qr }} />}
      </div>
    </article>
  );
}
