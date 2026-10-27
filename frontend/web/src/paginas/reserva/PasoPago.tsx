import { useState } from "react";
import { confirmarPagoSimulado, crearIntentoPago, crearReserva } from "../../api/cliente";
import type { Pasajero, Reserva } from "../../api/tipos";
import { euros } from "./formato";

interface Props {
  trenId: string;
  asientos: string[];
  pasajeros: Pasajero[];
  total: number;
  onPagada: (r: Reserva) => void;
  onAsientoOcupado: () => void;
}

export function PasoPago({ trenId, asientos, pasajeros, total, onPagada, onAsientoOcupado }: Props) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const pagar = async () => {
    setCargando(true);
    setError("");
    try {
      const r = await crearReserva({ trenId, asientos, pasajeros });
      await crearIntentoPago(r.id);
      onPagada(await confirmarPagoSimulado(r.id));
    } catch (e) {
      const m = (e as Error).message;
      setOcupado(/ocupado/i.test(m));
      setError(m);
      setCargando(false);
    }
  };

  return (
    <div className="pago">
      <div className="pago__panel cristal">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M7 15h4" />
        </svg>
        <div>
          <h2>Pago en modo prueba</h2>
          <p>
            Esta web es un proyecto académico. El pago se conectará con Stripe en modo test, así que aquí no se pide ninguna
            tarjeta y no se cobra nada. Al pulsar el botón se confirma la reserva como si el pago hubiera ido bien.
          </p>
          <p className="pago__importe">
            Importe: <strong>{euros.format(total)}</strong>
          </p>
        </div>
      </div>

      {error && (
        <div className="reserva__error" role="alert">
          <p>{error}</p>
          {ocupado && (
            <button type="button" className="boton boton--secundario" onClick={onAsientoOcupado}>
              Elegir otros asientos
            </button>
          )}
        </div>
      )}

      <div className="reserva__acciones">
        <button type="button" className="boton" onClick={pagar} disabled={cargando} aria-busy={cargando}>
          {cargando ? (
            <>
              <span className="girador" aria-hidden="true" /> Procesando el pago…
            </>
          ) : (
            `Pagar ${euros.format(total)} (simulado)`
          )}
        </button>
      </div>
    </div>
  );
}
