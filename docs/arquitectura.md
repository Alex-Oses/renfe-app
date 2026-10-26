# 🏗️ Arquitectura

```
┌────────────── frontend/ ──────────────┐
│  App Expo (viajero + revisor)         │
└───────┬───────────────────┬───────────┘
        │ HTTPS             │ Realtime (posiciones)
┌───────▼──────── backend/ ─▼───────────────────────────────┐
│  api (NestJS) ──────▶ Supabase (Postgres, Auth, pgvector) │
│   ├─▶ face-service (FastAPI + InsightFace, red interna)   │
│   ├─▶ Stripe (test)                                       │
│   └─▶ Claude API (chatbot con tool use)                   │
│  gtfs-worker ──▶ Supabase  ◀── Renfe GTFS / GTFS-RT       │
└───────────────────────────────────────────────────────────┘
┌────────────── obsidian/ ──────────────┐
│  Contratos, estado, decisiones,       │
│  handoffs (lo leen humanos e IAs)     │
└───────────────────────────────────────┘
```

## Datos reales vs simulados

| Real (datos abiertos Renfe) | Simulado |
|---|---|
| Estaciones, rutas, horarios (GTFS) | Precios |
| Posiciones y retrasos (GTFS-RT) | Asientos y ocupación |
| | Reservas y pagos (Stripe test) |

## Piezas clave

- **Billetes QR:** la API firma `{billete_id, viaje_id, usuario_id, exp}` con Ed25519. El revisor escanea, la API verifica firma **y** estado en BD, y marca el billete como usado.
- **Login facial:** la app envía la foto a la API, la API pide el embedding a face-service y lo compara con el guardado (pgvector). Solo embeddings, nunca fotos.
- **Chatbot:** Claude API con herramientas que llaman a los propios servicios (buscar trenes, ver mis billetes).

Decisiones detalladas: `obsidian/03-decisiones/`. Plan completo: https://claude.ai/artifact/2w2FZuQJhMrEuGHxAWdKfw
