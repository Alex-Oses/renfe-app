// Combobox accesible de estaciones (patrón ARIA 1.2 combobox + listbox).
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { buscarEstaciones } from "../api/cliente";
import type { Estacion } from "../api/tipos";

const base = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Resalta la primera coincidencia; base() conserva la longitud con los acentos del español.
function resaltar(texto: string, q: string): ReactNode {
  const i = q.trim() ? base(texto).indexOf(base(q.trim())) : -1;
  if (i < 0) return texto;
  const f = i + q.trim().length;
  return (
    <>
      {texto.slice(0, i)}
      <mark>{texto.slice(i, f)}</mark>
      {texto.slice(f)}
    </>
  );
}

interface Props {
  etiqueta: string;
  texto: string;
  onTexto: (t: string) => void;
  placeholder?: string;
}

export function Desplegable({ etiqueta, texto, onTexto, placeholder }: Props) {
  const id = useId();
  const [abierto, setAbierto] = useState(false);
  const [opciones, setOpciones] = useState<Estacion[]>([]);
  const [activa, setActiva] = useState(-1);
  const lista = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!abierto) return;
    let vigente = true;
    const t = setTimeout(() => {
      buscarEstaciones(texto)
        .then((r) => vigente && (setOpciones(r.slice(0, 8)), setActiva(-1)))
        .catch(() => vigente && setOpciones([]));
    }, 120);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [texto, abierto]);

  useEffect(() => {
    lista.current?.querySelector(`[data-i="${activa}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activa]);

  function elegir(e: Estacion) {
    onTexto(e.nombre);
    setAbierto(false);
  }

  function teclado(ev: KeyboardEvent<HTMLInputElement>) {
    const n = opciones.length;
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      if (!abierto) return setAbierto(true);
      if (!n) return;
      setActiva((a) => (ev.key === "ArrowDown" ? (a + 1) % n : (a - 1 + n) % n));
    } else if (ev.key === "Enter" && abierto && activa >= 0) {
      ev.preventDefault();
      elegir(opciones[activa]);
    } else if (ev.key === "Escape" && abierto) {
      ev.preventDefault();
      setAbierto(false);
    }
  }

  const visible = abierto && opciones.length > 0;
  return (
    <div className="parada desplegable">
      <label className="parada__etiqueta" htmlFor={`${id}c`}>
        {etiqueta}
      </label>
      <input
        id={`${id}c`}
        className="parada__campo"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={visible}
        aria-controls={`${id}l`}
        aria-activedescendant={visible && activa >= 0 ? `${id}o${activa}` : undefined}
        value={texto}
        onChange={(e) => {
          onTexto(e.target.value);
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setAbierto(false)}
        onKeyDown={teclado}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      <ul
        ref={lista}
        id={`${id}l`}
        role="listbox"
        aria-label={etiqueta}
        className={`panel-cristal cristal${visible ? " panel-cristal--abierto" : ""}`}
      >
        {opciones.map((e, i) => (
          <li
            key={e.id}
            id={`${id}o${i}`}
            data-i={i}
            role="option"
            aria-selected={i === activa}
            className="opcion"
            // mousedown: evita que el blur cierre el panel antes del clic
            onMouseDown={(ev) => {
              ev.preventDefault();
              elegir(e);
            }}
            onMouseMove={() => setActiva(i)}
          >
            <span className="opcion__nombre">{resaltar(e.nombre, texto)}</span>
            <span className="opcion__ciudad">{e.ciudad}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
