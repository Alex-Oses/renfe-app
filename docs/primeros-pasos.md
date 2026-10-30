# 🚀 Primeros pasos

## Requisitos (todos)

| Herramienta | Versión | Para qué |
|---|---|---|
| Git | cualquiera reciente | — |
| Node.js | 22 (ver `.nvmrc`) | frontend, API, worker |
| pnpm | 9 (`corepack enable`) | gestor de paquetes del monorepo |
| Docker Desktop | reciente | Supabase local y servicios |
| Obsidian | reciente | abrir `obsidian/` |
| Claude Code u OpenCode | reciente | tu agente de IA |

Según tu área:
- **Alex:** app Expo Go en el móvil.
- **Marina:** nada extra: la [Supabase CLI](https://supabase.com/docs/guides/local-development) viene como devDependency del repo (`pnpm install`). Para arrancar la BD local, Docker Desktop tiene que estar abierto.
- **Kevin:** cuenta de Stripe (modo test).

## Clonar y preparar

```bash
git clone https://github.com/<usuario>/renfe-app.git
cd renfe-app
git checkout develop
corepack enable
pnpm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

## Abrir el vault

Obsidian → *Open folder as vault* → `renfe-app/obsidian`. Lee `01-estado/estado-equipo.md`.

## Arrancar tu IA

Abre una terminal en la raíz `renfe-app/` y lanza `claude` u `opencode`. No hay que configurar nada más: ver [agentes-ia.md](agentes-ia.md).
