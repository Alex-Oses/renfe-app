---
fecha: 2026-10-27
autor: Alex
area: mobile
para: Rubén, Marina
rama: feat/mobile-billete-revisor-admin
pr: (ver PR de esta rama)
tags: [handoff, contrato, revisor]
estado: abierto
---

# Handoff — Billete nuevo, QR firmado, modo revisor y panel de admin preparado

## Qué se hizo
- **QR firmado** `RNF1.<datos>.<firma>` (ver [[endpoints]] → "Formato del QR"). Sin API: HMAC en el navegador (solo demo). Los billetes antiguos se vuelven a firmar al abrirlos.
- **Billete** como tarjeta de embarque: cabecera con estado del viaje, duración, muescas y QR grande. Probado: una captura del QR en pantalla se lee y valida.
- **Modo revisor** `/revisor`: cámara trasera (BarcodeDetector o jsQR), foto o pegar código. Veredicto: válido, ya validado, otro día, caducado, anulado, falso, no existe; con viajero, documento enmascarado, tren, trayecto, horas, coche, asiento, clase y localizador. Historial de lecturas.
- **Admin** `/admin`: cifras y últimas reservas (`GET /admin/resumen`, propuesto) y lista de lo pendiente.
- Roles en `Usuario.rol`. Cuentas demo: `revisor@renfe-app.demo` / `revisor123` y `admin@renfe-app.demo` / `admin1234`. En la cabecera salen "Revisor" y "Admin" según el rol.

## Qué queda
- **Rubén:** `POST /billetes/validar` y `GET /admin/resumen` según [[endpoints]]; firmar el QR con Ed25519 en la API.
- **Marina:** tabla de validaciones (`billete_id`, `revisor_id`, `validado_en`) en [[modelo-datos]]; rol `admin` en `app_metadata.rol`.
- **Alex (próximo día):** panel de admin completo (usuarios y roles, anular reservas, avisos).

## Bloqueos / preguntas para otros
- Sin API, el revisor solo comprueba firma y fechas: que el billete exista o esté anulado solo se sabe si se compró en el mismo móvil. Lo dice en pantalla.

## Cambios en contratos
- [[endpoints]]: formato del QR, `POST /billetes/validar` y `GET /admin/resumen` detallados; rol `admin`.

## Ficheros tocados
- `frontend/web/src/api/{qr-billete,simulado-revisor,simulado-admin,simulado-reservas,simulado-cuenta,cliente,tipos}.ts`
- `frontend/web/src/paginas/{Billete,Revisor,Admin}.tsx`, `src/paginas/revisor/`, `billetes.css`, `Cabecera.tsx`, `main.tsx`; dependencia `jsqr`
- `obsidian/02-contratos-api/endpoints.md`, este handoff.
