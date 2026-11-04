---
actualizado: 2026-11-03
autor: Rubén (con OpenCode)
estado: actualizado
tags: [arquitectura, docs]
---

# 🧭 Arquitectura

> Documento de referencia. Si el código y este documento discrepan, se avisa antes de cambiar nada:
> el contrato (`obsidian/02-contratos-api/`) y estas reglas mandan hasta que un ADR diga lo contrario.

## 1. Vista general

```
                     ┌──────────────────────────────┐
                     │  RENFE · datos abiertos      │
                     │  GTFS estático · GTFS-RT     │
                     │  licencia CC BY 4.0          │
                     └──────────────┬───────────────┘
                                    │
                 ┌──────────────────┴─────────────────┐
                 │ GTFS estático                      │ GTFS-RT
                 ▼                                    ▼
      ┌────────────────────────┐          ┌──────────────────────┐
      │ gtfs-worker (Node)     │          │ API /posiciones      │
      │ import AVE/LD (manual) │          │ caché en memoria 30 s│
      └───────────┬────────────┘          └──────────┬───────────┘
                  │ COPY/upsert                      │
                  ▼                                  │
      ┌────────────────────────┐                     │
      │ Supabase Postgres/Auth │                     │
      │ pgvector               │                     │
      └───────────┬────────────┘                     │
                  │ SQL                              │
                  ▼                                  ▼
      ┌─────────────────────────────────────────────────┐
      │ API NestJS :3000                                │
      │ auth · trenes · reservas · billetes · abonos    │
      │ chatbot · /posiciones                           │
      └───┬──────────────┬───────────────────┬──────────┘
          │HTTPS         │HTTPS              │HTTPS + JWT
          ▼              ▼                   ▼
      Stripe         Gemini API         Web Vite + app Expo
      (previsto)     (chatbot)          @renfe/shared
```

Piezas y responsabilidad:

| Pieza                                      | Responsable | Qué hace                                        | Qué NO hace                           |
| ------------------------------------------ | ----------- | ----------------------------------------------- | ------------------------------------- |
| `frontend/web` (React + Vite)              | Alex        | Web de viajero, cuenta, abonos, mapa, revisor y contenido | No habla con Renfe ni con Postgres    |
| `frontend/mobile` (Expo)                   | Alex        | App viajero/revisor; calcula el vector facial en el dispositivo | No habla con Renfe ni con Postgres    |
| `frontend/shared`                          | Alex        | Cliente, tipos, simulados y contenido común | No tiene UI ni acceso directo a la BD |
| `backend/api` (NestJS)                     | Rubén       | REST para la app; cachea GTFS-RT en `/posiciones` | No importa GTFS estático ni cobra     |
| `backend/gtfs-worker` (Node)               | Marina      | Importa el GTFS estático de AVE/LD              | No toca GTFS-RT ni atiende usuarios   |
| Supabase (Postgres/Auth/pgvector)          | Marina      | Datos, sesiones, embeddings y decisión del login facial | No expone tablas de negocio a la app  |
| Stripe (test, previsto)                    | Kevin       | Pago de prueba cuando se conecte                | No está conectado en la demo actual   |
| Gemini API                                 | Rubén       | Chatbot con *tool use*                          | No tiene acceso directo a la BD       |

## 2. Fuentes de datos reales

Verificado el 2026-10-26. Todo es **datos abiertos de Renfe, CC BY 4.0** (atribución obligatoria en la app).

| Dato | Fuente | Volumen medido |
|---|---|---|
| Estaciones, rutas y horarios de **Cercanías** | `https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip` | 15,1 MB · 1.147 paradas · 271 rutas · 132.334 viajes · 1.826.757 horarios · 450 calendarios · 19 transbordos · 123.734 puntos de trazado |
| Estaciones, rutas y horarios de **AVE / Larga y Media Distancia** | `https://ssl.renfe.com/gtransit/Fichero_AV_LD/google_transit.zip` | 0,8 MB · 1.008 paradas · 663 rutas · 8.681 viajes · 68.829 horarios · 8.681 calendarios · 32.137 excepciones · **sin trazados ni transbordos** |
| Posiciones en vivo de Cercanías | `https://gtfsrt.renfe.com/vehicle_positions.json` (también `.pb`) | ~133 KB · **348 trenes** |
| Retrasos de Cercanías | `https://gtfsrt.renfe.com/trip_updates.json` | ~142 KB · 349 viajes |
| Posiciones en vivo de AVE/LD/MD | `https://gtfsrt.renfe.com/vehicle_positions_LD.json` | ~65 KB · **192 trenes** |
| Retrasos de AVE/LD/MD | `https://gtfsrt.renfe.com/trip_updates_LD.json` | ~50 KB · 207 viajes |
| Incidencias y avisos | `https://gtfsrt.renfe.com/alerts.json` | ~99 KB · 69 avisos |
| Catálogo de datasets (metadatos) | `https://data.renfe.com/api/3/action/package_search` (CKAN) | 44 datasets |

