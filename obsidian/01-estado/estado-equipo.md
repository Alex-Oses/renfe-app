---
actualizado: 2026-11-02
tags: [estado]
---

# 📊 Estado del equipo

> Cada persona (o su IA) actualiza **solo su fila** al terminar una sesión.
> Estados: 🟢 en marcha · 🟡 bloqueado/esperando · ⚪ sin empezar · ✅ hecho

| Persona | Rol | Estado | En qué está | Bloqueos | Actualizado |
|---|---|---|---|---|---|
| Alex | PO + Frontend | 🟢 | `arrancar.cmd` (#114) enciende/apaga solo lo que usa la web de Vercel: Supabase local, API en Docker y Funnel (`https://aleeex.tail3409a7.ts.net`, la de `VITE_API_URL`). Verificado desde fuera: `/estaciones` 200 con CORS de Vercel. Arreglado el test con fecha fija de `completarRuta` que rompía el CI de todas las ramas (#115) ([[2026-11-02-alex-arrancar-y-apagar]]) | Probar Expo y facial en móvil real; en el PC con Tailscale, Chrome bloquea la IP 100.x y la web cae a Render (probar desde fuera de la tailnet) | 2026-11-02 |
| Rubén | Backend + chatbot | 🟢 | Chatbot con contexto en `.md`, memoria por conversación, pasos en vivo por SSE y tarjetas de tren en web; pantalla de asistente en Expo con endpoint JSON, memoria, Markdown básico y acceso al flujo de compra. PR #97 integrada con `develop`; triaje documental #101 integrado ([[2026-10-30-ruben-pr97-mergeada]]) | Probar el chat en Expo y la latencia de Gemini sigue siendo el riesgo de la demo | 2026-10-30 |
| Marina | SM + Base de datos | 🟢 | **Supabase Cloud validada**: proyecto `hqwwucagvlhnlqrspwvh` (eu-west-1), 4 migraciones con `db push`, catálogo AV/LD cargado por el session pooler y `gtfs:verificar` en verde (1 035 estaciones / 668 rutas / 8 908 viajes / 71 781 horarios, feed 29/10). Los 3 PRs (#72, #73, #74) ya están mergeados. Siguiente: `DATABASE_URL` en Render ([[supabase-nube]]) | Nada por mi parte. Render sigue en 503 hasta que Kevin/Alex pongan `DATABASE_URL` | 2026-10-29 |
| Kevin | DevOps + despliegue + Docker | 🟢 | CI revisada y en verde (excepción para Dependabot + `pnpm test:ramas`): PR **#75** abierta, `CI / ok` y `PR / reglas` ✅, falta aprobación. API viva en Render sin base de datos. Siguiente: en cuanto exista Supabase Cloud ([[supabase-nube]]) rellenar las variables de Render; y Docker (D10 de [[ADR-005-app-movil-expo]]) | `DATABASE_URL` bloqueada hasta que Marina cree Supabase Cloud | 2026-10-28 |

## Bloqueos globales
- **Historial reescrito el 27/10: todos tenéis que borrar vuestra copia y clonar de nuevo** (ver [[2026-10-27-alex-reescritura-historial-y-vercel]]).
- 🟢 **Supabase Cloud operativa desde el 29/10** (`hqwwucagvlhnlqrspwvh`, eu-west-1): esquema y catálogo AV/LD cargados y verificados. Ya no depende de la VM de Marina ([[supabase-nube]]).
- API desplegada en Render (https://renfe-api.onrender.com) **sin base de datos**: `/estaciones` y `/trenes` dan 503 hasta que se rellene `DATABASE_URL` (session pooler) en el panel de Render.
- 🟢 **La app móvil ya tiene plan** ([[ADR-005-app-movil-expo]], 28/10): Expo para iOS y Android, y la web queda como demo y plan B. El facial está decidido en [[ADR-007-reconocimiento-facial]]: **sin servidor Python**, el vector lo calcula el dispositivo y la decisión la toma Postgres.
- 🟡 **Servidor final bloqueado por red:** el administrador debe confirmar la apertura de puertos y autorizar proxy/TLS y DNS. La base de datos y la API deben quedar dockerizadas allí; Supabase Cloud y Render son transitorios y se retirarán solo después de validar el servidor ([[infraestructura-servidor]], [[ADR-009-supabase-self-hosted-en-servidor]]).

## Próximos hitos
- **Entrega final: 06/11/2026.** Congelación de código el 04/11. Plan en [[sprint-actual]].
