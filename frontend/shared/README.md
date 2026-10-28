# @renfe/shared

Lógica común de la web (`frontend/web`) y de la futura app Expo (`frontend/mobile`). Sin React ni DOM en la UI: solo TypeScript.

- `api/`: cliente de la API (`configurarApi` al arrancar cada app), tipos del contrato y datos simulados.
- `estado/`: reglas puras de los avisos (qué tren avisar y cuándo).
- `contenido/`: textos y páginas de información (ayuda, Cercanías, Inspírate…).

Se importa por ruta: `import { buscarTrenes } from "@renfe/shared/api/cliente"`.
En la app hará falta un sustituto de `localStorage` y de `crypto.subtle` (los usan los simulados y el QR firmado).
