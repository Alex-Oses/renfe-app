# ⚙️ backend/

Todo lo que corre en servidor. Tres piezas independientes, cada una con su responsable:

| Carpeta | Qué es | Tecnología | Responsable |
|---|---|---|---|
| [`api/`](api/README.md) | API principal: auth (contraseña y cara), estaciones, trenes, posiciones, reservas, billetes, abonos y chatbot | NestJS (TypeScript) | **Rubén** |
| [`database/`](database/README.md) | Esquema, migraciones, seeds y políticas RLS | Supabase (Postgres 17 + pgvector) | **Marina** |
| [`gtfs-worker/`](gtfs-worker/README.md) | Import del GTFS **estático** de Renfe (job, no servicio) | Node (TypeScript) | **Marina** |

## Cómo se conectan

```
Web / App ──HTTPS+JWT──▶ API ──SQL──▶ Supabase (Postgres)
                          ├──HTTPS──▶ Gemini (chatbot)
                          └──HTTPS──▶ Renfe GTFS-RT (4 JSON cada 30 s, en memoria)

gtfs-worker ──COPY/upsert──▶ Supabase ◀── Renfe GTFS estático
```

- La **API es la única puerta de entrada** para el frontend. No hay Supabase Realtime: el mapa usa
  `GET /posiciones`.
- El login facial **no tiene servicio propio**: el dispositivo calcula el vector y decide Postgres
  (ADR-007). No hay `backend/face-service` ni código Python.
- Los pagos son simulados: no hay Stripe ni módulo `/pagos`.
- Los contratos (endpoints, tablas, eventos) están en `obsidian/02-contratos-api/` y son la fuente de verdad.
