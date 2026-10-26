// Cabecera y navegación principal. Dueño: agente de diseño.
import { Link, NavLink } from "react-router-dom";

export function Cabecera() {
  return (
    <header className="cabecera">
      <div className="contenedor cabecera__fila">
        <Link to="/" className="marca">
          Andén
        </Link>
        <nav aria-label="Principal">
          <NavLink to="/">Comprar</NavLink> <NavLink to="/mapa">Trenes en directo</NavLink>{" "}
          <NavLink to="/billetes">Mis billetes</NavLink> <NavLink to="/cuenta">Mi cuenta</NavLink>
        </nav>
      </div>
    </header>
  );
}
