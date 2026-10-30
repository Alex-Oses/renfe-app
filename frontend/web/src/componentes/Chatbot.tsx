import { FormEvent, useEffect, useRef, useState } from "react";
import { enviarMensajeChatbot } from "@renfe/shared/api/cliente";

interface Mensaje {
  id: number;
  autor: "usuario" | "asistente";
  texto: string;
}

const SALUDO: Mensaje = {
  id: 0,
  autor: "asistente",
  texto: "¡Hola! Puedo ayudarte a encontrar trenes, estaciones y horarios.",
};

export function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState<Mensaje[]>([SALUDO]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>();
  const siguienteId = useRef(1);
  const entrada = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (abierto) entrada.current?.focus();
  }, [abierto]);

  useEffect(() => {
    if (lista.current) lista.current.scrollTop = lista.current.scrollHeight;
  }, [mensajes, cargando]);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const texto = mensaje.trim();
    if (!texto || cargando) return;

    setMensaje("");
    setError(null);
    setMensajes((actuales) => [...actuales, { id: siguienteId.current++, autor: "usuario", texto }]);
    setCargando(true);
    try {
      const respuesta = await enviarMensajeChatbot(texto, conversationId);
      setConversationId(respuesta.conversationId);
      setMensajes((actuales) => [
        ...actuales,
        { id: siguienteId.current++, autor: "asistente", texto: respuesta.respuesta },
      ]);
    } catch (razon) {
      setError(razon instanceof Error ? razon.message : "No se ha podido contactar con el asistente.");
    } finally {
      setCargando(false);
    }
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
            <button type="button" className="chatbot__cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar chat">
              ×
            </button>
          </header>
          <div className="chatbot__mensajes" ref={lista} aria-live="polite">
            {mensajes.map((item) => (
              <p key={item.id} className={`chatbot__mensaje chatbot__mensaje--${item.autor}`}>
                {item.texto}
              </p>
            ))}
            {cargando && <p className="chatbot__mensaje chatbot__mensaje--asistente chatbot__escribiendo">Escribiendo…</p>}
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
