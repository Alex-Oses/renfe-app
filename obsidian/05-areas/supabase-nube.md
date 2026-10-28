---
responsable: Marina
estado: listo para ejecutar
fecha: 2026-10-28
tags: [area, supabase, despliegue, runbook]
para: [Marina, Alex, Kevin]
---

# ☁️ Supabase en la nube y conexión con Render

Runbook para pasar el catálogo de **local (VM) a Supabase cloud** y conectar la API de
Render. Es el paso que desbloquea `/estaciones` y `/trenes`: hoy devuelven **503** porque
el servicio no tiene `DATABASE_URL`.

Estado de partida (28/10): migración y carga AV/LD validadas en la VM, ver
[[2026-10-28-marina-importador-gtfs-avld]]. Esquema en [[modelo-datos]], plan en
[[plan-ingesta-gtfs]].

> **Nada de esto se ejecuta desde el portátil corporativo.** Se lanza en la VM
> `genai-openllm-vm` (o donde esté el repo con `pnpm install`). Para `db push` e
> importación **no hace falta Docker**: es tráfico de red a Supabase.

## 0. Requisitos previos

- [ ] Las **tres ramas mergeadas** en `develop` (si no, `db push` no ve las migraciones):
      `docs/db-contrato-feeds-reales` → `feat/db-migracion-catalogo-gtfs` →
      `feat/gtfs-importador-catalogo-avld`.
- [ ] `git checkout develop && git pull` en la VM: `backend/database/supabase/migrations/`
      tiene que contener `20261028120200_catalogo_gtfs.sql`.
- [ ] Cuenta de Supabase con organización (plan gratuito vale).
- [ ] CLI disponible: `pnpm exec supabase --version` (viene como devDependency).
- [ ] Gestor de contraseñas a mano: la contraseña de la BD **no se escribe en el repo ni en el vault**.

## 1. Crear el proyecto en la nube

En el panel de Supabase → **New project**:

| Campo | Valor | Motivo |
|---|---|---|
| Nombre | `renfe-app` | igual que `project_id` local |
| Región | **Frankfurt (eu-central-1)** | la misma que Render (`region: frankfurt` en `render.yaml`) |
| Contraseña de BD | generada, larga, guardada en el gestor | se usa en las dos URLs |

Tarda un par de minutos en aprovisionarse. Del panel, aparte, apunta:

- **Project ref** (`<ref>`): Settings → General.
- **Connection string**: botón **Connect** → pestañas *Direct* / *Session pooler* / *Transaction pooler*.

## 2. Enlazar el proyecto (una vez)

```bash
cd ~/renfe-app
pnpm install
pnpm exec supabase login                                   # abre el navegador / pide token
pnpm exec supabase link --project-ref <ref> --workdir backend/database
# pedirá la contraseña de la BD → pégala (no queda en el historial del shell)
```

`link` guarda la referencia en `backend/database/supabase/.temp/` (ignorado por Git).

## 3. Aplicar el esquema: `db push`

```bash
# 1) ver qué se va a aplicar, sin tocar nada
pnpm exec supabase db push --dry-run --workdir backend/database

# 2) comparar migraciones locales y remotas (local | remote | time)
pnpm exec supabase migration list --workdir backend/database

# 3) aplicar
pnpm exec supabase db push --workdir backend/database
```

- `db push` aplica **solo las migraciones pendientes**, en orden.
- **No ejecuta `seed.sql`** (eso solo lo hace `db reset`). Hoy `seed.sql` está vacío, pero la
  regla se mantiene: **en la nube, `db push`; nunca `db reset`** → `reset` borra la base
  entera y la recrea.

Comprobar que han entrado las 9 tablas y que RLS está activo (SQL Editor del panel):

```sql
select tablename, rowsecurity
  from pg_tables
 where schemaname = 'public'
 order by tablename;
-- 9 filas: calendario_excepciones, calendarios, embeddings_faciales, estacion_feeds,
-- estaciones, horarios, perfiles, rutas, viajes — todas con rowsecurity = true
```

## 4. Cargar el catálogo AV/LD

Usa la **conexión directa** (puerto `5432`) para la importación: es la única que permite
todo sin limitaciones y no pasa por el pooler.

```bash
export DATABASE_URL='postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:5432/postgres'

pnpm gtfs:importar --simular      # descarga y analiza, sin escribir
pnpm gtfs:importar --reemplazar   # carga real (idempotente)
```

Salida esperada (feed del 28/10):

| Tabla | Filas |
|---|---|
| `estaciones` | 1 035 |
| `estacion_feeds` | 1 008 |
| `rutas` | 663 |
| `calendarios` | 8 729 |
| `calendario_excepciones` | 31 702 |
| `viajes` | 8 729 |
| `horarios` | 69 670 |

Tamaño: del orden de **30–50 MB** (estimación), muy por debajo de los 500 MB del plan gratuito.
Tiempo: 1–3 min, casi todo red.

## 5. Validar la carga

```bash
pnpm gtfs:verificar     # mismos conteos, integridad y la consulta real de la API
```

Debe salir todo en verde y **0** en: horarios sin viaje, viajes sin horarios, origen = destino,
salida > llegada, rutas en `otro`. Además debe devolver **> 0** viajes para hoy.

Comprobación rápida en el SQL Editor:

```sql
select count(*) from estaciones;                                  -- 1035
select count(*) from viajes   where feed = 'avld';                 -- 8729
select count(*) from horarios where feed = 'avld';                 -- 69670

-- ¿hay trenes hoy? (debe ser > 0)
select count(*) from viajes v
 where v.feed = 'avld' and current_date between v.fecha_inicio and v.fecha_fin;
```

## 6. Elegir la conexión correcta (el error clásico)

