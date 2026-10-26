---
fecha: 2026-10-26
estado: aceptado
autor: Rubén
tags: [adr]
---

# ADR-002 — Base de la API (Nest 12, sin ORM, contrato propio)

## Contexto

El backend está vacío y hay que arrancarlo sin esperar a la base de datos. El scaffold oficial de
NestJS hoy genera **Nest 12 en ESM con Vitest y oxlint** (no Jest/ESLint), con TypeScript 6 y Vite 8.
Los horarios de GTFS son 1,9 M de filas y las consultas de búsqueda son *self-joins* que ningún ORM
va a escribir mejor. Además, Alex ya tiene un frontend con unos tipos concretos: no debe condicionar
el contrato de la API.

## Decisión

1. **Nest 12 ESM con el scaffold oficial**: Vitest + oxlint. Menos configuración que imponer Jest/ESLint.
2. **Contrato propio.** La API se diseña desde `docs/arquitectura.md`; el frontend se adapta, no al revés.
3. **Sin ORM.** `pg` + SQL para GTFS y `@supabase/supabase-js` solo para Auth.
4. **Validación de entorno al arrancar.** `src/config/entorno.ts`; en producción el proceso no levanta
   sin `CORS_ORIGINS`.
5. **Swagger en `/docs`** como documentación viva, además de `obsidian/02-contratos-api/`.
6. **`GET /health`** desde el minuto uno: lo usan Docker Compose y el CI.

## Consecuencias

- Node ≥ 22 obligatorio (el monorepo ya lo exige).
- El scaffold trae versiones muy recientes (TS 6, Vite 8): si dan guerra, bajar a Nest 11 es barato ahora.
- Sin ORM, las migraciones y el modelo de datos son de Marina; la API solo lee.
- El frontend actual necesitará cambios cuando la API devuelva datos reales (`tripId`, `feed`, retrasos).
