# Despliegue en el servidor (opción A)

Base de datos y API en la **misma máquina**, con Docker. La base de datos **no se publica**: solo se
llega a ella por la red interna de Docker. Lo único que sale al exterior es la API, detrás de nginx o
de un túnel.

Decisión y alternativas: [[ADR-009-despliegue-servidor]](../../obsidian/03-decisiones/ADR-009-despliegue-servidor.md).
Auditoría del servidor: [[infraestructura-servidor]](../../obsidian/05-areas/infraestructura-servidor.md).

> **Estado:** los ficheros están escritos y `docker compose config` valida, pero **las imágenes no se
> han construido ni se ha levantado nada**: en el portátil de desarrollo no hay daemon de Docker. La
> primera construcción real es en el servidor.

## Antes de empezar

- Docker y `docker compose` en el servidor. Comprueba con `docker compose version`.
- Un `.env` en la raíz del repo (copia `.env.example`). Mínimo:

  | Variable | Para qué |
  |---|---|
  | `POSTGRES_PASSWORD` | Contraseña de la BD del compose. Obligatoria |
  | `CORS_ORIGINS` | Origen del navegador. **Obligatoria en producción**: si falta, la API no arranca |
  | `SUPABASE_JWT_SECRET` | Verificar los tokens. Sin él, `/auth/cara/*` no funciona |
  | `DATABASE_URL_DOCKER` | Solo si la BD **no** es la del compose (ver § Con una BD que ya existe) |
  | `API_PUBLICO` | Puerto del host donde escucha la API. Por defecto `3010` |

- Puertos del host libres: `3010` (API) y los que use Supabase si ya está instalado. La auditoría del
  28/10 vio ocupados el 3000, 54321–54327 y 8083.

## Levantar

```bash
docker compose up -d --build db api
docker compose ps          # los dos tienen que salir "healthy"
curl -s http://127.0.0.1:3010/health
```

`/health` tiene que decir `"baseDatos": "ok"`. Si dice `"no configurada"`, el `DATABASE_URL` que llegó
a la API no es el que crees: `docker compose exec api printenv DATABASE_URL`.

La API escucha en `127.0.0.1`, no en `0.0.0.0`, a propósito: para el navegador hace falta un proxy
delante (§ Exponer al exterior).

## Aplicar las migraciones (una sola vez)

Las migraciones están montadas en el contenedor de la BD, así que no hace falta `psql` en el host:

```bash
docker compose exec -T db sh -c 'for f in /migraciones/*.sql; do
  echo "→ $f"
  psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f "$f" || exit 1
done'
```

Son 4 ficheros y **no son idempotentes** (`create table` sin `if not exists`): la segunda pasada falla.
Si necesitas empezar de cero, `docker compose down -v` borra el volumen y las vuelve a pedir.

`deploy/postgres/00-compat-supabase.sql` se aplica **solo**, al crear el volumen: crea los roles
`anon`/`authenticated`/`service_role`, el esquema `auth`, `auth.users` y `auth.uid()`, que es lo que
asumen las migraciones. No lo ejecutes a mano.

## Cargar el catálogo GTFS

```bash
docker compose --profile tools run --rm gtfs-worker
docker compose --profile tools run --rm gtfs-worker ./node_modules/.bin/tsx src/verificar.ts
```

`--reemplazar` vacía el feed antes de cargarlo. El zip se guarda en el volumen `gtfs-data` y se
reutiliza en la siguiente ejecución.

## Exponer al exterior

El administrador tiene que dar **un** puerto de entrada. Con eso, nginx delante de la API:

```nginx
server {
  listen 443 ssl;
  server_name renfe.example.com;

  ssl_certificate     /etc/letsencrypt/live/renfe.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/renfe.example.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3010;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

El certificado se saca **sin abrir el puerto 80**: `certbot certonly --dns-<proveedor>` usa el reto
DNS-01 (un registro TXT). El 80 solo hace falta para HTTP-01.

Si el administrador no puede abrir **ningún** puerto de entrada, la salida es **Cloudflare Tunnel**:
solo necesita salida al 443 y no toca el firewall.

```bash
cloudflared tunnel --url http://127.0.0.1:3010
```

En los dos casos, `CORS_ORIGINS` tiene que ser el origen real desde el que entra el navegador
(`https://renfe.example.com`), no `localhost`.

## Con una BD que ya existe

Si la base de datos no es la del compose (un Supabase Cloud o un Supabase self-hosted que ya esté
corriendo en el servidor), apunta la API a ella y no levantes el `db`:

```bash
# En .env
DATABASE_URL_DOCKER=postgresql://postgres.<ref>:<password>@<host>:5432/postgres?sslmode=require

docker compose up -d --no-deps --build api
```

`--no-deps` evita que arranque el `db` del compose. El esquema y el importador son los mismos, así que
cambiar de una BD a otra es cambiar esa línea.

## Operación

```bash
docker compose logs -f api          # logs
docker compose up -d --build api    # actualizar tras un merge
docker compose exec -T db pg_dump -U postgres -d postgres | gzip > backup-$(date +%F).sql.gz
```

## Lo que queda pendiente

- **Construir las imágenes en el servidor.** Aquí no hay daemon de Docker, así que el primer
  `up --build` es la prueba de verdad de los dos Dockerfile.
- **`/auth/registro` y `/auth/login`.** Con un Postgres pelado no hay Supabase Auth: sin esos
  endpoints no hay filas en `auth.users` ni en `perfiles`, y el login facial no se puede usar. Ver
  ADR-009.
- **Backups automáticos.** El `pg_dump` de arriba es manual; no hay cron.
