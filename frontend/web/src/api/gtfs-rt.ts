// La conversión del GTFS-RT vive en la función de Vercel (api/posiciones.ts), que no puede importar
// nada de src/. Aquí se reexporta para la web (solo el tipo) y para los tests.
export { URLS_GTFS_RT, convertirFeed, type Feed, type PosicionApi } from "../../api/posiciones";
