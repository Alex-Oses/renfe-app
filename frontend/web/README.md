# @renfe/web — Web React + Vite

**Responsable:** Alex · Web de viajero y revisor.

Aplicación web de Andén 0: React 18, React Router, Vite y TypeScript estricto. Comparte cliente de API,
tipos, datos simulados, contenido y tokens con la app móvil mediante `@renfe/shared`.

## Estado

Web funcional en desarrollo, no un esqueleto. Incluye inicio, buscador y resultados, reserva con pago
simulado, mis billetes y QR, cuenta, abonos, mapa de posiciones, revisor y páginas de contenido/ayuda.
Su disponibilidad depende de la configuración y de la API; que una pantalla exista en el repositorio no
implica que esté desplegada.

## Ejecutar

```bash
pnpm install          # desde la raíz
pnpm dev:web          # Vite en el puerto 5173
pnpm --filter @renfe/web test
pnpm --filter @renfe/web lint
pnpm --filter @renfe/web build
```

Sin `VITE_API_URL`, la web usa los datos simulados de `@renfe/shared`. Para posiciones en directo puede
configurarse `VITE_POSICIONES_URL` o `VITE_TIEMPO_REAL` (ver `.env.example`).

## Estructura

- `src/paginas/`: inicio, búsqueda, resultados, reserva, billetes, cuenta, abonos, mapa, revisor y
  contenido.
- `src/componentes/`: cabecera, pie, buscador, fotos, avisos y piezas compartidas de interfaz.
- `src/estado/`: sesión, avisos y seguimiento de trenes.
- `api/posiciones.ts`: adaptador de GTFS-RT para la función de Vercel.

## Límites

- Horarios y posiciones parten de datos abiertos GTFS/GTFS-RT de Renfe (CC BY 4.0); precios, asientos,
  reservas, abonos y pagos son simulados.
- El reconocimiento facial de la web usa cámara y cálculo en el navegador; no hay servicio facial aparte.
- No se debe afirmar que una función está desplegada sin comprobarlo en el entorno correspondiente.