Comportamiento observado de los endpoints GTFS-RT:

- **Sin CORS** (`Access-Control-Allow-Origin` ausente) → la build **web** de Expo no puede llamarlos.
- **Sin compresión** → cada petición viaja en crudo.
- `Cache-Control: max-age=30, public` → ellos esperan un sondeo cada 30 s.
- No publican límite de peticiones: la API reintenta con *backoff* y conserva la última copia válida.

**No existe** API pública de búsqueda con precios, disponibilidad, reserva ni pago. Los endpoints internos
de `renfe.com` y su app no están documentados y su uso va contra sus condiciones: **no se usan**.

## 3. Qué es real y qué es simulado

| Real (datos abiertos Renfe) | Simulado |
|---|---|
| Estaciones, rutas, horarios (GTFS) | Precios |
| Posiciones, retrasos e incidencias (GTFS-RT) | Asientos y ocupación |
| | Reservas y pagos (simulados; Stripe test previsto) |

## 4. Ingesta (gtfs-worker)

```
        IMPORT MANUAL
        ─────────────
   descarga ZIP AVE/LD + estaciones.csv
          │
   parsea ~70 k horarios del feed
          │
   COPY/upsert a gtfs_* (30-60 s)
          ▼
   estaciones, rutas, viajes, horarios, calendario
```

El worker solo importa GTFS estático de AVE/LD; Cercanías y el cron diario quedan fuera del sprint.
**No** sondea GTFS-RT: de eso se encarga la API (`/posiciones`), que cachea las cuatro fuentes en
memoria.

Reglas del worker:

- **Idempotente**: reimportar el mismo día no duplica nada (upsert por clave natural + `feed`).
- **Atómico**: se importa en tablas temporales y se intercambian, para no servir horarios a medias.
- **Degradable**: si Renfe falla, se conserva la última importación válida y se registra el error.
- **Nunca** escribe en las tablas de negocio (`reservas`, `billetes`…).

## 5. Camino de una petición

### 5.1 Buscar trenes (sin salir a internet)

```
 App                    API NestJS                        Postgres
  │  GET /trenes?origen=60000&destino=60001&fecha=2026-11-02
  │  Authorization: Bearer <jwt de la API>
  ├──────────────────────▶│
  │                       │ 1. AuthGuard: firma y expiración del JWT
  │                       │ 2. DTO: fecha válida, origen ≠ destino
  │                       │ 3. SQL: servicios activos ese día
  │                       │      ⨝ viajes ⨝ horarios(origen) ⨝ horarios(destino)
  │                       │      WHERE seq_origen < seq_destino
  │                       ├──────────────────────────────────▶│
  │                       │◀──────────────────────────────────│ 15-40 ms
  │                       │ 4. LEFT JOIN rt_retrasos
  │                       │ 5. DTO: viaje, línea, sale, llega, retraso
  │◀──────────────────────│
  │ 200 · objetivo < 150 ms
  │ 6. pinta resultados
```

Si Renfe está caída, esta petición sigue funcionando: solo se pierden los retrasos.

### 5.2 Comprar, QR y validar

```
1  POST /reservas         → API crea la reserva pagada simulada y sus billetes
2  La API firma un QR Ed25519 por pasajero (sin Stripe en la demo)
3  GET /billetes          → app pinta el QR
4  POST /billetes/validar → revisor escanea → API verifica firma + estado en BD → "usado"

El flujo Stripe (PaymentIntent + webhook) sigue previsto en modo test, pero no está conectado en la demo.
```

### 5.3 Tiempo real

```
API /posiciones ──lee/cachea 30 s──▶ GTFS-RT de Renfe
       ▲
       │ GET (HTTPS)
  web y app (mapa)
```

La entrega usa caché en memoria de la API, no el worker con Realtime (decisión del 27/10). Ir
directo a Renfe desde cada cliente costaría ~24 MB/hora por usuario.

### 5.4 Login facial y chatbot

```
Login facial   dispositivo: web (Human + ArcFace) o app (SCRFD + ArcFace ONNX) → vector de 512
               POST /auth/cara/verificar → API → verificar_cara() en Postgres
               → similitud coseno ≥ umbral de config_cara → JWT de la API
               (la foto no sale del dispositivo y no se guarda nunca; ver ADR-007)

Chatbot        POST /chatbot/mensaje → API → Gemini API (function calling)
               → Gemini consulta herramientas internas → respuesta en lenguaje natural
```

## 6. Reglas de arquitectura (no negociables)

1. **Datos Renfe:** el worker importa GTFS estático y la API cachea GTFS-RT; la app no llama a Renfe.
2. **La app solo conoce** su URL de API. Nada de Postgres, Stripe secreto ni Renfe.
3. **El contrato manda.** Endpoint, tabla o evento nuevo → se escribe en `obsidian/02-contratos-api/`
   *antes* del código.
