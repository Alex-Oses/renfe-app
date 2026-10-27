import type { Pagina } from "./tipos";
import { paginas as rutas } from "./inspirate/rutas";
import { paginas as destinos } from "./inspirate/destinos";
import { paginas as estaciones } from "./inspirate/estaciones";
import { paginas as experiencias } from "./inspirate/experiencias";
import { paginas as indices } from "./inspirate/indices";

export const paginas: Pagina[] = [...rutas, ...destinos, ...estaciones, ...experiencias, ...indices];
