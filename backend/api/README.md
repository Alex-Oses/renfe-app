# @renfe/api — API NestJS

**Responsable:** Rubén · IA: OpenCode

> Esqueleto vacío. Se genera en el Sprint 0/1.

## Crear el proyecto (una vez)

```bash
cd backend
# Borra el contenido de api/ salvo README.md y Dockerfile, y luego:
pnpm dlx @nestjs/cli new api --package-manager pnpm --skip-git
```

Cambia `"name"` en `package.json` a `"@renfe/api"` y asegúrate de que existe el script `"dev": "nest start --watch"`.

## Módulos previstos (`src/modules/`)

| Módulo | Qué hace | Responsable |
|---|---|---|
| `auth` | Registro/login con Supabase Auth, login facial (llama a face-service) | Rubén |
| `trenes` | Búsqueda por origen/destino/fecha sobre datos GTFS | Rubén |
| `reservas` | Asientos y reservas simulados | Rubén |
| `pagos` | PaymentIntent de Stripe test + webhook | Kevin |
| `billetes` | Genera QR firmado (Ed25519) y lo valida para el revisor | Rubén |
| `chatbot` | Claude API con tool use (buscar trenes, ver billetes) | Rubén |

`src/common/` guarda guards, pipes, filtros y el cliente de Supabase.

## Reglas

- Cada endpoint debe estar en `obsidian/02-contratos-api/endpoints.md` **antes** de implementarse.
- Documenta con Swagger (`@nestjs/swagger`) en `/docs`.