| Conexión | Host / puerto | IPv4 | Para qué |
|---|---|---|---|
| **Directa** | `db.<ref>.supabase.co:5432` | **no** (solo IPv6) | migraciones e importación desde la VM |
| **Session pooler** | `...pooler.supabase.com:5432` | sí | **la API en Render** |
| **Transaction pooler** | `...pooler.supabase.com:6543` | sí | funciones serverless; no soporta sesiones largas |

Reglas prácticas:

- **Render necesita el pooler.** La conexión directa de Supabase es **IPv6** y Render no
  tiene salida IPv6: con la URL directa la API arranca pero `/health` da
  `"baseDatos": "error"` y los endpoints 503.
- Para la API, **session pooler** (puerto `5432` en el host del pooler): mantiene sesión y
  `pg` se comporta igual que contra Postgres normal. El *transaction pooler* (6543) rompe
  sentencias preparadas con nombre y `LISTEN/NOTIFY`; no lo uses con `pg.Pool` salvo que haga falta.
- Copia el host exacto del panel (**Connect → Session pooler**); la región forma parte del
  nombre (`aws-0-eu-central-1.pooler.supabase.com` para Frankfurt).
- El usuario del pooler es `postgres.<ref>`, **no** `postgres`.

## 7. Configurar `DATABASE_URL` en Render

`render.yaml` ya declara la variable (`sync: false`), así que solo hay que rellenarla:

1. Render → servicio **`renfe-api`** → **Environment**.
2. `DATABASE_URL` = cadena del **session pooler** con la contraseña real:
   `postgresql://postgres.<ref>:<PASSWORD>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`
3. Guardar → **Manual Deploy → Deploy latest commit** (o esperar al siguiente push).
4. Comprobar:
   - `https://renfe-api.onrender.com/health` → `{"estado":"ok","baseDatos":"ok",...}`
   - `https://renfe-api.onrender.com/estaciones?q=atocha&feed=avld`
   - `https://renfe-api.onrender.com/trenes?origen=<id>&destino=<id>&fecha=AAAA-MM-DD`
     (los ids tienen que existir: `select id, nombre from estaciones where nombre ilike '%atocha%';`)

Si `/health` sigue en `"error"`: prueba a añadir `?sslmode=require` a la URL y revisa que la
contraseña esté URL-encoded (los caracteres `@ : / # ?` se escapan).

## 8. Checklist final

- [ ] `supabase link` hecho contra el proyecto correcto (`migration list` muestra las locales como aplicadas)
- [ ] 9 tablas en `public` con `rowsecurity = true`
- [ ] `pnpm gtfs:importar --reemplazar` terminado sin avisos
- [ ] `pnpm gtfs:verificar` todo en verde y con viajes para hoy
- [ ] `DATABASE_URL` en Render = **session pooler** (no la directa)
- [ ] `/health` → `"baseDatos": "ok"`
- [ ] `/estaciones?q=atocha&feed=avld` devuelve datos (no 503)
- [ ] `/trenes?origen=…&destino=…&fecha=…` devuelve viajes reales
- [ ] Contraseña y claves **solo** en el gestor de contraseñas y en las variables de Render
- [ ] Proyecto despierto antes de la demo del 6/11 (el plan gratuito lo pausa por inactividad)

## 9. Errores habituales

| Síntoma | Causa | Solución |
|---|---|---|
| `db reset` en la nube | hábito del entorno local | **nunca**: borra y recrea la base. Aquí solo `db push` |
| `no migrations found` / no aplica nada | estás en una rama sin `migrations/` | `git checkout develop && git pull` |
| `Cannot find project ref` | falta `supabase link` | repetir el paso 2 con el `<ref>` correcto |
| `/health` con `"baseDatos": "error"` | URL directa (IPv6) desde Render | usar el **session pooler** |
| `prepared statement "s1" already exists` | transaction pooler (6543) | cambiar a session pooler (5432) |
| `password authentication failed` | contraseña con caracteres especiales sin escapar | URL-encode (`@` → `%40`, etc.) |
| `timeout expired` al importar | firewall/red de la VM o puerto 5432 cerrado | usar la VM; comprobar salida a `db.<ref>.supabase.co` |
| `relation "estaciones" does not exist` al importar | migraciones no aplicadas en la nube | `db push` antes de importar |
| El proyecto no responde tras unos días | pausa por inactividad del plan gratuito | entrar al panel y **Restore**; hacerlo antes de la demo |
| `db push` falla a mitad | migración con error | se aplica por migración; corregir y volver a lanzar (no editar una migración ya aplicada: crear otra) |

## 10. Credenciales: dónde sí y dónde no

- **Sí:** gestor de contraseñas del equipo · variables de entorno de Render · el `.env` local
  (que está en `.gitignore`).
- **No:** Git (ni en `.env.example`, que va sin valores) · el vault de Obsidian · handoffs ·
  capturas · mensajes del chat.
- La **`service_role key`** es equivalente a la contraseña: mismas reglas. Nunca en el
  frontend (`EXPO_PUBLIC_*` es público).
- Si una credencial se filtra: rotar la contraseña en el panel (Settings → Database → Reset
  password) y actualizar Render. El histórico de Git **no** se reescribe por esto.

## 11. Después de esto

1. **Reimportación programada**: AV/LD tiene horizonte hasta el 29/09/2027, así que basta
   semanal (cron en la VM o Supabase Cron). Ver [[plan-ingesta-gtfs]] §9.
2. **Consultas lentas**: `explain analyze` de `/trenes` y `/estaciones` contra la nube y
   añadir índice solo si sale mal. Con 8 729 viajes el plan ya es bueno; el problema
   aparecería con Cercanías (2 M de horarios), que está fuera del sprint.
3. **Cercanías**: fuera de alcance (497 paradas sin `CODIGO`).
