import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { misBilletes, obtenerBillete } from "../api/cliente";
import type { Billete as TBillete } from "../api/tipos";
import { fecha, hora } from "./reserva/formato";
import Cartera from "./billetes/Cartera";
import "./billetes.css";
import { ciudadDe } from "../api/tipos";

const aSvg = (texto: string) => QRCode.toString(texto, { type: "svg", margin: 1, errorCorrectionLevel: "M" });

export default function Billete() {
  const { id = "" } = useParams();
  const [b, setB] = useState<TBillete | null>(null);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [grupo, setGrupo] = useState<TBillete[]>([]);
  const [qrsGrupo, setQrsGrupo] = useState<string[] | null>(null);

  useEffect(() => {
    obtenerBillete(id)
      .then((x) => {
        setB(x);
        setQrsGrupo(null);
        // Los demás billetes de la misma reserva, para moverse entre viajeros.
        misBilletes().then(
          (todos) =>
            setGrupo(
              todos.filter((t) => t.reservaId === x.reservaId).sort((p, q) => p.id.localeCompare(q.id, "es", { numeric: true })),
            ),
          () => setGrupo([]),
        );
        return aSvg(x.qr);
      })
      .then(setQr)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  const verTodos = () => {
    if (qrsGrupo) return setQrsGrupo(null);
    Promise.all(grupo.map((g) => aSvg(g.qr))).then(setQrsGrupo, () => setQrsGrupo(null));
  };

  if (error)
    return (
      <div className="contenedor seccion" role="alert">
        <p>{error}</p>
        <Link to="/billetes">Volver a mis billetes</Link>
      </div>
    );
  if (!b) return <p className="contenedor seccion cargando">Cargando el billete…</p>;

  return (
    <div className="contenedor seccion billete-pagina">
      <Link className="enlace-atras no-imprimir" to="/billetes">
        Mis billetes
      </Link>
      <h1 className="sr-solo">Billete {b.localizador}</h1>
      {grupo.length > 1 && <NavGrupo grupo={grupo} actual={b.id} todos={qrsGrupo !== null} onTodos={verTodos} />}
      {qrsGrupo && (
        <ul className="qr-grupo" aria-label="Todos los QR de la reserva">
          {grupo.map((g, i) => (
            <li key={g.id} className="qr-grupo__item cristal">
              <div className="pase__qr" role="img" aria-label={`QR de ${g.pasajero.nombre}`} dangerouslySetInnerHTML={{ __html: qrsGrupo[i] }} />
              <p>
                <strong>
                  {g.pasajero.nombre} {g.pasajero.apellidos}
                </strong>
                <br />
                Coche {g.asiento.coche}, asiento {g.asiento.fila}
                {g.asiento.letra}
              </p>
            </li>
          ))}
        </ul>
      )}
      <article className="pase" aria-label={`Billete de ${b.tren.origen.nombre} a ${b.tren.destino.nombre}`}>
        <header className="pase__cabeza">
          <span className="pase__marca">Renfe</span>
          <span className="pase__tren">
            {b.tren.tipo} {b.tren.numero}
          </span>
          <EstadoViaje salida={b.tren.salida} llegada={b.tren.llegada} />
        </header>
        <div className="pase__ruta">
          <div>
            <span className="pase__ciudad">{ciudadDe(b.tren.origen)}</span>
            <span className="pase__hora">{hora(b.tren.salida)}</span>
            <span className="pase__est">{b.tren.origen.nombre}</span>
          </div>
          <div className="pase__trayecto">
            <svg className="pase__via" width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M2 12h34M28 5l8 7-8 7" />
            </svg>
            <span className="pase__duracion">{duracion(b.tren.salida, b.tren.llegada)}</span>
          </div>
          <div className="pase__destino">
            <span className="pase__ciudad">{ciudadDe(b.tren.destino)}</span>
            <span className="pase__hora">{hora(b.tren.llegada)}</span>
            <span className="pase__est">{b.tren.destino.nombre}</span>
          </div>
        </div>
        <dl className="pase__datos">
          <div>
            <dt>Fecha</dt>
            <dd>{fecha(b.tren.salida)}</dd>
          </div>
          <div>
            <dt>Coche</dt>
            <dd>{b.asiento.coche}</dd>
          </div>
          <div>
            <dt>Asiento</dt>
            <dd>
              {b.asiento.fila}
              {b.asiento.letra}
            </dd>
          </div>
          <div>
            <dt>Clase</dt>
            <dd>{b.asiento.clase}</dd>
          </div>
          <div className="pase__ancho">
            <dt>Viajero</dt>
            <dd>
              {b.pasajero.nombre} {b.pasajero.apellidos}
            </dd>
          </div>
        </dl>
        <div className="pase__corte" aria-hidden="true" />
        <div className="pase__pie">
          <div className="pase__qr pase__qr--grande" role="img" aria-label="Código QR del billete" dangerouslySetInnerHTML={{ __html: qr }} />
          <p className="pase__etiqueta">Localizador</p>
          <p className="pase__loc">{b.localizador}</p>
          <p className="pase__nota">Enseña este código al revisor o en el control de acceso. Sube el brillo de la pantalla.</p>
        </div>
      </article>
      <div className="reserva__acciones no-imprimir">
        <button type="button" className="boton" onClick={() => window.print()}>
          Imprimir billete
        </button>
      </div>
      <Cartera billete={b} />
    </div>
  );
}

// "2 h 25 min" entre salida y llegada.
function duracion(salida: string, llegada: string) {
  const min = Math.max(0, Math.round((Date.parse(llegada) - Date.parse(salida)) / 60_000));
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;
}

// Etiqueta en la cabecera del billete según cuándo es el viaje.
function EstadoViaje({ salida, llegada }: { salida: string; llegada: string }) {
  const ahora = Date.now();
  const s = Date.parse(salida);
  const texto =
    ahora > Date.parse(llegada) ? "Viaje realizado" : ahora >= s ? "En viaje" : new Date(s).toDateString() === new Date().toDateString() ? "Sale hoy" : "Próximo viaje";
  return <span className="pase__estado">{texto}</span>;
}

function Flecha({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function NavGrupo({ grupo, actual, todos, onTodos }: { grupo: TBillete[]; actual: string; todos: boolean; onTodos: () => void }) {
  const i = grupo.findIndex((g) => g.id === actual);
  const ir = (k: number) => `/billetes/${encodeURIComponent(grupo[k].id)}`;
  return (
    <nav className="nav-grupo cristal no-imprimir" aria-label="Viajeros de esta reserva">
      {i > 0 ? (
        <Link className="nav-grupo__paso" to={ir(i - 1)} aria-label="Viajero anterior">
          <Flecha d="M15 5l-7 7 7 7" />
        </Link>
      ) : (
        <span className="nav-grupo__paso" aria-hidden="true" />
      )}
      <span className="nav-grupo__cuenta" aria-live="polite">
        Viajero {i + 1} de {grupo.length}
      </span>
      {i < grupo.length - 1 ? (
        <Link className="nav-grupo__paso" to={ir(i + 1)} aria-label="Viajero siguiente">
          <Flecha d="M9 5l7 7-7 7" />
        </Link>
      ) : (
        <span className="nav-grupo__paso" aria-hidden="true" />
      )}
      <button type="button" className="nav-grupo__todos" aria-pressed={todos} onClick={onTodos}>
        {todos ? "Ocultar los QR del grupo" : "Ver todos los QR del grupo"}
      </button>
    </nav>
  );
}
