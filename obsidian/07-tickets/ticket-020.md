# Ticket 020 — Mostrar éxito al comprar un abono

- **Prioridad:** P2
- **Área:** `frontend/web`, `frontend/mobile`
- **Estado:** Arreglado
- **Dependencias:** Ninguna

## Problema reportado

Tras comprar un abono, el mensaje aparece en rojo aunque la operación se haya realizado correctamente.

## Criterios de aceptación

- La respuesta confirmada de compra usa estilo semántico de éxito; errores y operaciones pendientes mantienen estados diferenciados.
- No se decide el color por el texto del mensaje: usar el estado explícito del flujo.
- El éxito solo se muestra tras recibir confirmación; un error no se presenta como compra completada.
- El mensaje tiene contraste suficiente y es anunciado correctamente por tecnología asistiva.
- Añadir pruebas para éxito, error y estado en curso.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Causa:** el resultado se repartía en banderas (`cargando`, `error`, `comprado`) y la confirmación
no tenía estado ni estilo de éxito propios; el único mensaje con color era el error. En la web
simulada el texto ya salía neutro, así que el rojo no se pudo reproducir sin la API real.

**Arreglo:** unión compartida `inicial | enviando | exito | error`; el éxito solo se crea con el
abono confirmado, se pinta en verde, con `role="status"` y `aria-live="polite"`. Error y
procesamiento mantienen estilos y anuncios distintos. El móvil usa el mismo estado y `Aviso`
anuncia los cambios. El tono depende solo del estado, no del texto.

**Comprobación:** 172 pruebas shared (4 nuevas), 39 web y lints shared/web/móvil en verde; flujo
real en Chrome con éxito, error y procesamiento. Detalles en
[[2026-11-03-buffy-ticket-020-estado-compra-abono]]. No se probó con la API real ni en emulador.
