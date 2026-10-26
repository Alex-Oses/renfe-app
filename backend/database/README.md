# database — Supabase

**Responsable:** Marina (Scrum Master + Base de datos) · IA: OpenCode

> Esqueleto vacío. Se inicializa en el Sprint 0.

## Inicializar (una vez)

Requiere la [CLI de Supabase](https://supabase.com/docs/guides/local-development) y Docker.

```bash
cd backend/database
supabase init        # crea config.toml
supabase start       # levanta Supabase local (Postgres en el puerto 54322)
```

Copia las claves que muestra `supabase start` a tu `.env`.

## Contenido previsto

| Ruta | Qué es |
|---|---|
| `migrations/` | Migraciones SQL (`supabase migration new <nombre>`) |
| `seed.sql` | Datos de prueba (estaciones, usuarios de test) |
| `config.toml` | Config de Supabase (lo crea `supabase init`) |

## Reglas

- **El modelo de datos se diseña primero en** `obsidian/02-contratos-api/modelo-datos.md` y luego se migra.
- Toda tabla con datos de usuario lleva RLS.
- Embeddings faciales en `vector(512)` con pgvector. Nunca fotos.
- Posiciones de trenes en una tabla con Realtime activado (la escribe gtfs-worker).
