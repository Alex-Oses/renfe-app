import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';

export type EstadoBd = 'ok' | 'no configurada' | 'error';

/**
 * Acceso a Postgres. Sin `DATABASE_URL` el servicio queda inerte: la API arranca
 * igual (fase F0) y los endpoints que necesiten datos responderán 503.
 */
@Injectable()
export class BdService implements OnModuleDestroy {
  private readonly pool: Pool | null;

  constructor(config: ConfigService) {
    const url = config.get<string>('DATABASE_URL');
    this.pool = url
      ? new Pool({ connectionString: url, max: 5, connectionTimeoutMillis: 2000 })
      : null;
  }

  async estado(): Promise<EstadoBd> {
    if (!this.pool) return 'no configurada';
    try {
      await this.pool.query('select 1');
      return 'ok';
    } catch {
      return 'error';
    }
  }

  consultar<T extends QueryResultRow>(
    sql: string,
    valores: unknown[] = [],
  ): Promise<QueryResult<T>> {
    if (!this.pool) throw new Error('DATABASE_URL no configurada');
    return this.pool.query<T>(sql, valores);
  }

  /**
   * Transacción de una sola conexión: reserva y emisión de billetes tienen que
   * ir juntas o no ir. Si `fn` lanza, se hace `rollback` y se propaga el error.
   */
  async transaccion<T>(fn: (cliente: PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool) throw new Error('DATABASE_URL no configurada');

    const cliente = await this.pool.connect();
    try {
      await cliente.query('begin');
      const resultado = await fn(cliente);
      await cliente.query('commit');
      return resultado;
    } catch (error) {
      await cliente.query('rollback').catch(() => undefined);
      throw error;
    } finally {
      cliente.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }
}
