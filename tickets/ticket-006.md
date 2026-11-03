# Ticket 006 — Configurar y comprobar el chatbot en Docker

- **Prioridad:** P1
- **Área:** `backend/api`, `infra`
- **Estado:** Pendiente de reproducción
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
