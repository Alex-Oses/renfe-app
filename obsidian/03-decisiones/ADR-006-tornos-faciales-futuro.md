---
fecha: 2026-10-28
estado: propuesto
autor: Alex
tags: [adr, face, futuro]
---

# ADR-006 — Plan de futuro: acceso facial en los tornos de las estaciones

**No entra en la entrega del 06/11.** Es la línea de evolución que se presenta en la demo.

## Contexto
- Ya tenemos login facial (embeddings, nunca fotos) y billetes y abonos con QR firmado, que se guardan en la cuenta.
- En los aeropuertos ya se embarca con la cara (por ejemplo, los filtros biométricos de Aena). En una estación AVE, el control de acceso es el mismo problema.

## Decisión
Idea de futuro: los tornos de las estaciones AVE y de Larga Distancia llevan una cámara.
1. El viajero activa «Usar mi cara para validar» en su billete o abono, desde la cuenta o la app.
2. Al llegar al torno, la cámara saca el embedding y el servidor facial ([[ADR-005-app-movil-expo]], Python) lo compara **solo con los viajeros que tienen un título válido para esa estación y esa franja horaria**, no con toda la base de datos.
3. Si coincide, se abre el torno y queda registrada la entrada o la salida (como la validación del QR del revisor). Si no, el viajero usa el QR de siempre.

## Alternativas descartadas
- **Comparar contra todos los usuarios (1:N global):** más lento, más falsos positivos y más riesgo para la privacidad.
- **Solo QR:** es lo que hay hoy, y obliga a sacar el móvil.

## Consecuencias
- Es voluntario y se puede revocar. El QR siempre funciona. Datos biométricos: RGPD art. 9 (consentimiento explícito), evaluación de impacto y borrado del embedding al darse de baja.
- Hardware (cámara y control del torno) y acuerdo con Adif: queda fuera del proyecto académico.
- En la web y la app hoy solo existe la preferencia «Usar mi cara para validar» y una sección «Próximamente» que lo explica.
