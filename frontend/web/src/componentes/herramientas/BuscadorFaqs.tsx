import { useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { buscarPagina } from "../../contenido";
import { Campo, Herramienta } from "./comun";

const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Resalta sin tildes: la normalización NFD+quitar marcas mantiene una letra por letra en español.
function resaltar(texto: string, q: string): ReactNode {
  if (!q) return texto;
  const t = texto.normalize("NFC");
  const base = norm(t);
  const partes: ReactNode[] = [];
  let i = 0;
  for (let j = base.indexOf(q); j !== -1; j = base.indexOf(q, i)) {
    partes.push(t.slice(i, j), <mark key={j}>{t.slice(j, j + q.length)}</mark>);
    i = j + q.length;
  }
  partes.push(t.slice(i));
  return partes;
}

export default function BuscadorFaqs() {
  const { pathname } = useLocation();
  const [q, setQ] = useState("");
  const preguntas = (buscarPagina(pathname)?.bloques ?? []).flatMap((b) => (b.tipo === "faq" ? b.preguntas : []));
  const t = norm(q.trim());
  const visibles = t ? preguntas.filter((x) => norm(`${x.p} ${x.r}`).includes(t)) : preguntas;

  return (
    <Herramienta titulo="Busca en las preguntas frecuentes">
      <Campo etiqueta="¿Qué necesitas saber?" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
      <p role="status">{t ? `${visibles.length} de ${preguntas.length} preguntas` : `${preguntas.length} preguntas`}</p>
      {visibles.map((x) => (
        <details key={x.p} open={!!t}>
          <summary>{resaltar(x.p, t)}</summary>
          <p>{resaltar(x.r, t)}</p>
        </details>
      ))}
    </Herramienta>
  );
}
