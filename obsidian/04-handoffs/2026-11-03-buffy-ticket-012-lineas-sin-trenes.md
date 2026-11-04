---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: alex
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-012, lineas, zona-horaria, errores, web]
estado: resuelto
---

# Handoff — Ticket 012: líneas que aparecen sin trenes

## Por qué falla

No se pudo reproducir la línea concreta del aviso (no hay `.env`, BD ni feed GTFS local), pero en
`TarjetaLinea` había dos defectos que producen ese síntoma:

1. **Fecha del dispositivo, no fecha de servicio.** La consulta usaba `hoyISO()` de
   `estado/vigilante.tsx`, que se construye con `getFullYear/getMonth/getDate` del reloj local. La fecha
   de servicio de GTFS es la de **Madrid**. Si el dispositivo está en otra zona (Canarias, un viaje, un
   reloj mal puesto), cerca de medianoche se pide el día anterior: los trenes ya salieron, el filtro
   los descarta y la tarjeta dice «No quedan trenes hoy».
2. **Un fallo se pintaba como lista vacía.** El callback de rechazo hacía `setTrenes([])`, así que un
   error de API/feed mostraba el mismo mensaje que una línea sin viajes, sin forma de reintentar.

El backend no tenía el problema: el controlador exige `AAAA-MM-DD`, el DTO lo valida y el SQL aplica
`SERVICIO_ACTIVO` con esa fecha (calendarios y excepciones). No se ha tocado.

## Qué se cambió

- `TarjetaLinea` consulta con `hoyEnMadrid()` de `@renfe/shared/api/cliente` (`Europe/Madrid`).
- Estado de error separado del vacío: mensaje con `role="alert"` y botón **Reintentar** que relanza la
  petición (`reintento` en las dependencias del efecto).
- `paginas/lineas/estado.ts`: `proximosTrenes` (futuros, máximo 4, fechas inválidas fuera) y
  `estadoDeLinea` (`cargando | error | vacia | trenes`), para que la decisión sea comprobable.
- `estado.test.ts`: línea con trenes, línea sin viajes futuros, fallo de carga y comparación de un ISO
  en UTC.

## Cómo se comprobó

- `pnpm --filter @renfe/web test -- src/paginas/lineas/estado.test.ts` → **5 pruebas** en verde.
- `pnpm --filter @renfe/web lint` → en verde.
- Suite completa de web y build no ejecutados en esta comprobación (el cambio es de la tarjeta y su
  helper); no hay navegador ni BD disponibles para validar contra GTFS real.

## Pendiente / límites

- Falta confirmar con la línea, fecha y feed del aviso original cuando haya entorno con datos.
- La tarjeta solo mira **hoy**: si no quedan salidas, el enlace lleva a buscar otro día. Es el
  comportamiento esperado, pero conviene product decidir si debe enseñar también las de mañana.
- `estado/vigilante.tsx` sigue usando la fecha local del dispositivo para los avisos de líneas
  favoritas. Es el mismo patrón, pero no afecta a esta vista y no se ha cambiado en este ticket.

## Ficheros tocados

- `frontend/web/src/paginas/lineas/TarjetaLinea.tsx`
- `frontend/web/src/paginas/lineas/estado.ts` y `estado.test.ts`
- `tickets/ticket-012.md`
