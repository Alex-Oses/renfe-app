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
| GET | `/trenes/:id` | Detalle de un tren (lo pide la web al reservar) | propuesto (Alex, 2026-10-26) |
| GET | `/trenes/:id/asientos` | Asientos disponibles (simulado) | propuesto |
| POST | `/reservas` | Crear reserva | propuesto |
| POST | `/pagos/intent` | PaymentIntent Stripe test | propuesto |
| POST | `/pagos/webhook` | Webhook de Stripe | propuesto |
| GET | `/billetes` | Mis billetes | propuesto |
| GET | `/billetes/:id/qr` | QR firmado | propuesto |
| POST | `/billetes/validar` | Revisor valida un QR | propuesto |
| POST | `/chatbot/mensaje` | Mensaje al chatbot | propuesto |
| GET | `/tiempo-real/trenes` | Posiciones de trenes (GTFS-RT) para el mapa | propuesto (Alex, 2026-10-26) |

## Formas de respuesta propuestas por la web

La web (`frontend/web/src/api/tipos.ts`) ya consume estos tipos con datos simulados: `Estacion`, `Tren`, `Asiento`, `Reserva`, `IntentoPago`, `Billete`, `Sesion`, `PosicionTren`. Rubén: si te encajan, se copian aquí como contrato; si no, se cambian en `tipos.ts`.
