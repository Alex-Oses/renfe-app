---
responsable: Rubén (pagos: Kevin)
tags: [area]
---

# 🧩 Área Backend (API)

**Código:** `backend/api` · **Estado:** F1 en marcha. Los 6 endpoints de datos están implementados y
mergeados; falta ejecutarlos contra la base de datos real. Los de negocio (reservas, pagos, billetes,
chatbot) siguen pendientes.

Plan completo, diagramas y caminos de petición: [`docs/arquitectura.md`](../../docs/arquitectura.md)
Contrato de cada ruta: [[endpoints]]. Esquema: [[modelo-datos]].

## Módulos

| Módulo | Responsable | Estado |
|---|---|---|
| estaciones (`GET /estaciones`) | Rubén | ✅ implementado; **pendiente de probar contra la BD real** |
| trenes (`GET /trenes`, detalle, `/posicion`) | Rubén | ✅ implementado; **pendiente de probar contra la BD real** |
| posiciones (`GET /posiciones`) | Rubén | ✅ implementado y probado contra Renfe; no usa BD |
| health (`GET /health`) | Rubén | ✅ |
| auth (Supabase + login facial) | Rubén | ✅ las 3 rutas `/auth/cara/*` con tests; **pendiente de probar contra la BD real** |
| reservas | Rubén | ⚪ |
| pagos (Stripe test) | Kevin | ⚪ |
| billetes (QR Ed25519) | Rubén | ⚪ |
| chatbot | Rubén | ⚪ |

## Datos reales que consume

Lo estático entra por `backend/gtfs-worker` a Postgres y la API solo lee. **La excepción es GTFS-RT**:
`/posiciones` descarga los 4 JSON de Renfe y los guarda en memoria, sin worker y sin BD (decisión del
27/10, ver §9 de la arquitectura).

| Dato | Fuente | Volumen medido |
|---|---|---|
| Estaciones, rutas y horarios | GTFS Cercanías (15,1 MB) + GTFS AVE/LD/MD (0,8 MB) | 2.155 paradas · ~141.000 viajes · 1,9 M horarios |
| Posiciones, retrasos e incidencias | GTFS-RT Cercanías + AVE/LD (JSON, cada 30 s) | ~460 trenes, ~460 con retraso real |

## Reglas técnicas

- La API **no llama a Renfe para datos estáticos**: si hace falta un dato nuevo del GTFS, lo importa
  el worker. GTFS-RT es la excepción (`/posiciones`), y solo en memoria.
- `feed` (`cercanias` | `avld`) en toda tabla, DTO y clave que venga de GTFS.
- Horas GTFS como segundos enteros: pueden pasar de 24:00.
- Búsqueda con índice `(stop_id, departure_seconds)`, objetivo < 150 ms.
- Precios, asientos y pagos son simulados; la tarjeta nunca pasa por la API.
- Todo cambio de endpoint, tabla o evento se escribe antes en [[endpoints]] o [[modelo-datos]].

## Decisiones abiertas

- Una estación física, una o dos en la UI (Atocha está en los dos feeds). Ver §9 de la arquitectura.

Cerrado el 29/10: las tablas van **sin prefijo** (`estaciones`, `viajes`, `horarios`…), como en
[[modelo-datos]]; la migración de Marina ya las crea así.

## Pendiente

- **Ejecutar el SQL contra la BD real.** Las 4 migraciones están en `develop` y validadas en la VM de
  Marina; falta `pnpm db:start` → `db:reset` → `gtfs:importar` y pasar
  `pnpm --filter @renfe/api test:e2e`. Runbook en `backend/api/README.md` § Base de datos.
- `/auth/registro` y `/auth/login`: sin `perfiles` no hay facial (la FK de `embeddings_faciales` va a
  `perfiles`). Hasta entonces el facial solo se prueba por los caminos de error.
- `/incidencias`: degradado sin BD (`alerts.json` no trae `headerText` ni `cause`).
- Los 6 campos del mapa de [[endpoints]] (`nombre`, `linea`, `origen`…) necesitan BD; hoy son `null`.

## Historial

- 2026-10-29 · El **rol sale de `perfiles.rol`** (el token ya no lleva `app_metadata`) y el guard
  responde `503` si la BD no está. La API lee el `.env` de la raíz. Nuevo `test/bd.e2e-spec.ts` que se
  salta sin `DATABASE_URL`. Handoff: [[2026-10-29-ruben-rol-perfiles-y-bd]].
- 2026-10-27 · `/posiciones` con retrasos reales, `paradaActual` y `GET /trenes/:feed/:tripId/posicion`
  (PR #47). Corregido el falso bloqueo del `tripId`. Handoffs: [[2026-10-27-ruben-gtfsrt-para-alex]],
  [[2026-10-27-ruben-campos-mapa-para-alex]], [[2026-10-27-ruben-gtfs-estatico-para-marina]].
- 2026-10-26 · Plan de arquitectura y verificación de fuentes de Renfe: [[2026-10-26-ruben-arquitectura-api-renfe]]
