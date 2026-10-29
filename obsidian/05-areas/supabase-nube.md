---
responsable: Marina
estado: nube validada (pendiente Render)
fecha: 2026-10-29
tags: [area, supabase, despliegue, runbook]
para: [Marina, Alex, Kevin]
---

# ☁️ Supabase en la nube y conexión con Render

Runbook para pasar el catálogo de **local (VM) a Supabase Cloud** y conectar la API de Render.

> **Estado 29/10: la nube está lista.** Proyecto creado, `link` hecho, `db push` con las
> **4 migraciones** aplicado, catálogo AV/LD cargado y `pnpm gtfs:verificar` **en verde**.
> Lo único que falta es poner `DATABASE_URL` en Render (Kevin/Alex): hoy `/health` sigue
> devolviendo `"baseDatos":"no configurada"` y `/estaciones` da 503.

## Estado actual de la nube

| Dato | Valor |
|---|---|
| Proyecto | `renfe-app` |
| **Project-ref** | `hqwwucagvlhnlqrspwvh` (no es secreto: puede ir en el vault) |
| Región | **eu-west-1 (Irlanda)** — deducida del registro IPv6 `2a05:d018:…`; el panel manda si dice otra |
| Host del **session pooler** | `aws-0-eu-west-1.pooler.supabase.com:5432` (si el panel muestra prefijo `aws-1`, usar ese) |
| Usuario | `postgres.hqwwucagvlhnlqrspwvh` |
| Migraciones aplicadas | **4**: `extensiones_y_funciones`, `identidad`, `catalogo_gtfs`, `reconocimiento_facial` |
| Catálogo AV/LD | **cargado y verificado** (conteos abajo) |
| Contraseña / cadena con password | **solo** en el gestor de contraseñas y en Render. Nunca en Git ni en el vault |

Conteos en la nube tras la carga (**feed del 29/10**; Renfe republica a diario, por eso
suben respecto al 28/10):

| Tabla | 29/10 (nube) | 28/10 (VM) |
|---|---|---|
| `estaciones` | 1 035 | 1 035 |
| `estacion_feeds` | 1 008 | 1 008 |
| `rutas` | **668** | 663 |
| `calendarios` | **8 908** | 8 729 |
| `calendario_excepciones` | **31 991** | 31 702 |
| `viajes` | **8 908** | 8 729 |
| `horarios` | **71 781** | 69 670 |

`gtfs:verificar` tolera ±10 % sobre el baseline del 28/10 a propósito: el feed cambia cada
día y una desviación del 2–3 % es normal. Lo que **no** tolera es 0 en `otro`, huérfanos o
viajes con salida > llegada.

## ⚠️ El gotcha: la conexión directa es solo IPv6

La VM Azure no tiene salida IPv6, y la conexión directa de Supabase **solo publica registro
AAAA**. Comprobado por DNS:

| Host | IPv4 (A) | IPv6 (AAAA) |
|---|---|---|
| `db.hqwwucagvlhnlqrspwvh.supabase.co` | **ninguna** | `2a05:d018:cb1:bb00:70fa:c173:b01e:1672` |
| `aws-0-eu-west-1.pooler.supabase.com` | 52.209.89.87, 108.128.216.176, 34.241.16.247 | ninguna |

Por eso `pg` falla con `connect ENETUNREACH` y, en cambio, `supabase db push` funciona (el CLI
cae al pooler por su cuenta). **Solución: session pooler para todo**, importación incluida.
El importador **no necesita ningún cambio**: `pg` lee el `sslmode` de la propia URL.

## Cadena de conexión que se usa

```
postgresql://postgres.hqwwucagvlhnlqrspwvh:<PASSWORD>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
```

- Cambian respecto a la directa: **host** (`...pooler.supabase.com`) y **usuario**
  (`postgres.<ref>`). El **puerto sigue 5432** y la base sigue siendo `postgres`.
- **No usar el transaction pooler (6543)**: no da sesión estable y el importador carga en una
  sola transacción de ~70 lotes. Tampoco en Render.
