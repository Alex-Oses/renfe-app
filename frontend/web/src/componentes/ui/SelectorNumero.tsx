// Botón + listbox en cristal para elegir un número (patrón ARIA "select-only combobox").
import { useId, useState, type KeyboardEvent } from "react";

interface Props {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  onCambio: (n: number) => void;
  texto: (n: number) => string;
}

export function SelectorNumero({ etiqueta, valor, min, max, onCambio, texto }: Props) {
  const id = useId();
  const [abierto, setAbierto] = useState(false);
  const [activa, setActiva] = useState(valor);
  const numeros = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  function abrir() {
    setActiva(valor);
    setAbierto(true);
  }
  function elegir(n: number) {
    onCambio(n);
    setAbierto(false);
  }
  function teclado(ev: KeyboardEvent) {
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      if (!abierto) return abrir();
      setActiva((a) => Math.min(max, Math.max(min, a + (ev.key === "ArrowDown" ? 1 : -1))));
    } else if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      if (abierto) elegir(activa);
      else abrir();
    } else if (ev.key === "Escape" && abierto) {
      ev.preventDefault();
      setAbierto(false);
    }
  }

  return (
    <div className="campo desplegable">
      <span id={`${id}e`}>{etiqueta}</span>
      <div
        className="selector"
        role="combobox"
        tabIndex={0}
        aria-labelledby={`${id}e`}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={`${id}l`}
        aria-activedescendant={abierto ? `${id}o${activa}` : undefined}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        onBlur={() => setAbierto(false)}
        onKeyDown={teclado}
      >
        {texto(valor)}
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <ul
        id={`${id}l`}
        role="listbox"
        aria-labelledby={`${id}e`}
        className={`panel-cristal cristal${abierto ? " panel-cristal--abierto" : ""}`}
      >
        {numeros.map((n) => (
          <li
            key={n}
            id={`${id}o${n}`}
            role="option"
            aria-selected={n === valor}
            className={`opcion${n === activa ? " opcion--activa" : ""}`}
            onMouseDown={(ev) => {
              ev.preventDefault();
              elegir(n);
            }}
            onMouseMove={() => setActiva(n)}
          >
            {texto(n)}
          </li>
        ))}
      </ul>
    </div>
  );
}
