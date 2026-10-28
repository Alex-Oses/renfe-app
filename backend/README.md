# ⚙️ backend/

Todo lo que corre en servidor. Tres piezas independientes, cada una con su responsable:

| Carpeta | Qué es | Tecnología | Responsable |
|---|---|---|---|
| [`api/`](api/README.md) | API principal: auth, búsqueda, reservas, pagos, billetes QR, chatbot | NestJS (TypeScript) | **Rubén** (Stripe: Kevin) |
| [`database/`](database/README.md) | Esquema, migraciones, seeds y políticas RLS | Supabase (Postgres + pgvector + Realtime) | **Marina** |
| [`gtfs-worker/`](gtfs-worker/README.md) | Descarga GTFS de Renfe y sondea GTFS-RT para el mapa | Node (TypeScript) | **Marina** |

## Cómo se conectan

```
App (frontend) ──HTTP──▶ api ──▶ Supabase (Postgres)
      │                   ├──▶ Stripe (modo test)
      │                   └──▶ Claude API (chatbot)
      └──Realtime──▶ Supabase ◀── gtfs-worker ◀── Renfe GTFS / GTFS-RT
```

- La **API es la única puerta de entrada** para el frontend (salvo Supabase Realtime para posiciones de trenes).
- El login facial **no tiene servicio propio**: el dispositivo calcula el vector y decide Postgres (ADR-007).
- Los contratos (endpoints, tablas, eventos) están en `obsidian/02-contratos-api/` y son la fuente de verdad.