- Contraseña **URL-encoded** si tiene caracteres especiales (`@`→`%40`, `:`→`%3A`, `/`→`%2F`,
  `#`→`%23`, `?`→`%3F`).
- Si salta `self-signed certificate in certificate chain`, cambiar a `?sslmode=no-verify`.
- La misma cadena vale para el importador y para Render.

## Cómo se hizo (por si hay que repetirlo)

1. **Crear el proyecto** en el panel (nombre `renfe-app`, región eu-west-1). Contraseña al gestor.
2. **Enlazar**: `pnpm exec supabase link --project-ref hqwwucagvlhnlqrspwvh --workdir backend/database`.
3. **Aplicar esquema**: `db push --dry-run` y luego `db push`. **Nunca `db reset`** en la nube.
   Deben entrar **4 migraciones** (las 3 del catálogo + la facial de Rubén).
4. **Comprobar RLS** (SQL Editor):
   ```sql
   select tablename, rowsecurity from pg_tables
    where schemaname = 'public' order by tablename;   -- todas con rowsecurity = true
   ```
5. **Cargar el catálogo** con `DATABASE_URL` = session pooler:
   ```bash
   read -rs PGPASSWORD && export PGPASSWORD
   export DATABASE_URL="postgresql://postgres.hqwwucagvlhnlqrspwvh:${PGPASSWORD}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"
   pnpm gtfs:verificar              # con la base vacía: todo a 0, pero CONECTA
   pnpm gtfs:importar --reemplazar  # carga real
   pnpm gtfs:verificar              # verde
   ```
6. **Validar**: 0 horarios huérfanos, 0 viajes sin horarios, 0 rutas en `otro`, 0 origen =
   destino, 0 salida > llegada, y **> 0** viajes para hoy.

Comprobaciones sueltas en el SQL Editor:

```sql
select count(*) from estaciones;                        -- 1035
select count(*) from viajes   where feed = 'avld';      -- 8908 (feed 29/10)
select count(*) from horarios where feed = 'avld';      -- 71781
select count(*) from viajes v
 where v.feed = 'avld' and current_date between v.fecha_inicio and v.fecha_fin;  -- > 0
```

## Configurar `DATABASE_URL` en Render (Kevin / Alex)

`render.yaml` ya declara la variable con `sync: false`; solo hay que rellenarla.

1. Render → servicio **`renfe-api`** → **Environment**.
2. `DATABASE_URL` = la cadena del **session pooler** de arriba, con la contraseña real
   (pedirla por el gestor de contraseñas, no por el chat ni por el vault).
3. `SUPABASE_JWT_SECRET` = el JWT secret del proyecto (Settings → API). También con `sync: false`.
4. Guardar. Render **redespliega solo** al cambiar una variable de entorno.
5. Comprobar `/health` (ver abajo).

> Ojo: Render sirve la rama **`main`**. El esquema ya es el nuevo, pero los endpoints que solo
> están en `develop` (p. ej. `/trenes/:feed/:tripId`) no aparecerán hasta el cierre de sprint.

### Cómo comprobar que `/health` pasa a `ok`

| Antes (ahora) | Después |
|---|---|
| `{"estado":"ok","baseDatos":"no configurada",...}` | `{"estado":"ok","baseDatos":"ok",...}` |

```bash
# 1. estado de la conexión
curl -s https://renfe-api.onrender.com/health

# 2. primer endpoint con datos reales
curl -s "https://renfe-api.onrender.com/estaciones?q=atocha&feed=avld"

# 3. viajes reales (ids del paso anterior o del SQL Editor)
curl -s "https://renfe-api.onrender.com/trenes?origen=<id>&destino=<id>&fecha=2026-10-30"
```

- El primer request tras un cambio puede tardar ~30 s (arranque en frío del plan gratuito).
- Si sigue `"error"`: casi siempre es la URL directa (IPv6), el usuario sin `.<ref>` o la
  contraseña sin URL-encode.
