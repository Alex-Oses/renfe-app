import { Link } from "react-router-dom";
import type { Reserva } from "@renfe/shared/api/tipos";

export function PasoListo({ reserva }: { reserva: Reserva }) {
  return (
    <div className="listo">
      <svg className="listo__check" width="88" height="88" viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r="24" fill="none" />
        <path fill="none" d="M15 27l7 7 15-15" />
      </svg>
      <p>Tu reserva está pagada. Te hemos guardado {reserva.pasajeros.length === 1 ? "el billete" : `los ${reserva.pasajeros.length} billetes`} en esta web.</p>
      <p className="listo__etiqueta">Localizador</p>
      <p className="listo__loc">{reserva.localizador}</p>
      <div className="reserva__acciones">
        <Link className="boton" to="/billetes">
          Ver mis billetes
        </Link>
        <Link className="boton boton--secundario" to="/mapa">
          Sigue tu tren en directo
        </Link>
      </div>
    </div>
  );
}
