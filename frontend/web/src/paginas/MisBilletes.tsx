import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { misBilletes } from "../api/cliente";
import type { Billete } from "../api/tipos";
import { fecha, hora } from "./reserva/formato";
import "./billetes.css";

export default function MisBilletes() {
  const [billetes, setBilletes] = useState<Billete[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    misBilletes().then(setBilletes, (e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="contenedor seccion" role="alert">{error}</p>;
  if (!billetes) return <p className="contenedor seccion cargando">Cargando tus billetes…</p>;

  const ahora = new Date().toISOString().slice(0, 19);
  const orden = [...billetes].sort((a, b) => a.tren.salida.localeCompare(b.tren.salida));
  const proximos = orden.filter((b) => b.tren.llegada >= ahora);
  const pasados = orden.filter((b) => b.tren.llegada < ahora).reverse();

  return (
    <div className="contenedor seccion billetes">
      <h1>Mis billetes</h1>
      {billetes.length === 0 ? (
        <div className="billetes__vacio">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" />
            <path d="M14 6v12" strokeDasharray="2 2" />
          </svg>
          <p>Todavía no tienes billetes. Cuando compres uno aparecerá aquí, listo para enseñar en el andén.</p>
          <Link className="boton" to="/">
            Buscar un tren
          </Link>
        </div>
      ) : (
        <>
          <Lista titulo="Próximos viajes" billetes={proximos} vacio="No tienes viajes pendientes." />
          {pasados.length > 0 && <Lista titulo="Viajes pasados" billetes={pasados} pasado />}
        </>
      )}
    </div>
  );
}

function Lista({ titulo, billetes, vacio, pasado }: { titulo: string; billetes: Billete[]; vacio?: string; pasado?: boolean }) {
  return (
    <section aria-labelledby={`t-${titulo}`}>
      <h2 id={`t-${titulo}`}>{titulo}</h2>
      {billetes.length === 0 ? (
        <p>{vacio}</p>
      ) : (
        <ul className="billetes__lista">
          {billetes.map((b) => (
            <li key={b.id}>
              <Link to={`/billetes/${encodeURIComponent(b.id)}`} className={`billete-fila${pasado ? " billete-fila--pasado" : ""}`}>
                <span className="billete-fila__ruta">
                  {b.tren.origen.ciudad} <span aria-hidden="true">→</span>
                  <span className="sr-solo"> a </span> {b.tren.destino.ciudad}
                </span>
                <span className="billete-fila__dato">
                  {fecha(b.tren.salida)}, {hora(b.tren.salida)}
                </span>
                <span className="billete-fila__dato">
                  {b.pasajero.nombre} · coche {b.asiento.coche}, {b.asiento.fila}
                  {b.asiento.letra}
                </span>
                <span className="billete-fila__loc">{b.localizador}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
