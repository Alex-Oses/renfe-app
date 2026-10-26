// Cabecera y navegación principal. Dueño: agente de diseño.
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useSesion } from "../estado/sesion";

const ENLACES = [
  { a: "/", texto: "Comprar" },
  { a: "/mapa", texto: "Trenes en directo" },
  { a: "/billetes", texto: "Mis billetes" },
];

export function Cabecera() {
  const { sesion } = useSesion();
  const { pathname } = useLocation();
  const [scroll, setScroll] = useState(false);
  const [menu, setMenu] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mirar = () => setScroll(window.scrollY > 8);
    mirar();
    window.addEventListener("scroll", mirar, { passive: true });
    return () => window.removeEventListener("scroll", mirar);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    if (menu) panel.current?.querySelector<HTMLElement>("a")?.focus();
  }, [menu]);

  function cerrar() {
    setMenu(false);
    boton.current?.focus();
  }

  // Foco atrapado dentro del panel móvil mientras está abierto.
  function teclado(e: KeyboardEvent) {
    if (e.key === "Escape") return cerrar();
    if (e.key !== "Tab" || !panel.current) return;
    const f = [boton.current!, ...panel.current.querySelectorAll<HTMLElement>("a")];
    const i = f.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      f[f.length - 1].focus();
    } else if (!e.shiftKey && i === f.length - 1) {
      e.preventDefault();
      f[0].focus();
    }
  }

  const enlaces = (
    <>
      {ENLACES.map((l) => (
        <NavLink key={l.a} to={l.a} end className="nav__enlace">
          {l.texto}
        </NavLink>
      ))}
      {sesion ? (
        <NavLink to="/cuenta" className="nav__enlace nav__cuenta">
          {sesion.usuario.nombre}
        </NavLink>
      ) : (
        <NavLink to="/acceder" className="nav__enlace nav__cuenta">
          Acceder
        </NavLink>
      )}
    </>
  );

  return (
    <header className={`cabecera${scroll || menu ? " cabecera--cristal cristal" : ""}`} onKeyDown={menu ? teclado : undefined}>
      <div className="contenedor cabecera__fila">
        <Link to="/" className="marca">
          Andén
        </Link>
        <nav aria-label="Principal" className="nav nav--ancha">
          {enlaces}
        </nav>
        <button
          ref={boton}
          type="button"
          className="hamburguesa"
          aria-expanded={menu}
          aria-controls="menu-movil"
          aria-label={menu ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenu((m) => !m)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              d={menu ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div
        ref={panel}
        id="menu-movil"
        className={`menu-movil cristal${menu ? " menu-movil--abierto" : ""}`}
        hidden={!menu}
      >
        <nav aria-label="Principal móvil" className="nav nav--movil">
          {enlaces}
        </nav>
      </div>
    </header>
  );
}
