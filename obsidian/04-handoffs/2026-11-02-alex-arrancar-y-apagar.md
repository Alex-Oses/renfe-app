---
fecha: 2026-11-02
autor: Alex
area: devops
para: todos
rama: chore/infra-arrancar-apagar
tags: [handoff, infra, local]
estado: abierto
---

# Handoff — Un solo script para arrancar y apagar todo en local

## Qué se hizo
- `arrancar.cmd` solo enciende o apaga lo que usa la web de Vercel: Supabase local, la API en Docker (`--solo-api`, sin web ni app) y Funnel. Sin argumentos pregunta; `-Abrir`, `-Cerrar` e `-Importar`. Se quita `-SinTunel`.
- `-Cerrar` apaga Funnel, API/web/app (`docker compose down`) y Supabase (`db:stop`); los datos se conservan. Si Docker está cerrado, lo dice y no falla.
- Arreglos: con Docker cerrado el script se caía en vez de abrirlo (stderr de `docker info` con `Stop` en PowerShell 5.1); `-Importar` no se respetaba y siempre descargaba los catálogos; `arrancar.cmd` devolvía 0 aunque fallara.
- Si Hyper-V/WSL reserva los puertos de Supabase (`bind: Intento de acceso a un socket...`), el script reinicia `winnat` con aviso de administrador. `db:start` reintenta 5 veces mientras Postgres se recupera.
- Probado: apagar y encender; solo queda el contenedor `api` y, por la IP pública de Funnel, `/estaciones` responde 200 con CORS para Vercel.
- En el PC con Tailscale, Chrome bloquea la llamada (el dominio resuelve a la IP 100.x) y la web cae a Render: probar desde fuera de la tailnet.

## Qué queda
- Solo probado en el PC de Alex (Windows 11).

## Ficheros tocados
`arrancar.cmd`, `scripts/arrancar.ps1`, `scripts/levantar-local.mjs`.
