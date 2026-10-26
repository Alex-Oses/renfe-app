# @renfe/mobile — App Expo

> Esqueleto vacío. La app se genera en el Sprint 0/1 con el comando de abajo.

## Crear la app (una sola vez, la hace Alex)

Desde la raíz del repo:

```bash
cd frontend
# Borra el contenido de mobile/ salvo este README y luego:
pnpm create expo-app mobile --template tabs
```

Después, en `mobile/package.json`, cambia `"name"` a `"@renfe/mobile"` y añade el script `"dev": "expo start"`.

## Estructura prevista

```
mobile/
├── src/
│   ├── app/          # Rutas (Expo Router): (viajero)/, (revisor)/, auth/
│   ├── features/     # Una carpeta por funcionalidad: busqueda, reserva, billetes, mapa, chatbot, face-login
│   ├── components/   # Componentes UI reutilizables
│   ├── services/     # Cliente de la API, Supabase, Stripe
│   └── theme/        # Colores, tipografía (estilo Renfe)
├── app.json
└── package.json
```

## Librerías previstas

expo-router, @supabase/supabase-js, @stripe/stripe-react-native, expo-camera (QR + cara), react-native-maps, @tanstack/react-query.

## Ejecutar

```bash
pnpm dev:mobile        # desde la raíz
```
