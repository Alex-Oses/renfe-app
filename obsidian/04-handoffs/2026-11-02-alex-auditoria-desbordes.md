---
fecha: 2026-11-02
autor: Alex
area: frontend
para: todos
rama: fix/mobile-responsive-entrada-y-avisos
pr: 121
tags: [handoff, web, responsive]
---

# Handoff — Auditoría de desbordes y portada en el móvil

## Qué se hizo

Cerré la auditoría responsive que quedó a medias en [[2026-11-02-alex-web-responsive]]:
360, 390, 768, 1024 y 1366 px sobre portada, resultados, billetes, acceder, cuenta,
abonos, mapa, líneas, revisor, admin y una página de contenido.

**Ninguna página hace scroll horizontal** en ningún ancho. Lo que sí salió, todo en la
portada:

1. **El buscador no cabía en el móvil.** El panel mide ~935 px a 390 px de ancho y el
   tramo sticky lo centra en `100svh`: quedaba cortado arriba y abajo, y el botón de
   buscar solo se alcanzaba al final del tramo, justo cuando la sección siguiente lo
   tapaba. Ahora, en pantallas de hasta 40 rem (o 560 px de alto), el tramo se sirve en
   flujo normal: el buscador entra entero y sin 2 700 px de scroll previo. En escritorio
   y tablet (768, 1366) se mantiene la animación del tren y el panel entra completo.
2. **El botón de ayuda tapaba la barra de pestañas.** Estaba a `bottom: 0.75rem` y se
   comía «Billetes» y «Cuenta». Ahora flota encima de la barra y en móvil es un icono
   redondo de 48 px (el texto queda oculto; el `aria-label` se queda).
3. **«Antes de viajar» salía con el título pegado al texto.** `.cristal--pulsable`
   impone `display: block` y en `main.tsx` `base.css` se carga después de las CSS de
   página, así que ganaba al `display: grid` de `.modulo-aviso`. Con `a.modulo-aviso`
   (más especificidad) vuelve a separarse.

Medido con Playwright y Chrome real. `lint` (tsc) y los 27 tests de `@renfe/web` en
verde.

## Qué queda

- **La web de Vercel no tiene nada de esto todavía.** El despliegue publicado está en
  `main` y este trabajo (y #118, #119, #120) vive en `develop`: hay que abrir el PR
  `develop → main` y darle a *Promote to Production*. Comprobado hoy: el CSS de
  `renfe-app-beta.vercel.app` no llevaba ni los 44 px del pie.
- **Al recargar `/trenes?origen=<id>` el campo «Desde» sale vacío.** `estacionConocida`
  solo guarda en memoria de la sesión ([[2026-11-02-alex-mobile-web-completa]]), así que
  en un F5 se pierde el nombre. Los resultados se pintan bien porque van por id. Se
  arregla guardando esa memoria en `sessionStorage` (con guarda para la app) o con un
  `GET /estaciones/:id` en la API; no lo he tocado para no ampliar el PR.
- Nada probado en móvil real: la app sigue sin abrirse en un teléfono ([[2026-11-02-alex-mobile-web-completa]]).

## Bloqueos / preguntas para otros

- Rubén: en su plan [[plan-migracion-logica-frontend]] apunta que el precio que pinta la
  web y el que cobra la API pueden no coincidir. Si entramos ahí, primero contrato.

## Cambios en contratos

Ninguno.

## Ficheros tocados

- `frontend/web/src/paginas/inicio/inicio.css`: tramo en flujo en pantallas pequeñas y
  `a.modulo-aviso`.
- `frontend/web/src/paginas/inicio/EntradaTren.tsx`: `esEntradaEstatica()` (mismo umbral
  que el CSS) para no escribir `--p` ni saltar el scroll.
- `frontend/web/src/estilos/base.css`: el botón de ayuda encima de la barra, icono
  redondo en móvil y alto del panel del chat.
- `frontend/web/src/componentes/Chatbot.tsx`: clase `chatbot__texto` en la etiqueta.
