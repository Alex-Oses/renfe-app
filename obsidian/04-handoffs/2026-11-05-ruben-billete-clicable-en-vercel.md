---
fecha: 2026-11-05
autor: Rubén (agente)
area: frontend
para: todos
rama: docs/vault-billete-clicable-en-vercel
pr: 154, 161
tags: [handoff, web, billetes, vercel]
estado: resuelto
---

# Handoff — La tarjeta de billete se arreglaba en rama y seguía rota en Vercel

## Qué se hizo

**Síntoma:** en `https://renfe-app-beta.vercel.app/billetes` la tarjeta salía partida en tres
columnas (hueco vacío a la izquierda, foto en el medio y datos apretados a la derecha, con el talón
debajo). En local se veía bien y cada «arreglo» parecía funcionar, pero Vercel seguía igual.

**Causa raíz (no era CSS mal escrito, era CSS que no había llegado):** la PR #150, que recuperó los
arreglos de los tickets 001–022, reaplicó en `develop` el `<Link className="ticket__enlace">` de
`MisBilletes.tsx` **pero dejó fuera las 17 líneas de `billetes.css`** que lo sacan del flujo
(`position: absolute; inset: 0; z-index: 1`) y las que ponen las filas de viajero por encima
(`z-index: 2`). Sin esa regla el enlace cuenta como una celda más de la rejilla y rompe la tarjeta.
Los arreglos del CSS vivían solo en ramas (`fix/mobile-billete-clicable`, PR #154) que nunca se
mergearon, así que `main` (y por tanto Vercel) nunca los recibió.

**Arreglo:** PR #154 mergeada (squash) en `develop` como `ad93236`, y release #161 `develop` → `main`
como `9eabfc6`. Comprobado en producción: la hoja de estilos servida por Vercel ya contiene
`.ticket__enlace { position: absolute; inset: 0 }`.

**Cómo se comprobó antes de mergear:** con Playwright, poniendo el `billetes.css` de `main` junto al
`MisBilletes.tsx` actual, se reproduce la captura del usuario exactamente; con el CSS de la rama, la
tarjeta vuelve a su sitio y la capa clicable mide 1120×251 px sobre la tarjeta.

## Qué queda

- **Regla para no repetirlo:** cuando un cambio lleve JSX + CSS del mismo componente, van en el mismo
  commit y en la misma PR. Si se recupera trabajo de otra rama (`git checkout <rama> -- fichero`), hay
  que comprobar que se traen **todos** los ficheros del arreglo, no solo los `.tsx`.
- Pendiente de antes, sin relación: el talón de la tarjeta en móvil (≤640 px) sigue pisando
  `LOCALIZADOR` y `TOTAL` porque el `grid-template-areas` de `billetes.css` solo tiene una celda de
  etiqueta. Detectado, **no arreglado** (el usuario pidió no tocarlo).

## Bloqueos / preguntas para otros

- Ninguno. El release #161 dejó `main` con los commits propios de los releases anteriores que
  `develop` no tiene (patrón habitual del repo); no bloquea, pero el siguiente release volverá a salir
  como `BEHIND`.

## Cambios en contratos

Ninguno.

## Ficheros tocados

- Código (ya en `main`): `frontend/web/src/paginas/billetes.css` (`ticket__enlace`, `ticket__viajero`),
  `frontend/web/src/paginas/MisBilletes.tsx` (renombrado `destinoCiudad`, sin cambio de comportamiento).
- Vault: este handoff y [[estado-equipo]].
