---
fecha: 2026-10-30
autor: Rubén
area: vault
tags: [estado, handoffs, triaje, infraestructura]
---

# Triaje de handoffs

Revisión completa de los 53 handoffs existentes. «Cerrado» significa que el código, el contrato o
un merge posterior resuelven lo pedido; «obsoleto» significa que el handoff describe un plan o
alcance sustituido; «abierto» conserva una acción verificable antes de la congelación del 04/11.

| Handoff | Autor | Para | Estado | Qué falta | De quién depende |
|---|---|---|---|---|---|
| [[2026-10-26-alex-config-github]] | Alex | todos | cerrado | Nada; configuración histórica integrada | — |
| [[2026-10-26-alex-contexto-inicial]] | Alex | todos | obsoleto | Sustituido por el sprint final y ADRs vigentes | — |
| [[2026-10-26-alex-esqueleto-monorepo]] | Alex | todos | cerrado | Nada; esqueleto creado | — |
| [[2026-10-26-alex-subida-github]] | Alex | todos | cerrado | Nada; repositorio y flujo creados | — |
| [[2026-10-26-alex-web-completa]] | Alex | todos | obsoleto | La web queda como demo/plan B, no como pieza principal | Alex |
| [[2026-10-26-marina-modelo-datos]] | Marina | todos | cerrado | Modelo v2 y huecos principales resueltos | — |
| [[2026-10-26-marina-supabase-init]] | Marina | todos | cerrado | Supabase local validado en VM | — |
| [[2026-10-26-ruben-arquitectura-api-renfe]] | Rubén | todos | cerrado | Contrato y arquitectura base integrados | — |
| [[2026-10-26-ruben-esqueleto-api]] | Rubén | todos | cerrado | API base, guard y health integrados | — |
| [[2026-10-26-ruben-respuestas-modelo-datos]] | Rubén | Marina | cerrado | Respuestas incorporadas al contrato y migraciones | — |
| [[2026-10-27-alex-billete-revisor-admin]] | Alex | Rubén, Marina | abierto | Decidir si se sustituye el HMAC actual por Ed25519 y cerrar el contrato; el código actual usa HMAC-SHA256 | Rubén y Marina, antes del 04/11 |
| [[2026-10-27-alex-ci-render]] | Alex | todos | abierto | Configurar y comprobar `DATABASE_URL`/JWT en Render mientras sea entorno transitorio | Kevin/Alex |
| [[2026-10-27-alex-estilo-cristal]] | Alex | todos | abierto | Prueba en dispositivos móviles reales | Alex |
| [[2026-10-27-alex-mapa-detalle-tren]] | Alex | Rubén | cerrado | Campos opcionales y recorrido ya llegan desde la API integrada | — |
| [[2026-10-27-alex-menu-idiomas]] | Alex | todos | obsoleto | `wallet` sigue fuera del alcance; no bloquea la entrega | — |
| [[2026-10-27-alex-plan-entrega]] | Alex | todos | obsoleto | Sustituido por el alcance final con chatbot e infraestructura obligatoria | Alex/PO |
| [[2026-10-27-alex-reescritura-historial-y-vercel]] | Alex | todos | cerrado | Historial ya sincronizado en la rama actual | — |
| [[2026-10-27-alex-sincronizacion-prs]] | Alex | todos | cerrado | PRs y contrato principal ya integrados | — |
| [[2026-10-27-alex-tiempo-real-y-detalles]] | Alex | todos | cerrado | `/posiciones` y detalle implementados | — |
| [[2026-10-27-alex-web-contrato-pulido]] | Alex | todos | cerrado | Web alineada con el contrato | — |
| [[2026-10-27-ruben-campos-mapa-para-alex]] | Rubén | Alex | cerrado | Campos de mapa cruzados con GTFS/BD | — |
| [[2026-10-27-ruben-endpoint-detalle-tren]] | Rubén | todos | cerrado | Endpoint de detalle y validaciones implementados | — |
| [[2026-10-27-ruben-endpoint-estaciones]] | Rubén | Marina | cerrado | Endpoint implementado y migraciones disponibles | — |
| [[2026-10-27-ruben-endpoint-posiciones]] | Rubén | todos | cerrado | GTFS-RT en memoria y posición por viaje integrados | — |
| [[2026-10-27-ruben-endpoint-trenes]] | Rubén | todos | cerrado | Búsqueda de trenes implementada y probada | — |
| [[2026-10-27-ruben-gtfs-estatico-para-marina]] | Rubén | Marina | cerrado | Hallazgos aplicados al importador y contrato | — |
| [[2026-10-27-ruben-gtfsrt-para-alex]] | Rubén | Alex | cerrado | Retrasos y posiciones reales consumibles por la web | — |
| [[2026-10-27-ruben-plan-app-movil]] | Rubén | Alex | obsoleto | D1–D10 sustituidas por ADR-005, ADR-007 y el plan final | — |
| [[2026-10-28-alex-dependabot-y-titulos-pr]] | Alex | todos | cerrado | CI, reglas y revisiones obligatorias integradas | — |
| [[2026-10-28-alex-paquete-compartido-y-pulido]] | Alex | todos | abierto | Probar Expo y resolver el modelo facial 512 en la app; revisar abonos si entran | Alex/Rubén |
| [[2026-10-28-kevin-revision-ci]] | Kevin | Alex, Rubén, Marina | cerrado | CI y Docker preparados; el despliegue final queda en los handoffs de infraestructura | — |
| [[2026-10-28-marina-contrato-v2]] | Marina | todos | cerrado | Contrato v2, migraciones y carga verificadas en Git/VM/Cloud | — |
| [[2026-10-28-marina-importador-gtfs-avld]] | Marina | todos | cerrado | Importador y catálogo AV/LD verificados; queda transición al servidor | — |
| [[2026-10-28-marina-migracion-catalogo]] | Marina | todos | cerrado | Migraciones de catálogo aplicadas y presentes en el historial | — |
| [[2026-10-28-ruben-facial]] | Rubén | Marina, Alex | abierto | Probar facial en la app Expo y confirmar registro/login contra el entorno final | Alex, Marina y Kevin |
| [[2026-10-28-ruben-infraestructura-servidor]] | Rubén | Kevin, Marina, Alex | abierto | Abrir puertos, construir/levantar imágenes, persistencia, backups y validación externa | Administrador y Kevin |
| [[2026-10-29-alex-api-billetes-abonos]] | Alex | Rubén, Marina, Kevin | abierto | Aplicar/probar migración de negocio en el servidor y configurar secretos de Render mientras siga activo | Marina y Kevin |
| [[2026-10-29-alex-cercanias]] | Alex | Marina | abierto | Decidir carga de Cercanías en el servidor y programar su refresco diario | Marina |
| [[2026-10-29-alex-mapa-datos-reales]] | Alex | Rubén, Marina | abierto | Probar la app Expo y cerrar el modelo facial para la entrega móvil | Alex y Rubén |
| [[2026-10-29-marina-supabase-cloud]] | Marina | Alex, Rubén, Kevin | abierto | Migrar y validar Cloud al servidor; Render/Cloud son transitorios | Administrador, Kevin y Marina |
| [[2026-10-29-ruben-chat-demo-local]] | Rubén | Alex, Marina, Kevin | cerrado | Modo demo y timeout integrados en PR #97 | — |
| [[2026-10-29-ruben-chat-frontend]] | Rubén | Alex, Marina, Kevin | cerrado | Acceso flotante integrado en PR #97 | — |
| [[2026-10-29-ruben-chat-prueba-real-local]] | Rubén | Alex, Marina, Kevin | abierto | Medir y decidir la latencia de Gemini para la demo | Rubén, antes del 04/11 |
| [[2026-10-29-ruben-chatbot]] | Rubén | todos | cerrado | Implementación, tests y contrato integrados en PR #97 | — |
| [[2026-10-29-ruben-correccion-e2e-chatbot]] | Rubén | todos | cerrado | Corrección e2e integrada y CI en verde | — |
| [[2026-10-29-ruben-docker-servidor]] | Rubén | Kevin, Marina, Alex | abierto | Ejecutar el primer `up --build`, validar Supabase self-hosted, backups y red | Administrador y Kevin |
| [[2026-10-29-ruben-jwt-propio-api]] | Rubén | Alex, Marina, Kevin | abierto | Configurar secretos fuera del repositorio y validar JWT en servidor | Kevin |
| [[2026-10-29-ruben-objetivo-bd-docker-servidor]] | Rubén | Marina, Kevin, Alex | abierto | Confirmar puertos y completar migración Cloud/Render al servidor | Administrador |
| [[2026-10-30-alex-compose-completo-y-recorridos]] | Alex | todos | abierto | Validar el compose final en servidor y actualizar el estado real de Cloud tras nuevas migraciones | Kevin y Marina |
| [[2026-10-30-ruben-chatbot-web-trenes-pasos]] | Rubén | Alex, Kevin | cerrado | Chatbot web/API integrado en PR #97 | — |
| [[2026-10-30-ruben-pr97-lista-para-merge]] | Rubén | Alex, Kevin | obsoleto | Sustituido por el handoff de PR mergeada | — |
| [[2026-10-30-ruben-pr97-mergeada]] | Rubén | Alex, Kevin | cerrado | PR #97 fusionada; queda la prueba Expo, registrada en los abiertos | Alex |
| [[2026-10-30-ruben-triaje-infraestructura]] | Rubén | Alex, Marina, Kevin | abierto | Confirmar red y validar el despliegue final antes de congelar | Administrador, Kevin y Marina |

