// Plantilla genérica de las páginas informativas (Viajar, Ayuda, Cercanías...).
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { herramientas } from "../componentes/herramientas/registro";
import { buscarPagina, hijasDe } from "@renfe/shared/contenido";
import { menuPrincipal } from "@renfe/shared/contenido/navegacion";
import type { Bloque, Tarjeta } from "@renfe/shared/contenido/tipos";
import "./contenido.css";

// Nombre legible de un tramo de ruta: página real, menú, o el propio slug.
function nombreDe(ruta: string): string {
  const p = buscarPagina(ruta);
  if (p) return p.titulo;
  for (const m of menuPrincipal) {
    if (m.ruta === ruta) return m.titulo;
    const g = m.grupos.find((x) => x.ruta === ruta);
    if (g) return g.titulo;
  }
  const slug = ruta.split("/").pop() ?? "";
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}

function Migas({ ruta }: { ruta: string }) {
  const tramos = ruta.split("/").filter(Boolean);
  return (
    <nav aria-label="Migas de pan" className="migas">
      <ol>
        <li>
          <Link to="/">Inicio</Link>
        </li>
        {tramos.map((_, i) => {
          const r = "/" + tramos.slice(0, i + 1).join("/");
          const ultimo = i === tramos.length - 1;
          return (
            <li key={r}>
              {ultimo ? <span aria-current="page">{nombreDe(r)}</span> : <Link to={r}>{nombreDe(r)}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function EnlaceTarjeta({ t }: { t: Tarjeta }) {
  const cuerpo = (
    <>
      {t.etiqueta && <span className="tarjeta__etiqueta">{t.etiqueta}</span>}
      <h3>{t.titulo}</h3>
      <p>{t.texto}</p>
    </>
  );
  if (!t.enlace) return <div className="tarjeta cristal">{cuerpo}</div>;
  if (t.enlace.startsWith("/"))
    return (
      <Link className="tarjeta cristal cristal--pulsable" to={t.enlace}>
        {cuerpo}
      </Link>
    );
  return (
    <a className="tarjeta cristal cristal--pulsable" href={t.enlace} rel="noreferrer">
      {cuerpo}
    </a>
  );
}

function Contenido({ b }: { b: Bloque }) {
  switch (b.tipo) {
    case "texto":
      return (
        <>
          {b.parrafos.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </>
      );
    case "lista":
      return (
        <ul className="bloque__lista">
          {b.items.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      );
    case "tarjetas":
      return (
        <ul className="tarjetas">
          {b.tarjetas.map((t, i) => (
            <li key={i}>
              <EnlaceTarjeta t={t} />
            </li>
          ))}
        </ul>
      );
    case "tabla":
      return (
        <div className="tabla" role="region" aria-label={b.titulo ?? "Tabla"} tabIndex={0}>
          <table>
            <thead>
              <tr>
                {b.columnas.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.filas.map((f, i) => (
                <tr key={i}>
                  {f.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "faq":
      return (
        <div className="faq">
          {b.preguntas.map((q) => (
            <details key={q.p}>
              <summary>{q.p}</summary>
              <p>{q.r}</p>
            </details>
          ))}
        </div>
      );
    case "pasos":
      return (
        <ol className="pasos">
          {b.pasos.map((p) => (
            <li key={p.titulo}>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      );
    case "aviso":
      return (
        <div className={`bloque-aviso bloque-aviso--${b.nivel}`} role={b.nivel === "alerta" ? "alert" : "note"}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d={b.nivel === "alerta" ? "M12 3 2 20h20L12 3zM12 10v4M12 17h.01" : "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 11v6M12 7h.01"}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p>{b.texto}</p>
        </div>
      );
    case "cta":
      return (
        <div className="cta cristal cristal--oscuro">
          <p>{b.texto}</p>
          {b.enlace.startsWith("/") ? (
            <Link className="boton" to={b.enlace}>
              {b.etiqueta}
            </Link>
          ) : (
            <a className="boton" href={b.enlace} rel="noreferrer">
              {b.etiqueta}
            </a>
          )}
        </div>
      );
    case "herramienta": {
      const Herramienta = herramientas[b.id];
      return Herramienta ? (
        <Herramienta />
      ) : (
        <div className="proximamente cristal">
          <strong>Próximamente</strong>
          <p>Esta herramienta interactiva todavía no está disponible.</p>
        </div>
      );
    }
  }
}

function NoEncontrada() {
  useEffect(() => {
    document.title = "Página no encontrada | Renfe";
  }, []);
  return (
    <section className="contenedor seccion no-encontrada">
      <div className="no-encontrada__caja cristal cristal--fuerte">
        <p className="no-encontrada__codigo" aria-hidden="true">
          404
        </p>
        <h1>Este tren no para aquí</h1>
        <p>La dirección no lleva a ninguna página. Puede que el enlace sea antiguo o tenga una errata.</p>
        <div className="no-encontrada__acciones">
          <Link className="boton" to="/">
            Volver al inicio
          </Link>
          <Link className="boton boton--secundario" to="/ayuda">
            Ir a Ayuda
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function PaginaContenido() {
  const { pathname } = useLocation();
  const pagina = buscarPagina(pathname);

  useEffect(() => {
    if (pagina) document.title = `${pagina.titulo} | Renfe`;
  }, [pagina]);

  if (!pagina) return <NoEncontrada />;

  const hijas = hijasDe(pagina.ruta);
  const indice = pagina.bloques
    .map((b, i) => ({ id: `seccion-${i}`, titulo: "titulo" in b ? b.titulo : undefined }))
    .filter((x): x is { id: string; titulo: string } => Boolean(x.titulo));

  return (
    <article className="contenido">
      <header className="contenido__cabecera">
        <div className="contenedor">
          <Migas ruta={pagina.ruta} />
          <div className="contenido__titular cristal cristal--fuerte">
            <h1>{pagina.titulo}</h1>
            <p>{pagina.resumen}</p>
          </div>
        </div>
      </header>

      <div className={`contenedor contenido__cuerpo${indice.length > 1 ? " contenido__cuerpo--indice" : ""}`}>
        {indice.length > 1 && (
          <nav aria-label="En esta página" className="indice">
            <p className="indice__titulo">En esta página</p>
            <ul>
              {indice.map((x) => (
                <li key={x.id}>
                  <a href={`#${x.id}`}>{x.titulo}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="contenido__bloques">
          {pagina.bloques.map((b, i) => {
            const titulo = "titulo" in b ? b.titulo : undefined;
            return (
              <section key={i} id={`seccion-${i}`} className={`bloque bloque--${b.tipo}`} aria-labelledby={titulo ? `seccion-${i}-t` : undefined}>
                {titulo && <h2 id={`seccion-${i}-t`}>{titulo}</h2>}
                <Contenido b={b} />
              </section>
            );
          })}

          {hijas.length > 0 && (
            <section className="bloque" aria-labelledby="hijas-t">
              <h2 id="hijas-t">En esta sección</h2>
              <ul className="tarjetas">
                {hijas.map((h) => (
                  <li key={h.ruta}>
                    <EnlaceTarjeta t={{ titulo: h.titulo, texto: h.resumen, enlace: h.ruta }} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
