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

// Iconos genéricos dibujados a mano: no reproducen logotipos de ninguna red.
const REDES = [
  { nombre: "Vídeos", d: "M3 6h18v12H3zM10 9.5v5l4.5-2.5z" },
  { nombre: "Fotos", d: "M4 7h3l2-2h6l2 2h3v12H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" },
  { nombre: "Mensajes", d: "M4 5h16v11H9l-5 4z" },
  { nombre: "Noticias", d: "M5 19a1 1 0 1 0 0-.01M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14" },
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
          <ul className="pie__redes" aria-label="Síguenos">
            {REDES.map((r) => (
              <li key={r.nombre}>
                {/* shortcut: canales simulados, enlazan a contacto hasta tener cuentas reales */}
                <Link to="/ayuda/contacto" className="pie__red" aria-label={`${r.nombre} (canal simulado)`}>
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
