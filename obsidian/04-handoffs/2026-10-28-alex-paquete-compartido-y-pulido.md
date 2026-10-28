---
fecha: 2026-10-28
autor: Alex
area: frontend
para: todos
rama: feat/mobile-paquete-compartido
pr: (ver PR de esta rama)
tags: [handoff]
---

# Handoff — Paquete `@renfe/shared`, tokens de diseño y pulido de la web

## Qué se hizo
- **`frontend/shared` (`@renfe/shared`)**: la lógica común sale de la web para que la app Expo la reutilice. Incluye el cliente de la API, los tipos del contrato, los simulados, el QR firmado, las reglas de avisos y el contenido. El cliente ya no lee `import.meta.env`: cada app llama a `configurarApi({ api, posiciones, tiempoReal })` al arrancar. La web lo hace en `main.tsx`.
- **Tokens de diseño** en `shared/tema/tokens.ts`, con valores listos para React Native. Un test comprueba que coinciden con `base.css`: si cambias el CSS, cambia el token.
- **Accesibilidad**: placeholders y `--gris` (`#5c5c5c`) con contraste AA, curva sin rebote, `prefers-reduced-motion` con fundidos y botones de idioma y de cerrar aviso de 44 px.
- **Flujo de compra**:
  - El buscador acepta el código de estación, nombres sin tildes y ciudades con una sola estación.
  - En `/trenes`, si la estación no existe, sale un aviso claro en lugar de «Sin plazas».
  - La reserva tiene esqueleto de carga y aviso de error.
- Decisiones de la app en [[ADR-005-app-movil-expo]] (contesta D1–D9 de [[2026-10-27-ruben-plan-app-movil]]). [[sprint-actual]] actualizado.
- Vercel también despliega cuando cambia `frontend/shared` (`ignoreCommand`).

### Segunda tanda (revisión de Alex)
- **Cristal líquido** muy marcado en la cabecera y menús más difuminados. Por debajo de 48rem, barra inferior de pestañas como en la futura app. `prefers-reduced-transparency` deja todo opaco.
- **Responsive** medido con CDP de 320 a 1280 px en 9 rutas, sin desbordes. Scrolls con `overscroll-behavior: contain`, `scroll-padding` y z-index de una sola escala.
- **Imágenes**: 97 fotos de Wikimedia Commons (CC, con crédito) en destinos, rutas, estaciones, Cercanías y portada (`shared/contenido/imagenes.ts`, `componentes/Foto.tsx`). Donde no hay foto, relleno ilustrado.
- **Abonos** (`/abonos`, «Mis abonos» en la cuenta): mensual AVE/LD, Avant, Cercanías y bono de 10, con QR firmado `RNA1` y la preferencia «Usar mi cara para validar». Endpoints **propuestos** en [[endpoints]].
- **Tornos faciales**: sección «Próximamente» y [[ADR-006-tornos-faciales-futuro]].

## Qué queda
- **Rubén:** revisar la propuesta `GET/POST /abonos` y `GET /abonos/:id` en [[endpoints]].
- El revisor todavía no lee QR `RNA1` (abonos).
- Precios de abonos fijos por tipo (shortcut).
- Alex revisa la web y da la lista de mejoras.
- Crear la app Expo en `frontend/mobile` cuando haya BD (Marina) y facial (Rubén).
- La detección de estaciones desconocidas en `/trenes` solo funciona con datos simulados (shortcut comentado). Con la API real habrá que usar `GET /estaciones`.
- El detector marca bajo contraste (3,1:1) en la reserva. Sin revisar.

## Bloqueos / preguntas para otros
- **Rubén:** contrato del servidor facial en [[endpoints]]. La app enviará la imagen desde `expo-camera`. Revisa también CORS sin cabecera `Origin`.
- **Marina:** migraciones `gtfs_*` en la nube; las necesita la app.
- **Equipo:** decidir si se paga la cuenta de Apple Developer (99 $/año) para TestFlight. Sin ella, iOS solo se prueba con Expo Go.

## Cambios en contratos
Ninguno.

## Ficheros tocados
- `frontend/shared/**` (nuevo; movido desde `frontend/web/src/api`, `contenido` y `estado/vigilante-reglas`)
- `frontend/web/src/**` (imports, `main.tsx`, buscador, resultados, reserva, `base.css`, `Avisos.css`), `frontend/web/package.json`, `frontend/web/vercel.json`
- `obsidian/03-decisiones/ADR-004*`, `ADR-005*`, `obsidian/01-estado/*`, este handoff
