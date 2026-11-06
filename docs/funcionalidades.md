---
actualizado: 2026-11-06
autor: Rubén (con OpenCode)
estado: actualizado
tags: [app, funcionalidades, docs]
---

# 📱 Qué hace la app

Andén 0 es una **demo funcional tipo Renfe**, no un servicio de venta real. Tiene dos clientes que
comparten lógica (`@renfe/shared`): una **web** (React + Vite) y una **app móvil** (Expo / React
Native, iOS y Android). Los horarios y las posiciones de los trenes salen de los datos abiertos de
Renfe (GTFS y GTFS-RT, CC BY 4.0); los **precios, asientos, reservas y pagos son simulados**.

> Este documento cuenta lo que el usuario puede hacer. Cómo está montado por dentro:
> [`tecnico.md`](tecnico.md). Datos reales frente a simulados: [`arquitectura.md`](arquitectura.md).

## 1. Dónde se puede usar

| Canal | Cómo se entra | Estado |
|---|---|---|
| **Web** | https://renfe-app-beta.vercel.app (producción, se despliega desde `main`) | Funcional con API real |
| **Android** | APK en la página `/app` de la web y en GitHub Releases (v1.1.0) | Distribución interna |
| **iOS / Android** | App Expo; en Expo Go funciona todo menos el facial, que necesita app compilada | Distribución interna |

Web y app comparten pantallas: buscador, resultados, reserva, billetes, abonos, cuenta, mapa,
chatbot, revisor y contenido informativo. La app móvil añade notificaciones locales y el facial nativo.

## 2. El recorrido principal (comprar un billete)

1. **Buscar**: origen, destino, fecha y pasajeros (adultos, niños y bebés) en la portada.
2. **Elegir tren**: resultados con hora, duración, producto (AVE, Alvia, Avlo…), precio desde y
   plazas. Si no hay directos, se ofrecen opciones **con un transbordo**.
3. **Asientos**: plano del tren con la ocupación real de ese viaje dentro de la demo.
4. **Viajeros**: nombre y documento por pasajero, tarifa, descuento y extras.
5. **Pago**: se confirma el importe y se verifica la **cara** del titular (huella facial, no foto).
   El cobro es simulado.
6. **Billete**: uno con QR firmado por pasajero, con coche, asiento, clase y hora.
7. **Control**: el revisor escanea el QR y la app dice si es válido.

## 3. Todo lo que se puede hacer

### 3.1 Buscar viajes

- Origen y destino por **estación o ciudad** (buscar "atocha", "barcelona" o el nombre de la ciudad
  vale; se amplía a las estaciones de esa ciudad). Enlaces directos `/trenes?origen=<id>&destino=<id>`.
- Fecha de ida y, opcionalmente, de vuelta (dos tramos).
- Pasajeros: adultos y niños; los bebés van en brazos, uno por adulto. El descuento guardado en la
  cuenta se aplica por defecto.
- Filtros por **franja horaria** y orden por hora, duración o precio.
- **Transbordos** cuando no hay directos: un solo cambio, entre 15 min y 3 h de espera, en la misma
  estación o en otra de la misma ciudad.
- Avisos claros si una estación no existe o el viaje ya ha salido.

### 3.2 Reservar y pagar

- Asientos por coche y número, con clases (Turista, Confort…) y precio por plaza.
- Tarifas: **básico, elige, elige-confort y premium**.
- Descuentos: **joven, dorada, familia numerosa general y especial**; el niño tiene su propio
  descuento y se aplica el mayor.
- Extras: equipaje, mascota, bici, comida y seguro (unos por reserva y otros por viajero).
- El total lo calcula la **API**, el mismo cálculo antes y durante la compra, así que lo que se ve es
  lo que se cobra.
- **Pago simulado con verificación facial**: primero se confirma el importe y después la cara. Si la
  cuenta aún no tiene cara registrada, se registra en ese momento. La API solo acepta la compra con
  una cara verificada en los últimos 10 minutos.
- **Transbordo en una sola compra**: los dos tramos se emiten juntos o no se emite ninguno.
- Correo de confirmación (Resend o Mailpit en local; si falla, no bloquea la compra).

### 3.3 Mis billetes

- Lista agrupada por viaje, con abonos aparte; la tarjeta entera abre el billete.
- Detalle con **QR firmado** (Ed25519), datos del viajero, trayecto, coche y asiento.
- **Retraso en vivo** del tren del billete, cruzando el viaje con las posiciones de Renfe.
- **Cancelar** con penalización simulada según la clase (Confort 30 %, Turista 100 %) y reembolso.
- Guardar el billete como imagen. Apple/Google Wallet todavía no se puede: la web avisa y ofrece la
  imagen mientras la API no genere el pase firmado.
- Los billetes de un transbordo se muestran como un solo viaje.

### 3.4 Abonos y bonos

| Tipo | Trayecto | Validez | Viajes | Precio simulado |
|---|---|---|---|---|
| Abono mensual AVE/Larga Distancia | Sí | 30 días | Ilimitados | 380 € |
| Abono mensual Avant | Sí | 30 días | Ilimitados | 230 € |
| Abono recurrente Cercanías | No | 30 días | Ilimitados | 60 € |
| Bono 10 viajes | Sí | 60 días | 10 | 220 € |

Se compran desde la web o la app, se guardan en la cuenta y llevan su propio **QR `RNA1`**. El
revisor los acepta igual que un billete; un bono de 10 descuenta un viaje por lectura.

