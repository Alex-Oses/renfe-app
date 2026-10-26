# 🧠 obsidian/ — Vault compartido

Esta carpeta es un **vault de Obsidian** versionado en Git. Es la memoria compartida del equipo y, sobre todo, de las IAs: cada persona trabaja con su propia IA en su PC, y la única forma de que la IA de Rubén sepa lo que hizo la IA de Alex es que quede escrito aquí.

## Abrirlo

Obsidian → *Open folder as vault* → selecciona `renfe-app/obsidian`.
Recomendado: plugin comunitario **Obsidian Git** para hacer pull/commit del vault desde Obsidian.

## Estructura

| Carpeta | Para qué | Quién escribe |
|---|---|---|
| `00-inicio/` | Portada del vault y reglas para agentes | Marina |
| `01-estado/` | Estado del equipo y sprint actual | Cada uno su fila / Marina el sprint |
| `02-contratos-api/` | Endpoints, modelo de datos, eventos. **Fuente de verdad** entre frontend y backend | Rubén, Marina (Alex revisa) |
| `03-decisiones/` | ADRs (decisiones de arquitectura) | Quien decide |
| `04-handoffs/` | Notas de traspaso al acabar cada sesión de trabajo | Todos (y sus IAs) |
| `05-areas/` | Una nota por área con su estado técnico | El responsable del área |
| `06-reuniones/` | Dailies, plannings, reviews, retros | Marina |
| `plantillas/` | Plantillas de handoff, ADR, daily | — |

## Flujo en una frase

**Al empezar: leer `01-estado/` + últimos handoffs. Al terminar: escribir un handoff y actualizar tu fila.** Las IAs lo hacen solas (ver `AGENTS.md`).
