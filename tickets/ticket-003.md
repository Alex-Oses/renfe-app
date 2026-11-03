# Ticket 003 — Eliminar claves React duplicadas

- **Prioridad:** P1
- **Área:** `frontend/mobile`, `frontend/web`, `frontend/shared`
- **Estado:** Pendiente de reproducción
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
