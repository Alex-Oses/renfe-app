// Widgets que parten de un localizador: consulta, cambio, anulación y pago pendiente.
import { useState } from "react";
import { Link } from "react-router-dom";
import { confirmarPagoSimulado } from "../../api/cliente";
import type { Reserva } from "../../api/tipos";
import { costeCambio, devolucionAnulacion, euros, PENALIZACION, tarifaDe } from "./logica";
import { BuscaReserva, Exito, Herramienta, ResumenReserva, useEnvio } from "./comun";

const soloPagadas = (r: Reserva) => (r.estado === "pagada" ? null : r.estado === "cancelada" ? "Esa reserva ya está anulada." : "Esa reserva aún no está pagada.");

export function ConsultaReserva() {
  const [r, setR] = useState<Reserva | null>(null);
  return (
    <Herramienta titulo="Consulta tu reserva">
      <BuscaReserva conEmail onReserva={setR} />
      {r && <div aria-live="polite"><ResumenReserva r={r} /><p>Total: <strong>{euros(r.total)}</strong></p></div>}
    </Herramienta>
  );
}

export function CambiaBillete() {
  const [r, setR] = useState<Reserva | null>(null);
  const envio = useEnvio("CAM");
  const tarifa = r && tarifaDe(r);
  const coste = r && tarifa ? costeCambio(tarifa, r.total) : null;
  return (
    <Herramienta titulo="Cambia tu billete">
      <BuscaReserva filtro={soloPagadas} onReserva={(x) => { setR(x); envio.reiniciar(); }} />
      {r && tarifa && (
        <div aria-live="polite">
          <ResumenReserva r={r} />
          <p>Tarifa: <strong>{tarifa}</strong></p>
          {coste === null ? (
            <p className="herr__error">La tarifa Básico no permite cambios.</p>
          ) : envio.exp ? (
            <Exito>Cambio solicitado. Expediente <strong>{envio.exp}</strong>. Elige el nuevo tren en <Link to="/">el buscador</Link>.</Exito>
          ) : (
            <>
              <p>Coste del cambio: <strong>{coste === 0 ? "gratis" : euros(coste)}</strong> (simulado).</p>
              <button className="boton" onClick={envio.enviar} disabled={envio.enviando}>{envio.enviando ? "Procesando…" : "Confirmar cambio"}</button>
            </>
          )}
        </div>
      )}
    </Herramienta>
  );
}

export function AnulaBillete() {
  const [r, setR] = useState<Reserva | null>(null);
  const envio = useEnvio("ANU");
  const tarifa = r && tarifaDe(r);
  const devuelve = r && tarifa ? devolucionAnulacion(tarifa, r.total) : null;
  return (
    <Herramienta titulo="Anula tu billete">
      <BuscaReserva filtro={soloPagadas} onReserva={(x) => { setR(x); envio.reiniciar(); }} />
      {r && tarifa && (
        <div aria-live="polite">
          <ResumenReserva r={r} />
          <p>Tarifa: <strong>{tarifa}</strong></p>
          {devuelve === null ? (
            <p className="herr__error">La tarifa Básico no permite anulación.</p>
          ) : envio.exp ? (
            <Exito>Anulación registrada. Expediente <strong>{envio.exp}</strong>. Te devolveremos {euros(devuelve)} (simulado).</Exito>
          ) : (
            <>
              <p>Penalización: {PENALIZACION[tarifa]} %. Te devolvemos <strong>{euros(devuelve)}</strong> de {euros(r.total)}.</p>
              <button className="boton" onClick={envio.enviar} disabled={envio.enviando}>{envio.enviando ? "Procesando…" : "Confirmar anulación"}</button>
            </>
          )}
        </div>
      )}
    </Herramienta>
  );
}

export function CompraLocalizador() {
  const [r, setR] = useState<Reserva | null>(null);
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState("");
  async function pagar(res: Reserva) {
    setPagando(true);
    setError("");
    try {
      setR(await confirmarPagoSimulado(res.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar el pago.");
    } finally {
      setPagando(false);
    }
  }
  return (
    <Herramienta titulo="Paga una reserva pendiente">
      <BuscaReserva filtro={(x) => (x.estado === "pendiente_pago" ? null : "Esa reserva no está pendiente de pago.")} onReserva={setR} />
      {r && (
        <div aria-live="polite">
          <ResumenReserva r={r} />
          <p>Total: <strong>{euros(r.total)}</strong></p>
          {r.estado === "pagada" ? (
            <Exito>Pago confirmado. <Link to="/billetes">Ver mis billetes</Link></Exito>
          ) : (
            <>
              <p><small>Pago simulado: no se pide ninguna tarjeta.</small></p>
              <button className="boton" onClick={() => pagar(r)} disabled={pagando}>{pagando ? "Procesando el pago…" : "Ir al pago"}</button>
            </>
          )}
          {error && <p className="herr__error" role="alert">{error}</p>}
        </div>
      )}
    </Herramienta>
  );
}
