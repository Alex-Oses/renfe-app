---
fecha: 2026-10-27
autor: Alex
area: mobile
para: todos
rama: feat/mobile-detalles-y-navegacion
pr: (ver PR de esta rama)
tags: [handoff]
---

# Handoff — Mapa con trenes reales de Renfe, tarifas en forma de tren y navegación

## Qué se hizo
- **Mapa en tiempo real con datos de Renfe** sin esperar a Render: función de Vercel `frontend/web/api/posiciones.ts`, misma lógica y URLs que el `/posiciones` de Rubén (#36) y misma forma del contrato. Cuando la API esté en Render, `VITE_API_URL` y la web usa la de Rubén sin más cambios.
- Nuevo tipo de tren "Larga Distancia" (el feed AVE/LD no dice si es AVE, Alvia…). El mapa oculta origen, destino, progreso y próxima parada si no llegan.
- Tarifas en forma de vagones (ventanillas, franja, ruedas y enganches; Prémium como cabeza) y arreglado el botón que salía como un óvalo gigante.
- Al navegar se empieza arriba (o centrado en el `#ancla`); cada paso de la reserva empieza arriba; al abrir las tarifas se colocan en pantalla.
- Panel "Busca tu próximo viaje" de la portada más pequeño.
- Rastreo de 400 páginas en móvil: arreglados `/trenes` sin fecha (rompía la página) y el desbordamiento de las páginas de contenido con tablas. 0 errores después.

## Qué queda
- Comprobar en Vercel que `/api/posiciones` responde (desde el entorno de desarrollo no se llega a Renfe; probado con tests).
- **Rubén:** los retrasos de GTFS-RT van en `trip_updates`, no en posiciones: hoy salen todos "Puntual".

## Bloqueos / preguntas para otros
- Ninguno.

## Cambios en contratos
Ninguno: la función implementa `GET /posiciones` tal como está en [[endpoints]].

## Ficheros tocados
- `frontend/web/api/posiciones.ts`, `frontend/web/vercel.json`, `frontend/web/src/**`, `.env.example` (`VITE_TIEMPO_REAL`)
- `obsidian/05-areas/frontend.md`, este handoff.
