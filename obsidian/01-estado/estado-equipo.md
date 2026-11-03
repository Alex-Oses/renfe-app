---
actualizado: 2026-11-02
tags: [estado]
---

# 📊 Estado del equipo

> Cada persona (o su IA) actualiza **solo su fila** al terminar una sesión.
> Estados: 🟢 en marcha · 🟡 bloqueado/esperando · ⚪ sin empezar · ✅ hecho

| Persona | Rol | Estado | En qué está | Bloqueos | Actualizado |
|---|---|---|---|---|---|
| Alex | PO + Frontend | 🟡 | Conexión web, shared y móvil con precios/reservas reales en `feat/mobile-conexion-api-precios`: `/precios/calcular`, `/reservas`, `/reservas/transbordo`, `/reservas?localizador=`, `/billetes` con `transbordos` y `/estaciones/:id` ([[2026-11-03-alex-conexion-api]]). Lint, tests y build en verde. | Validación manual bloqueada hasta que #137/#138 estén integradas: la API desplegada aún devuelve 404 en `/estaciones/:id` | 2026-11-03 |
| Rubén | Backend + chatbot | 🟢 | **Facial en la app, nativo y en PR**: pantalla `/cara` con `expo-camera` + ONNX en el dispositivo (SCRFD + ArcFace 512), sin navegador ni WebView; PR **#123** con CI en verde. **QR de billete y abono con Ed25519** (PR **#130**): una sola variable `QR_SIGNING_PRIVATE_KEY`, validada al arrancar, con tests; `.env.example` sin variables muertas. Liveness, umbral de `config_cara` y latencia de Gemini: **validados en la web**. | Compilar y probar el facial en un móvil real (en mi PC no hay Android SDK ni JDK); ambas PRs esperan aprobaciones; Kevin debe cambiar `QR_SIGNING_SECRET` por `QR_SIGNING_PRIVATE_KEY` en Render | 2026-11-03 |
| Marina | SM + Base de datos | 🟢 | **Supabase Cloud validada**: proyecto `hqwwucagvlhnlqrspwvh` (eu-west-1), 4 migraciones con `db push`, catálogo AV/LD cargado por el session pooler y `gtfs:verificar` en verde (1 035 estaciones / 668 rutas / 8 908 viajes / 71 781 horarios, feed 29/10). Los 3 PRs (#72, #73, #74) ya están mergeados. Siguiente: `DATABASE_URL` en Render ([[supabase-nube]]) | Nada por mi parte. Render sigue en 503 hasta que Kevin/Alex pongan `DATABASE_URL` | 2026-10-29 |
| Kevin | DevOps + despliegue + Docker | 🟢 | CI revisada y en verde (excepción para Dependabot + `pnpm test:ramas`): PR **#75** abierta, `CI / ok` y `PR / reglas` ✅, falta aprobación. API viva en Render sin base de datos. Siguiente: en cuanto exista Supabase Cloud ([[supabase-nube]]) rellenar las variables de Render; y Docker (D10 de [[ADR-005-app-movil-expo]]) | `DATABASE_URL` bloqueada hasta que Marina cree Supabase Cloud | 2026-10-28 |

## Bloqueos globales
- **Historial reescrito el 27/10: todos tenéis que borrar vuestra copia y clonar de nuevo** (ver [[2026-10-27-alex-reescritura-historial-y-vercel]]).
- 🟢 **Supabase Cloud operativa desde el 29/10** (`hqwwucagvlhnlqrspwvh`, eu-west-1): esquema y catálogo AV/LD cargados y verificados. Ya no depende de la VM de Marina ([[supabase-nube]]).
- API desplegada en Render (https://renfe-api.onrender.com) **sin base de datos**: `/estaciones` y `/trenes` dan 503 hasta que se rellene `DATABASE_URL` (session pooler) en el panel de Render.
- 🟢 **La app móvil ya tiene plan** ([[ADR-005-app-movil-expo]], 28/10): Expo para iOS y Android, y la web queda como demo y plan B. El facial está decidido en [[ADR-007-reconocimiento-facial]]: **sin servidor Python**, el vector lo calcula el dispositivo y la decisión la toma Postgres.
- 🟡 **Servidor final bloqueado por red:** el administrador debe confirmar la apertura de puertos y autorizar proxy/TLS y DNS. La base de datos y la API deben quedar dockerizadas allí; Supabase Cloud y Render son transitorios y se retirarán solo después de validar el servidor ([[infraestructura-servidor]], [[ADR-009-supabase-self-hosted-en-servidor]]).

## Próximos hitos
- **Entrega final: 06/11/2026.** Congelación de código el 04/11. Plan en [[sprint-actual]].