- Si sigue `"no configurada"`: la variable no se guardó en el servicio correcto o el redeploy
  no ha terminado.

## Checklist

- [x] `supabase link` contra `hqwwucagvlhnlqrspwvh` (`migration list` muestra las 4 aplicadas)
- [x] Tablas en `public` con `rowsecurity = true`
- [x] `pnpm gtfs:importar --reemplazar` sin avisos, por el session pooler
- [x] `pnpm gtfs:verificar` en verde y con viajes para hoy
- [ ] `DATABASE_URL` en Render = **session pooler** (no la directa)
- [ ] `/health` → `"baseDatos": "ok"`
- [ ] `/estaciones?q=atocha&feed=avld` devuelve datos (no 503)
- [ ] `/trenes?origen=…&destino=…&fecha=…` devuelve viajes reales
- [x] Contraseña y claves **solo** en el gestor y en las variables de Render
- [ ] Proyecto despierto antes de la demo del 6/11 (el plan gratuito lo pausa por inactividad)

## Errores habituales

| Síntoma | Causa | Solución |
|---|---|---|
| `connect ENETUNREACH` a `db.<ref>.supabase.co` | conexión directa = solo IPv6 | usar el **session pooler** (host `...pooler.supabase.com`, usuario `postgres.<ref>`) |
| `Tenant or user not found` | host del pooler de otra región o usuario sin `.<ref>` | copiar la cadena de **Connect → Session pooler** |
| `db reset` en la nube | hábito del entorno local | **nunca**: borra y recrea la base. Aquí solo `db push` |
| `no migrations found` / no aplica nada | rama sin `migrations/` | `git checkout develop && git pull` |
| `Cannot find project ref` | falta `supabase link` | repetir el `link` con el `<ref>` correcto |
| `/health` con `"baseDatos": "error"` | URL directa (IPv6) o credenciales | session pooler + contraseña URL-encoded |
| `prepared statement "s1" already exists` | transaction pooler (6543) | cambiar a session pooler (5432) |
| `password authentication failed` | contraseña con caracteres especiales sin escapar | URL-encode (`@` → `%40`, etc.) |
| `relation "estaciones" does not exist` al importar | migraciones no aplicadas en la nube | `db push` antes de importar |
| El proyecto no responde tras unos días | pausa por inactividad del plan gratuito | entrar al panel y **Restore**; hacerlo antes de la demo |
| `db push` falla a mitad | migración con error | se aplica por migración; corregir y volver a lanzar (no editar una ya aplicada: crear otra) |

## Credenciales: dónde sí y dónde no

- **Sí:** gestor de contraseñas del equipo · variables de entorno de Render · el `.env` local
  (que está en `.gitignore`).
- **No:** Git (ni en `.env.example`, que va sin valores) · el vault de Obsidian · handoffs ·
  capturas · mensajes del chat.
- El **project-ref** sí puede estar en el vault: no da acceso sin la contraseña.
- La **`service_role key`** es equivalente a la contraseña: mismas reglas. Nunca en el
  frontend (`EXPO_PUBLIC_*` es público).
- Si una credencial se filtra: rotar la contraseña en el panel (Settings → Database → Reset
  password) y actualizar Render. El histórico de Git **no** se reescribe por esto.

## Después de esto

1. **Render con datos reales** → desbloquea a Rubén (`/auth/cara/*` necesita BD) y a la web de Alex.
2. **Reimportación programada**: AV/LD tiene horizonte hasta el 29/09/2027, así que basta
   semanal (cron en la VM o Supabase Cron). Ver [[plan-ingesta-gtfs]] §9.
3. **Consultas lentas**: `explain analyze` de `/trenes` y `/estaciones` contra la nube y
   añadir índice solo si sale mal. Con ~8 900 viajes el plan ya es bueno; el problema
   aparecería con Cercanías (2 M de horarios), que está fuera del sprint.
4. **Cercanías**: fuera de alcance (497 paradas sin `CODIGO`).
