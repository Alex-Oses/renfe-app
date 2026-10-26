---
responsable: Rubén
estado: borrador
tags: [contrato, api]
---

# 🔌 Endpoints de la API

> **Fuente de verdad** entre frontend y backend. Se actualiza ANTES de implementar.
> Base URL local: `http://localhost:3000` · Auth: `Authorization: Bearer <jwt de Supabase>`

## Plantilla por endpoint

```
### METODO /ruta
Descripción:
Auth: sí/no
Request:  { ... }
Response 200: { ... }
Errores: 400 ..., 401 ..., 404 ...
Estado: propuesto | implementado | cambiado (fecha)
```

## Lista prevista (por rellenar)

| Método | Ruta | Para qué | Estado |
|---|---|---|---|
| POST | `/auth/registro` | Alta de usuario | propuesto |
| POST | `/auth/login` | Login email/contraseña | propuesto |
| POST | `/auth/cara/registrar` | Guardar embedding facial | propuesto |
| POST | `/auth/cara/verificar` | Login facial | propuesto |
| GET | `/estaciones?q=` | Autocompletar estaciones | propuesto |
| GET | `/trenes?origen=&destino=&fecha=` | Buscar trenes | propuesto |
| GET | `/trenes/:id/asientos` | Asientos disponibles (simulado) | propuesto |
| POST | `/reservas` | Crear reserva | propuesto |
| POST | `/pagos/intent` | PaymentIntent Stripe test | propuesto |
| POST | `/pagos/webhook` | Webhook de Stripe | propuesto |
| GET | `/billetes` | Mis billetes | propuesto |
| GET | `/billetes/:id/qr` | QR firmado | propuesto |
| POST | `/billetes/validar` | Revisor valida un QR | propuesto |
| POST | `/chatbot/mensaje` | Mensaje al chatbot | propuesto |
| GET | `/trenes/:tripId` | Detalle de un viaje con su retraso actual | propuesto |
| GET | `/trenes/:tripId/posicion` | Última posición conocida del tren | propuesto |
| GET | `/incidencias?feed=&linea=` | Avisos GTFS-RT | propuesto |
| GET | `/posiciones?bbox=` | Posiciones para el mapa (alternativa al Realtime) | propuesto |

> Añadidas el 2026-10-26 a partir de [`docs/arquitectura.md`](../../docs/arquitectura.md) §5. Detalle de
> request/response **sin definir**: se escribe aquí antes de implementar.
> Toda respuesta que venga de GTFS lleva `feed` (`cercanias` | `avld`).
> `/posiciones` solo existe si se descarta el Realtime de Supabase (decisión abierta en §9).
