import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { misAbonos, obtenerAbono } from "@renfe/shared/api/cliente";
import { estadoAbono } from "@renfe/shared/api/simulado-abonos";
import type { Abono, Usuario } from "@renfe/shared/api/tipos";
import { fecha } from "../reserva/formato";
import "../abonos/abonos.css";

const aFecha = (iso: string) => fecha(`${iso}T12:00:00`);

const TEXTO_ESTADO = { pendiente: "Aún no empieza", vigente: "Vigente", agotado: "Sin viajes", caducado: "Caducado" };
const claveCara = (id: string) => `anden-abonos-cara-${id}`;

function leerCara(id: string) {
  try {
    return localStorage.getItem(claveCara(id)) === "1";
  } catch {
    return false;
  }
}

export function MisAbonos({ usuario }: { usuario: Usuario }) {
  const [abonos, setAbonos] = useState<Abono[] | null>(null);
  const [error, setError] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [qr, setQr] = useState("");
  const [cara, setCara] = useState(() => leerCara(usuario.id));

  useEffect(() => {
    misAbonos().then(setAbonos, (e: Error) => setError(e.message));
  }, []);

  const verQr = async (a: Abono) => {
    if (abierto === a.id) return setAbierto(null);
    setAbierto(a.id);
    setQr("");
    setError("");
    try {
      // GET /abonos/:id devuelve el abono con su QR firmado; la lista puede venir sin él.
      const conQr = await obtenerAbono(a.id).catch(() => a);
      const { default: QRCode } = await import("qrcode");
      setQr(await QRCode.toString(conQr.qr || a.qr, { type: "svg", margin: 1, errorCorrectionLevel: "M" }));
    } catch (e) {
      setError((e as Error).message || "No hemos podido generar el QR del abono.");
    }
  };

  const cambiarCara = (v: boolean) => {
    setCara(v);
    try {
      localStorage.setItem(claveCara(usuario.id), v ? "1" : "0");
    } catch {
      /* sin almacenamiento: vale solo para esta visita */
    }
  };

  return (
    <section className="tarjeta mis-abonos" id="mis-abonos" aria-labelledby="cuenta-abonos">
      <h2 id="cuenta-abonos">Mis abonos</h2>
      {error && <p role="alert">{error}</p>}
      {!abonos && !error && <p>Cargando…</p>}
      {abonos?.length === 0 && <p>Todavía no tienes abonos ni bonos.</p>}
      {abonos && abonos.length > 0 && (
        <ul className="mis-abonos__lista">
          {abonos.map((a) => {
            const estado = estadoAbono(a);
            return (
              <li key={a.id} className="mis-abonos__item">
                <h3>{a.nombre}</h3>
                {a.origen && (
                  <p>
                    {a.origen.nombre} – {a.destino?.nombre}
                  </p>
                )}
                <p>
                  <span className={`mis-abonos__estado mis-abonos__estado--${estado}`}>{TEXTO_ESTADO[estado]}</span> Del{" "}
                  {aFecha(a.inicio)} al {aFecha(a.fin)}
                </p>
                <p>{a.viajesRestantes === null ? "Viajes ilimitados" : `Te quedan ${a.viajesRestantes} de ${a.viajesTotales} viajes`}</p>
                <button
                  type="button"
                  className="boton boton--secundario"
                  aria-expanded={abierto === a.id}
                  aria-controls={`qr-${a.id}`}
                  onClick={() => void verQr(a)}
                >
                  {abierto === a.id ? "Ocultar QR" : "Ver QR"}
                </button>
                {abierto === a.id && (
                  <div id={`qr-${a.id}`}>
                    {qr ? (
                      <div className="mis-abonos__qr" role="img" aria-label={`Código QR de ${a.nombre}`} dangerouslySetInnerHTML={{ __html: qr }} />
                    ) : (
                      <p>Generando el QR…</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p>
        <Link to="/abonos">Comprar un abono o bono</Link>
      </p>

      <label className="mis-abonos__cara">
        <input
          type="checkbox"
          role="switch"
          checked={cara && usuario.caraRegistrada}
          disabled={!usuario.caraRegistrada}
          aria-describedby="cara-abonos-ayuda"
          onChange={(e) => cambiarCara(e.target.checked)}
        />
        <span>Usar mi cara para validar</span>
      </label>
      <p id="cara-abonos-ayuda">
        {usuario.caraRegistrada
          ? "De momento solo guardamos tu preferencia: la validación con la cara aún no existe en las estaciones."
          : "Para activarlo, registra antes tu cara en «Acceso con tu cara»."}
      </p>
    </section>
  );
}
