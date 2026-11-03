---
fecha: 2026-11-03
autor: Alex
area: frontend
para: todos
rama: refactor/mobile-logica-a-shared
pr: por abrir
tags: [handoff, frontend, shared, refactor]
---

# Handoff — La lógica repetida del frontend pasa a `@renfe/shared`

## Qué se hizo

Las 5 fases de [[plan-migracion-logica-frontend]], con un commit por fase:

1. **Formato** (`shared/formato/formato.ts`): `euros`, `hora`, `horaLocal`, `fecha`, `fechaCorta`,
   `aFecha` y `TEXTO_ESTADO`. Desaparecen `web/src/paginas/reserva/formato.ts`, `mobile/src/formato.ts`
   y unas 10 copias sueltas en pantallas.
2. **Texto** (`shared/formato/texto.ts`): `sinTildes` y `slug`. Desaparecen 9 copias y `mobile/src/billetes.ts`.
3. **Sesión** (`shared/estado/sesion.ts`): `leerSesion` y `guardarSesion`. La web ignora ahora,
   igual que el móvil, una sesión guardada sin token o sin correo.
4. **Puntualidad** (`shared/billetes/indemnizacion.ts`): la tabla del compromiso de Renfe.
   `logica.ts` la reexporta, así que la web no cambia.
5. **Viaje** (`shared/billetes/viaje.ts`): `minutosDelDia`, `duracionMin`, `FRANJAS`,
   `documentoValido` y `emailValido`. El móvil usa ahora el mismo control de correo que la web,
   que rechaza direcciones como `ana@@correo.es`.

## Comprobado

- `tsc` en shared, web y mobile; tests de shared (142) y de web (27) en verde.
- `vite build` de la web y `expo export --platform android` de la app sin errores.

## Sin comprobar

- Ninguna pantalla probada a mano, ni en el navegador ni en un móvil.

## Ficheros

`frontend/shared/{formato,estado,billetes}/`, unas 30 pantallas de `frontend/web/src` y
`frontend/mobile/src`, y `frontend/shared/tsconfig.json` (incluye `formato`).
