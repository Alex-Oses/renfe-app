import { Link } from "react-router-dom";
import { Buscador } from "../componentes/Buscador";

const FRECUENTES = [
  { origen: "60000", destino: "71801", texto: "Madrid → Barcelona" },
  { origen: "60000", destino: "51003", texto: "Madrid → Sevilla" },
  { origen: "60000", destino: "65000", texto: "Madrid → València" },
  { origen: "60000", destino: "54413", texto: "Madrid → Málaga" },
  { origen: "71801", destino: "04040", texto: "Barcelona → Zaragoza" },
];

export function Inicio() {
  const manana = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  return (
    <>
      <section className="portada">
        <div className="contenedor portada__rejilla">
          <div className="portada__texto">
            <h1>¿A dónde vas?</h1>
            <p>Busca trenes de larga y media distancia, elige asiento y lleva el billete en el móvil.</p>
          </div>
          <Buscador />
        </div>
      </section>

      <section className="contenedor seccion">
        <h2>Trayectos frecuentes</h2>
        <ul className="frecuentes">
          {FRECUENTES.map((f) => (
            <li key={f.texto}>
              <Link to={`/trenes?${new URLSearchParams({ origen: f.origen, destino: f.destino, fecha: manana })}`}>
                <span>{f.texto}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
