import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { misBilletes } from "@renfe/shared/api/cliente";
import type { Billete } from "@renfe/shared/api/tipos";
import { agrupar, type Viaje } from "./billetes/agrupar";
import { fecha, hora } from "./reserva/formato";
import "./billetes.css";
import { ciudadDe } from "@renfe/shared/api/tipos";

export default function MisBilletes() {
  const [billetes, setBilletes] = useState<Billete[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    misBilletes().then(setBilletes, (e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="contenedor seccion" role="alert">{error}</p>;
  if (!billetes) return <p className="contenedor seccion cargando">Cargando tus billetes…</p>;

  const ahora = new Date().toISOString().slice(0, 19);
  const viajes = agrupar(billetes);
  const proximos = viajes.filter((v) => v.billetes[0].tren.llegada >= ahora);
  const pasados = viajes.filter((v) => v.billetes[0].tren.llegada < ahora).reverse();

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
          <Lista titulo="Próximos viajes" viajes={proximos} vacio="No tienes viajes pendientes." />
          {pasados.length > 0 && <Lista titulo="Viajes pasados" viajes={pasados} pasado />}
        </>
      )}
    </div>
  );
}

function Lista({ titulo, viajes, vacio, pasado }: { titulo: string; viajes: Viaje[]; vacio?: string; pasado?: boolean }) {
  const id = `t-${titulo.replace(/\s+/g, "-")}`;
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{titulo}</h2>
      {viajes.length === 0 ? (
        <p>{vacio}</p>
      ) : (
        <ul className="billetes__lista">
          {viajes.map((v) => (
            <li key={v.reservaId}>
              <TarjetaViaje viaje={v} pasado={pasado} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TarjetaViaje({ viaje, pasado }: { viaje: Viaje; pasado?: boolean }) {
  const { tren, localizador } = viaje.billetes[0];
  const n = viaje.billetes.length;
  const idT = `viaje-${viaje.reservaId}`;
  return (
    <article className={`viaje cristal${pasado ? " viaje--pasado" : ""}`} aria-labelledby={idT}>
      <header className="viaje__cabeza">
        <h3 id={idT} className="viaje__ruta">
          {ciudadDe(tren.origen)} <span aria-hidden="true">→</span>
          <span className="sr-solo"> a </span> {ciudadDe(tren.destino)}
        </h3>
        <span className="viaje__loc">
          <span className="sr-solo">Localizador </span>
          {localizador}
        </span>
      </header>
      <p className="viaje__dato">
        {fecha(tren.salida)}, {hora(tren.salida)} · {tren.tipo} {tren.numero} · {n} {n === 1 ? "viajero" : "viajeros"}
      </p>
      <ul className="viaje__viajeros">
        {viaje.billetes.map((b: Billete) => (
          <li key={b.id}>
            <Link to={`/billetes/${encodeURIComponent(b.id)}`} className="viaje__viajero">
              <span>
                {b.pasajero.nombre} {b.pasajero.apellidos}
              </span>
              <span className="viaje__asiento">
                Coche {b.asiento.coche}, asiento {b.asiento.fila}
                {b.asiento.letra}
              </span>
              <span className="sr-solo">. Abrir billete</span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
