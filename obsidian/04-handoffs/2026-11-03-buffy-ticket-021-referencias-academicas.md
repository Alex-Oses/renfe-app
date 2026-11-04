---
fecha: 2026-11-03
autor: Buffy (agente)
area: frontend / contenido / docs
para: alex
rama: fix/mobile-tickets-pendientes
pr:
tags: [handoff, ticket-021, marca, legal, asix, anden-0]
estado: resuelto
---

# Handoff — Ticket 021: retirar referencias académicas

## Inventario y decisiones

| Dónde | Antes | Ahora |
| --- | --- | --- |
| Pie web y Pie móvil | «Proyecto académico (ASIX 2)…» | «Andén 0, sin relación con Renfe…»; se conservan GTFS/CC BY y el aviso de simulación |
| `shared/contenido/ayuda.ts` | `AVISO_ACADEMICO` con «proyecto académico de un ciclo formativo (ASIX)» | `AVISO_LEGAL`: «Andén 0 es una demostración sin relación con Renfe…»; se conserva el alcance legal (no vende, no recoge datos) |
| Aviso legal | «práctica académica», «ejercicio de clase» | «demostración», «demostración técnica»; se mantienen marcas, datos y simulación |
| Privacidad | «proyecto académico», «pruebas de la práctica» | «Andén 0», «pruebas de la demostración» |
| Videollamada y ciberseguridad | «En este proyecto académico…» | «En Andén 0…» |
| Condiciones de transporte | «proyecto académico» | «Andén 0»; se mantiene que no sustituye las condiciones oficiales |
| `shared/contenido/mas-renfe.ts` | aviso «Proyecto académico:…» | «En Andén 0 no se puede pedir ninguna tarjeta real» |
| `PasoPago` web | «Esta web es un proyecto académico» | «Esta web es una demostración»; se mantiene el pago simulado |
| Inicio, pasajero, Cuenta y Cabecera móvil | «Proyecto de clase», «demo de clase» | «Andén 0» y aviso de simulación |
| Swagger (`backend/api/src/main.ts`) | «proyecto académico tipo Renfe» | «Andén 0, una demostración tipo Renfe» |
| Correo de la API | «Proyecto de clase: billete y pago simulados» | «Andén 0: billete y pago simulados» |
| `User-Agent` de posiciones y GTFS | «proyecto academico» / «proyecto de clase» | `anden-0 (demo)` / `anden-0/0.1` |

**No se tocaron**: `obsidian/` (ADR-006, ADR-007 y ADR-009 son historial de decisiones), `tickets/`
(documentación interna de tareas), atribuciones de marcas, licencia CC BY 4.0 ni el aviso de que los
datos son simulados. No se cambió ningún flujo ni se renombró la marca Renfe del producto.

## Comprobación

- Búsqueda final de `ASIX|proyecto académico|práctica académica|ejercicio de clase|proyecto de
  clase|demo de clase|ciclo formativo|académico`: solo aparecen las referencias internas de
  `tickets/` y los ADR del vault, fuera del alcance.
- Chrome/CDP: `/`, `/ayuda/informacion-legal/aviso-legal`,
  `/ayuda/informacion-legal/privacidad-cookies`, `/ayuda/contacto` y `/mas-renfe/tarjeta` no
  contienen esas etiquetas; el pie muestra «Andén 0…» y el aviso legal conserva la no afiliación.
- `pnpm --filter @renfe/shared test` → **172**; `@renfe/web test` → **39**;
  `shared lint`, `mobile lint`, `api lint` y `web build` en verde.

## Límites

- La app móvil no se ha abierto en emulador; sus textos están validados por `tsc` y revisión de
  fuente.
- El cambio de `User-Agent` no altera el contrato: solo identifica al cliente ante Renfe/OSM.

## Ficheros tocados

- `frontend/web/src/componentes/Pie.tsx`
- `frontend/mobile/src/components/Pie.tsx`
- `frontend/shared/contenido/ayuda.ts`
- `frontend/shared/contenido/mas-renfe.ts`
- `frontend/web/src/paginas/reserva/PasoPago.tsx`
- `frontend/mobile/src/app/(tabs)/index.tsx`
- `frontend/mobile/src/app/pasajero.tsx`
- `frontend/mobile/src/components/Cabecera.tsx`
- `frontend/mobile/src/app/(tabs)/cuenta.tsx`
- `backend/api/src/main.ts`
- `backend/api/src/common/correo/correo.service.ts`
- `backend/gtfs-worker/src/trazar-vias.ts`
- `frontend/web/api/posiciones.ts`
- `tickets/ticket-021.md`
