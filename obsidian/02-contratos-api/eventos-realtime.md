---
responsable: Marina
estado: borrador
tags: [contrato, realtime]
---

# 📡 Eventos en tiempo real

| Canal / tabla | Quién escribe | Quién escucha | Payload |
|---|---|---|---|
| `posiciones_trenes` | gtfs-worker | App (mapa) | `{ viaje_id, lat, lon, retraso_seg, actualizado }` (borrador) |
| `billetes` (UPDATE estado) | API | App (mis billetes) | por definir |
