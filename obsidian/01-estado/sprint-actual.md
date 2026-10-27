---
sprint: final
inicio: 2026-10-27
fin: 2026-11-06
tags: [sprint]
---

# 🏁 Sprint final — Entrega el 6/11

**La entrega es el 06/11/2026** (no marzo: el calendario de 7 sprints queda obsoleto). Quedan 8 días de trabajo.

**Objetivo:** demo con **horarios y posiciones reales de Renfe** en la web publicada. Todo lo demás, simulado.

## Alcance

**Entra:**
- GTFS estático AVE/LD importado en Supabase (`gtfs_*`).
- API: `/estaciones`, `/trenes` contra Supabase y `/posiciones` leyendo GTFS-RT en memoria cada 30 s (sin worker).
- Web en Vercel apuntando a la API en Render con `VITE_API_URL`.
- Login facial en el navegador (ya hecho).

**Fuera (simulado o recortado):** Stripe real, reservas en BD, QR firmado, revisor, chatbot, Cercanías, worker separado, Docker, app Expo.

## Plan

| Días | Alex | Rubén | Marina | Kevin |
|---|---|---|---|---|
| 28–29/10 | Plan en el vault ✅; web alineada con el contrato ✅ | Preparar `/estaciones` y `/trenes` | Migración solo de `gtfs_*` + import AVE/LD | ~~CI con lint y test~~ hecha por Alex ✅; `render.yaml` listo ✅ → solo crear el servicio en Render |
| 30/10–1/11 | Conectar la web a la API real | `/estaciones` y `/trenes` contra Supabase | Supabase en la nube con datos cargados | API desplegada en Render |
| 2–3/11 | Estados vacíos/error con datos reales; mapa con `/posiciones` | `/posiciones` (GTFS-RT en memoria) | Índices y consultas lentas | Si sobra: Stripe test en el pago |
| 4/11 | **Congelación de código**: solo arreglos | ídem | ídem | ídem |
| 5/11 | Ensayo de la demo + diapositivas | Explica la API | Explica los datos | Explica despliegue y CI |

## ⚠️ Riesgo: base de datos solo en local

Marina no está y sus migraciones no están en el repo (solo `backend/database/supabase/seed.sql`). Sin ellas no hay Supabase en la nube ni API con datos.

- **Marina:** en cuanto vuelva, subir las migraciones `gtfs_*` en una rama y abrir PR. Es lo primero, antes que el import.
- **Si el 29/10 no están:** Rubén escribe la migración mínima de `gtfs_*` a partir de [[modelo-datos]] y Alex crea el proyecto de Supabase en la nube. Marina lo revisa al volver.

## Plan B

Si la API no está el **3/11**, se presenta con datos simulados: basta con quitar `VITE_API_URL` en Vercel y volver a desplegar (sin esa variable, la web usa sus datos simulados). Se cuenta como "arquitectura lista para datos reales".

## Demo (≈5 min)

Buscar tren → reservar asiento → pago simulado → billete con QR → entrar con la cara → mapa en directo. Diapositivas: arquitectura (`docs/arquitectura.md`) y forma de trabajo (vault + PRs + agentes).
