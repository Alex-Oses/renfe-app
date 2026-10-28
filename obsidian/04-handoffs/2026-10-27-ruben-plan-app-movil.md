---
fecha: 2026-10-27
autor: Rubén
area: frontend
para: Alex
estado: abierto
prioridad: alta
rama: feat/api-retrasos
pr: "#47"
tags: [incidencia, frontend, movil, planificacion, entrega]
---

# 🔴 Incidencia abierta — **no existe plan para la app móvil**, que es la entrega principal

> Abierta por Rubén el 27/10. No es un plan: es la lista de decisiones que faltan para poder
> escribirlo. **Nadie debe empezar a programar la app hasta que se contesten D1–D3.**

## 1. El objetivo, tal como lo ha fijado el equipo

La entrega final (06/11, congelación 04/11) tiene que incluir:

1. **La app móvil de Renfe** como pieza principal.
2. **El proyecto dockerizado.**
3. La documentación de la aplicación.
4. El inicio de sesión por reconocimiento facial.

La web de `frontend/web` **es un extra y una herramienta de testeo**. La idea es llevar ese producto a
app y **mejorar la UX/UI en la app**, porque la app es lo que se entrega. Enfoque técnico propuesto:
**React Native** (decisión de Rubén, 27/10; pendiente del OK de Alex, que es el dueño del frontend).

## 2. La documentación dice lo contrario, y por eso hay que corregirla

| Documento | Qué dice hoy | Qué hay que hacer |
|---|---|---|
| [[sprint-actual]] | «**Fuera**: … Docker, app Expo» | Reescribirlo: hoy excluye el objetivo principal. Es de Alex (PO) |
| [[ADR-004-web-primero-vercel-render]] | Web primero; Android «al final» con **Capacitor**; `estado: propuesto`, sin aprobar | Queda **en conflicto** con React Native. Hay que rechazarlo o reescribirlo. Es de Alex |
| [[ADR-001-stack-tecnologico]] | Expo + React Native | Es lo único alineado con el objetivo, y solo nombra la tecnología |
| [[frontend]] (nota de área) | «`frontend/mobile` (Expo) queda fuera de la entrega» | Corregir. Es de Alex |
| `frontend/README.md` | Dice que el frontend **es** Expo y solo lista `mobile/` | Corregir: hoy la única app es `web/` |
| `frontend/mobile/` | Esqueleto vacío (un `package.json` con `dev: echo`, cinco README) | Es donde iría la app |
| `docker-compose.yml` + 3 `Dockerfile` | Placeholder del commit inicial, **nunca ejecutados**; el propio fichero dice que no funcionará | No hay dockerización, solo el andamio |

**Conclusión:** no hay plan de la app móvil en ninguna parte. Lo que hay es una decisión en contra
(ADR-004) y un sprint que la excluye.

## 3. Decisiones pendientes

Cada una con las opciones reales. **No están tomadas**; las que son de frontend decide Alex.

**D1 · Expo (managed) o React Native CLI (bare)** — *decide Alex*
Expo es más rápido de arrancar y da EAS Build sin Android Studio; bare da control total y builds
locales. Con 10 días, Expo.

**D2 · ¿Se reescribe la UI o se reutiliza algo de `frontend/web`?** — *decide Alex*
La lógica es TypeScript y se puede portar (`src/api/cliente.ts`, `src/estado/`, `src/contenido/`);
**la UI no**, porque es React DOM + CSS. Si se reescribe todo, son las 10 pantallas desde cero.

**D3 · ¿Qué pasa con `frontend/web` y Vercel?** — *decide Alex*
Queda como demo/testeo (lo que se ha dicho) o se retira. **Aviso:** hoy es lo único desplegado y lo
único que se puede enseñar si la app no llega.

**D4 · ¿`frontend/mobile` o una carpeta nueva?** — *decide Alex*
`frontend/mobile` ya está reservada y con la estructura prevista (`app/`, `features/`, `components/`,
`services/`, `theme/`).

