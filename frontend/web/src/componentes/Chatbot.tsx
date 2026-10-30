import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { aTren, nombreDeTren } from "@renfe/shared/api/adaptador-trenes";
import { enviarMensajeChatbotFlujo, type PasoChatbot } from "@renfe/shared/api/cliente";
import type { TrenApi } from "@renfe/shared/api/tipos";
import { euros, hora } from "../paginas/reserva/formato";
import { bloques, enfasis } from "./chatbot/markdown";

interface Mensaje {
  id: number;
  autor: "usuario" | "asistente";
  texto: string;
  trenes?: TrenApi[];
}

const SALUDO: Mensaje = {
  id: 0,
  autor: "asistente",
  texto: "¡Hola! Puedo ayudarte a encontrar trenes, estaciones y horarios.",
};

// Lo que se lee mientras la IA trabaja: el nombre interno de la herramienta no le dice nada.
const HERRAMIENTAS: Record<string, string> = {
  buscar_estaciones: "Buscando estaciones (API)",
  buscar_trenes: "Mirando trenes (API)",
  detalle_tren: "Consultando paradas (API)",
  consultar_posiciones: "Consultando posiciones (API)",
  posicion_tren: "Localizando el tren (API)",
};

function etiquetaPaso(paso: PasoChatbot): string {
  if (paso.paso === "consultando") return HERRAMIENTAS[paso.herramienta] ?? "Consultando la API";
  return paso.paso === "analizando" ? "Analizando tu pregunta" : "Razonando con los datos";
}

const duracion = (min = 0) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;

// `soloParrafos`: con tarjetas de trenes debajo, las listas del modelo sobran (repiten lo mismo).
function Texto({ texto, soloParrafos = false }: { texto: string; soloParrafos?: boolean }) {
  return (
    <>
      {bloques(texto).map((bloque, i) =>
        bloque.tipo === "lista" ? (
          soloParrafos ? null : (
            <ul key={i}>
              {bloque.lineas.map((linea, j) => (
                <li key={j}>
                  <Negritas texto={linea} />
                </li>
              ))}
            </ul>
          )
        ) : (
          <p key={i}>
            <Negritas texto={bloque.lineas.join(" ")} />
          </p>
        ),
      )}
    </>
  );
}

function Negritas({ texto }: { texto: string }) {
  return (
    <>
      {enfasis(texto).map((trozo, i) =>
        trozo.negrita ? <strong key={i}>{trozo.texto}</strong> : <span key={i}>{trozo.texto}</span>,
      )}
    </>
  );
}

