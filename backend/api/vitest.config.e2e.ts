import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { defineConfig } from 'vitest/config';

// El `.env` está en la raíz del monorepo y `test:e2e` corre en `backend/api`.
// Solo se carga si el shell no trae ya `DATABASE_URL` (lo del shell manda).
if (!process.env.DATABASE_URL && existsSync('../../.env')) loadEnvFile('../../.env');

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
