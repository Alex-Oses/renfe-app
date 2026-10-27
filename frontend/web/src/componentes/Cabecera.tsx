// Cabecera y navegación principal. Dueño: agente de diseño.
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { avisoDestacado, enlacesAyuda, menuPrincipal, type Menu } from "../contenido/navegacion";
import { useSesion } from "../estado/sesion";
import { CampanaAvisos } from "./CampanaAvisos";

const ENLACES = [
  { a: "/", texto: "Comprar" },
  { a: "/mapa", texto: "Trenes en directo" },
  { a: "/billetes", texto: "Mis billetes" },
  { a: "/lineas", texto: "Mis líneas" },
];

// Ayuda entra en el mega-menú como un menú más, partida en dos columnas.
const MENUS: Menu[] = [
  ...menuPrincipal,
  {
    titulo: "Ayuda",
    ruta: "/ayuda",
    grupos: [
      { titulo: "Gestiones frecuentes", ruta: "/ayuda", enlaces: enlacesAyuda.slice(0, 7) },
      { titulo: "Atención al cliente", ruta: "/ayuda", enlaces: enlacesAyuda.slice(7) },
    ],
  },
];

const IDIOMAS = ["ES", "CA", "EN", "FR"];

const Flecha = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="mega__flecha">
    <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Columnas({ menu }: { menu: Menu }) {
  // Grupos sin enlaces (Inspírate) se juntan en una sola columna de accesos.
  const conEnlaces = menu.grupos.filter((g) => g.enlaces.length);
  const sueltos = menu.grupos.filter((g) => !g.enlaces.length);
  return (
    <div className="mega__columnas">
      {conEnlaces.map((g) => (
        <div key={g.titulo} className="mega__grupo">
          <Link to={g.ruta} className="mega__titulo">
            {g.titulo}
          </Link>
          <ul>
            {g.enlaces.map((e) => (
              <li key={e.ruta}>
                <Link to={e.ruta}>{e.texto}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {sueltos.length > 0 && (
        <div className="mega__grupo">
          <span className="mega__titulo">Explora</span>
          <ul>
            {sueltos.map((g) => (
              <li key={g.ruta}>
                <Link to={g.ruta}>{g.titulo}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Cabecera() {
  const { sesion } = useSesion();
  const { pathname } = useLocation();
  const [oculta, setOculta] = useState(false);
  const [foco, setFoco] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const [aviso, setAviso] = useState(Boolean(avisoDestacado.texto));
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const cabecera = useRef<HTMLElement>(null);

  useEffect(() => {
    // Se esconde al bajar y vuelve al subir; arriba del todo siempre visible.
    let ultimo = window.scrollY;
    const mirar = () => {
      const y = window.scrollY;
      if (y < 80) setOculta(false);
      else if (Math.abs(y - ultimo) > 8) {
        const baja = y > ultimo;
        setOculta(baja);
        // Al bajar se cierra lo que esté abierto; si no, el menú (o el foco en él) la mantendría visible.
        if (baja) {
          setMega(null);
          setMenu(false);
          const activo = document.activeElement;
          if (activo instanceof HTMLElement && cabecera.current?.contains(activo)) activo.blur();
        }
      } else return;
      ultimo = y;
    };
    window.addEventListener("scroll", mirar, { passive: true });
    return () => window.removeEventListener("scroll", mirar);
  }, []);

  useEffect(() => {
    setMenu(false);
    setMega(null);
  }, [pathname]);

  useEffect(() => {
    if (menu) panel.current?.querySelector<HTMLElement>("a, summary")?.focus();
  }, [menu]);

  // Clic fuera del mega-menú lo cierra.
  useEffect(() => {
    if (!mega) return;
    const fuera = (e: PointerEvent) => {
      if (!cabecera.current?.contains(e.target as Node)) setMega(null);
    };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, [mega]);

  function cerrar() {
    setMenu(false);
    boton.current?.focus();
  }

  function cerrarMega() {
    const abierto = mega;
    setMega(null);
    if (abierto) document.getElementById(`mega-boton-${abierto}`)?.focus();
  }

  // Foco atrapado dentro del panel móvil mientras está abierto.
  function teclado(e: KeyboardEvent) {
    if (e.key === "Escape") {
      if (menu) return cerrar();
      if (mega) return cerrarMega();
    }
    if (!menu || e.key !== "Tab" || !panel.current) return;
    const visibles = [...panel.current.querySelectorAll<HTMLElement>("a, summary")].filter((el) => el.offsetParent);
    const f = [boton.current!, ...visibles];
    const i = f.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      f[f.length - 1].focus();
    } else if (!e.shiftKey && i === f.length - 1) {
      e.preventDefault();
      f[0].focus();
    }
  }

  const cuenta = sesion ? (
    <NavLink to="/cuenta" className="nav__enlace nav__cuenta">
      {sesion.usuario.nombre}
    </NavLink>
  ) : (
    <NavLink to="/acceder" className="nav__enlace nav__cuenta">
      Acceder
    </NavLink>
  );

  const accesos = ENLACES.map((l) => (
    <NavLink key={l.a} to={l.a} end className="nav__enlace">
      {l.texto}
    </NavLink>
  ));

  const idiomas = (
    <div className="idioma" role="group" aria-label="Idioma">
      {IDIOMAS.map((i) => (
        <button
          key={i}
          type="button"
          className="idioma__opcion"
          aria-pressed={i === "ES"}
          disabled={i !== "ES"}
          title={i === "ES" ? "Español" : "Próximamente"}
        >
          {i}
        </button>
      ))}
    </div>
  );

  const abierto = MENUS.find((m) => m.ruta === mega);

  return (
    <>
      {aviso && (
        <div className="barra-aviso" role="region" aria-label="Aviso destacado">
          <div className="contenedor barra-aviso__fila">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Link to={avisoDestacado.ruta}>{avisoDestacado.texto}</Link>
            <button type="button" className="barra-aviso__cerrar" aria-label="Ocultar aviso" onClick={() => setAviso(false)}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <header
        ref={cabecera}
        className={`cabecera cristal cristal--fuerte${oculta && !menu && !mega && !foco ? " cabecera--oculta" : ""}`}
        onKeyDown={menu || mega ? teclado : undefined}
        onFocus={() => setFoco(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setFoco(false);
            setMega(null);
          }
        }}
      >
        <div className="contenedor cabecera__fila">
          <Link to="/" className="marca">
            Renfe
          </Link>
          <nav aria-label="Secciones" className="mega">
            <ul className="mega__lista">
              {MENUS.map((m) => (
                <li key={m.ruta}>
                  <button
                    id={`mega-boton-${m.ruta}`}
                    type="button"
                    className="mega__boton"
                    aria-expanded={mega === m.ruta}
                    aria-controls="mega-panel"
                    onClick={() => setMega((x) => (x === m.ruta ? null : m.ruta))}
                  >
                    {m.titulo}
                    <Flecha />
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="cabecera__derecha">
            <CampanaAvisos />
            <span className="cabecera__ancha">{cuenta}</span>
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
        </div>
        <div className="contenedor accesos">
          <nav aria-label="Mi viaje" className="nav">
            {accesos}
          </nav>
          {idiomas}
        </div>

        {/* Mega-menú de escritorio */}
        <div id="mega-panel" className="mega__panel cristal cristal--flotante" hidden={!abierto}>
          {abierto && (
            <>
              <div className="mega__cabeza">
                <Link to={abierto.ruta} className="mega__todo">
                  Todo sobre {abierto.titulo}
                </Link>
              </div>
              <Columnas menu={abierto} />
            </>
          )}
        </div>

        {/* Cajón móvil */}
        <div
          ref={panel}
          id="menu-movil"
          className={`menu-movil cristal cristal--flotante${menu ? " menu-movil--abierto" : ""}`}
          hidden={!menu}
        >
          <nav aria-label="Principal móvil" className="nav nav--movil">
            {accesos}
            {cuenta}
          </nav>
          <div className="cajon__secciones">
            {MENUS.map((m) => (
              <details key={m.ruta} className="cajon__menu">
                <summary>{m.titulo}</summary>
                <Link to={m.ruta} className="cajon__todo">
                  Todo sobre {m.titulo}
                </Link>
                <Columnas menu={m} />
              </details>
            ))}
          </div>
          {idiomas}
        </div>
      </header>
    </>
  );
}
