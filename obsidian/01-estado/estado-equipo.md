---
actualizado: 2026-10-29
tags: [estado]
---

# 📊 Estado del equipo

> Cada persona (o su IA) actualiza **solo su fila** al terminar una sesión.
> Estados: 🟢 en marcha · 🟡 bloqueado/esperando · ⚪ sin empezar · ✅ hecho

| Persona | Rol | Estado | En qué está | Bloqueos | Actualizado |
|---|---|---|---|---|---|
| Alex | PO + Frontend | 🟢 | La web ya usa los datos reales de la API: buscador con `/estaciones`, resultados con `/trenes`, mapa con recorrido y paradas del GTFS estático, retraso de GTFS-RT (incluido «Sin datos») y login facial con el cuerpo del contrato. `lint`, `test` y build en verde, sin commit todavía ([[2026-10-29-alex-mapa-datos-reales]]). Además: Dependabot sin PRs, títulos de PR flexibles y revisión obligatoria de todo el equipo (3 aprobaciones, PR #81) | Para la app: BD (Marina) y facial (Rubén). El facial sigue en 1024 (Human) y el ADR pide 512 | 2026-10-29 |
| Rubén | Backend + chatbot | 🟢 | Documentación reescrita al estado real (arquitectura, READMEs y vault; la app móvil existe en `feat/mobile-app-expo`) y arreglado el arranque en local: la API y la web ya leen el `.env` de la raíz. En local: `/health` con `baseDatos: ok`, `/estaciones` y `/posiciones` en 200 y la web con datos reales ([[2026-10-29-ruben-documentacion-estado-real]]) | El puerto público lo tiene que abrir el administrador; falta preparar la migración al servidor Docker; secretos de despliegue fuera del repositorio | 2026-10-29 |
| Marina | SM + Base de datos | 🟢 | **Supabase Cloud validada**: proyecto `hqwwucagvlhnlqrspwvh` (eu-west-1), 4 migraciones con `db push`, catálogo AV/LD cargado por el session pooler y `gtfs:verificar` en verde (1 035 estaciones / 668 rutas / 8 908 viajes / 71 781 horarios, feed 29/10). Los 3 PRs (#72, #73, #74) ya están mergeados. Siguiente: `DATABASE_URL` en Render ([[supabase-nube]]) | Nada por mi parte. Render sigue en 503 hasta que Kevin/Alex pongan `DATABASE_URL` | 2026-10-29 |
| Kevin | DevOps + despliegue + Docker | 🟢 | CI revisada y en verde (excepción para Dependabot + `pnpm test:ramas`): PR **#75** abierta, `CI / ok` y `PR / reglas` ✅, falta aprobación. API viva en Render sin base de datos. Siguiente: en cuanto exista Supabase Cloud ([[supabase-nube]]) rellenar las variables de Render; y Docker (D10 de [[ADR-005-app-movil-expo]]) | `DATABASE_URL` bloqueada hasta que Marina cree Supabase Cloud | 2026-10-28 |

## Bloqueos globales
- **Historial reescrito el 27/10: todos tenéis que borrar vuestra copia y clonar de nuevo** (ver [[2026-10-27-alex-reescritura-historial-y-vercel]]).
- 🟢 **Supabase Cloud operativa desde el 29/10** (`hqwwucagvlhnlqrspwvh`, eu-west-1): esquema y catálogo AV/LD cargados y verificados. Ya no depende de la VM de Marina ([[supabase-nube]]).
- API desplegada en Render (https://renfe-api.onrender.com) **sin base de datos**: `/estaciones` y `/trenes` dan 503 hasta que se rellene `DATABASE_URL` (session pooler) en el panel de Render.
- 🟢 **La app móvil ya existe en código** (29/10): rama `feat/mobile-app-expo`, Expo SDK 58 con expo-router, EAS y `@renfe/shared`, **pendiente de mergear**; en `develop` solo hay el README. La web queda como demo y plan B ([[ADR-005-app-movil-expo]]). El facial está decidido en [[ADR-007-reconocimiento-facial]]: **sin servidor Python**, el vector lo calcula el dispositivo y la decisión la toma Postgres.

## Próximos hitos
- **Entrega final: 06/11/2026.** Congelación de código el 04/11. Plan en [[sprint-actual]].
