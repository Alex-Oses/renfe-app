import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ESTACIONES } from "../api/simulado";
import { Desplegable } from "./Desplegable";
import { SelectorNumero } from "./ui/SelectorNumero";

const porNombre = (nombre: string) => ESTACIONES.find((e) => e.nombre === nombre.trim());
const hoy = () => new Date().toISOString().slice(0, 10);
const textoPasajeros = (n: number) => `${n} ${n === 1 ? "pasajero" : "pasajeros"}`;

interface Props {
  inicial?: { origen?: string; destino?: string; fecha?: string; pasajeros?: number };
  compacto?: boolean;
}

export function Buscador({ inicial, compacto }: Props) {
  const navegar = useNavigate();
  const nombreDe = (id?: string) => ESTACIONES.find((e) => e.id === id)?.nombre ?? "";
  const [origen, setOrigen] = useState(nombreDe(inicial?.origen));
  const [destino, setDestino] = useState(nombreDe(inicial?.destino));
  const [fecha, setFecha] = useState(inicial?.fecha ?? hoy());
  const [pasajeros, setPasajeros] = useState(inicial?.pasajeros ?? 1);
  const [giro, setGiro] = useState(0);
  const [error, setError] = useState("");

  function buscar(e: FormEvent) {
    e.preventDefault();
    const o = porNombre(origen);
    const d = porNombre(destino);
    if (!o || !d) return setError("Elige el origen y el destino de la lista de estaciones.");
    if (o.id === d.id) return setError("El origen y el destino tienen que ser estaciones distintas.");
    setError("");
    navegar(`/trenes?${new URLSearchParams({ origen: o.id, destino: d.id, fecha, pasajeros: String(pasajeros) })}`);
  }

  function intercambiar() {
    setOrigen(destino);
    setDestino(origen);
    setGiro((g) => g + 180);
  }

  return (
    <form className={`buscador${compacto ? " buscador--compacto" : ""}`} onSubmit={buscar} noValidate>
      <div className="trayecto">
        <div className="trayecto__via" aria-hidden="true" />
        <Desplegable etiqueta="Desde" texto={origen} onTexto={setOrigen} placeholder="Estación de origen" />
        <button type="button" className="intercambiar" onClick={intercambiar} aria-label="Intercambiar origen y destino">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={{ transform: `rotate(${giro}deg)` }}>
            <path d="M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <Desplegable etiqueta="Hasta" texto={destino} onTexto={setDestino} placeholder="Estación de destino" />
      </div>

      <div className="buscador__pie">
        <label className="campo">
          <span>Fecha de ida</span>
          <input type="date" value={fecha} min={hoy()} onChange={(e) => setFecha(e.target.value)} required />
        </label>
        <SelectorNumero etiqueta="Pasajeros" valor={pasajeros} min={1} max={9} onCambio={setPasajeros} texto={textoPasajeros} />
        <button type="submit" className="boton">Buscar trenes</button>
      </div>
      {error && (
        <p className="buscador__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
