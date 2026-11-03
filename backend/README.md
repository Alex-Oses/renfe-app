# ⚙️ backend/

Todo lo que corre en servidor. Tres piezas independientes, cada una con su responsable:

| Carpeta | Qué es | Tecnología | Responsable |
|---|---|---|---|
| [`api/`](api/README.md) | API principal: auth, búsqueda, reservas, pagos simulados, billetes QR, chatbot y `/posiciones` | NestJS (TypeScript) | **Rubén** (Stripe: Kevin) |
| [`database/`](database/README.md) | Esquema, migraciones, seeds y políticas RLS | Supabase (Postgres + pgvector) | **Marina** |
| [`gtfs-worker/`](gtfs-worker/README.md) | Importa el GTFS estático de AVE/LD; no toca GTFS-RT | Node (TypeScript) | **Marina** |

## Cómo se conectan

```
Web y app ──HTTPS+JWT──▶ api ──SQL──▶ Supabase (Postgres)
                          ├──HTTPS──▶ Gemini API (chatbot)
                          ├──HTTPS──▶ Stripe test (previsto, sin conectar)
                          └──HTTPS──▶ Renfe GTFS-RT (`/posiciones`, caché 30 s)

gtfs-worker ──COPY/upsert──▶ Supabase ◀── Renfe GTFS estático
```

- La **API es la única puerta de entrada** para los datos de negocio del frontend. El mapa usa
  `GET /posiciones`; no hay Supabase Realtime en la entrega.
- El login facial **no tiene servicio propio**: el dispositivo calcula el vector y decide Postgres (ADR-007).
- Los contratos (endpoints, tablas, eventos) están en `obsidian/02-contratos-api/` y son la fuente de verdad.
