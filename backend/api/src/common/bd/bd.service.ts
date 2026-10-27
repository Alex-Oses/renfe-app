import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, type QueryResult, type QueryResultRow } from 'pg';

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

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }
}
