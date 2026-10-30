---
fecha: 2026-10-29
autor: Marina (IA: OpenCode)
area: database
para: [Alex, Rubén, Kevin]
rama: docs/vault-supabase-cloud-validada
pr: pendiente de abrir (solo documentación)
tags: [handoff, supabase, despliegue, base-datos]
estado: abierto
---

# Handoff — Supabase Cloud validada: catálogo AV/LD en la nube

## Qué se hizo

**Supabase Cloud está operativa y con datos reales.** El catálogo AV/LD ya no vive solo en la
VM de Marina.

| Paso | Estado |
|---|---|
| `supabase link` contra el proyecto | ✅ |
| `supabase db push` (4 migraciones) | ✅ |
| Catálogo AV/LD cargado | ✅ |
| `pnpm gtfs:verificar` | ✅ todo en verde |
| `DATABASE_URL` en Render | ⬜ **pendiente (Kevin/Alex)** |

### Datos del proyecto

| Dato | Valor |
|---|---|
| Proyecto | `renfe-app` |
| **Project-ref** | `hqwwucagvlhnlqrspwvh` (no es secreto) |
| Región | **eu-west-1 (Irlanda)**, deducida del IPv6 `2a05:d018:…`; manda el panel si dice otra |
| Host del session pooler | `aws-0-eu-west-1.pooler.supabase.com:5432` |
| Usuario del pooler | `postgres.hqwwucagvlhnlqrspwvh` |
| Migraciones aplicadas | 4: `extensiones_y_funciones`, `identidad`, `catalogo_gtfs`, `reconocimiento_facial` |

La **contraseña y la cadena completa con password no están en este vault**: están en el gestor
de contraseñas. Aquí solo consta el `<ref>`, que no da acceso.

### Conteos (feed del 29/10; Renfe republica a diario)

| Tabla | Nube (29/10) | VM (28/10) |
|---|---|---|
| `estaciones` | 1 035 | 1 035 |
| `estacion_feeds` | 1 008 | 1 008 |
| `rutas` | **668** | 663 |
| `calendarios` | **8 908** | 8 729 |
| `calendario_excepciones` | **31 991** | 31 702 |
| `viajes` | **8 908** | 8 729 |
| `horarios` | **71 781** | 69 670 |

Las diferencias son del feed, no de la carga: `gtfs:verificar` compara contra el baseline del
28/10 con **±10 %** a propósito. Sigue exigiendo 0 rutas en `otro`, 0 huérfanos y 0 viajes con
salida > llegada, y que haya viajes para hoy.

### Gotcha importante: la conexión directa es solo IPv6

`db.hqwwucagvlhnlqrspwvh.supabase.co` **solo publica registro AAAA**
(`2a05:d018:cb1:bb00:70fa:c173:b01e:1672`). La VM Azure no tiene salida IPv6 → `pg` falla con
`connect ENETUNREACH`. `supabase db push` sí funcionó porque el CLI cae al pooler por su cuenta.

**Solución aplicada: session pooler para todo** (importación incluida). El importador **no
necesitó ningún cambio**: `pg` lee `sslmode` de la URL y el pooler en modo sesión mantiene la
transacción única de la carga. **No usar el transaction pooler (6543)**.

## Qué queda

1. **Render (Kevin/Alex)** — es lo único que falta para desbloquear a todo el equipo:
   - servicio `renfe-api` → **Environment** → `DATABASE_URL`:
     ```
     postgresql://postgres.hqwwucagvlhnlqrspwvh:<PASSWORD>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
     ```
     (contraseña por el gestor de contraseñas, URL-encoded si tiene caracteres especiales;
     si falla el certificado, `?sslmode=no-verify`)
   - `SUPABASE_JWT_SECRET` = JWT secret del proyecto (Settings → API)
   - Guardar → Render redespliega solo → comprobar `/health`:
     `"baseDatos":"no configurada"` → **`"baseDatos":"ok"`**
   - Luego `/estaciones?q=atocha&feed=avld` y `/trenes?origen=…&destino=…&fecha=…`
   - Detalle paso a paso en [[supabase-nube]]
2. **Rubén**: en cuanto Render tenga BD, las 3 rutas `/auth/cara/*` ya se pueden probar de verdad.
3. **`explain analyze`** de `/trenes` y `/estaciones` contra la nube; índice solo si hace falta.
4. **Reimportación semanal programada** (AV/LD tiene horizonte hasta 29/09/2027).
5. **Fuera de alcance**: Cercanías (497 paradas sin `CODIGO`), `posiciones_trenes`, Stripe.

## Bloqueos / preguntas para otros

- **Kevin / Alex:** nadie más puede usar la BD hasta que `DATABASE_URL` esté en Render. Los
  valores exactos están arriba; la contraseña, por canal privado o gestor, **no por el vault**.
- **Ojo con la rama de Render:** sirve `main`. El esquema de BD ya es el nuevo, pero los
  endpoints que solo están en `develop` (p. ej. `/trenes/:feed/:tripId`) no aparecerán hasta el
  cierre de sprint.
- **Rubén:** si cambias `SERVICIO_ACTIVO` en `backend/api/src/common/gtfs/sql.ts`, cámbialo
  también en `backend/gtfs-worker/src/verificar.ts` (está copiado a propósito).
- **Plan gratuito:** el proyecto se pausa por inactividad. Antes de la demo del 6/11, entrar al
  panel y comprobar que está despierto.

## Cambios en contratos

Ninguno. El esquema en la nube es exactamente el de [[modelo-datos]] (las 4 migraciones ya
mergeadas en `develop`: PRs #72, #73 y #74, más la facial de Rubén).

## Ficheros tocados

- `obsidian/05-areas/supabase-nube.md` — reescrito con el estado real, el project-ref, el host
  del pooler, el gotcha IPv6, los conteos del 29/10 y los pasos de Render + `/health`
- `obsidian/05-areas/base-datos.md` — estado «nube validada» y pendientes actualizados
- `obsidian/01-estado/estado-equipo.md` — mi fila y los bloqueos globales de BD
- `obsidian/04-handoffs/2026-10-29-marina-supabase-cloud.md` — este handoff
