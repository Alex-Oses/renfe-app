# 🚆 Renfe App — Monorepo del equipo

App tipo Renfe hecha en equipo: búsqueda de trenes por fecha, reserva y pago (simulado con Stripe test), billetes QR validados contra la base de datos, login con reconocimiento facial, mapa en tiempo real y chatbot con IA.

> **Estado actual:** esqueleto. Hay estructura, configuraciones de ejemplo y documentación, pero **ninguna funcionalidad implementada todavía**. Cada carpeta tiene un `README.md` que explica qué irá ahí y quién es responsable.

---

## 🗂️ Las tres partes del repo

El repositorio está dividido en **tres zonas que no se mezclan**:

| Carpeta | Qué es | Responsable |
|---|---|---|
| [`frontend/`](frontend/README.md) | 📱 App móvil/web (Expo + React Native). Todo lo que ve el usuario. | **Alex** |
| [`backend/`](backend/README.md) | ⚙️ API (NestJS), base de datos (Supabase), worker de datos Renfe (GTFS) y servicio facial (Python). | **Rubén** (API), **Marina** (BD + GTFS), **Kevin** (face service, Stripe) |
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
| `docker-compose.yml` | Levanta todos los servicios en local (placeholder). |
| `.github/` | Plantillas de PR/issues, CODEOWNERS y CI (placeholder). |

```
renfe-app/
├── frontend/
│   └── mobile/            # App Expo (viajero + revisor)
├── backend/
│   ├── api/               # API NestJS (Rubén)
│   ├── database/          # Supabase: migraciones, seeds, políticas (Marina)
│   ├── gtfs-worker/       # Ingesta GTFS + GTFS-RT de Renfe (Marina)
│   └── face-service/      # Reconocimiento facial, Python FastAPI (Kevin)
├── obsidian/              # Vault compartido (abrir esta carpeta en Obsidian)
├── docs/                  # Guías del proyecto
├── scripts/               # Utilidades del monorepo
├── .github/               # Plantillas y CI
├── AGENTS.md  CLAUDE.md  opencode.json
├── docker-compose.yml  package.json  pnpm-workspace.yaml
└── .env.example
```

---

## 🚀 Primeros pasos

1. Lee [`docs/primeros-pasos.md`](docs/primeros-pasos.md) (requisitos: Node 22, pnpm 9, Docker, Python 3.12, Obsidian).
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
| Kevin | DevOps + Stripe + face service | `docker-compose.yml`, `.github/`, `backend/face-service/` | OpenCode |

Comunicación en **Slack**, código y tareas en **GitHub**, contexto para las IAs en **Obsidian**. Detalles en [`docs/slack.md`](docs/slack.md).

## ⚠️ Datos de Renfe

Renfe no tiene API pública de reservas ni de precios. Solo hay datos abiertos **GTFS** (horarios) y **GTFS-RT** (tiempo real). Asientos, precios, reservas y pagos son **simulados**. Ver [`docs/arquitectura.md`](docs/arquitectura.md).
