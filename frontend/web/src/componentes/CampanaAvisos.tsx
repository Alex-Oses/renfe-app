// Campana de la cabecera: contador de no leídos y panel con el historial de avisos.
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAvisos } from "../estado/avisos";
import { IconoAviso } from "./AvisosIconos";
import "./Avisos.css";

const frase = (n: number) => (n === 0 ? "No tienes avisos sin leer" : n === 1 ? "Tienes 1 aviso sin leer" : `Tienes ${n} avisos sin leer`);
const hora = (iso: string) => new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

export function CampanaAvisos() {
  const { avisos, marcarLeido, marcarTodosLeidos, borrarHistorial, permiso, pedirPermiso } = useAvisos();
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const caja = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const sinLeer = avisos.filter((a) => !a.leido).length;

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => !caja.current?.contains(e.target as Node) && setAbierto(false);
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && (setAbierto(false), boton.current?.focus());
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <div className="campana" ref={caja}>
      <button
        ref={boton}
        type="button"
        className="campana__boton"
        aria-expanded={abierto}
        aria-controls={id}
        aria-label={`Avisos. ${frase(sinLeer)}`}
        onClick={() => setAbierto((x) => !x)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 21h4" />
        </svg>
        {sinLeer > 0 && <span className="campana__contador" aria-hidden="true">{sinLeer > 9 ? "9+" : sinLeer}</span>}
      </button>
      <span className="solo-lectores" aria-live="polite">{sinLeer > 0 ? frase(sinLeer) : ""}</span>

      {abierto && (
        <div id={id} className="campana__panel cristal cristal--flotante" role="region" aria-label="Historial de avisos">
          <div className="campana__cabecera">
            <h2>Avisos</h2>
            {sinLeer > 0 && (
              <button type="button" className="campana__enlace" onClick={marcarTodosLeidos}>
                Marcar todo como leído
              </button>
            )}
          </div>
          {permiso === "default" && (
            <button type="button" className="boton boton--secundario campana__permiso" onClick={pedirPermiso}>
              Recibir avisos también fuera de la web
            </button>
          )}
          {permiso === "denied" && <p className="campana__nota">Las notificaciones del navegador están bloqueadas. Puedes activarlas en los ajustes del sitio.</p>}
          {avisos.length === 0 ? (
            <p className="campana__nota">
              Aún no hay avisos. Sigue un tren en el <Link to="/mapa" onClick={() => setAbierto(false)}>mapa</Link> o guarda tus{" "}
              <Link to="/lineas" onClick={() => setAbierto(false)}>líneas</Link> y te avisaremos aquí.
            </p>
          ) : (
            <>
              <ul className="campana__lista">
                {avisos.map((a) => (
                  <li key={a.id} className={a.leido ? "" : "campana__item--nuevo"}>
                    <IconoAviso tipo={a.tipo} />
                    <div>
                      <p className="emergente__titulo">
                        {a.titulo} {!a.leido && <span className="solo-lectores">(sin leer)</span>}
                      </p>
                      <p className="emergente__texto">{a.texto}</p>
                      <p className="campana__hora">{hora(a.creado)}</p>
                      {a.enlace && (
                        <Link to={a.enlace} className="emergente__accion" onClick={() => (marcarLeido(a.id), setAbierto(false))}>
                          Ver
                        </Link>
                      )}
                    </div>
                    {!a.leido && (
                      <button type="button" className="campana__enlace" onClick={() => marcarLeido(a.id)}>
                        Leído
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <button type="button" className="campana__enlace" onClick={borrarHistorial}>
                Borrar historial
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