**D5 · ¿Solo Android?** — *decide el equipo*
iOS exige macOS para compilar. Nadie del equipo tiene Mac. Propuesta: **Android-only** y decirlo en la
documentación, no descubrirlo en la demo.

**D6 · ¿Cómo se entrega el APK?** — *decide Alex / Kevin*
- **Expo Go** en un móvil: no es un APK, es la app corriendo en un cliente. Sirve para la demo, no
  para entregar.
- **EAS Build**: cuenta gratuita, cola de espera, no necesita Android Studio.
- **Build local**: requiere Android Studio + JDK en el PC. Aquí no está instalado.

**D7 · ¿Cómo se hace el facial en la app?** — *decide Alex con Kevin*
`ADR-004` **eliminó `backend/face-service/`** (Python) y movió el facial al navegador con Human.
Si la app es React Native, ese código no se reutiliza. Opciones: cámara nativa (`expo-camera`) con
modelo en el dispositivo, o una webview solo para el login facial. Y decidir si `face-service` vuelve.

**D8 · ¿Se rechaza `ADR-004`?** — *decide Alex*
Si la app es React Native, el ADR está muerto en su punto principal. Marcarlo `estado: rechazado` con
el motivo, o reescribirlo. **No se borra.**

**D9 · ¿Se reescribe el sprint?** — *decide Alex (PO)*
Hoy pone app y Docker fuera. Mientras siga así, cualquiera que lea el vault trabajará en lo contrario
de lo que se entrega.

**D10 · ¿Qué se dockeriza exactamente?** — *decide Kevin*
La app móvil **no** va en Docker (se compila a APK). Lo dockerizable es la API, Supabase local y el
worker. **Y hay un problema práctico:** en el PC de Rubén no se puede probar Docker (decisión del
27/10), así que la dockerización se escribe a ciegas y hay que validarla en la VM de Marina o en el PC
de Kevin. Sin eso, «proyecto dockerizado» es una carpeta con ficheros que nadie ha ejecutado.

**D11 · ¿Qué es «documentación de la aplicación» para la entrega?** — *decide el equipo*
No está definido en ningún sitio. ¿Memoria del proyecto, manual de usuario, diagramas, Swagger, o todo?
Depende del enunciado de la asignatura.

**D12 · ¿Cabe?** — *decide el equipo*
Quedan **10 días** hasta la congelación y el frontend es de una sola persona. Si la app es React
Native desde cero, algo hay que recortar. Lo que se recorte se escribe antes de empezar, no el 3/11.

## 4. Qué no se toca hasta que se decida

- No se crea la app ni se instalan dependencias de React Native.
- No se reescriben `sprint-actual.md` ni `ADR-004` (son de Alex).
- No se borra ni se toca `frontend/web`: es el plan B y lo único enseñable hoy.

## 5. Lo que sí puedo adelantar desde la API (Rubén)

Sin depender de D1–D3, y solo si se confirma que hay app:

- **CORS**: hoy `CORS_ORIGINS` solo acepta orígenes web. Una app nativa no manda `Origin`; hay que
  revisar la política antes de que la app haga la primera petición.
- **Contrato**: [[endpoints]] sigue siendo el único punto de acceso. Los 6 campos del mapa
  (`nombre`, `linea`, `origen`…) son justo los que la app necesitará para la UX/UI, y hoy son `null`
  por falta de BD. Si la app es la entrega principal, esos campos pasan de «nice to have» a bloqueantes.
- **Docker**: coordinar con Kevin el servicio de la API y validarlo donde haya Docker.

## 6. Siguiente paso

Alex contesta **D1, D2 y D3**. Con eso se puede escribir el plan de verdad (pantallas, orden, fechas,
responsables) en [[frontend]] o en un ADR nuevo, y corregir el sprint y el ADR-004.

## Ficheros tocados

- Este handoff.
- [[estado-equipo]]: bloqueo global añadido (solo esa sección; no toco filas de nadie).
