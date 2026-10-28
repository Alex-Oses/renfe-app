import { useState, type KeyboardEvent } from "react";
import type { Asiento } from "@renfe/shared/api/tipos";
import { euros } from "./formato";

interface Props {
  asientos: Asiento[];
  n: number;
  elegidos: string[];
  onCambio: (ids: string[]) => void;
  onSeguir: () => void;
}

export function PasoAsientos({ asientos, n, elegidos, onCambio, onSeguir }: Props) {
  const coches = [...new Set(asientos.map((a) => a.coche))];
  const [coche, setCoche] = useState(() => (elegidos[0] ? Number(elegidos[0].split("-")[0]) : coches[coches.length - 1]));
  const [aviso, setAviso] = useState("");
  const delCoche = asientos.filter((a) => a.coche === coche);
  const filas = [...new Set(delCoche.map((a) => a.fila))];

  const alternar = (a: Asiento) => {
    if (!a.libre) return;
    if (elegidos.includes(a.id)) {
      onCambio(elegidos.filter((x) => x !== a.id));
      setAviso("");
    } else if (elegidos.length >= n) {
      setAviso(`Ya tienes ${n} ${n === 1 ? "asiento" : "asientos"}. Quita uno para elegir otro.`);
    } else {
      onCambio([...elegidos, a.id]);
      setAviso("");
    }
  };

  // Flechas para moverse por el mapa como en una rejilla.
  const mover = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
    const actual = (e.target as HTMLElement).dataset.pos;
    if (!d || !actual) return;
    e.preventDefault();
    const [f, c] = actual.split(":").map(Number);
    const sig = e.currentTarget.querySelector<HTMLElement>(`[data-pos="${f + d[0]}:${c + d[1]}"]`);
    sig?.focus();
  };

  const tabCoche = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1;
    if (j < 0 || j >= coches.length) return;
    setCoche(coches[j]);
    (e.currentTarget.parentElement?.children[j] as HTMLElement)?.focus();
  };

  const clase = delCoche[0]?.clase;
  const precio = delCoche[0]?.precio ?? 0;

  return (
    <>
      <div role="tablist" aria-label="Coches" className="coches">
        {coches.map((c, i) => {
          const a = asientos.find((x) => x.coche === c)!;
          const mios = elegidos.filter((x) => x.startsWith(`${c}-`)).length;
          return (
            <button
              key={c}
              role="tab"
              type="button"
              id={`tab-coche-${c}`}
              aria-selected={c === coche}
              aria-controls="mapa-coche"
              tabIndex={c === coche ? 0 : -1}
              onClick={() => setCoche(c)}
              onKeyDown={(e) => tabCoche(e, i)}
              className="coches__tab"
            >
              <span>Coche {c}</span>
              <small>{a.clase}</small>
              {mios > 0 && <span className="coches__marca">{mios}</span>}
            </button>
          );
        })}
      </div>

      <ul className="leyenda" aria-label="Leyenda">
        <li>
          <span className="asiento asiento--muestra" aria-hidden="true" /> Libre
        </li>
        <li>
          <span className="asiento asiento--muestra asiento--elegido" aria-hidden="true">
            <Check />
          </span>{" "}
          Elegido
        </li>
        <li>
          <span className="asiento asiento--muestra asiento--ocupado" aria-hidden="true">
            <Cruz />
          </span>{" "}
          Ocupado
        </li>
      </ul>

      <div id="mapa-coche" role="tabpanel" aria-labelledby={`tab-coche-${coche}`} className="coche">
        <p className="coche__clase">
          <span className={`etiqueta-clase etiqueta-clase--${clase === "Prémium" ? "premium" : clase === "Confort" ? "confort" : "estandar"}`}>{clase}</span>{" "}
          {euros.format(precio)} por asiento
        </p>
        <div className="coche__mapa" onKeyDown={mover} role="group" aria-label={`Asientos del coche ${coche}`}>
          <div className="coche__fila coche__fila--cabeza" aria-hidden="true">
            <span>A</span>
            <span>B</span>
            <span className="coche__pasillo" />
            <span>C</span>
            <span>D</span>
          </div>
          {filas.map((f) => (
            <div className="coche__fila" key={f}>
              {delCoche
                .filter((a) => a.fila === f)
                .flatMap((a, i) => {
                  const marcado = elegidos.includes(a.id);
                  const boton = (
                    <button
                      key={a.id}
                      type="button"
                      data-pos={`${f}:${i}`}
                      className={`asiento${marcado ? " asiento--elegido" : ""}${a.libre ? "" : " asiento--ocupado"}`}
                      aria-pressed={a.libre ? marcado : undefined}
                      aria-disabled={!a.libre || undefined}
                      aria-label={`Asiento ${f}${a.letra}, ${a.letra === "A" || a.letra === "D" ? "ventana" : "pasillo"}, ${a.libre ? euros.format(a.precio) : "ocupado"}`}
                      onClick={() => alternar(a)}
                    >
                      {marcado ? <Check /> : a.libre ? <span aria-hidden="true">{f}</span> : <Cruz />}
                    </button>
                  );
                  return i === 1 ? [boton, <span key={`p${f}`} className="coche__pasillo" aria-hidden="true">{f}</span>] : [boton];
                })}
            </div>
          ))}
        </div>
      </div>

      <p className="reserva__aviso" role="status">
        {aviso || `${elegidos.length} de ${n} ${n === 1 ? "asiento elegido" : "asientos elegidos"}.`}
      </p>
      <div className="reserva__acciones">
        <button type="button" className="boton" disabled={elegidos.length !== n} onClick={onSeguir}>
          Continuar con los viajeros
        </button>
      </div>
    </>
  );
}

export const Check = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const Cruz = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
