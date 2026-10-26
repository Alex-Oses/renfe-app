---
fecha: 2026-10-26
estado: propuesto
autor: Alex
tags: [adr]
---

# ADR-002 — Web primero (React en Vercel), API en Render y facial en el navegador

Sustituye partes de [[ADR-001-stack-tecnologico]]: frontend, despliegue y servicio facial. El resto sigue igual.

## Contexto
- Con Expo cada prueba en el móvil es lenta y para enseñar algo hay que instalar la app. Queremos un enlace que funcione en cualquier sitio para las reviews y el profe.
- Lo que necesita la app (cámara, lector de QR, mapa, chatbot) funciona en el navegador.
- Todo tiene que ser **gratis al 100 %**. El servicio facial con InsightFace no cabe en los 512 MB de RAM del plan gratuito de Render.

## Decisión
- **Frontend:** web app con **Vite + React + TypeScript** en `frontend/web`, desplegada en **Vercel** (plan Hobby). Cada PR tiene su URL de preview.
- **Android:** al final del proyecto se empaqueta la misma web como APK con **Capacitor**. No hay que reescribir nada.
- **API:** NestJS en **Render** (plan gratuito), conectada a **Supabase**.
- **Conexión front ↔ API:** la URL sale de la variable `VITE_API_URL`. Todas las llamadas pasan por un único cliente (`src/api/`) que sigue [[endpoints]]. Mientras la API no exista, ese cliente devuelve datos simulados; cambiar a la API real es cambiar la variable.
- **Reconocimiento facial en el navegador:** con la librería **Human** (`@vladmandic/human`, licencia MIT). El navegador detecta la cara, comprueba que es una persona real (*liveness*) y calcula el embedding. La API solo recibe el embedding y lo compara con el guardado en Supabase con **pgvector**. No hay servidor Python y nunca se suben fotos.

## Alternativas descartadas
- **Expo / React Native desde el principio:** más lento para iterar y para enseñar. Pasar a APK con Capacitor nos da Android igualmente.
- **InsightFace en Render:** necesita más RAM que el plan gratuito.
- **InsightFace en Hugging Face Spaces (gratis):** funciona, pero el servicio se duerme tras 48 h sin uso y añade otro despliegue que mantener.
- **face-api.js:** sin mantenimiento desde 2020.

## Consecuencias
- Se elimina `backend/face-service/` (Python). Kevin pasa a encargarse del facial en el frontend (módulo con Human) y de la comparación con pgvector en la API, junto a Rubén.
- Todo el proyecto queda en TypeScript.
- **Render gratuito se duerme** tras 15 min sin uso y tarda ~50 s en despertar: antes de una demo, abrir la API un minuto antes.
- La API debe permitir CORS desde el dominio de Vercel y sus previews.
- **Seguridad del facial:** como el embedding se calcula en el cliente, alguien podría enviar uno falso. Para una práctica es aceptable. Mitigación: liveness de Human, umbral de similitud estricto y login facial solo como alternativa a la contraseña, nunca como único factor para pagar.
- Hay que actualizar `AGENTS.md`, `docs/arquitectura.md`, el sprint y CODEOWNERS cuando se acepte este ADR.

## Pendiente de aprobar
Alex lo propone. Hace falta el OK de Rubén (API en Render) y Kevin (despliegues y facial) en la próxima daily.
