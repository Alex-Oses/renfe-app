---
fecha: 2026-10-26
estado: aceptado
autor: Alex
tags: [adr]
---

# ADR-001 — Stack tecnológico

> **Superado en parte (29/10/2026):** el **facial** ya no es un microservicio Python ([[ADR-007-reconocimiento-facial]]:
> vector en el dispositivo + Postgres) y el **tiempo real** no usa Supabase Realtime (snapshot en memoria
> + `GET /posiciones`). Siguen vigentes el monorepo pnpm, NestJS, Supabase, el worker GTFS, los QR
> firmados y Gemini.

## Contexto
App tipo Renfe hecha por 4 personas, con IA, en ~5 meses. Renfe solo publica datos abiertos GTFS y GTFS-RT (no hay API de reservas ni precios).

## Decisión
- **Monorepo pnpm** con tres zonas: `frontend/`, `backend/`, `obsidian/`.
- **Frontend:** Expo + React Native (iOS/Android/web), modos viajero y revisor.
- **API:** NestJS (TypeScript).
- **Base de datos:** Supabase (Postgres, Auth, pgvector, Realtime).
- **Datos Renfe:** worker Node que importa GTFS y sondea GTFS-RT.
- **Facial:** microservicio Python FastAPI + InsightFace, verificación 1:1, solo embeddings.
- **Pagos:** Stripe en modo test. Asientos, precios y reservas simulados.
- **Billetes:** QR firmado con Ed25519, validado contra la BD.
- **Chatbot:** Gemini API con function calling, modelo `gemini-3.5-flash-lite`.
- **Infra:** Docker Compose, GitHub Actions.
- **Coordinación de IAs:** vault de Obsidian dentro del repo + `AGENTS.md`.

## Consecuencias
- Todo es TypeScript salvo face-service (Python).
- Las funciones de reserva/pago son demostrativas, no reales.
