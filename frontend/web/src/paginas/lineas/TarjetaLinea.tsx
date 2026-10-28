import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buscarTrenes, posicionesTrenes } from "@renfe/shared/api/cliente";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import type { LineaFavorita, PosicionTren, Tren } from "@renfe/shared/api/tipos";
import { useAvisos } from "../../estado/avisos";
import { hoyISO } from "../../estado/vigilante";
import { retrasoDe } from "@renfe/shared/estado/vigilante-reglas";

const nombre = (id: string) => ESTACIONES.find((e) => e.id === id)?.nombre ?? id;
const hora = (iso: string) => new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

function cuenta(ms: number) {
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "sale ya";
  if (min < 60) return `sale en ${min} min`;
  return `sale en ${Math.floor(min / 60)} h ${min % 60} min`;
}

export function TarjetaLinea({ linea, primera, ultima }: { linea: LineaFavorita; primera: boolean; ultima: boolean }) {
  const { alternarFavorito, moverFavorito } = useAvisos();
  const [trenes, setTrenes] = useState<Tren[] | null>(null);
  const [pos, setPos] = useState<PosicionTren[]>([]);
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    let vivo = true;
    buscarTrenes({ origen: linea.origen, destino: linea.destino, fecha: hoyISO() }).then(
      (t) => vivo && setTrenes(t),
      () => vivo && setTrenes([]),
    );
    posicionesTrenes().then((p) => vivo && setPos(p), () => {});
    return () => {
      vivo = false;
    };
  }, [linea.origen, linea.destino]);

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 10_000);
    return () => clearInterval(t);
  }, []);

  const titulo = `${nombre(linea.origen)} a ${nombre(linea.destino)}`;
  const proximos = (trenes ?? []).filter((t) => Date.parse(t.salida) > ahora).slice(0, 4);

  return (
    <article className="linea cristal" aria-label={titulo}>
      <header className="linea__cabecera">
        <h2>
          {nombre(linea.origen)} <span aria-hidden="true">→</span>
          <span className="solo-lectores"> a </span> {nombre(linea.destino)}
        </h2>
        <div className="linea__acciones">
          <button type="button" className="linea__icono" aria-label={`Subir ${titulo}`} disabled={primera} onClick={() => moverFavorito(linea.id, -1)}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 15l6-6 6 6" /></svg>
          </button>
          <button type="button" className="linea__icono" aria-label={`Bajar ${titulo}`} disabled={ultima} onClick={() => moverFavorito(linea.id, 1)}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          <button type="button" className="linea__icono" aria-label={`Quitar ${titulo}`} onClick={() => alternarFavorito(linea.origen, linea.destino)}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" /></svg>
          </button>
        </div>
      </header>

      {trenes === null ? (
        <p className="cargando">Cargando horarios…</p>
      ) : proximos.length === 0 ? (
        <p className="linea__nada">
          No quedan trenes hoy en esta línea. <Link to={`/trenes?origen=${linea.origen}&destino=${linea.destino}`}>Buscar otro día</Link>
        </p>
      ) : (
        <ul className="linea__trenes">
          {proximos.map((t) => {
            const retraso = retrasoDe(t, pos);
            return (
              <li key={t.id} className="linea__tren">
                <span className="linea__cuenta">{cuenta(Date.parse(t.salida) - ahora)}</span>
                <span className="linea__hora">{hora(t.salida)}</span>
                <span className="linea__tipo">{t.tipo}</span>
                {retraso > 0 && <span className="linea__retraso">+{retraso} min de retraso</span>}
                <Link className="linea__reservar" to={`/reserva/${encodeURIComponent(t.id)}`} aria-label={`Reservar ${t.tipo} de las ${hora(t.salida)}`}>
                  Reservar
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
