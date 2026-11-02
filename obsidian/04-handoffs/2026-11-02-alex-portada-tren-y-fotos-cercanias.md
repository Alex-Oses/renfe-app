---
fecha: 2026-11-02
autor: Alex
area: frontend
para: todos
rama: fix/mobile-portada-y-fotos-cercanias
pr: 125
tags: [handoff, web, responsive]
---

# Handoff — El tren vuelve a la portada del móvil y fotos por sección

## Qué se hizo

**La portada del móvil perdió el tren con el PR #121.** Para que el buscador no saliera
cortado, aquel cambio sirvió el tramo en flujo normal a menos de 40 rem (o 560 px de
alto) y ocultó la escena. El problema de fondo era que el panel medía **935 px** a 390 px
de ancho porque cada campo del pie iba en su propia fila.

Ahora el tramo vuelve a ser sticky en vertical en cualquier ancho y la escena vuelve:

- Pie del buscador a **dos columnas** en pantallas estrechas (ida, adultos/niños,
  bebés/descuento, botón), paddings cortos y campos de parada más pequeños: el panel
  baja de ~935 a **604 px** a 390×844 y a 562 px en los móviles bajos.
- Tramo de **220vh** en vez de 340vh: se llega al buscador con menos scroll.
- El panel se sube el alto de la barra de pestañas, así que el botón de buscar nunca
  queda debajo de ella.
- En pantallas estrechas **y** bajas (≤ 760 px) el `h1` del panel se oculta solo a los
  ojos: sigue para lectores de pantalla y libera los ~37 px que faltaban.
- Las listas de adultos/niños/bebés tenían 14 rem de mínimo y se salían del panel;
  ahora se ajustan a su columna.
- Sigue sirviéndose en flujo normal con `prefers-reduced-motion` y en ventanas de
  **660 px de alto o menos** (móvil tumbado), donde no cabe de ninguna forma. El umbral
  del CSS y el de `esEntradaEstatica()` vuelven a coincidir.

**Auditoría de imágenes (lo que quedó a medias en [[2026-11-02-alex-auditoria-desbordes]]):**

- `fotosSeccion` en `frontend/shared/contenido/imagenes.ts`: líneas, estaciones,
  accesibilidad, planos, tarifas, información de viaje y avisos dejan de compartir la
  foto de la ciudad dentro de un núcleo. Los 7 archivos están comprobados en Commons
  (302 en `Special:FilePath`) y con el autor y la licencia de los metadatos.
- `fotoDeNucleo()`: solo la portada de un núcleo (`/cercanias/madrid`) lleva foto de
  ciudad, no sus subpáginas.
- El menú de Cercanías pinta la miniatura de cada núcleo (30 px, 96 px de descarga,
  `lazy`): las filas quedan en 42 px, cómodas para el dedo.

## Qué queda

- **Nada de esto está en la web publicada**: Vercel sigue en `main` y esto vive en
  `develop`, igual que #118, #119, #120 y #124. Falta el PR `develop → main` y
  *Promote to Production*.
- El tren y el paisaje no se han reencuadrado para pantallas muy estrechas: en 320 px
  el morro del tren se sale por la derecha, como ya pasaba en escritorio con ventanas
  estrechas. No molesta, pero está sin pulir.
- En móvil tumbado (≤ 660 px de alto) la portada sigue en flujo y sin tren a propósito.
- Nada probado en un teléfono real: todo con Chrome y emulación de dispositivo.

## Bloqueos / preguntas para otros

Ninguno. Aviso: en este PC la API responde pero Postgres local no está levantado, así
que `/trenes` contesta «La base de datos no está disponible»; es del entorno, no del
cambio.

## Comprobado

- Medido con Chrome real (CDP) a 320×700, 360×740, 375×667, 390×844, 412×915, 700×700,
  767×800, 768×1024 y 1366×768: tramo sticky, tren visible, panel entero dentro de la
  vista, botón de buscar como elemento de arriba al final del tramo y ni un desborde
  dentro del panel. Con `prefers-reduced-motion` sigue estático y sin tren.
- Flujo completo a 390×844: Madrid → sugerencia → Barcelona → sugerencia → **Buscar
  trenes** navega a `/trenes?origen=…`.
- Menú: las 30 miniaturas del DOM cargan (`naturalWidth > 0`); `/cercanias/bilbao`,
  `/lineas`, `/tarifas` y `/estaciones` enseñan su foto y su pie con el autor correcto.
- `lint` (tsc) de `@renfe/shared` y `@renfe/web` en verde; 129 + 27 tests en verde.

## No comprobado

- Móvil real (ni la web en un teléfono ni la app).
- El gesto de deslizar a la izquierda del tramo, que no he tocado.

## Cambios en contratos

Ninguno.

## Ficheros tocados

- `frontend/web/src/paginas/inicio/inicio.css`: tramo sticky y panel compacto en
  pantallas estrechas; umbral de flujo normal a 660 px de alto.
- `frontend/web/src/paginas/inicio/EntradaTren.tsx`: `esEntradaEstatica()` sin el ancho.
- `frontend/shared/contenido/imagenes.ts`: `fotosSeccion`, `fotoDeNucleo()` y la sección
  por delante del núcleo en `fotoDeRuta()`.
- `frontend/shared/contenido/imagenes.test.ts`: casos de sección y de núcleo.
- `frontend/web/src/componentes/Cabecera.tsx`: miniatura en los enlaces de núcleos.
- `frontend/web/src/estilos/base.css`: `.mega__miniatura` y enlaces del menú en flex.
