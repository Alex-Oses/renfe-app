import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { buscarTrenes } from "@renfe/shared/api/cliente";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import type { Tren } from "@renfe/shared/api/tipos";
import { euros } from "./logica";
import { Campo, Herramienta, Selector } from "./comun";

export const hoy = () => new Date().toISOString().slice(0, 10);
export const hora = (iso: string) => iso.slice(11, 16);

export function OpcionesEstaciones() {
  return (
    <>
      <option value="">Elige estación</option>
      {ESTACIONES.map((e) => (
        <option key={e.id} value={e.id}>{e.nombre}</option>
      ))}
    </>
  );
}

export default function BuscadorHorarios() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState(hoy());
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [trenes, setTrenes] = useState<Tren[] | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!origen || !destino) return setError("Elige origen y destino.");
    if (origen === destino) return setError("El origen y el destino no pueden ser la misma estación.");
    setError("");
    setCargando(true);
    try {
      setTrenes(await buscarTrenes({ origen, destino, fecha }));
    } catch {
      setError("No hemos podido cargar los horarios. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Herramienta titulo="Consulta horarios">
      <form className="herr__form" onSubmit={enviar} noValidate>
        <Selector etiqueta="Origen" value={origen} onChange={(e) => setOrigen(e.target.value)}><OpcionesEstaciones /></Selector>
        <Selector etiqueta="Destino" value={destino} onChange={(e) => setDestino(e.target.value)}><OpcionesEstaciones /></Selector>
        <Campo etiqueta="Fecha" type="date" value={fecha} min={hoy()} onChange={(e) => setFecha(e.target.value)} />
        <button className="boton" disabled={cargando}>{cargando ? "Buscando…" : "Ver horarios"}</button>
        {error && <p className="herr__error" role="alert">{error}</p>}
      </form>
      {trenes && (
        <div className="herr__desliza" aria-live="polite">
          {trenes.length === 0 ? (
            <p>No hay trenes para ese trayecto.</p>
          ) : (
            <table className="herr__tabla">
              <caption className="sr-only">Trenes del {fecha}</caption>
              <thead><tr><th>Salida</th><th>Llegada</th><th>Tren</th><th>Desde</th><th><span className="sr-only">Comprar</span></th></tr></thead>
              <tbody>
                {trenes.map((t) => (
                  <tr key={t.id}>
                    <td>{hora(t.salida)}</td>
                    <td>{hora(t.llegada)}</td>
                    <td>{t.tipo} {t.numero}</td>
                    <td>{t.plazasLibres ? euros(t.precioDesde) : "Completo"}</td>
                    <td>{t.plazasLibres > 0 && <Link to={`/reserva/${t.id}`}>Comprar</Link>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Herramienta>
  );
}