export function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState<Mensaje[]>([SALUDO]);
  const [pasos, setPasos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>();
  // Id del mensaje con la lista de trenes desplegada; por defecto solo se ve el primero.
  const [expandido, setExpandido] = useState<number>();
  const siguienteId = useRef(1);
  const entrada = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (abierto) entrada.current?.focus();
  }, [abierto]);

  useEffect(() => {
    if (lista.current) lista.current.scrollTop = lista.current.scrollHeight;
  }, [mensajes, pasos, cargando]);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const texto = mensaje.trim();
    if (!texto || cargando) return;

    setMensaje("");
    setError(null);
    setPasos([]);
    setMensajes((actuales) => [...actuales, { id: siguienteId.current++, autor: "usuario", texto }]);
    setCargando(true);
    try {
      const respuesta = await enviarMensajeChatbotFlujo(texto, conversationId, (paso) => {
        const etiqueta = etiquetaPaso(paso);
        // Varias consultas seguidas repiten «razonando»: no se pinta dos veces lo mismo.
        setPasos((actuales) => (actuales.at(-1) === etiqueta ? actuales : [...actuales, etiqueta]));
      });
      setConversationId(respuesta.conversationId);
      setMensajes((actuales) => [
        ...actuales,
        {
          id: siguienteId.current++,
          autor: "asistente",
          texto: respuesta.respuesta,
          trenes: respuesta.trenes,
        },
      ]);
    } catch (razon) {
      setError(razon instanceof Error ? razon.message : "No se ha podido contactar con el asistente.");
    } finally {
      setCargando(false);
      setPasos([]);
    }
  }

  function nuevaConversacion() {
    setMensajes([SALUDO]);
    setConversationId(undefined);
    setExpandido(undefined);
    setPasos([]);
    setError(null);
    setMensaje("");
    entrada.current?.focus();
  }

  return (
    <aside className={`chatbot${abierto ? " chatbot--abierto" : ""}`}>
      {abierto ? (
        <section className="chatbot__panel" aria-label="Chat de ayuda">
          <header className="chatbot__cabecera">
            <div>
              <p className="chatbot__eyebrow">Asistente Renfe</p>
              <h2>¿En qué puedo ayudarte?</h2>
            </div>
            <div className="chatbot__acciones">
              <button
                type="button"
                className="chatbot__nueva"
                onClick={nuevaConversacion}
                title="Empezar una conversación nueva"
              >
                Nueva
              </button>
              <button type="button" className="chatbot__cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar chat">
                ×
              </button>
            </div>
          </header>
          <div className="chatbot__mensajes" ref={lista} aria-live="polite">
            {mensajes.map((item) => (
              <div key={item.id} className={`chatbot__mensaje chatbot__mensaje--${item.autor}`}>
                <Texto texto={item.texto} soloParrafos={!!item.trenes?.length} />
                {item.trenes && item.trenes.length > 0 && (
                  <div className="chatbot__trenes">
                    <ul>
                      {(expandido === item.id ? item.trenes : item.trenes.slice(0, 1)).map((t) => {
                        const tren = aTren(t);
                        return (
                          <li key={t.id}>
                            {/* Al reservar se cierra el chat para no tapar la página. */}
                            <Link
                              className="chatbot__tren"
                              to={`/reserva/${encodeURIComponent(t.id)}`}
                              onClick={() => setAbierto(false)}
                            >
                              <span className="chatbot__tren-nombre">{nombreDeTren(tren)}</span>
                              <span className="chatbot__tren-horas">
                                {hora(tren.salida)} → {hora(tren.llegada)} · {duracion(tren.duracionMin)}
                              </span>
                              <span className="chatbot__tren-precio">{euros.format(tren.precioDesde)}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    {item.trenes.length > 1 && (
                      <button
                        type="button"
                        className="chatbot__mas"
                        aria-expanded={expandido === item.id}
                        onClick={() => setExpandido((actual) => (actual === item.id ? undefined : item.id))}
                      >
                        {expandido === item.id ? "Mostrar menos" : `Mostrar más (${item.trenes.length - 1})`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {cargando && (
              <div className="chatbot__pasos">
                {(pasos.length > 0 ? pasos : ["Analizando tu pregunta"]).map((paso, i, todos) => (
                  <p key={i} className={`chatbot__paso${i === todos.length - 1 ? " chatbot__paso--activo" : ""}`}>
                    <span className="chatbot__punto" aria-hidden="true" />
                    {paso}
                  </p>
                ))}
              </div>
            )}
            {error && <p className="chatbot__error" role="alert">{error}</p>}
          </div>
          <form className="chatbot__formulario" onSubmit={enviar}>
            <label className="solo-lectura" htmlFor="chatbot-mensaje">Escribe tu pregunta</label>
            <input
              ref={entrada}
              id="chatbot-mensaje"
              value={mensaje}
              onChange={(evento) => setMensaje(evento.target.value)}
              placeholder="Pregunta por trenes o estaciones"
              maxLength={2000}
              disabled={cargando}
            />
            <button type="submit" className="chatbot__enviar" disabled={!mensaje.trim() || cargando} aria-label="Enviar mensaje">
              <span aria-hidden="true">↑</span>
            </button>
          </form>
        </section>
      ) : (
        <button type="button" className="chatbot__boton" onClick={() => setAbierto(true)} aria-label="Abrir asistente Renfe">
          <span className="chatbot__icono" aria-hidden="true">✦</span>
          <span>¿Necesitas ayuda?</span>
        </button>
      )}
    </aside>
  );
}
