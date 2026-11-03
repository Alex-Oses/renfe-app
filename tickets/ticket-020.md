# Ticket 020 — Mostrar éxito al comprar un abono

- **Prioridad:** P2
- **Área:** `frontend/web`, `frontend/mobile`
- **Estado:** Pendiente de reproducción
- **Dependencias:** Ninguna

## Problema reportado

Tras comprar un abono, el mensaje aparece en rojo aunque la operación se haya realizado correctamente.

## Criterios de aceptación

- La respuesta confirmada de compra usa estilo semántico de éxito; errores y operaciones pendientes mantienen estados diferenciados.
- No se decide el color por el texto del mensaje: usar el estado explícito del flujo.
- El éxito solo se muestra tras recibir confirmación; un error no se presenta como compra completada.
- El mensaje tiene contraste suficiente y es anunciado correctamente por tecnología asistiva.
- Añadir pruebas para éxito, error y estado en curso.
