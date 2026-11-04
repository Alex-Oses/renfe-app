---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend
para: alex
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-017, pie, navegacion, accesibilidad, web, mobile]
estado: resuelto
---

# Handoff — Ticket 017: cuatro iconos del pie con acciones distintas

## Inventario antes del cambio

Web (`componentes/Pie.tsx`) y móvil (`components/Pie.tsx`) tenían los mismos cuatro iconos:

| Etiqueta | Destino actual |
| --- | --- |
| Vídeos | `/ayuda/contacto` |
| Fotos | `/ayuda/contacto` |
| Mensajes | `/ayuda/contacto` |
| Noticias | `/ayuda/contacto` |

Los cuatro eran canales simulados y llevaban al mismo sitio. No hay cuentas sociales reales en el
proyecto, así que no existen cuatro destinos sociales válidos que enlazar.

## Decisión

Se reutilizan cuatro secciones **existentes** de la arquitectura de información, sin inventar rutas:

| Etiqueta | Destino |
| --- | --- |
| Viajar | `/viajar` |
| Inspírate | `/inspirate` |
| Gestiona | `/gestiona` |
| Ayuda | `/ayuda` |

No se ha eliminado el bloque ni se han añadido enlaces externos. Si producto crea cuentas reales,
basta cambiar `ATAJOS` en ambos pies; el nombre visible y el `aria-label` ya son el nombre de la
sección.

## Qué se cambió

- Web: `ATAJOS` con ruta y trazo propio; cada `Link` tiene `aria-label` y `title`; la lista se llama
  «Secciones destacadas» para lectores de pantalla.
- Móvil: `ATAJOS` con ruta e icono existente; `accessibilityLabel` con el nombre y
  `accessibilityHint="Ir a …"`; `onPress` navega a la ruta propia.
- Se mantienen los objetivos táctiles de 44 px en web y 38 px en móvil.

## Cómo se comprobó

- Chrome headless en `/`: cuatro enlaces con `href` distintos
  (`/viajar`, `/inspirate`, `/gestiona`, `/ayuda`) y `aria-label`/`title` correctos.
- Cada uno navega a su ruta y `history.back()` vuelve a `/viajar`/`/inspirate`/`/gestiona`/`/ayuda`
  desde la portada; no queda ningún enlace a `/ayuda/contacto` en el pie.
- `pnpm --filter @renfe/web test` → 39 pruebas; typecheck de web y móvil en verde.

## Pendiente / límites

- No se ha ejecutado la app móvil en dispositivo; el typecheck y la ruta compartida
  `/contenido${ruta}` son la comprobación disponible.
- La decisión de convertir canales sociales simulados en atajos de secciones queda documentada para
  que producto la valide; no se han inventado URLs externas.

## Ficheros tocados

- `frontend/web/src/componentes/Pie.tsx`
- `frontend/mobile/src/components/Pie.tsx`
- `tickets/ticket-017.md`
