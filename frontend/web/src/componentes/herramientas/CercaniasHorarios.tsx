import { useMemo, useState, type FormEvent } from "react";
import { nucleosCercanias } from "@renfe/shared/contenido/navegacion";
import { horariosCercanias, lineasNucleo } from "./logica";
import { Herramienta, Selector } from "./comun";

export default function CercaniasHorarios() {
  const [nucleo, setNucleo] = useState(nucleosCercanias[0].ruta);
  const lineas = useMemo(() => lineasNucleo(nucleo), [nucleo]);
  const [linea, setLinea] = useState(0);
  const [origen, setOrigen] = useState(0);
  const [destino, setDestino] = useState(1);
  const [error, setError] = useState("");
  const [tabla, setTabla] = useState<ReturnType<typeof horariosCercanias> | null>(null);
  const estaciones = lineas[linea]?.estaciones ?? [];

  const cambiarNucleo = (n: string) => {
    setNucleo(n);
    setLinea(0);
    setOrigen(0);
    setDestino(1);
    setTabla(null);
  };

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (origen === destino) return setError("El origen y el destino deben ser distintos.");
    setError("");
    setTabla(horariosCercanias(nucleo, lineas[linea].id, origen, destino));
  }

  return (
    <Herramienta titulo="Horarios de Cercanías">
      <form className="herr__form" onSubmit={enviar} noValidate>
        <Selector etiqueta="Núcleo" value={nucleo} onChange={(e) => cambiarNucleo(e.target.value)}>
          {nucleosCercanias.map((n) => <option key={n.ruta} value={n.ruta}>{n.texto}</option>)}
        </Selector>
        <Selector etiqueta="Línea" value={linea} onChange={(e) => { setLinea(Number(e.target.value)); setTabla(null); }}>
          {lineas.map((l, i) => <option key={l.id} value={i}>{l.id}</option>)}
        </Selector>
        <Selector etiqueta="Origen" value={origen} onChange={(e) => setOrigen(Number(e.target.value))}>
          {estaciones.map((s, i) => <option key={s} value={i}>{s}</option>)}
        </Selector>
        <Selector etiqueta="Destino" value={destino} onChange={(e) => setDestino(Number(e.target.value))} error={error}>
          {estaciones.map((s, i) => <option key={s} value={i}>{s}</option>)}
        </Selector>
        <button className="boton">Ver horarios</button>
      </form>
      {tabla && (
        <div className="herr__desliza" aria-live="polite">
          <table className="herr__tabla">
            <caption className="sr-only">Salidas de {estaciones[origen]} a {estaciones[destino]}</caption>
            <thead><tr><th>Salida</th><th>Llegada</th><th>Duración</th></tr></thead>
            <tbody>
              {tabla.map((h) => <tr key={h.sale}><td>{h.sale}</td><td>{h.llega}</td><td>{h.duracion} min</td></tr>)}
            </tbody>
          </table>
          <p><small>Horarios simulados.</small></p>
        </div>
      )}
    </Herramienta>
  );
}
