// Función de Vercel: GET /api/posiciones con los trenes de Renfe en tiempo real.
// Renfe no permite leer el GTFS-RT desde el navegador (sin CORS), así que se lee aquí.
// Devuelve la forma de GET /posiciones del contrato; cuando la API de Render esté
// desplegada, la web usará la suya con VITE_API_URL y esta función dejará de usarse.
import { URLS_GTFS_RT, convertirFeed, type Feed } from "../src/api/gtfs-rt";

const ESPERA_MS = 5000;

async function leer(feed: Feed) {
  const r = await fetch(URLS_GTFS_RT[feed], { signal: AbortSignal.timeout(ESPERA_MS) });
  if (!r.ok) throw new Error(`Renfe respondió ${r.status} en ${feed}`);
  return convertirFeed(await r.json(), feed);
}

export async function GET(): Promise<Response> {
  const feeds = await Promise.allSettled([leer("avld"), leer("cercanias")]);
  const datos = feeds.flatMap((f) => (f.status === "fulfilled" ? f.value : []));
  if (feeds.every((f) => f.status === "rejected")) {
    return Response.json({ error: "No se pudo leer el tiempo real de Renfe" }, { status: 503 });
  }
  return Response.json(
    { datos, actualizado: new Date().toISOString() },
    // Renfe refresca cada 30 s: la CDN de Vercel sirve la misma respuesta a todos durante ese tiempo.
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30" } },
  );
}
