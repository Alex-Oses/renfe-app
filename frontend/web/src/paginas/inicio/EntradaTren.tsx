import { useEffect, useRef } from "react";
import { Buscador } from "../../componentes/Buscador";
import { TrenSvg } from "./TrenSvg";

// Tramo sticky: el progreso de scroll (0..1) se escribe en --p y el CSS mueve todo con transform/opacity.
export function EntradaTren() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let pendiente = 0;
    // La cabecera sticky ocupa sitio encima: subimos el tramo su altura para que se pegue desde scrollY=0.
    const ajustar = () => {
      const cab = document.querySelector<HTMLElement>(".cabecera");
      el.style.setProperty("--cab", `${cab?.offsetHeight ?? 0}px`);
    };
    const pintar = () => {
      pendiente = 0;
      const r = el.getBoundingClientRect();
      const recorrido = r.height - innerHeight;
      const p = recorrido > 0 ? Math.min(1, Math.max(0, -r.top / recorrido)) : 1;
      el.style.setProperty("--p", p.toFixed(4));
      el.dataset.listo = p > 0.62 / 1.6 ? "si" : "no"; // mismo umbral que antes, medido en --t (ver inicio.css)
      if (p > 0.005) el.dataset.empezado = "si";
      else delete el.dataset.empezado;
    };
    const alScroll = () => {
      if (!pendiente) pendiente = requestAnimationFrame(pintar);
    };
    const alResize = () => {
      ajustar();
      alScroll();
    };

    // En táctil el gesto es deslizar hacia la izquierda: lo convertimos en scroll vertical.
    const fijo = el.querySelector<HTMLElement>(".entrada__fijo");
    let x0 = 0;
    let y0 = 0;
    const inicio = (e: TouchEvent) => {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    };
    const mover = (e: TouchEvent) => {
      const t = e.touches[0];
      const dx = x0 - t.clientX;
      const dy = y0 - t.clientY;
      x0 = t.clientX;
      y0 = t.clientY;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      const recorrido = el.offsetHeight - innerHeight;
      scrollBy(0, (dx / innerWidth) * recorrido * 1.2);
    };

    ajustar();
    pintar();
    addEventListener("scroll", alScroll, { passive: true });
    addEventListener("resize", alResize);
    fijo?.addEventListener("touchstart", inicio, { passive: true });
    fijo?.addEventListener("touchmove", mover, { passive: true });
    return () => {
      cancelAnimationFrame(pendiente);
      removeEventListener("scroll", alScroll);
      removeEventListener("resize", alResize);
      fijo?.removeEventListener("touchstart", inicio);
      fijo?.removeEventListener("touchmove", mover);
    };
  }, []);

  // Salta al estado final del tramo (buscador visible).
  function irAlFinal() {
    const el = ref.current;
    if (!el || el.dataset.listo === "si") return;
    const fin = el.getBoundingClientRect().bottom + scrollY - innerHeight;
    scrollTo({ top: fin, behavior: "instant" });
  }

  function irAlBuscador() {
    irAlFinal();
    ref.current?.querySelector<HTMLElement>(".entrada__panel input, .entrada__panel button")?.focus();
  }

  return (
    <section ref={ref} className="entrada" aria-labelledby="entrada-titulo" data-listo="no">
      <div className="entrada__fijo">
        <div className="entrada__fondo" aria-hidden="true">
          <div className="entrada__paisaje" />
          <div className="entrada__catenaria" />
        </div>
        <div className="entrada__lema" aria-hidden="true">
          <span>Renfe</span>
        </div>
        <div className="entrada__tren">
          <div className="entrada__estela" aria-hidden="true" />
          <TrenSvg />
        </div>
        <div className="entrada__anden" aria-hidden="true" />
        <div className="entrada__aviso">
          <span className="aviso aviso--raton" aria-hidden="true">
            <svg viewBox="0 0 24 36" width="22" height="34" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="32" rx="10" />
              <path className="aviso__rueda" d="M12 9v5" strokeLinecap="round" />
            </svg>
            Desliza hacia abajo
          </span>
          <span className="aviso aviso--mano" aria-hidden="true">
            <svg className="aviso__flecha" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12H5M11 6l-6 6 6 6" />
            </svg>
            Desliza hacia la izquierda
          </span>
          <button type="button" className="entrada__saltar" onClick={irAlBuscador}>
            Ir al buscador
          </button>
        </div>
        <div className="entrada__panel cristal" onFocusCapture={irAlFinal}>
          <h1 id="entrada-titulo">Busca tu próximo viaje</h1>
          <p>Trenes de larga y media distancia. Eliges asiento y llevas el billete en el móvil.</p>
          <Buscador />
        </div>
      </div>
    </section>
  );
}
