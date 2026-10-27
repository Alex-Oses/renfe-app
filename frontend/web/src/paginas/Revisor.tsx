import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { validarBillete } from "../api/cliente";
import type { EstadoValidacion, ResultadoValidacion } from "../api/tipos";
import { useSesion } from "../estado/sesion";
import { leerDeArchivo } from "./revisor/decodificar";
import { Escaner } from "./revisor/Escaner";
import "./revisor/revisor.css";

// Cómo se enseña cada resultado: color, título y qué tiene que hacer el revisor.
const ESTADOS: Record<EstadoValidacion, { tono: "ok" | "aviso" | "mal"; titulo: string; accion: string }> = {
  valido: { tono: "ok", titulo: "Billete válido", accion: "Puede viajar." },
  ya_validado: { tono: "aviso", titulo: "Ya validado", accion: "Este billete ya se ha validado antes. Comprueba la identidad del viajero." },
  otro_dia: { tono: "aviso", titulo: "No es para hoy", accion: "El billete es auténtico, pero de otro día." },
  caducado: { tono: "mal", titulo: "Billete caducado", accion: "Ese viaje ya terminó." },
  anulado: { tono: "mal", titulo: "Billete anulado", accion: "La reserva está cancelada." },
  falso: { tono: "mal", titulo: "Billete falso", accion: "El código no es de un billete de Renfe o ha sido modificado." },
  no_existe: { tono: "mal", titulo: "Billete no encontrado", accion: "El código es auténtico pero no consta en el sistema." },
};

const hora = (iso: string) => new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
const dia = (iso: string) => new Date(iso).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });

export default function Revisor() {
  const { sesion } = useSesion();
  const rol = sesion?.usuario.rol;
  const [modo, setModo] = useState<"camara" | "resultado">("camara");
  const [resultado, setResultado] = useState<ResultadoValidacion | null>(null);
  const [comprobando, setComprobando] = useState(false);
  const [error, setError] = useState("");
  const [codigo, setCodigo] = useState("");
  const [historial, setHistorial] = useState<ResultadoValidacion[]>([]);
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = "Revisor | Renfe";
  }, []);

  async function comprobar(texto: string) {
    setComprobando(true);
    setError("");
    try {
      const r = await validarBillete(texto);
      setResultado(r);
      setHistorial((h) => [r, ...h].slice(0, 20));
      setModo("resultado");
      requestAnimationFrame(() => titulo.current?.focus());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setComprobando(false);
    }
  }

  async function desdeFoto(archivo?: File) {
    if (!archivo) return;
    const texto = await leerDeArchivo(archivo).catch(() => null);
    if (texto) void comprobar(texto);
    else setError("No se ha encontrado ningún QR en la foto. Prueba con otra más nítida.");
  }

  function desdeTexto(e: FormEvent) {
    e.preventDefault();
    if (codigo.trim()) void comprobar(codigo.trim());
  }

  if (rol !== "revisor" && rol !== "admin")
    return (
      <div className="contenedor seccion revisor">
        <h1>Modo revisor</h1>
        <p>Esta zona es solo para el personal de a bordo. Entra con una cuenta de revisor.</p>
        <p className="revisor__demo cristal">
          Para la demostración: <strong>revisor@renfe-app.demo</strong> · contraseña <strong>revisor123</strong>
        </p>
        <Link className="boton" to="/acceder">
          Entrar
        </Link>
      </div>
    );

  const info = resultado && ESTADOS[resultado.estado];
  const b = resultado?.billete;

  return (
    <div className="contenedor seccion revisor">
      <div className="revisor__cabeza">
        <h1>Modo revisor</h1>
        <p>{sesion?.usuario.nombre}</p>
      </div>

      {modo === "camara" && (
        <section className="revisor__lector cristal" aria-label="Lector de billetes">
          <Escaner alLeer={(t) => void comprobar(t)} />
          {comprobando && <p className="cargando">Comprobando…</p>}
          {error && (
            <p className="revisor__error" role="alert">
              {error}
            </p>
          )}
          <div className="revisor__alternativas">
            <label className="boton boton--secundario">
              Subir foto del QR
              <input type="file" accept="image/*" capture="environment" className="sr-solo" onChange={(e) => void desdeFoto(e.target.files?.[0])} />
            </label>
            <form onSubmit={desdeTexto} className="revisor__pegar">
              <label htmlFor="codigo-qr" className="sr-solo">
                Código del QR
              </label>
              <input id="codigo-qr" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="O pega aquí el código (RNF1…)" />
              <button className="boton" type="submit" disabled={!codigo.trim()}>
                Comprobar
              </button>
            </form>
          </div>
        </section>
      )}

      {modo === "resultado" && resultado && info && (
        <section className={`veredicto veredicto--${info.tono}`} aria-labelledby="veredicto-titulo">
          <div className="veredicto__banda">
            <span className="veredicto__icono" aria-hidden="true">
              {info.tono === "ok" ? "✓" : info.tono === "aviso" ? "!" : "✕"}
            </span>
            <div>
              <h2 id="veredicto-titulo" ref={titulo} tabIndex={-1}>
                {info.titulo}
              </h2>
              <p>{info.accion}</p>
              {resultado.primeraValidacion && <p>Primera validación: {dia(resultado.primeraValidacion)} a las {hora(resultado.primeraValidacion)}.</p>}
            </div>
          </div>

          {b && (
            <dl className="veredicto__datos">
              <div className="veredicto__ancho">
                <dt>Viajero</dt>
                <dd>
                  {b.pasajero} <span className="veredicto__doc">{b.documento}</span>
                </dd>
              </div>
              <div className="veredicto__ancho">
                <dt>Trayecto</dt>
                <dd>
                  {b.origen} → {b.destino}
                </dd>
              </div>
              <div>
                <dt>Tren</dt>
                <dd>
                  {b.tipo} {b.numero}
                </dd>
              </div>
              <div>
                <dt>Fecha</dt>
                <dd>{dia(b.salida)}</dd>
              </div>
              <div>
                <dt>Salida</dt>
                <dd>{hora(b.salida)}</dd>
              </div>
              <div>
                <dt>Llegada</dt>
                <dd>{hora(b.llegada)}</dd>
              </div>
              <div>
                <dt>Coche</dt>
                <dd>{b.coche}</dd>
              </div>
              <div>
                <dt>Asiento</dt>
                <dd>{b.asiento}</dd>
              </div>
              <div>
                <dt>Clase</dt>
                <dd>{b.clase}</dd>
              </div>
              <div>
                <dt>Localizador</dt>
                <dd className="veredicto__loc">{b.localizador}</dd>
              </div>
            </dl>
          )}

          {!resultado.comprobadoEnServidor && (
            <p className="veredicto__nota">
              Comprobado sin conexión: firma y fechas. Que el billete exista y no esté anulado se comprobará en el servidor cuando la API esté
              conectada.
            </p>
          )}

          <button className="boton veredicto__siguiente" onClick={() => setModo("camara")}>
            Escanear otro billete
          </button>
        </section>
      )}

      {historial.length > 0 && (
        <section className="revisor__historial" aria-labelledby="historial-titulo">
          <h2 id="historial-titulo">Últimas lecturas</h2>
          <ol>
            {historial.map((h) => (
              <li key={h.validadoEn} className={`lectura lectura--${ESTADOS[h.estado].tono}`}>
                <span>{hora(h.validadoEn)}</span>
                <strong>{ESTADOS[h.estado].titulo}</strong>
                <span>{h.billete ? `${h.billete.pasajero} · coche ${h.billete.coche}, ${h.billete.asiento}` : "—"}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
