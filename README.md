# 🚆 Renfe App — Monorepo del equipo

App tipo Renfe hecha en equipo: búsqueda de trenes por fecha, reserva y pago (simulado con Stripe test), billetes QR validados contra la base de datos, login con reconocimiento facial, mapa en tiempo real y chatbot con IA.

> **Estado actual (29/10/2026):** la **web** está completa y desplegada en Vercel (https://renfe-app-beta.vercel.app);
> la **API** corre en Render (https://renfe-api.onrender.com) contra Supabase Cloud, con el catálogo AVE/LD
> cargado y verificado; la **app Expo** existe en la rama `feat/mobile-app-expo`, pendiente de mergear.
> Precios, asientos, reservas y pagos son simulados: no hay Stripe.
> Arquitectura y estado pieza por pieza: [`docs/arquitectura.md`](docs/arquitectura.md).

---

## 🗂️ Las tres partes del repo

El repositorio está dividido en **tres zonas que no se mezclan**:

| Carpeta | Qué es | Responsable |
|---|---|---|
| [`frontend/`](frontend/README.md) | 📱 Web (Vite + React, en Vercel) y app móvil (Expo). Todo lo que ve el usuario. | **Alex** |
| [`backend/`](backend/README.md) | ⚙️ API (NestJS), base de datos (Supabase) y worker del GTFS estático. | **Rubén** (API), **Marina** (BD + GTFS), **Kevin** (despliegue) |
| [`obsidian/`](obsidian/README.md) | 🧠 Vault de Obsidian: memoria compartida del equipo y de las IAs (estado, contratos de API, decisiones, handoffs). | **Todos** (lo mantiene Marina como Scrum Master) |

Además, en la raíz:

| Ruta | Qué es |
|---|---|
| [`docs/`](docs/README.md) | Guías humanas: puesta en marcha, Git/GitHub, Slack, flujo Scrum, arquitectura. |
| `AGENTS.md` | Instrucciones para **cualquier** agente de IA (OpenCode, Codex, Claude Code, Copilot…). |
| `CLAUDE.md` | Importa `AGENTS.md` para Claude Code. |
| `opencode.json` | Config de OpenCode: carga `AGENTS.md` y el estado del vault automáticamente. |
| `.claude/` | Config de Claude Code: hook de inicio que lee el vault y comando `/handoff`. |
| `.opencode/` | Comandos de OpenCode (`/handoff`, `/estado`). |
| `scripts/` | Scripts del monorepo (p. ej. `agent-context.mjs`, que resume el vault para las IAs). |
| `docker-compose.yml` | BD + API en el servidor, con Docker (ADR-009). La BD no se publica. |
| `.github/` | Plantillas de PR/issues, CODEOWNERS y CI (lint, test, e2e y build). |

```
renfe-app/
├── frontend/
│   ├── web/               # Web Vite + React (demo y plan B)
│   ├── mobile/            # App Expo SDK 58 (rama feat/mobile-app-expo)
│   └── shared/            # @renfe/shared: cliente API, tipos, simulados, tema
├── backend/
│   ├── api/               # API NestJS (Rubén)
│   ├── database/          # Supabase: migraciones y seeds (Marina)
│   └── gtfs-worker/       # Import del GTFS estático de Renfe (Marina)
├── deploy/                # Runbook y compatibilidad con Postgres puro (ADR-009)
├── obsidian/              # Vault compartido (abrir esta carpeta en Obsidian)
├── docs/                  # Guías del proyecto
├── scripts/               # Utilidades del monorepo
├── .github/               # Plantillas y CI
├── AGENTS.md  CLAUDE.md  opencode.json
├── docker-compose.yml  render.yaml  package.json  pnpm-workspace.yaml
└── .env.example
```

---

## 🚀 Primeros pasos

1. Lee [`docs/primeros-pasos.md`](docs/primeros-pasos.md) (requisitos: Node 22, pnpm 9, Docker, Obsidian).
2. Abre la carpeta `obsidian/` como vault en Obsidian.
3. Lee [`obsidian/01-estado/estado-equipo.md`](obsidian/01-estado/estado-equipo.md) para saber en qué punto está el proyecto.
4. Si vas a trabajar con una IA, no tienes que configurar nada: Claude Code y OpenCode leen el vault solos (ver [`docs/agentes-ia.md`](docs/agentes-ia.md)).

Subir el repo a GitHub por primera vez: [`docs/git-github.md`](docs/git-github.md).

---

## 👥 Equipo (Scrum)

| Persona | Rol | Área | IA que usa |
|---|---|---|---|
| Alex | Product Owner + Frontend | `frontend/` | Claude Code |
| Rubén | Backend + chatbot | `backend/api/` | OpenCode |
| Marina | Scrum Master + Base de datos | `backend/database/`, `backend/gtfs-worker/` | OpenCode |
| Kevin | DevOps + despliegue | `docker-compose.yml`, `.github/` | OpenCode |

Comunicación en **Slack**, código y tareas en **GitHub**, contexto para las IAs en **Obsidian**. Detalles en [`docs/slack.md`](docs/slack.md).

## ⚠️ Datos de Renfe

Renfe no tiene API pública de reservas ni de precios. Solo hay datos abiertos **GTFS** (horarios) y **GTFS-RT** (tiempo real). Asientos, precios, reservas y pagos son **simulados**. Ver [`docs/arquitectura.md`](docs/arquitectura.md).
