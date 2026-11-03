# Ticket 005 — Compilar y validar la app nativa con reconocimiento facial

- **Prioridad:** P1
- **Área:** `frontend/mobile`, `face`
- **Estado:** Pendiente
- **Dependencias:** [ticket-004](ticket-004.md) para validar el flujo de confirmación de compra

## Objetivo

Obtener un build instalable de Android y comprobar el flujo facial en un dispositivo real; el README indica que Expo Go no soporta el módulo nativo ONNX.

## Criterios de aceptación

- Seguir los perfiles y comandos existentes de Expo/EAS, sin cambiar dependencias nativas salvo que el build demuestre que es necesario.
- El build termina y se puede instalar en un dispositivo compatible.
- Verificar carga de modelos, permisos/cámara, registro o reconocimiento, cierre de cámara y gestión de errores.
- Si depende de API, documentar variables y configurar solo valores de prueba; no incluir credenciales en Git.
- Registrar dispositivo/plataforma, comandos, resultado y bloqueos en el handoff.
- No publicar en una tienda ni distribuir un build de producción.

## Verificación

Usar el build interno/de desarrollo descrito en `frontend/mobile/README.md` y realizar una prueba manual con consentimiento.
