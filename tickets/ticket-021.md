# Ticket 021 — Retirar referencias académicas a ASIX 2 de la experiencia

- **Prioridad:** P2
- **Área:** `frontend/web`, `frontend/mobile`, contenido/documentación de usuario
- **Estado:** Arreglado
- **Dependencias:** Ninguna

## Objetivo

Eliminar de la experiencia del producto las menciones a “proyecto académico”, “ASIX 2” u otras etiquetas equivalentes que ya no deban mostrarse.

## Criterios de aceptación

- Buscar las menciones en interfaz, textos de marketing, contenido y documentación pública; presentar el inventario antes de retirar referencias con valor histórico/legal.
- Eliminar o actualizar las menciones visibles al usuario según el nombre actual del producto.
- No borrar atribuciones, licencias, historial técnico ni notas del vault sin confirmar que están dentro del alcance.
- Verificar que no quedan menciones en las pantallas públicas afectadas y que las pruebas/build siguen pasando.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

**Inventario:** pies web/móvil, aviso legal, privacidad, condiciones, videollamada, ciberseguridad,
Más Renfe, pago de reserva, pies de la app, Cabecera, Swagger, correo y `User-Agent`. Se conservan
las atribuciones, la licencia CC BY, el aviso de simulación y la no afiliación con Renfe. No se
tocaron los ADR del vault ni los tiquets internos.

**Arreglo:** las etiquetas «ASIX 2», «proyecto académico», «práctica académica», «ejercicio de
clase», «proyecto de clase» y «demo de clase» se sustituyen por el nombre actual **Andén 0** y por
«demostración» donde correspondía.

**Comprobación:** búsqueda final limpia fuera de tiquets/vault; cinco rutas públicas revisadas en
Chrome sin menciones; 172 pruebas shared, 39 web, lints shared/móvil/API y build web en verde.
Detalles e inventario completo en [[2026-11-03-buffy-ticket-021-referencias-academicas]].
