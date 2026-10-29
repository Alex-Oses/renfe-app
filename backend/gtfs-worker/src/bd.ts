/**
 * Acceso a PostgreSQL para la importación.
 *
 * Se conecta con `pg` (la misma librería que la API) usando `DATABASE_URL`. Toda
 * la carga va en **una transacción**: o entra el feed entero o no entra nada.
 */
import pg from "pg";
import { CARGAS, ORDEN_VACIADO, type TablaCarga } from "./sql.js";

export interface Conexion {
  pool: pg.Pool;
  cliente: pg.PoolClient;
}

export async function abrir(url: string): Promise<Conexion> {
  const pool = new pg.Pool({ connectionString: url, max: 2, connectionTimeoutMillis: 5_000 });
  const cliente = await pool.connect();
  return { pool, cliente };
}

export async function cerrar(conexion: Conexion): Promise<void> {
  conexion.cliente.release();
  await conexion.pool.end();
}

export async function enTransaccion(
  conexion: Conexion,
  trabajo: () => Promise<void>,
): Promise<void> {
  await conexion.cliente.query("begin");
  try {
    await trabajo();
    await conexion.cliente.query("commit");
  } catch (error) {
    await conexion.cliente.query("rollback");
    throw error;
  }
}

/**
 * Carga una tabla en lotes. Devuelve cuántas filas ha enviado.
 *
 * El tamaño de lote por defecto (1 000) está pensado para `horarios`: 69 670
 * filas son ~70 peticiones, que en la VM tardan segundos. Para los ~2 M de
 * Cercanías habría que subir el lote o pasar a `COPY` (ver plan-ingesta-gtfs).
 */
export async function cargar<T extends object>(
  conexion: Conexion,
  tabla: TablaCarga,
  filas: T[],
  opciones: { lote?: number; progreso?: (hechas: number, total: number) => void } = {},
): Promise<number> {
  const lote = opciones.lote ?? 1_000;
  if (filas.length === 0) return 0;

  for (let i = 0; i < filas.length; i += lote) {
    const trozo = filas.slice(i, i + lote);
    await conexion.cliente.query(CARGAS[tabla], [JSON.stringify(trozo)]);
    opciones.progreso?.(Math.min(i + lote, filas.length), filas.length);
  }
  return filas.length;
}

export async function consultar<T extends pg.QueryResultRow>(
  conexion: Conexion,
  sql: string,
  valores: unknown[] = [],
): Promise<T[]> {
  const resultado = await conexion.cliente.query<T>(sql, valores);
  return resultado.rows;
}

/** Borra el catálogo de un feed en orden inverso a las claves ajenas. */
export async function vaciarFeed(conexion: Conexion, feed: string): Promise<void> {
  for (const tabla of ORDEN_VACIADO) {
    await conexion.cliente.query(`delete from public.${tabla} where feed = $1`, [feed]);
  }
}