## Resumen

- **Abiertos:** 16
- **Cerrados:** 31
- **Obsoletos:** 6

## Decisiones abiertas antes de la congelación (04/11)

1. **Red del servidor:** el administrador debe confirmar puertos, proxy/TLS, DNS y permisos. Dueño:
   administrador/Kevin. Fecha límite: **04/11**.
2. **Validación del despliegue final:** construir y levantar Supabase self-hosted y API, aplicar las
   ocho migraciones presentes en el repositorio, importar datos, probar Auth/API/Realtime y
   backups. Dueño: Kevin y Marina. Fecha límite: **04/11**.
3. **Transición de entornos:** mantener Cloud/Render hasta que el servidor pase la validación y
   retirarlos después. Dueño: Kevin/Alex/Marina. Fecha límite: **04/11**.
4. **Facial móvil:** probar Expo con embedding ArcFace de 512 y registro/login contra el entorno
   operativo. Dueño: Alex/Rubén. Fecha límite: **04/11**.
5. **Latencia del chatbot:** medir Gemini y decidir el mensaje/plan de demo si tarda demasiado.
   Dueño: Rubén. Fecha límite: **04/11**.
6. **QR:** el código actual firma con HMAC-SHA256 (`backend/api/src/common/qr/firma.ts`), aunque
   el contrato histórico menciona Ed25519. Dueño: Rubén; decidir y alinear contrato antes del
   **04/11**.
7. **Cercanías:** decidir si se importa al servidor y cómo se refresca a diario. Dueño: Marina.
   Fecha límite: **04/11**.
