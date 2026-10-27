import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Coloca el scroll al cambiar de página: arriba del todo, o centrado en el #ancla si el enlace lleva una.
// Con atrás/adelante (POP) no toca nada: el navegador devuelve al usuario adonde estaba.
export function AlNavegar() {
  const { pathname, hash } = useLocation();
  const tipo = useNavigationType();

  useEffect(() => {
    if (tipo === "POP") return;
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    // Las páginas se cargan en diferido: se reintenta unos frames hasta que exista el destino.
    let intentos = 0;
    let marco = 0;
    const buscar = () => {
      const destino = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (destino) {
        destino.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      if (++intentos < 30) marco = requestAnimationFrame(buscar);
      else window.scrollTo({ top: 0, behavior: "instant" });
    };
    buscar();
    return () => cancelAnimationFrame(marco);
  }, [pathname, hash, tipo]);

  return null;
}
