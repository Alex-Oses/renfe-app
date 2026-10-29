import { useState } from "react";
import {
  confirmarPagoSimulado,
  crearIntentoPago,
  crearReserva,
  usaDatosSimulados,
} from "@renfe/shared/api/cliente";
import type { IdDescuento, IdExtra, IdTarifa, Pasajero, Reserva, Tren } from "@renfe/shared/api/tipos";
import { EXTRAS, precioExtra } from "@renfe/shared/api/simulado-precios";
import { euros } from "./formato";

interface Props {
  tren: Tren;
  asientos: string[];
  pasajeros: Pasajero[];
  total: number;
  tarifa: IdTarifa;
  descuento: IdDescuento;
  bebes: number;
  extras: IdExtra[];
  onExtras: (e: IdExtra[]) => void;
  onPagada: (r: Reserva) => void;
  onAsientoOcupado: () => void;
}

export function PasoPago({ tren, asientos, pasajeros, total, tarifa, descuento, bebes, extras, onExtras, onPagada, onAsientoOcupado }: Props) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const pagar = async () => {
    setCargando(true);
    setError("");
    try {
      const r = await crearReserva(tren, { trenId: tren.id, asientos, pasajeros, tarifa, descuento, extras, bebes });
      // Con la API real POST /reservas ya crea la reserva pagada y sus billetes; sin API hay que
      // pasar por el intento de pago y la confirmación simulados.
      if (usaDatosSimulados) {
        await crearIntentoPago(r.id);
        onPagada(await confirmarPagoSimulado(r.id));
      } else {
        onPagada(r);
      }
    } catch (e) {
      const m = (e as Error).message;
      setOcupado(/butaca|ocupad/i.test(m));
      setError(m);
      setCargando(false);
    }
  };

  return (
    <div className="pago">
      <fieldset className="extras">
        <legend>Añade a tu viaje</legend>
        {EXTRAS.map((e) => {
          const precio = precioExtra(e.id, asientos.length, tarifa);
          return (
            <label key={e.id} className="extra">
              <input
                type="checkbox"
                checked={extras.includes(e.id)}
                disabled={cargando}
                onChange={(ev) => onExtras(ev.target.checked ? [...extras, e.id] : extras.filter((x) => x !== e.id))}
              />
              <span className="extra__nombre">{e.nombre}</span>
              <span className="extra__precio">
                {precio === 0 ? "Incluido" : `${euros.format(precio)}${e.porViajero && asientos.length > 1 ? ` (${asientos.length} viajeros)` : ""}`}
              </span>
            </label>
          );
        })}
      </fieldset>

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
