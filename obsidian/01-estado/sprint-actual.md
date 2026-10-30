---
sprint: final
inicio: 2026-10-27
fin: 2026-11-06
tags: [sprint]
---

# 🏁 Sprint final — Entrega el 6/11

**La entrega es el 06/11/2026** (no marzo: el calendario de 7 sprints queda obsoleto). Quedan 8 días de trabajo.

**Objetivo (actualizado el 28/10, [[ADR-005-app-movil-expo]]):** la **app móvil** (Expo, iOS y Android) es la pieza principal, con login facial y datos reales de Renfe. La web en Vercel se queda como demo y plan B.

## Reparto desde el 28/10

| Persona | Qué hace |
|---|---|
| Alex | Frontend: mejora la web, lógica común en `@renfe/shared` y app Expo en `frontend/mobile` en cuanto haya BD y facial |
| Rubén | Login facial **sin servidor Python**: dispositivo + Postgres, rutas `/auth/cara/*` en la API ([[ADR-007-reconocimiento-facial]]) |
| Marina | Base de datos: migraciones `gtfs_*`, import y Supabase en la nube |
| Kevin | Despliegue y Docker (D10 pendiente) |

## Alcance

**Entra:** app Expo (iOS y Android), login facial con el servidor Python, GTFS AVE/LD en Supabase, API en Render y web en Vercel.

**Fuera (simulado o recortado):** Stripe real, reservas en BD, chatbot, Cercanías y worker separado.

> El plan de abajo es el del 27/10 y sigue sirviendo para la API y los datos. Donde diga «Fuera: app Expo», manda lo de arriba.

## Plan

| Días | Alex | Rubén | Marina | Kevin |
|---|---|---|---|---|
| 28–29/10 | Plan en el vault ✅; web alineada con el contrato ✅ | Preparar `/estaciones` y `/trenes` | Contrato v2 y [[plan-ingesta-gtfs]] ✅; migración del catálogo + import AVE/LD | ~~CI con lint y test~~ hecha por Alex ✅; `render.yaml` listo ✅ → solo crear el servicio en Render |
| 30/10–1/11 | Conectar la web a la API real | `/estaciones` y `/trenes` contra Supabase | Supabase en la nube con datos cargados | API desplegada en Render ✅ (Alex, 27/10: https://renfe-api.onrender.com) |
| 2–3/11 | Estados vacíos/error con datos reales; mapa con `/posiciones` | `/posiciones` (GTFS-RT en memoria) | Índices y consultas lentas | Si sobra: Stripe test en el pago |
| 4/11 | **Congelación de código**: solo arreglos | ídem | ídem | ídem |
| 5/11 | Ensayo de la demo + diapositivas | Explica la API | Explica los datos | Explica despliegue y CI |

## ⚠️ Riesgo: base de datos solo en local — ✅ **CERRADO el 29/10**

Marina no está y sus migraciones no están en el repo (solo `backend/database/supabase/seed.sql`). Sin ellas no hay Supabase en la nube ni API con datos.

- **Marina:** en cuanto vuelva, subir las migraciones `gtfs_*` en una rama y abrir PR. Es lo primero, antes que el import.
- **Si el 29/10 no están:** Rubén escribe la migración mínima de `gtfs_*` a partir de [[modelo-datos]] y Alex crea el proyecto de Supabase en la nube. Marina lo revisa al volver.

> **Actualización 28/10 (Marina):** el contrato está revisado contra los ficheros reales
> ([[modelo-datos]] v2) y el plan de carga está en [[plan-ingesta-gtfs]]. La migración del catálogo
> es el siguiente paso y la tengo como prioridad. Ojo al alcance: el sprint solo necesita el feed
> `avld` (**69 670 horarios**), no los 2 M de las dos redes, así que la carga es de minutos.
> Las tablas se llaman como en el modelo (`estaciones`, `viajes`, `horarios`…): `gtfs_*` era una
> abreviatura.

> **Actualización 29/10 (Marina):** **riesgo cerrado.** Los PRs #72, #73 y #74 están mergeados,
> **Supabase Cloud creada** (`hqwwucagvlhnlqrspwvh`, eu-west-1), 4 migraciones aplicadas, catálogo
> AV/LD cargado (feed 29/10: 1 035 estaciones · 668 rutas · 8 908 viajes · 71 781 horarios) y
> `gtfs:verificar` en verde. Falta solo `DATABASE_URL` en Render (Kevin/Alex): [[supabase-nube]].

## Plan B

Si la API no está el **3/11**, se presenta con datos simulados: basta con quitar `VITE_API_URL` en Vercel y volver a desplegar (sin esa variable, la web usa sus datos simulados). Se cuenta como "arquitectura lista para datos reales".

## Demo (≈5 min)

Buscar tren → reservar asiento → pago simulado → billete con QR → entrar con la cara → mapa en directo. Diapositivas: arquitectura (`docs/arquitectura.md`) y forma de trabajo (vault + PRs + agentes).
