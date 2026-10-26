---
responsable: Marina
estado: borrador
tags: [contrato, base-datos]
---

# 🗄️ Modelo de datos (Supabase)

> Se diseña aquí y después se migra en `backend/database/migrations/`.

## Tablas previstas (por detallar)

| Tabla | Origen | Notas |
|---|---|---|
| `perfiles` | App | 1:1 con `auth.users`, rol `viajero` / `revisor` |
| `embeddings_faciales` | API (face-service) | `vector(512)`, nunca fotos |
| `estaciones` | GTFS `stops` | |
| `rutas`, `viajes`, `horarios` | GTFS `routes`, `trips`, `stop_times` | |
| `asientos` | Simulado | Generados por viaje |
| `reservas` | App | Estado: pendiente / pagada / cancelada |
| `pagos` | Stripe test | id del PaymentIntent |
| `billetes` | API | QR firmado Ed25519, estado: válido / usado |
| `validaciones` | Revisor | Quién, cuándo, resultado |
| `posiciones_trenes` | GTFS-RT | **Realtime activado** |

## Plantilla por tabla

```
### nombre_tabla
| columna | tipo | null | notas |
RLS:
Índices:
```
