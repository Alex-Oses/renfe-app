---
responsable: Alex
estado: hecho
fecha: 2026-11-03
tags: [area, frontend, shared, plan]
para: [Rubén, Marina, Kevin]
---

# Plan de migración de la lógica del frontend a `@renfe/shared`

> **Hecho el 03/11** (ver [[2026-11-03-alex-logica-frontend-a-shared]]). El objetivo es que la web (`frontend/web`) y la app (`frontend/mobile`) no tengan
> lógica repetida: lo que no pinta pantalla va a `frontend/shared`, con sus tests. Detalle del
> área en [[frontend]].

## Punto de partida (03/11)

`@renfe/shared` ya tiene casi toda la lógica de negocio: cliente de la API, adaptadores, datos
simulados, QR, retrasos, agrupar billetes y el contenido de Cercanías (129 tests). Quedan restos
duplicados o atrapados en una sola app:

| Lógica | Dónde está hoy | Problema |
| --- | --- | --- |
| Formato de `euros`, `hora`, `fecha` | `web/src/paginas/reserva/formato.ts`, `mobile/src/formato.ts`, `web/.../herramientas/logica.ts` y ~6 `.tsx` | 3 versiones que no dan lo mismo: la web corta la hora del ISO (`slice(11, 16)`) y el móvil la pasa a la zona del dispositivo |
| Quitar tildes / slug | `shared/api/cliente.ts` (`sinTildes`, privada), `mobile/src/billetes.ts` y ~8 componentes con `normalize("NFD")` | Copiado a mano en cada buscador |
| Estados de abono (`TEXTO_ESTADO`) | `web/.../cuenta/MisAbonos.tsx` y `mobile/src/formato.ts` | Textos repetidos |
| Sesión (`leerSesion`, `guardarSesion`) | `web/src/estado/sesion.tsx` y `mobile/src/sesion.ts` | Misma lógica sobre `sessionStorage`; el móvil ya lo emula con SQLite (`polyfills.ts`) |
| Indemnización por retraso | `web/.../herramientas/logica.ts` | Solo en la web; la app no lo enseña |
| Lógica dentro de pantallas grandes | `mobile/src/app/pasajero.tsx` (729 líneas), `resultados.tsx` (661), `directo.tsx` (558) | Validación y filtrado mezclados con la vista; no se pueden testear |

**Se queda donde está:** lo que depende de la plataforma. `web/.../cuenta/arcface.ts` (usa
`onnxruntime-web` y canvas), `web/.../revisor/decodificar.ts` (canvas y `BarcodeDetector`),
`web/src/api/gtfs-rt.ts` (reexporta la función de Vercel), `mobile/src/polyfills.ts` y `tema.ts`.

## Fases

Cada fase es un PR pequeño contra `develop`, con `pnpm lint` y `pnpm test` en verde. No cambia
nada de lo que ve el usuario, salvo la fase 1, que unifica la hora.

1. **`shared/formato.ts`**: `euros`, `hora`, `fecha`, `aFecha`, `hoyIso` y `TEXTO_ESTADO`, con
   tests. Antes, decidir qué hora vale: la del ISO de la API (hora de la estación, `slice(11, 16)`)
   es la correcta para los trenes, así que el móvil pasa a usarla. Borrar `reserva/formato.ts`,
   `mobile/src/formato.ts` y el `euros` de `logica.ts`.
2. **`shared/texto.ts`**: `sinTildes` y `slug`, exportadas desde aquí y usadas por `cliente.ts`,
   `simulado.ts` y los buscadores de las dos apps. Tests con «A Coruña», «Lleida» y la ñ.
3. **`shared/estado/sesion.ts`**: `leerSesion` y `guardarSesion` sobre `sessionStorage`. La web
   envuelve esto en su contexto de React; el móvil lo usa tal cual gracias al polyfill. Probar a
   mano el login, una recarga y el «token inválido» en las dos apps.
4. **`shared/billetes/indemnizacion.ts`**: mover `porcentajeIndemnizacion` y su tabla desde
   `logica.ts`. Así la app puede enseñar el aviso de retraso en el billete (opcional).
5. **Sacar lógica de las pantallas del móvil**: validación de pasajeros de `pasajero.tsx` y
   filtros y orden de `resultados.tsx` a funciones puras en `shared`, comparando con lo que hace
   la web en `Resultados.tsx`. Es la fase más larga y la de más riesgo; se hace la última.

## Riesgos y reglas

- **Congelación el 04/11 y entrega el 06/11.** Las fases 1 a 3 son cortas y se pueden hacer antes
  si el equipo lo aprueba. La 4 y la 5 quedan para después de la entrega.
- Nada de capas nuevas: funciones sueltas y tipos de `shared/api/tipos.ts`, sin clases ni
  servicios.
- `shared` no puede importar React, React Native ni nada del DOM. Si una función lo necesita, se
  queda en su app.
- Cada función que se mueve se lleva sus tests o gana uno.

## Cómo saber que está hecho

- `grep -rn 'normalize("NFD")\|currency: "EUR"\|toFixed(2)' frontend/web/src frontend/mobile/src`
  no devuelve nada.
- Ya no existen `mobile/src/formato.ts`, `mobile/src/billetes.ts` ni `web/src/paginas/reserva/formato.ts`.
- Los tests de `shared` suben y los de web y móvil siguen en verde.

## Resultado (03/11)

- Fases 1 a 5 hechas en una rama, con un commit por fase. No cambia nada de lo que se ve:
  el móvil sigue con la hora local (`horaLocal`) y la fecha sin año (`fechaCorta`), y la web con
  la hora del ISO (`hora`) y la fecha con año (`fecha`). `textoDuracion` y el orden siguen en
  cada pantalla porque no hacen lo mismo en web y en móvil.
- Módulos nuevos: `shared/formato/formato.ts`, `shared/formato/texto.ts`, `shared/estado/sesion.ts`,
  `shared/billetes/indemnizacion.ts` y `shared/billetes/viaje.ts`, todos con tests (129 → 142).
- La app todavía no enseña la indemnización: sería una funcionalidad nueva y no está en el sprint.
