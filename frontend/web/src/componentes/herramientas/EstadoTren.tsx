import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { posicionesTrenes } from "@renfe/shared/api/cliente";
import type { PosicionTren } from "@renfe/shared/api/tipos";
import { Campo, Herramienta } from "./comun";

const sinTildes = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export default function EstadoTren() {
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [res, setRes] = useState<PosicionTren[] | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const t = sinTildes(q.trim());
    if (!t) return setError("Escribe un número de tren o una estación.");
    setError("");
    setCargando(true);
    try {
      const todos = await posicionesTrenes();
      setRes(todos.filter((p) => p.numero === t || sinTildes(`${p.origen} ${p.destino}`).includes(t)));
    } catch {
      setError("No hemos podido consultar el estado. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <Herramienta titulo="Estado de tu tren">
      <form className="herr__form" onSubmit={enviar} noValidate>
        <Campo etiqueta="Nº de tren, origen o destino" value={q} onChange={(e) => setQ(e.target.value)} error={error} ayuda="Ej.: 3142 o Sevilla" />
        <button className="boton" disabled={cargando}>{cargando ? "Consultando…" : "Consultar"}</button>
      </form>
      {res && (
        <div aria-live="polite">
          {res.length === 0 ? (
            <p>No hay ningún tren circulando que coincida.</p>
          ) : (
            <ul className="herr__lista">
              {res.slice(0, 8).map((p) => (
                <li key={p.trenId}>
                  <strong>{p.tipo} {p.numero}</strong> {p.origen} → {p.destino}.{" "}
                  {p.retrasoSeg === null
                    ? "Sin datos de retraso"
                    : p.retrasoSeg > 0
                      ? `Retraso de ${Math.round(p.retrasoSeg / 60)} min`
                      : "En hora"}
                  . Próxima parada: {p.proximaParada}.{" "}
                  <Link to={`/mapa?tren=${encodeURIComponent(p.trenId)}`}>Ver en el mapa</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Herramienta>
  );
}
