# @renfe/shared

Lógica común de la web (`frontend/web`) y de la app Expo (`frontend/mobile`). Sin React ni DOM en la UI: solo TypeScript.

- `api/`: cliente de la API (`configurarApi` al arrancar cada app), tipos del contrato y datos simulados.
- `billetes/`: agrupa los billetes por reserva y une los dos tramos de un transbordo (web y app).
- `estado/`: reglas puras de los avisos (qué tren avisar y cuándo).
- `contenido/`: textos y páginas de información (ayuda, Cercanías, Inspírate…).
- `tema/`: tokens de diseño de la web (colores, tipografía, espaciado, sombras, cristal y animación) con valores
  listos para React Native: `import { tema } from "@renfe/shared/tema/tokens"`. `tokens.test.ts` lee
  `frontend/web/src/estilos/base.css` y falla si una variable `:root` cambia sin actualizar su token.

Se importa por ruta: `import { buscarTrenes } from "@renfe/shared/api/cliente"`.
La app ya aporta un sustituto de `localStorage` y de `crypto.subtle` en `mobile/src/polyfills.ts` (los usan los simulados y el QR firmado).
