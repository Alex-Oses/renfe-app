// Pop-ups de avisos: apilados, se cierran solos a los 6 s (pausa con ratón o foco), no roban el foco.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAvisos, type AvisoLocal } from "../estado/avisos";
import { IconoAviso, IconoCerrar } from "./AvisosIconos";
import "./Avisos.css";

const DURACION = 6000;
const SALIDA = 200;

const ACCION: Record<AvisoLocal["tipo"], string> = {
  retraso: "Ver en el mapa",
  llegada: "Ver en el mapa",
  cambio: "Ver detalles",
  info: "Ver",
};

function Emergente({ aviso, onCerrar }: { aviso: AvisoLocal; onCerrar: () => void }) {
  const [pausa, setPausa] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const restante = useRef(DURACION);
  const cerrar = useRef(onCerrar);
  cerrar.current = onCerrar;

  useEffect(() => {
    if (pausa || saliendo) return;
    const inicio = Date.now();
    const t = setTimeout(() => setSaliendo(true), restante.current);
    return () => {
      clearTimeout(t);
      restante.current -= Date.now() - inicio;
    };
  }, [pausa, saliendo]);

  useEffect(() => {
    if (!saliendo) return;
    const t = setTimeout(() => cerrar.current(), SALIDA);
    return () => clearTimeout(t);
  }, [saliendo]);

  return (
    <div
      className={`emergente cristal emergente--${aviso.tipo}${saliendo ? " emergente--saliendo" : ""}`}
      role={aviso.grave ? "alert" : "status"}
      aria-live={aviso.grave ? "assertive" : "polite"}
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
      onFocus={() => setPausa(true)}
      onBlur={() => setPausa(false)}
    >
      <IconoAviso tipo={aviso.tipo} />
      <div className="emergente__cuerpo">
        <p className="emergente__titulo">{aviso.titulo}</p>
        <p className="emergente__texto">{aviso.texto}</p>
        {aviso.enlace && (
          <Link className="emergente__accion" to={aviso.enlace} onClick={() => setSaliendo(true)}>
            {ACCION[aviso.tipo]}
          </Link>
        )}
      </div>
      <button type="button" className="emergente__cerrar" aria-label="Cerrar aviso" onClick={() => setSaliendo(true)}>
        <IconoCerrar />
      </button>
    </div>
  );
}

export function AvisosEmergentes() {
  const { avisos, emergentes, cerrarEmergente } = useAvisos();
  const visibles = emergentes.map((id) => avisos.find((a) => a.id === id)).filter((a): a is AvisoLocal => !!a);
  return (
    <section className="emergentes" aria-label="Avisos recientes">
      {visibles.map((a) => (
        <Emergente key={a.id} aviso={a} onCerrar={() => cerrarEmergente(a.id)} />
      ))}
    </section>
  );
}
