---
fecha: 2026-10-27
autor: Alex
area: mobile
para: todos
rama: feat/mobile-menu-idiomas
pr: https://github.com/Alex-Oses/renfe-app/pull/37
tags: [handoff]
estado: obsoleto
---

# Handoff — Menú completo, idiomas y avisos en la web

## Qué se hizo
- Subida la web local de Alex: menú completo con páginas de contenido (`src/contenido/`), idiomas ES/CA/EN/FR, campana y avisos emergentes, "Mis líneas", cartera de billetes, tarifas y descuentos, calendario de precios y nuevo tren en la portada.
- Recuperados encima el cristal líquido (#34) y la adaptación al contrato con los arreglos de móvil (#28), que se habían perdido al copiar la carpeta local.
- Arreglos: recuadro `cristal--oscuro` ilegible y botón "Elegir" cortado en móvil.

## Qué queda
- Probar en móvil real.
- `enlaceWallet` usa `GET /billetes/:id/wallet`, que no está en [[endpoints]]: sigue simulado y queda fuera de la entrega.

## Bloqueos / preguntas para otros
- Ninguno.

## Cambios en contratos
Ninguno.

## Ficheros tocados
- `frontend/web/` (casi todo), este handoff.
