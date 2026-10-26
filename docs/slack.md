# 💬 Slack + GitHub

Slack es para **hablar**; GitHub para **código y tareas**; Obsidian para **contexto de las IAs**. Si algo se decide en Slack, se apunta en el vault (ADR o handoff).

## Canales

| Canal | Para qué |
|---|---|
| `#general` | Avisos del equipo |
| `#daily` | Daily asíncrona (ayer / hoy / bloqueos) |
| `#frontend` · `#backend` · `#database` · `#devops` | Dudas por área |
| `#github` | Notificaciones automáticas (PRs, issues, merges) |
| `#ci` | Resultados de GitHub Actions |
| `#handoffs` | Aviso cuando alguien deja un handoff que bloquea a otro |

## Conectar GitHub (una vez)

1. Instala la app **GitHub** desde el directorio de apps de Slack.
2. En `#github`:
   ```
   /github subscribe aleeexUwU/renfe-app issues pulls reviews comments commits:develop
   ```
3. En `#ci`:
   ```
   /github subscribe aleeexUwU/renfe-app workflows:{event:"pull_request","push"}
   /github unsubscribe aleeexUwU/renfe-app issues pulls commits
   ```
4. En `#handoffs` (avisos cuando se tocan handoffs o contratos):
   ```
   /github subscribe aleeexUwU/renfe-app commits:develop
   ```
   (Kevin puede afinarlo más adelante con un workflow que publique en Slack solo los cambios de `obsidian/04-handoffs/`.)

## Normas

- Si tu PR bloquea a alguien, menciónalo en el canal de su área con el enlace.
- Nada de claves ni contraseñas en Slack.
