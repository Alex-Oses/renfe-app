import type { Pagina } from "./tipos";

// Contenido de "Gestiona tu billete". Datos tomados de renfe.com (oct. 2026), redactados de nuevo.
const s = "gestiona";

const tablaCambiosAnulaciones = {
  tipo: "tabla" as const,
  titulo: "Condiciones por tarifa (AVE, Alvia, Euromed e Intercity)",
  columnas: ["Tarifa", "Cambio", "Anulación"],
  filas: [
    ["Básico", "10 € más la diferencia de precio, hasta 24 h antes de la salida", "No se devuelve el importe"],
    ["Elige / Elige Confort", "Primer cambio gratis; los siguientes, 10 € más la diferencia", "Se devuelve el 70 % del billete"],
    ["Elige + Reembolso total (5 €)", "Igual que Elige", "100 % hasta 7 días antes; 95 % en los últimos 6 días"],
    ["Prémium", "Cambios sin gastos", "100 % hasta 7 días antes; 95 % en los últimos 6 días"],
  ],
};

export const paginas: Pagina[] = [
  {
    ruta: "/gestiona",
    titulo: "Gestiona tu billete",
    resumen: "Consulta, cambia o anula tus viajes, añade extras y tramita facturas, reclamaciones e indemnizaciones.",
    seccion: s,
    bloques: [
      {
        tipo: "tarjetas",
        tarjetas: [
          { titulo: "Tus reservas", texto: "Localiza tus viajes, cámbialos, anúlalos o mira cómo va tu tren.", enlace: "/gestiona/tus-reservas" },
          { titulo: "Añade extras", texto: "Suma un billete de niño o servicios extra a un viaje ya comprado.", enlace: "/gestiona/anade-extras" },
          { titulo: "Posventa", texto: "Pide una indemnización por retraso, tu factura o presenta una reclamación.", enlace: "/gestiona/posventa" },
        ],
      },
      { tipo: "aviso", nivel: "info", texto: "Para casi todas las gestiones necesitas el localizador del billete (6 caracteres) y el correo o documento usado en la compra." },
    ],
  },
  {
    ruta: "/gestiona/tus-reservas",
    titulo: "Tus reservas",
    resumen: "Todo lo que puedes hacer con un billete que ya tienes.",
    seccion: s,
    bloques: [
      {
        tipo: "tarjetas",
        tarjetas: [
          { titulo: "Consulta tus viajes", texto: "Recupera tu billete con el localizador.", enlace: "/gestiona/tus-reservas/consulta-tus-viajes" },
          { titulo: "Cambia tu billete", texto: "Elige otra fecha u hora según tu tarifa.", enlace: "/gestiona/tus-reservas/cambia-tu-billete" },
          { titulo: "Anula tu billete", texto: "Cancela y recupera la parte que te corresponda.", enlace: "/gestiona/tus-reservas/anula-tu-billete" },
          { titulo: "Grupos de 10 a 25", texto: "Compra para grupos medianos con descuento.", enlace: "/gestiona/tus-reservas/grupos-10-25" },
          { titulo: "Compra con localizador", texto: "Paga una reserva que dejaste pendiente.", enlace: "/gestiona/tus-reservas/compra-con-localizador" },
          { titulo: "Estado de tu tren", texto: "Mira salidas, llegadas y retrasos en tiempo real.", enlace: "/gestiona/tus-reservas/estado-de-tu-tren" },
        ],
      },
    ],
  },
  {
    ruta: "/gestiona/tus-reservas/consulta-tus-viajes",
    titulo: "Consulta tus viajes",
    resumen: "Recupera los datos de tu billete, descárgalo de nuevo o reenvíalo a tu correo.",
    seccion: s,
    bloques: [
      { tipo: "herramienta", id: "consulta-reserva" },
      {
        tipo: "pasos",
        pasos: [
          { titulo: "Ten a mano el localizador", texto: "Viene en el correo de confirmación y en el propio billete." },
          { titulo: "Indica cómo compraste", texto: "Por internet basta con el correo; por teléfono o en taquilla con tarjeta te pedirán los 6 primeros y 4 últimos dígitos de la tarjeta." },
          { titulo: "Gestiona", texto: "Desde el detalle del viaje puedes descargar el billete, cambiarlo, anularlo o añadir extras." },
        ],
      },
      { tipo: "aviso", nivel: "info", texto: "Si eres usuario registrado, todos tus viajes aparecen en Mis viajes sin necesidad del localizador." },
    ],
  },
  {
    ruta: "/gestiona/tus-reservas/cambia-tu-billete",
    titulo: "Cambia tu billete",
    resumen: "Modifica la fecha, la hora o la clase de tu viaje. Lo que pagas depende de la tarifa que compraste.",
    seccion: s,
    bloques: [
      { tipo: "herramienta", id: "cambia-billete" },
      tablaCambiosAnulaciones,
      {
        tipo: "lista",
        titulo: "A tener en cuenta",
        items: [
          "Si el nuevo billete cuesta más, pagas la diferencia; si cuesta menos con tarifa Básico, no se devuelve.",
          "El extra Pack Superflex añade cambios ilimitados y gratuitos, Puente AVE y reembolso total.",
          "Los cambios se hacen en el mismo canal (web, app, taquilla o teléfono 912 320 320) antes de la salida del tren.",
          "En Avant, Media Distancia y Cercanías los cambios siguen las condiciones propias de cada producto.",
        ],
      },
    ],
  },
  {
    ruta: "/gestiona/tus-reservas/anula-tu-billete",
    titulo: "Anula tu billete",
    resumen: "Cancela un viaje antes de la salida y recupera el importe que te corresponda según la tarifa.",
    seccion: s,
    bloques: [
      { tipo: "herramienta", id: "anula-billete" },
      tablaCambiosAnulaciones,
      {
        tipo: "tabla",
        titulo: "Otros servicios",
        columnas: ["Servicio", "Gastos de anulación"],
        filas: [
          ["Avant y Media Distancia (sencillo)", "Se descuenta el 15 % del precio"],
          ["Avant y Media Distancia, solo un trayecto de ida y vuelta", "Se descuenta el 40 % de ese billete"],
          ["Avant y Media Distancia, ida y vuelta completa", "Se descuenta el 15 %"],
          ["Cercanías y Rodalies", "Solo en las 2 horas siguientes a la compra"],
        ],
      },
      { tipo: "aviso", nivel: "info", texto: "Si compraste por la web, anula también por la web. Los billetes en PDF pagados con tarjeta o PayPal desde fuera de España se anulan llamando al +34 912 320 320." },
    ],
  },
  {
    ruta: "/gestiona/tus-reservas/grupos-10-25",
    titulo: "Grupos de 10 a 25 personas",
    resumen: "Compra en una sola operación para grupos medianos y consigue descuento.",
    seccion: s,
    bloques: [
      { tipo: "herramienta", id: "solicitud-grupos" },
      {
        tipo: "lista",
        items: [
          "Busca origen, destino, fechas y número de adultos y niños del grupo.",
          "Hasta 4 niños menores de 4 años pueden viajar gratis sin ocupar asiento.",
          "La asistencia para personas con movilidad reducida se pide en otra compra o por teléfono.",
          "Con Elige o Elige Confort, si anulas más de 48 h antes de la salida recuperas el 70 %; después, el 25 %.",
        ],
      },
      { tipo: "aviso", nivel: "info", texto: "Para grupos de más de 25 personas hay que pedir presupuesto al servicio de grupos." },
    ],
  },
  {
    ruta: "/gestiona/tus-reservas/compra-con-localizador",
    titulo: "Compra con localizador",
    resumen: "Termina de pagar una reserva que se hizo antes y quedó pendiente de compra.",
    seccion: s,
    bloques: [
      { tipo: "herramienta", id: "compra-localizador" },
      {
        tipo: "pasos",
        pasos: [
          { titulo: "Introduce el localizador", texto: "Es el código que te dieron al hacer la reserva (por teléfono o en una agencia)." },
          { titulo: "Revisa el viaje", texto: "Comprueba trayecto, fecha, viajeros y precio antes de pagar." },
          { titulo: "Paga y descarga", texto: "Tras el pago recibirás el billete en tu correo." },
        ],
      },
      { tipo: "aviso", nivel: "alerta", texto: "Las reservas sin pagar caducan; si se pasa el plazo, la plaza se libera y tendrás que comprar de nuevo." },
    ],
  },
  {
    ruta: "/gestiona/tus-reservas/estado-de-tu-tren",
    titulo: "Estado de tu tren",
    resumen: "Consulta en tiempo real si tu tren va en hora, por estación, número de tren o trayecto.",
    seccion: s,
    bloques: [
      { tipo: "herramienta", id: "estado-tren" },
      {
        tipo: "texto",
        parrafos: [
          "Puedes buscar por estación, por número de tren, por origen y destino o con el número del billete.",
          "La consulta muestra los trenes que circulan ahora, los que llegaron hace menos de 2 horas y los que salen ese día o en las 4 horas siguientes.",
          "Los horarios son orientativos: debes estar en la estación a la hora que marca tu billete.",
        ],
      },
    ],
  },
  {
    ruta: "/gestiona/anade-extras",
    titulo: "Añade extras",
    resumen: "Completa un viaje ya comprado con un billete de niño o servicios adicionales.",
    seccion: s,
    bloques: [
      {
        tipo: "tarjetas",
        tarjetas: [
          { titulo: "Billete de niño", texto: "Añade a un menor que viaja contigo.", enlace: "/gestiona/anade-extras/billete-nino" },
          { titulo: "Extras de viaje", texto: "Mascota, bici, asiento, Puente AVE, reembolso total…", enlace: "/gestiona/anade-extras/extras-de-viaje" },
        ],
      },
    ],
  },
  {
    ruta: "/gestiona/anade-extras/billete-nino",
    titulo: "Añade un billete de niño",
    resumen: "Suma un menor a tu reserva para que viaje junto a ti.",
    seccion: s,
    bloques: [
      { tipo: "herramienta", id: "anade-nino" },
      {
        tipo: "lista",
        items: [
          "Los menores de 4 años viajan gratis sin ocupar plaza, pero conviene añadirlos a la reserva.",
          "De 4 a 13 años tienen descuento de niño sobre la tarifa del adulto y ocupan asiento.",
          "El niño se coloca junto al adulto si hay plazas libres contiguas.",
          "Necesitas el localizador y los datos del documento del adulto.",
        ],
      },
    ],
  },
  {
    ruta: "/gestiona/anade-extras/extras-de-viaje",
    titulo: "Añade extras de viaje",
    resumen: "Contrata servicios adicionales para un billete que ya tienes.",
    seccion: s,
    bloques: [
      { tipo: "herramienta", id: "anade-extras" },
      {
        tipo: "pasos",
        pasos: [
          { titulo: "Busca tu viaje", texto: "Con trayecto, tipo y número de documento y fecha, o con el localizador." },
          { titulo: "Elige el extra", texto: "Según el tren: mascota, bicicleta, elección de asiento, Puente AVE o Reembolso total (5 €)." },
          { titulo: "Paga", texto: "Se suma a tu reserva y recibes la confirmación por correo." },
        ],
      },
      { tipo: "aviso", nivel: "info", texto: "¿Dudas? Centro de Servicios Renfe Contigo: 912 320 320." },
    ],
  },
  {
    ruta: "/gestiona/posventa",
    titulo: "Posventa",
    resumen: "Trámites después del viaje: indemnizaciones, facturas y reclamaciones.",
    seccion: s,
    bloques: [
      {
        tipo: "tarjetas",
        tarjetas: [
          { titulo: "Solicita indemnización", texto: "Si tu tren llegó con retraso.", enlace: "/gestiona/posventa/indemnizacion" },
          { titulo: "Solicita tu factura", texto: "De billetes, abonos o gastos de cambio.", enlace: "/gestiona/posventa/factura" },
          { titulo: "Tramita tu reclamación", texto: "Presenta o consulta una reclamación.", enlace: "/gestiona/posventa/reclamacion" },
        ],
      },
    ],
  },
  {
    ruta: "/gestiona/posventa/indemnizacion",
    titulo: "Solicita indemnización por retraso",
    resumen: "Renfe te devuelve parte o todo el billete si el tren llega tarde, según el compromiso de puntualidad.",
    seccion: s,
    bloques: [
      { tipo: "herramienta", id: "form-indemnizacion" },
      {
        tipo: "tabla",
        titulo: "Cuánto te devuelven",
        columnas: ["Servicio", "Retraso", "Devolución"],
        filas: [
          ["AVE, Avlo, Alvia, Euromed, Intercity y Larga Distancia", "60 min o más", "50 %"],
          ["AVE, Avlo, Alvia, Euromed, Intercity y Larga Distancia", "Más de 90 min", "100 %"],
          ["Avant", "Más de 15 min", "50 %"],
          ["Avant", "Más de 30 min", "100 %"],
          ["Media Distancia", "Más de 15 / 30 / 60 min", "25 % / 50 % / 100 %"],
        ],
      },
      {
        tipo: "lista",
        titulo: "Plazos y forma de cobro",
        items: [
          "Puedes pedirla cuando hayan pasado 24 horas desde la llegada del tren y hasta 3 meses después del viaje.",
          "Elige cobrar en el mismo medio de pago, en un código de descuento con un 50 % extra (válido 6 meses) o en Puntos Más Renfe con un 100 % extra.",
          "No hay indemnización si el retraso se debe a fuerza mayor según el Reglamento (UE) 2021/782.",
          "En billetes comprados desde el 31 de enero de 2026 tampoco compensan los retrasos por limitaciones temporales de velocidad de Adif.",
        ],
      },
    ],
  },
  {
    ruta: "/gestiona/posventa/factura",
    titulo: "Solicita tu factura",
    resumen: "Pide la factura de tus billetes o abonos, en el momento de la compra o después.",
    seccion: s,
    bloques: [
      { tipo: "herramienta", id: "form-factura" },
      {
        tipo: "texto",
        titulo: "Si estás registrado",
        parrafos: [
          "Puedes pedir la factura al comprar o más tarde desde Mis viajes, y verla o imprimirla cuando quieras en Mis facturas. Si anulas o te devuelven dinero, la factura rectificativa se genera sola.",
          "Necesitas tener el NIF o CIF en tu perfil; se guarda para las siguientes veces y la factura sale a nombre de ese documento.",
        ],
      },
      {
        tipo: "lista",
        titulo: "Sin registro, con el formulario puedes pedir",
        items: [
          "Facturas de billetes o localizadores comprados por cualquier canal.",
          "Facturas de Cercanías (opción «Otras solicitudes»).",
          "Una factura que agrupe un rango de fechas.",
          "Facturas de gastos de cambio o anulación.",
          "Facturas de la emisión de la Tarjeta Dorada o la Tarjeta Joven.",
          "Rectificaciones o copias de facturas ya emitidas.",
        ],
      },
    ],
  },
  {
    ruta: "/gestiona/posventa/reclamacion",
    titulo: "Tramita tu reclamación",
    resumen: "Presenta una reclamación por internet o consulta el estado de una que ya enviaste.",
    seccion: s,
    bloques: [
      { tipo: "herramienta", id: "form-reclamacion" },
      {
        tipo: "lista",
        titulo: "Qué datos tienes que dar",
        items: [
          "Nombre, apellidos y DNI u otro documento.",
          "Dirección postal o correo donde quieres recibir la respuesta.",
          "Qué pasó, en qué trayecto (origen y destino), qué día y a qué hora.",
          "Si quieres, otros datos útiles, como un testigo de lo ocurrido.",
        ],
      },
      {
        tipo: "faq",
        preguntas: [
          { p: "¿Hasta cuándo puedo reclamar?", r: "Tienes 3 meses desde que ocurrieron los hechos." },
          { p: "¿Cuánto tardan en responder?", r: "Un mes desde que la reciben. En casos complejos te avisarán de la fecha, que nunca pasará de 3 meses." },
          { p: "¿Puedo ver mi expediente?", r: "Sí, tienes derecho a acceder a los documentos de tu reclamación (arts. 101 y 102 del Real Decreto 2387/2004)." },
        ],
      },
    ],
  },
];
