# Ticket 003 — Eliminar claves React duplicadas

- **Prioridad:** P1
- **Área:** `frontend/mobile`, `frontend/web`, `frontend/shared`
- **Estado:** Arreglado; pendiente de reproducir en el navegador con la API real
- **Dependencias:** Ninguna

## Problema reportado

React muestra `Encountered two children with the same key...` en alguna pantalla.

## Criterios de aceptación

- Identificar componente, lista y datos concretos que duplican la clave.
- Asignar claves estables y únicas basadas en la identidad real del elemento; no usar el índice como arreglo general.
- Si la fuente produce registros duplicados, tratarlos según el dominio, sin ocultarlos silenciosamente.
- Añadir una regresión para la lista afectada y comprobar que el warning desaparece.

## Verificación

Reproducir el escenario original con logs de desarrollo abiertos y verificar refresco, filtrado y ordenación.

## Resolución (2026-11-03, rama `fix/mobile-tickets-pendientes`)

- **Componente y lista:** `frontend/web/src/paginas/Revisor.tsx`, lista «Últimas lecturas». Cada
  lectura se pintaba con `key={h.validadoEn}`.
- **Datos que duplican la clave:** `validadoEn` lo genera la API con `instanteAIso()`
  (`backend/api/src/common/gtfs/tiempo.ts`), que formatea **sin milisegundos**. Dos validaciones en
  el mismo segundo —pulsar «Comprobar» dos veces o escanear dos códigos seguidos— devuelven el mismo
  valor y React avisa de la clave repetida.
- **Arreglo:** nuevo `frontend/web/src/paginas/revisor/historial.ts` con `Lectura` (`ResultadoValidacion
  & { lecturaId }`) y `anadirLectura()`. El componente guarda un contador y usa `key={h.lecturaId}`;
  las dos lecturas se siguen mostrando, sin ocultar ninguna y sin usar el índice.
- **Otras listas:** revisadas las claves de web y móvil (inicio, contenido, resultados, transbordos,
  billetes, mapa, tarifas, extras, navegación, chatbot). Sus identificadores son únicos con los datos
  actuales; no hay otra colisión reproducible.
- **Regresión:** `frontend/web/src/paginas/revisor/historial.test.ts` (2 pruebas) cubre dos lecturas
  del mismo segundo y el tope de 20.
- **Comprobado:** `pnpm --filter @renfe/web test` y `pnpm --filter @renfe/web lint` en verde.
- **Pendiente:** reproducirlo en el navegador con la API real; aquí no hay API ni navegador
  automatizado. Detalle en [[2026-11-03-buffy-ticket-003-claves-duplicadas]].