### 3.5 Cuenta y acceso

- **Registro y login con email y contraseña** (Supabase Auth valida; la API emite su propio token).
- **Acceso con la cara**: se guarda una **huella numérica de 512 valores**, nunca la imagen. La web
  la calcula en el navegador (Human + ONNX); la app, en el propio móvil con modelos ONNX nativos.
- Tras crear la cuenta se ofrece registrar la cara, necesaria para pagar con verificación facial.
- La cuenta muestra datos, tarjetas y descuentos, mis abonos y la preferencia «usar mi cara para
  validar» (se guarda en el dispositivo).
- La **sesión se cierra sola** cuando la API rechaza el token o cambia de API, en vez de dejar la
  pantalla en «token inválido».
- Roles: **viajero** (por defecto), **revisor** y **admin**.

### 3.6 Mapa en directo

- Trenes de **Cercanías y AVE/Larga Distancia** sobre OpenStreetMap (unas 500 posiciones).
- Búsqueda por número, tipo de tren, origen o destino.
- Lista lateral o panel arrastrable en móvil; al elegir un tren se ve su nombre, de dónde sale,
  adónde va, la próxima parada, la hora de llegada y el **retraso** (con estado «a tiempo», «retraso»,
  «adelanto» o «sin datos»).
- El recorrido y las paradas se piden al GTFS estático la primera vez que se abre un tren.
- Sin base de datos, la web puede pintar el mapa con posiciones reales de Renfe vía una función de
  Vercel; sin ninguna API, usa trenes simulados.

### 3.7 Mis líneas

- Favoritos origen → destino con los **próximos trenes de hoy**, su hora y su retraso.
- En la app, cada 20 s con sesión iniciada, se revisan billetes y líneas favoritas y se lanzan
  **notificaciones locales** (sin push remoto).

### 3.8 Modo revisor

- Solo para cuentas con rol `revisor` o `admin`.
- Escáner con la cámara del dispositivo (o entrada manual del código).
- Veredictos: **válido, ya validado, otro día, caducado, anulado, falso y no existe**, con los datos
  del billete o del abono.
- Historial de lecturas de la sesión y validación de abonos (descuenta viaje en los bonos).

### 3.9 Chatbot

- Preguntas en lenguaje natural sobre estaciones, trenes, horarios y posiciones («¿qué trenes hay de
  Madrid a Barcelona mañana?»).
- Usa **Gemini** con herramientas internas de **solo lectura**: no puede reservar ni ver datos
  privados.
- Devuelve tarjetas de tren enlazadas al flujo de compra y, en la web, enseña los pasos mientras
  consulta.
- Sin clave de Gemini responde 503; el resto de la app sigue funcionando.

### 3.10 Contenido informativo

- Más de 800 fichas navegables: antes de viajar, equipajes, mascotas, asistencia, cambios y
  anulaciones, facturas, descuentos, destinos, rutas inspiradoras y los núcleos de Cercanías.
- Cualquier ruta desconocida se resuelve como página de contenido; si no existe, 404 con enlace de
  vuelta.
- Incluye la atribución de los datos abiertos de Renfe (CC BY 4.0), obligatoria.

### 3.11 Panel de administración

- Preparado para el rol `admin`: resumen de billetes vendidos, reservas (y canceladas), ingresos,
  validaciones, usuarios y últimas reservas.
- La API todavía **no expone `/admin/resumen`**, así que el panel solo funciona con datos simulados
  (sin `VITE_API_URL`). Con API real muestra un aviso de error.

### 3.12 Descargar la app

- Página `/app` con el APK de Android, instrucciones para iPhone/iPad, el logo de la app y el
  favicon propio.

## 4. Qué es real y qué es simulado

| Real (datos abiertos de Renfe) | Simulado |
|---|---|
| Estaciones, rutas, horarios y calendarios (GTFS) | Precios y tarifas |
| Posiciones, retrasos y estado de los trenes (GTFS-RT) | Asientos y ocupación (dentro de la demo) |
| Trazados de Cercanías y vías de OpenStreetMap | Reservas, abonos y pagos (sin Stripe) |
| Huella facial calculada en el dispositivo | Decisión de parecido facial (umbral configurable en BD) |

Ninguna pantalla que enseñe precios, asientos o pagos reales existe: la demo lo indica en el propio
flujo de pago («modo prueba»).

## 5. Roles

| Rol | Puede |
|---|---|
| `viajero` | Buscar, comprar, ver sus billetes y abonos, cancelar, mapa, chatbot, cuenta |
| `revisor` | Lo anterior + validar QRs de billetes y abonos |
| `admin` | Lo anterior + panel de administración y reset de la huella facial de un usuario |

El rol se guarda en el perfil y viaja firmado en el token; nadie puede autoasignarse `revisor` al
registrarse.

## 6. Límites conocidos

- **No hay cobro real**: Stripe sigue sin conectar y las reservas nacen pagadas.
- **No hay precios ni aforo reales**: Renfe no los publica; los importes son deterministas y
  simulados.
- **Cercanías no está en el catálogo**: el worker importa AVE/Larga y Media Distancia; de Cercanías
  solo hay posiciones en el mapa.
- **`/incidencias`** está en el contrato pero la API todavía no lo implementa.
- El **facial** necesita la app compilada (no funciona en Expo Go) y no sustituye a la contraseña.
- La **caché del navegador** puede servir una versión antigua de la web tras un despliegue: recarga
  forzada (Ctrl+F5) si algo no cuadra.
