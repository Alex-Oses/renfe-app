# Ticket 006 — Configurar y comprobar el chatbot en Docker

- **Prioridad:** P1
- **Área:** `backend/api`, `infra`
- **Estado:** Arreglado; prueba en contenedor pendiente (sin daemon de Docker en esta máquina)
- **Dependencias:** Ninguna

## Problema reportado

Al iniciar el entorno con Docker, el chatbot parece no estar configurado o no responde.

## Criterios de aceptación

- Reproducir el chatbot con el `docker-compose.yml` y `.env.example` actuales e identificar si el fallo es variable, red, proveedor o interfaz.
- Confirmar que `GEMINI_API_KEY` y `GEMINI_MODEL` llegan al contenedor API y que los errores del proveedor se muestran/loguean de forma útil.
- La clave se configura en `.env` local y nunca se copia a compose, logs, documentación o Git.
- Documentar el modo sin clave (degradación/error esperado) y cómo probarlo localmente.
- Añadir una prueba de configuración/fallback que no dependa de una llamada real de pago al proveedor.

## Verificación

Probar configuración válida y ausente en Docker local, además de las pruebas existentes del módulo chatbot.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:** el `.env` local no tiene `GEMINI_API_KEY` ni `GEMINI_MODEL` (ni las variables obligatorias
`POSTGRES_PASSWORD`, `JWT_SECRET`, `CORS_ORIGINS`), así que `docker compose config` ni siquiera
resuelve. Sin clave el `503` es el comportamiento previsto, pero no había ninguna pista en el arranque
y los errores del proveedor eran todos el mismo texto. Además, `GEMINI_MODEL=` vacía no caía al modelo
por defecto y producía un 404.

**Arreglo:**

- `GEMINI_MODEL` vacía usa `gemini-3.5-flash-lite` (`||` en vez de `??`).
- El proveedor registra HTTP y mensaje del proveedor (recortado, con la clave en `***`) y devuelve
  mensajes distintos para clave/modelo (400/403), modelo inexistente (404), cuota (429) y red.
- Aviso al arrancar si falta `GEMINI_API_KEY` y log en el `catch` del SSE.
- `.env.example` y `deploy/README.md` explican el modo sin clave y cómo comprobar las variables dentro
  del contenedor sin imprimir la clave.
- `gemini.provider.spec.ts`: 8 pruebas de configuración/fallback sin llamadas reales al proveedor.

**Comprobado:** 21 pruebas del chatbot en verde, `lint` y `build` en verde, y build real sin clave →
`503` «El chatbot no está configurado» + aviso en el log.

**Pendiente:** el daemon de Docker no está disponible aquí, así que no se levantó el compose; los
comandos de verificación quedan en `deploy/README.md` § Chatbot y en
[[2026-11-03-buffy-ticket-006-chatbot-docker]].
