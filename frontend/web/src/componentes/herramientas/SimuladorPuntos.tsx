import { useState } from "react";
import { euros, NIVELES, puntosGanados, type Nivel } from "./logica";
import { Campo, Herramienta, Selector } from "./comun";

export default function SimuladorPuntos() {
  const [importe, setImporte] = useState("100");
  const [nivel, setNivel] = useState<Nivel>("General");
  const n = Number(importe.replace(",", "."));
  const valido = Number.isFinite(n) && n >= 0;
  const r = puntosGanados(valido ? n : 0, nivel);
  return (
    <Herramienta titulo="Simula tus puntos">
      <div className="herr__form">
        <Campo etiqueta="Importe gastado (€)" inputMode="decimal" value={importe} onChange={(e) => setImporte(e.target.value)} error={valido ? undefined : "Escribe un importe válido."} />
        <Selector etiqueta="Nivel" value={nivel} onChange={(e) => setNivel(e.target.value as Nivel)}>
          {Object.keys(NIVELES).map((k) => <option key={k}>{k}</option>)}
        </Selector>
      </div>
      <p aria-live="polite">
        Ganarías <strong>{r.puntos.toLocaleString("es-ES")} puntos</strong>, equivalentes a <strong>{euros(r.euros)}</strong> en descuentos.
      </p>
      <p><small>Cálculo simulado: 10 puntos por euro × multiplicador de nivel; 100 puntos = 1 €.</small></p>
    </Herramienta>
  );
}
