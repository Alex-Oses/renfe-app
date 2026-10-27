import type { Pagina } from "./tipos";
import { paginas as viajar } from "./viajar";
import { paginas as inspirate } from "./inspirate";
import { paginas as cercanias } from "./cercanias";
import { paginas as gestiona } from "./gestiona";
import { paginas as ayuda } from "./ayuda";
import { paginas as masRenfe } from "./mas-renfe";

export const todasLasPaginas: Pagina[] = [...viajar, ...inspirate, ...cercanias, ...gestiona, ...ayuda, ...masRenfe];

const porRuta = new Map(todasLasPaginas.map((p) => [p.ruta, p]));

export function buscarPagina(ruta: string): Pagina | undefined {
  return porRuta.get(ruta.replace(/\/+$/, "") || "/");
}

/** Páginas que cuelgan directamente de `ruta` (un nivel). */
export function hijasDe(ruta: string): Pagina[] {
  const base = ruta.replace(/\/+$/, "");
  return todasLasPaginas.filter((p) => p.ruta.startsWith(base + "/") && !p.ruta.slice(base.length + 1).includes("/"));
}
