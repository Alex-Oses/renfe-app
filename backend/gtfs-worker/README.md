# @renfe/gtfs-worker — Datos abiertos de Renfe

**Responsable:** Marina · IA: OpenCode

> Esqueleto vacío.

## Qué hará

1. **GTFS estático** (horarios, paradas, rutas): descargarlo del portal de datos abiertos de Renfe, parsearlo e importarlo a Supabase (diario).
2. **GTFS-RT** (posiciones y retrasos en tiempo real): sondearlo cada `GTFS_RT_POLL_SECONDS` y escribir en la tabla con Realtime que usa el mapa.

URLs en `.env` (`GTFS_STATIC_URL`, `GTFS_RT_URL`). Los ficheros descargados van a `data/` (ignorado por Git).

## Estructura prevista

```
src/
├── static/     # descarga + import del GTFS
├── realtime/   # polling GTFS-RT (protobuf)
└── index.ts
```

Librerías previstas: `gtfs-realtime-bindings`, `csv-parse`, `@supabase/supabase-js`, `node-cron`.
