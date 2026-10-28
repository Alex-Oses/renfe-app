// Foto de contenido con crédito de Commons; sin foto (o si falla) pinta un relleno ilustrado de la marca.
import { useState } from "react";
import { urlFoto, type Foto as DatosFoto } from "@renfe/shared/contenido/imagenes";
import "./foto.css";

// Icono por categoría (primer tramo de la ruta).
const ICONOS: Record<string, string> = {
  inspirate: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  cercanias: "M7 3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM4 10h16M8 21l2-4M16 21l-2-4M8 14h.01M16 14h.01",
  viajar: "M7 3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM4 10h16M8 21l2-4M16 21l-2-4M8 14h.01M16 14h.01",
  ayuda: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
  gestiona: "M4 9h13l-3-3M20 15H7l3 3",
  "mas-renfe": "M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z",
};

type Props = { foto?: DatosFoto; alt: string; categoria?: string; clase?: string };

export function Foto({ foto, alt, categoria = "viajar", clase = "" }: Props) {
  const [fallo, setFallo] = useState(false);
  if (!foto || fallo)
    return (
      <div className={`foto foto--relleno foto--${categoria} ${clase}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={ICONOS[categoria] ?? ICONOS.viajar} />
        </svg>
      </div>
    );
  const credito = `Foto: ${foto.autor} (Wikimedia Commons)`;
  return (
    <figure className={`foto ${clase}`}>
      <img
        src={urlFoto(foto.archivo)}
        srcSet={`${urlFoto(foto.archivo, 480)} 480w, ${urlFoto(foto.archivo, 800)} 800w, ${urlFoto(foto.archivo, 1280)} 1280w`}
        sizes="(min-width: 64rem) 50vw, 100vw"
        alt={alt}
        title={credito}
        loading="lazy"
        decoding="async"
        onError={() => setFallo(true)}
      />
      <figcaption className="foto__credito">{credito}</figcaption>
    </figure>
  );
}
