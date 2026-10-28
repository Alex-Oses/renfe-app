import { useState, type FormEvent } from "react";
import type { Reserva } from "@renfe/shared/api/tipos";
import { euros, indemnizacion, porcentajeIndemnizacion } from "./logica";
import { BuscaReserva, Campo, Exito, Herramienta, ResumenReserva, useEnvio } from "./comun";

export default function FormIndemnizacion() {
  const [r, setR] = useState<Reserva | null>(null);
  const [min, setMin] = useState("");
  const [error, setError] = useState("");
  const [calc, setCalc] = useState<{ pct: number; importe: number } | null>(null);
  const envio = useEnvio("IND");

  function calcular(e: FormEvent) {
    e.preventDefault();
    const m = Number(min);
    if (!Number.isInteger(m) || m < 0 || m > 1440) return setError("Escribe los minutos de retraso (0 a 1440).");
    setError("");
    if (r) setCalc({ pct: porcentajeIndemnizacion(r.tren.tipo, m), importe: indemnizacion(r.tren.tipo, m, r.total) });
  }

  return (
    <Herramienta titulo="Solicita tu indemnización por retraso">
      <BuscaReserva filtro={(x) => (x.estado === "pagada" ? null : "Solo se indemnizan reservas pagadas.")} onReserva={(x) => { setR(x); setCalc(null); envio.reiniciar(); }} />
      {r && (
        <div aria-live="polite">
          <ResumenReserva r={r} />
          <form className="herr__form" onSubmit={calcular} noValidate>
            <Campo etiqueta="Minutos de retraso en destino" type="number" inputMode="numeric" min={0} value={min} onChange={(e) => setMin(e.target.value)} error={error} />
            <button className="boton boton--secundario">Calcular</button>
          </form>
          {calc && (calc.pct === 0 ? (
            <p>Con ese retraso, un {r.tren.tipo} no tiene indemnización según el compromiso de puntualidad.</p>
          ) : envio.exp ? (
            <Exito>Solicitud enviada. Expediente <strong>{envio.exp}</strong>. Recibirás {euros(calc.importe)} (simulado).</Exito>
          ) : (
            <>
              <p>Te corresponde el <strong>{calc.pct} %</strong>: <strong>{euros(calc.importe)}</strong>.</p>
              <button className="boton" onClick={envio.enviar} disabled={envio.enviando}>{envio.enviando ? "Enviando…" : "Solicitar indemnización"}</button>
            </>
          ))}
        </div>
      )}
    </Herramienta>
  );
}
