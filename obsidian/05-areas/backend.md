---
responsable: Rubén (pagos y face-service: Kevin)
tags: [area]
---

# ⚙️ Área Backend (API)

**Código:** `backend/api` · **Estado:** planificado (NestJS pendiente: `nest new`)

Plan completo, diagramas y caminos de petición: [`docs/arquitectura.md`](../../docs/arquitectura.md)

## Módulos

| Módulo | Responsable | Estado |
|---|---|---|
| auth (Supabase + login facial) | Rubén | ⚪ |
| trenes (búsqueda, detalle, incidencias, posiciones) | Rubén | ⚪ |
| reservas | Rubén | ⚪ |
| pagos (Stripe test) | Kevin | ⚪ |
| billetes (QR Ed25519) | Rubén | ⚪ |
| chatbot (Claude *tool use*) | Rubén | ⚪ |

## Datos reales que consume

Todo entra por `backend/gtfs-worker`; la API solo lee Postgres. Detalle en §2 y §4 de la arquitectura.

| Dato | Fuente | Volumen medido |
|---|---|---|
| Estaciones, rutas y horarios | GTFS Cercanías (15,1 MB) + GTFS AVE/LD/MD (0,8 MB) | 2.155 paradas · 141.000 viajes · 1,9 M horarios |
| Posiciones, retrasos e incidencias | GTFS-RT Cercanías + AVE/LD (JSON, cada 30 s) | ~540 trenes |

## Reglas técnicas

- La API **no llama a Renfe**. Si hace falta un dato nuevo, lo importa el worker.
- `feed` (`cercanias` | `avld`) en toda tabla, DTO y clave que venga de GTFS.
- Horas GTFS como segundos enteros: pueden pasar de 24:00.
- Búsqueda con índice `(stop_id, departure_seconds)`, objetivo < 150 ms.
- Precios, asientos y pagos son simulados; la tarjeta nunca pasa por la API.
- Todo cambio de endpoint, tabla o evento se escribe antes en [[endpoints]] o [[modelo-datos]].

## Decisiones abiertas

- Una estación física, una o dos en la UI (Atocha está en los dos feeds). Ver §9 de la arquitectura.
- Tiempo real: worker + Supabase Realtime ([[ADR-001-stack-tecnologico]]) o caché en memoria en la API.

## Pendiente

- `nest new` en `backend/api`.
- Rellenar [[endpoints]]: 4 rutas propuestas sin detallar y el campo `feed`.
- ADR-002: el worker como única entrada de datos Renfe.

## Historial

- 2026-10-26 — Plan de arquitectura y verificación de fuentes de Renfe: [[2026-10-26-ruben-arquitectura-api-renfe]]
