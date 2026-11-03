# Tickets de trabajo

Estos tickets convierten los problemas reportados en tareas pequeñas y verificables. Los fallos descritos proceden de pruebas del usuario y **no se han reproducido todavía**; cada agente debe empezar confirmando el comportamiento en la rama actual.

Las skills de Burton están en [`.burton/skills/`](../.burton/skills/). Son opcionales y se pueden activar al empezar un ticket con `/skills on <id>` o dejar que `auto-skills` seleccione la skill adecuada.

## Cómo usarlos

1. Elige un ticket pendiente y trabaja solo en su alcance.
2. Lee `AGENTS.md`, el README del área responsable y, para API/datos, los contratos y decisiones del vault.
3. Para una sesión autónoma de varios tickets, crea **una sola rama de trabajo** al inicio con `pnpm rama <tipo> <área> <tema>` y mantente en ella durante toda la sesión. Haz un commit local separado por ticket completado; no cambies de rama para cada ticket.
4. Reproduce el problema, añade o ajusta pruebas, implementa, ejecuta las comprobaciones pertinentes y deja un handoff según las reglas del repo.
5. Si el ticket requiere una decisión de producto o de contrato no especificada, para y pregunta; no inventes servicios, precios, credenciales ni datos.
6. Para la ejecución local solicitada por el usuario: **no hagas push, no abras PR y no fusiones bajo ninguna circunstancia**. Deja la rama y todos sus commits solo en este clon.

## Orden sugerido

| Ticket | Prioridad | Área | Tarea | Dependencias |
|---|---|---|---|---|
| [ticket-001](ticket-001.md) | P0 | mobile/api | Bearer token al pagar | — |
| [ticket-002](ticket-002.md) | P0 | mobile | Listas virtualizadas anidadas | — |
| [ticket-003](ticket-003.md) | P1 | frontend | Claves React duplicadas | — |
| [ticket-004](ticket-004.md) | P0 | mobile/api | Confirmación facial al pagar | — |
| [ticket-005](ticket-005.md) | P1 | mobile/face | Build nativo y prueba facial | 004 |
| [ticket-006](ticket-006.md) | P1 | api/infra | Chatbot en Docker | — |
| [ticket-007](ticket-007.md) | P1 | api/chatbot | Respuestas de rutas verificables | — |
| [ticket-008](ticket-008.md) | P1 | mobile/web/shared | Evitar trenes pasados | — |
| [ticket-009](ticket-009.md) | P1 | api/gtfs/shared | Destinos y transbordos posibles | — |
| [ticket-010](ticket-010.md) | P1 | mobile/web/shared/api | Precio consistente entre pasos | — |
| [ticket-011](ticket-011.md) | P1 | mobile/web/shared | Persistencia de tarifa elegida | — |
| [ticket-012](ticket-012.md) | P1 | web/gtfs | Trenes ausentes en una línea | — |
| [ticket-013](ticket-013.md) | P2 | web | Buscador de líneas superpuesto | — |
| [ticket-014](ticket-014.md) | P2 | web/mobile | Alinear buscador del estado del tren | — |
| [ticket-015](ticket-015.md) | P2 | web | Deseleccionar tren en el mapa | — |
| [ticket-016](ticket-016.md) | P2 | web/mobile | Abrir billete al pulsar la tarjeta | — |
| [ticket-017](ticket-017.md) | P2 | web/mobile | Acciones distintas en el footer | — |
| [ticket-018](ticket-018.md) | P2 | web/mobile | Imágenes de experiencias | — |
| [ticket-019](ticket-019.md) | P2 | web/mobile | Animación responsive del tren | — |
| [ticket-020](ticket-020.md) | P2 | web/mobile | Confirmación visual al comprar abono | — |
| [ticket-021](ticket-021.md) | P2 | web/mobile/docs | Retirar referencias a ASIX 2 | — |
| [ticket-022](ticket-022.md) | P1 | docs/agents | Actualizar la descripción obsoleta del proyecto | — |

P0 = bloquea un flujo urgente o una condición obligatoria; P1 = corrección funcional importante; P2 = mejora visual/contenido. Las prioridades no sustituyen al sprint ni a la aprobación del responsable del área.
