// Pie de página con el mapa de secciones. Dueño: agente de diseño.
import { Link } from "react-router-dom";
import { usaDatosSimulados } from "@renfe/shared/api/cliente";
import { enlacesAyuda, enlacesLegal, menuPrincipal, type Enlace } from "@renfe/shared/contenido/navegacion";

const menu = (ruta: string) => menuPrincipal.find((m) => m.ruta === ruta);
const enlacesDe = (ruta: string): Enlace[] =>
  (menu(ruta)?.grupos ?? []).flatMap((g) => (g.enlaces.length ? g.enlaces : [{ texto: g.titulo, ruta: g.ruta }]));

const COLUMNAS: { titulo: string; ruta: string; enlaces: Enlace[] }[] = [
  { titulo: "Viajar", ruta: "/viajar", enlaces: enlacesDe("/viajar").slice(0, 7) },
  { titulo: "Inspírate", ruta: "/inspirate", enlaces: enlacesDe("/inspirate") },
  { titulo: "Gestiona", ruta: "/gestiona", enlaces: enlacesDe("/gestiona").slice(0, 7) },
  { titulo: "Ayuda", ruta: "/ayuda", enlaces: enlacesAyuda.slice(0, 7) },
  { titulo: "Legal", ruta: "/ayuda/informacion-legal", enlaces: enlacesLegal },
];

// Atajos a las cuatro secciones principales: no hay cuentas sociales reales que enlazar.
const ATAJOS = [
  { nombre: "Viajar", ruta: "/viajar", d: "M4 7h16v10H4zM8 7V5h8v2M4 11h16" },
  { nombre: "Inspírate", ruta: "/inspirate", d: "M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9z" },
  { nombre: "Gestiona", ruta: "/gestiona", d: "M4 7h16v10H4zM4 10h16" },
  { nombre: "Ayuda", ruta: "/ayuda", d: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.5 9a2.5 2.5 0 1 1 4 2c-.8.6-1.5 1.2-1.5 2.5M12 17h.01" },
];

export function Pie() {
  return (
    <footer className="pie">
      <div className="contenedor pie__interior cristal">
        <nav aria-label="Mapa del sitio" className="pie__columnas">
          {COLUMNAS.map((c) => (
            <div key={c.titulo} className="pie__columna">
              <h2 className="pie__titulo">
                <Link to={c.ruta}>{c.titulo}</Link>
              </h2>
              <ul>
                {c.enlaces.map((e) => (
                  <li key={e.ruta}>
                    <Link to={e.ruta}>{e.texto}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="pie__base">
          <ul className="pie__redes" aria-label="Secciones destacadas">
            {ATAJOS.map((r) => (
              <li key={r.nombre}>
                <Link to={r.ruta} className="pie__red" aria-label={r.nombre} title={r.nombre}>
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path d={r.d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
          <p className="pie__aviso">
            Proyecto académico (ASIX 2), sin relación con Renfe. Horarios basados en datos abiertos GTFS de Renfe (CC BY 4.0).
            {usaDatosSimulados && " Ahora mismo los trenes, precios, pagos y posiciones son simulados."}
          </p>
        </div>
      </div>
    </footer>
  );
}
