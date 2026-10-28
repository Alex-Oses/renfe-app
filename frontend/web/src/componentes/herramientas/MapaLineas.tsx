import { Link } from "react-router-dom";
import { posiciones } from "@renfe/shared/api/simulado-tiempo-real";
import { Herramienta } from "./comun";

// Corredores sacados de los recorridos simulados en tiempo real, sin repetir sentido.
function corredores() {
  const vistos = new Map<string, { tipo: string; paradas: string[] }>();
  for (const p of posiciones()) {
    const nombres = p.paradas.map((x) => x.nombre);
    const clave = `${p.tipo}|${[...nombres].sort().join("|")}`;
    if (!vistos.has(clave)) vistos.set(clave, { tipo: p.tipo, paradas: nombres });
  }
  return [...vistos.values()].sort((a, b) => a.tipo.localeCompare(b.tipo));
}

export default function MapaLineas() {
  const lineas = corredores();
  return (
    <Herramienta titulo="Líneas y corredores">
      <ul className="herr__lista">
        {lineas.map((l) => (
          <li key={l.tipo + l.paradas.join()}>
            <strong>{l.tipo}</strong>: {l.paradas.join(" – ")}
          </li>
        ))}
      </ul>
      <Link className="boton boton--secundario" to="/mapa">Ver trenes en el mapa</Link>
    </Herramienta>
  );
}
