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
    const pintar = () => {
      pendiente = 0;
      const r = el.getBoundingClientRect();
      const recorrido = r.height - innerHeight;
      const p = recorrido > 0 ? Math.min(1, Math.max(0, -r.top / recorrido)) : 1;
      el.style.setProperty("--p", p.toFixed(4));
      el.dataset.listo = p > 0.62 ? "si" : "no";
    };
    const alScroll = () => {
      if (!pendiente) pendiente = requestAnimationFrame(pintar);
    };
    pintar();
    addEventListener("scroll", alScroll, { passive: true });
    addEventListener("resize", alScroll);
    return () => {
      cancelAnimationFrame(pendiente);
      removeEventListener("scroll", alScroll);
      removeEventListener("resize", alScroll);
    };
  }, []);

  // Si el teclado o un lector entra en el buscador antes de tiempo, saltamos al estado final.
  function alFoco() {
    const el = ref.current;
    if (!el || el.dataset.listo === "si") return;
    const fin = el.getBoundingClientRect().bottom + scrollY - innerHeight;
    scrollTo({ top: fin, behavior: "instant" });
  }

  return (
    <section ref={ref} className="entrada" aria-labelledby="entrada-titulo" data-listo="no">
      <div className="entrada__fijo">
        <div className="entrada__fondo" aria-hidden="true">
          <div className="entrada__paisaje" />
          <div className="entrada__catenaria" />
        </div>
        <div className="entrada__lema" aria-hidden="true">
          <span>Andén</span>
          <small>Desliza para subir al tren</small>
        </div>
        <div className="entrada__tren">
          <div className="entrada__estela" aria-hidden="true" />
          <TrenSvg />
        </div>
        <div className="entrada__anden" aria-hidden="true" />
        <div className="entrada__panel cristal" onFocusCapture={alFoco}>
          <h1 id="entrada-titulo">Busca tu próximo viaje</h1>
          <p>Trenes de larga y media distancia. Eliges asiento y llevas el billete en el móvil.</p>
          <Buscador />
        </div>
      </div>
    </section>
  );
}