4. **Postgres es la memoria de negocio.** Las posiciones GTFS-RT pueden cachearse en la API.
5. **La tarjeta no toca el backend.** Cuando se conecte Stripe, la API solo manejará `PaymentIntent`
   y webhooks; la demo actual no cobra.
6. **Nada de secretos en el vault ni en el repo.** Solo `.env.example`.
7. **Precios, asientos y pagos son simulados.** Cualquier pantalla que los enseñe debe decirlo.

## 7. Trampas conocidas de los datos

| # | Trampa | Qué hacer |
|---|---|---|
| 1 | Cercanías y AVE/LD son **dos feeds separados**: posiciones y retrasos en ficheros distintos | Guardar columna `feed` en todas las tablas y sondear los 4 JSON |
| 2 | Los `tripId` de AVE/LD llevan la fecha pegada (`3560412026-10-24`) | **No quitar nada**: el `trip_id` de `trips.txt` la lleva igual (comprobado el 27/10 con el fichero real). Cada `trip_id` es un viaje de un día |
| 3 | 1,8 M filas de horarios | `COPY`, nunca `INSERT` fila a fila |
| 4 | Horas GTFS pueden pasar de 24:00 (tren de las 25:10) | Guardar segundos enteros, no tipo `time` |
| 5 | Cercanías no trae `pickup_type` / `drop_off_type` | No se puede filtrar paradas técnicas por campo; en AVE sí vienen |
| 6 | La misma estación física tiene `stop_id` distinto en cada feed (Atocha) | Decidir si la app ve una estación o dos (ver §9) |
| 7 | AVE/LD no trae `shapes` | Trazado de línea solo para Cercanías; AVE se dibuja con puntos |
| 8 | Renfe regenera el estático a diario | Import diario idempotente, nunca `INSERT` a pelo |

## 8. Rendimiento y límites

| Aspecto | Medida |
|---|---|
| Import completo | 30-60 s con `COPY` |
| Búsqueda de trenes | objetivo < 150 ms (índice `(stop_id, departure_seconds)`) |
| Vuelta de GTFS-RT | 4 peticiones ≈ 440 KB cada 30 s |
| Trenes en vivo | ~540 (348 Cercanías + 192 AVE/LD) |
| Coste de ir directo a Renfe desde la app | ~24 MB/hora por usuario, sin compresión y sin CORS en web |
| Caché | La API guarda GTFS-RT 30 s en memoria; no hace falta Redis ni una tabla de posiciones |

## 9. Decisiones abiertas

| Decisión | Opciones | Recomendación |
|---|---|---|
| Estaciones entre feeds | Una estación lógica con dos `stop_id` / dos estaciones | Una sola en la UI (evita "Atocha" duplicada) |
| Tiempo real | Worker → tabla + Realtime (ADR-001) / caché en memoria en la API | **Decidido (27/10): caché en memoria en la API** para la entrega, sin worker; el worker + Realtime queda fuera de alcance |
| Transbordos | Fuera de alcance en fase 1 / implementar routing | Fuera: solo `transfers.txt` de Cercanías, +1 semana |
| Atribución CC BY | Créditos en la app | Obligatoria en Ajustes/Acerca de |

Ninguna de estas está cerrada salvo la de tiempo real, que se resolvió el 27/10 a favor de la caché
en memoria para la entrega. Si se decide otra, va a `obsidian/03-decisiones/` (ADR-002).

## 10. Alcance inicial por sprint (histórico)

> Plan de la entrega inicial; el estado real, con sus límites, está en el README raíz y en los READMEs de área.

| Pieza | Quién | Estimación |
|---|---|---|
| API NestJS base + auth Supabase + guards/roles | Rubén | 3-4 días |
| Import GTFS estático (2 feeds, idempotente) | Marina | 4-6 días |
| Worker GTFS-RT (4 JSON + Realtime) | Marina | 2-3 días |
| `/estaciones`, `/trenes`, detalle + retrasos, `/posiciones`, `/incidencias` | Rubén | 6-7 días |
| Reservas + pagos + QR + chatbot | Rubén / Kevin | 10-15 días |

MVP enseñable (búsqueda directa + mapa + reserva simulada): **~4-5 semanas** de una persona.

## 11. Fuera de alcance

- Precios, aforo y disponibilidad reales (no existen).
- API privada de `renfe.com` (no documentada, anti-bot, contra sus condiciones).
- Transbordos en fase 1.
- Historial de posiciones más allá de lo que quepa en la tabla (no hay requisito).
- App nativa con polls directos a Renfe.

## 12. Enlaces

- Plan original del proyecto (claude.ai): https://claude.ai/artifact/2w2FZuQJhMrEuGHxAWdKfw
- Decisiones: `obsidian/03-decisiones/ADR-001-stack-tecnologico.md`
- Contrato de endpoints: `obsidian/02-contratos-api/endpoints.md`
- Modelo de datos: `obsidian/02-contratos-api/modelo-datos.md`
- Eventos en tiempo real: `obsidian/02-contratos-api/eventos-realtime.md`
- Flujo de trabajo Git: `docs/flujo-trabajo.md`
