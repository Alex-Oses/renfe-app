import type { Pagina } from "./tipos";

// Sección Ayuda (incluye la información legal bajo /ayuda/informacion-legal/...).
// Datos (teléfonos, plazos, porcentajes) tomados de renfe.com en oct. 2026; textos redactados de nuevo.

const AVISO_ACADEMICO =
  "Este sitio es un proyecto académico de un ciclo formativo (ASIX). No tiene relación con Renfe Viajeros ni con ninguna empresa del Grupo Renfe, no vende billetes y no recoge datos reales.";

export const paginas: Pagina[] = [
  {
    ruta: "/ayuda",
    titulo: "¿En qué podemos ayudarte?",
    resumen: "Cambios, anulaciones, indemnizaciones, facturas, objetos perdidos y todos los canales de atención en un mismo sitio.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "tarjetas",
        titulo: "Accesos rápidos",
        tarjetas: [
          { titulo: "Cambiar billete", texto: "Qué billetes admiten cambios y cuánto cuestan.", enlace: "/ayuda/cambiar-billete" },
          { titulo: "Anular billete", texto: "Porcentajes de devolución según el tipo de tren y billete.", enlace: "/ayuda/anular-billete" },
          { titulo: "Puntualidad e indemnización", texto: "Cuánto te devolvemos si tu tren llega tarde.", enlace: "/ayuda/compromiso-puntualidad", etiqueta: "Importante" },
          { titulo: "Solicitar factura", texto: "Pide la factura de tus billetes y abonos.", enlace: "/ayuda/solicitar-factura" },
          { titulo: "Cercanías", texto: "Atención al cliente de cada núcleo de Cercanías.", enlace: "/ayuda/cercanias" },
          { titulo: "Preguntas frecuentes", texto: "Compra, Más Renfe, abonos, Cercanías y grupos.", enlace: "/ayuda/faqs" },
          { titulo: "Cita previa", texto: "Reserva hora en la taquilla de tu estación.", enlace: "/ayuda/cita-previa" },
          { titulo: "Atención por videollamada", texto: "Servicio en lengua de signos para personas con discapacidad auditiva.", enlace: "/ayuda/videollamada" },
          { titulo: "Avisos por WhatsApp", texto: "Recibe el estado de tus líneas en el móvil.", enlace: "/ayuda/avisos-whatsapp", etiqueta: "Nuevo" },
          { titulo: "Notificación de accidentes", texto: "Comunica un accidente ocurrido en un tren o estación.", enlace: "/ayuda/notificacion-accidentes" },
        ],
      },
      {
        tipo: "tarjetas",
        titulo: "¿Tienes más dudas?",
        tarjetas: [
          { titulo: "Hablemos por teléfono", texto: "Todos los números de atención, ordenados por tema.", enlace: "/ayuda/telefonos" },
          { titulo: "Escríbenos", texto: "Reclamaciones, sugerencias, felicitaciones y solicitudes de información.", enlace: "/ayuda/contacto" },
          { titulo: "Condiciones de viaje", texto: "Información legal, derechos de los viajeros y condiciones de transporte.", enlace: "/ayuda/informacion-legal" },
          { titulo: "Objetos perdidos", texto: "Dónde preguntar si te has dejado algo en el tren o la estación.", enlace: "/ayuda/objetos-perdidos" },
        ],
      },
      {
        tipo: "aviso",
        nivel: "info",
        texto: "Renfe está adherida al Sistema Arbitral de Consumo: puedes acudir a la Junta Arbitral Nacional de Consumo si no estás conforme con la respuesta a una reclamación.",
      },
    ],
  },

  {
    ruta: "/ayuda/cambiar-billete",
    titulo: "Cambiar billete",
    resumen: "Las condiciones de cambio dependen del tren y de la opción de billete que compraste.",
    seccion: "ayuda",
    bloques: [
      { tipo: "aviso", nivel: "alerta", texto: "Los billetes de Cercanías, Rodalies y Ancho Métrico no se pueden cambiar. Tampoco se puede cambiar el origen ni el destino de ningún billete." },
      {
        tipo: "tabla",
        titulo: "AVE, AVE Internacional (España–Francia), Alvia, Euromed e Intercity",
        columnas: ["Opción", "Cambio de fecha u hora", "Otras condiciones"],
        filas: [
          ["Básico", "1 cambio por 10 € + diferencia de precio, hasta 24 h antes de la salida", "Si el nuevo billete es más barato no se devuelve la diferencia. Cambio de titular: 40 €"],
          ["Elige / Elige Confort", "1.er cambio gratis (pagas solo la diferencia). Siguientes: 10 € cada uno", "La diferencia a la baja no se reembolsa"],
          ["Prémium", "Incluye el Pack Superflex", "No disponible en AVE Internacional"],
        ],
      },
      {
        tipo: "lista",
        titulo: "Extras para ganar flexibilidad (no disponibles con Básico)",
        items: [
          "Cambios gratuitos ilimitados: cambias fecha y hora tantas veces como quieras pagando solo la diferencia, si la hay.",
          "Puente AVE: adelantas o retrasas la salida el mismo día del viaje sin gastos ni diferencia de precio (solo trayectos dentro de España).",
          "Pack Superflex: reúne los cambios ilimitados, el Puente AVE y el reembolso total (solo trayectos dentro de España).",
        ],
      },
      {
        tipo: "tabla",
        titulo: "Avant y Media Distancia (máximo 3 cambios)",
        columnas: ["Cambio", "Coste"],
        filas: [
          ["Primero", "Gratis, para el mismo día o para otro"],
          ["Segundo y tercero", "10 % del precio del billete que cambias"],
          ["A un billete más caro", "Pagas la diferencia más los gastos de cambio"],
          ["A un billete más barato", "Sin gastos de cambio"],
        ],
      },
      { tipo: "cta", texto: "¿Ya sabes qué cambio necesitas?", enlace: "/gestiona/tus-reservas/cambia-tu-billete", etiqueta: "Cambiar mi billete" },
    ],
  },

  {
    ruta: "/ayuda/anular-billete",
    titulo: "Anular billete",
    resumen: "Cuánto recuperas al anular depende del tipo de tren y de la opción de billete.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "tabla",
        titulo: "AVE, AVE Internacional (España–Francia), Alvia, Euromed e Intercity",
        columnas: ["Opción", "Devolución al anular"],
        filas: [
          ["Básico", "No admite anulación"],
          ["Elige / Elige Confort", "70 % del importe"],
          ["Elige + extra Reembolso total", "100 % hasta 7 días antes de la salida; 95 % en los últimos 6 días naturales"],
          ["Prémium", "Reembolso total incluido"],
        ],
      },
      {
        tipo: "tabla",
        titulo: "Avant, Media Distancia, Cercanías y Rodalies",
        columnas: ["Caso", "Gastos de anulación"],
        filas: [
          ["Regla general", "15 % del billete anulado"],
          ["Ida y vuelta Avant/MD, anulando solo un trayecto", "40 % del billete anulado"],
          ["Ida y vuelta Avant/MD, anulando los dos a la vez", "15 % del billete anulado"],
          ["Cercanías y Rodalies", "Solo se pueden anular en las 2 horas siguientes a la compra"],
        ],
      },
      {
        tipo: "lista",
        titulo: "Si estás fuera de España",
        items: [
          "Un billete de Renfe no se puede anular en puntos de venta de otras redes ferroviarias.",
          "Lo comprado en la web se anula también desde la web.",
          "Si tienes un billete PDF pagado con tarjeta o PayPal, llama a Renfe Contigo: +34 912 320 320.",
        ],
      },
      { tipo: "cta", texto: "Anula tu billete en línea", enlace: "/gestiona/tus-reservas/anula-tu-billete", etiqueta: "Anular billete" },
    ],
  },

  {
    ruta: "/ayuda/cercanias",
    titulo: "Ayuda en Cercanías",
    resumen: "Cada núcleo de Cercanías tiene su propio servicio de atención al cliente.",
    seccion: "ayuda",
    bloques: [
      { tipo: "aviso", nivel: "info", texto: "Durante 2026 hay abonos bonificados en Cercanías y Media Distancia y abonos a mitad de precio en algunos trenes de Alta Velocidad declarados de servicio público." },
      { tipo: "cta", texto: "Consulta precios y condiciones de los abonos 2026", enlace: "/mas-renfe/promociones/abonos-bonificados", etiqueta: "Ver abonos bonificados" },
      {
        tipo: "tarjetas",
        titulo: "Elige tu núcleo",
        tarjetas: [
          ["Asturias", "asturias"], ["Bilbao", "bilbao"], ["Cádiz", "cadiz"], ["Cantabria", "cantabria"],
          ["Cartagena", "cartagena"], ["Ferrol", "ferrol"], ["León", "leon"], ["Madrid", "madrid"],
          ["Málaga", "malaga"], ["Murcia/Alicante", "murcia-alicante"], ["Rodalies Catalunya", "rodalies-catalunya"],
          ["San Sebastián", "san-sebastian"], ["Sevilla", "sevilla"], ["València", "valencia"], ["Zaragoza", "zaragoza"],
        ].map(([n, id]) => ({ titulo: n, texto: `Horarios, avisos y atención al cliente de Cercanías ${n}.`, enlace: `/cercanias/${id}` })),
      },
      { tipo: "texto", parrafos: ["Rodalies de Catalunya tiene su propio servicio de atención, gestionado junto con la Generalitat."] },
    ],
  },

  {
    ruta: "/ayuda/faqs",
    titulo: "Preguntas frecuentes",
    resumen: "Respuestas rápidas sobre compra de billetes, Más Renfe, abonos, Cercanías Madrid y viajes en grupo.",
    seccion: "ayuda",
    bloques: [
      { tipo: "herramienta", id: "buscador-faqs" },
      {
        tipo: "faq",
        titulo: "Compra de billetes",
        preguntas: [
          { p: "¿Cómo puedo pagar en la web?", r: "Con tarjeta de crédito o débito, Puntos Renfe, PayPal, Bizum, Google Pay o Apple Pay. La conexión va cifrada durante todo el pago." },
          { p: "¿Dónde puedo comprar el billete?", r: "En la web y la app, por teléfono en el 912 320 320, en taquillas y máquinas de autoventa, en agencias de viajes y en puntos de venta internacionales." },
          { p: "¿Qué puedo hacer con un billete pagado con PayPal?", r: "En el mismo canal donde lo compraste, lo mismo que con tarjeta: cambiar, anular o pedir indemnización. En estaciones, agencias o máquinas solo las operaciones que no supongan un pago extra." },
          { p: "¿Puedo cambiar en estación o agencia un billete pagado con PayPal?", r: "Sí, si el cambio no exige pagar más. Si hay devolución, se hace a la cuenta PayPal de origen." },
          { p: "¿Y anularlo en estación o agencia?", r: "Sí. El dinero vuelve a la cuenta PayPal con la que pagaste." },
          { p: "¿Hasta cuándo puedo comprar?", r: "Desde que el tren sale a la venta hasta 15 minutos antes de la salida." },
          { p: "No puedo ver ni imprimir mi billete, ¿qué hago?", r: "Imprímelo en una máquina de autoventa o llama al 91 919 05 04 con el número de la tarjeta con la que pagaste." },
          { p: "¿Puedo anular mis billetes?", r: "Si tu opción (Básico, Elige, Prémium) o tu tarifa Avant/MD lo permite, hasta 15 minutos antes de salir. Necesitas el código de compra o el número de billete de 13 dígitos. Las 2 primeras horas tras la compra la anulación no tiene gastos." },
          { p: "¿Puedo cambiar mis billetes?", r: "Sí, si tu opción o tarifa lo admite, hasta 15 minutos antes de la salida. Puede tener coste según el billete." },
          { p: "¿Puedo imprimir, pedir factura o pasar el billete al wallet más tarde?", r: "Sí, desde tu área privada si eres cliente registrado." },
          { p: "¿Qué gano registrándome?", r: "Compras más rápido, ves tus billetes pendientes, cambias y pides reembolsos con menos pasos, guardas tus tarjetas de pago, entras en sorteos y, si quieres, recibes novedades por correo." },
          { p: "¿Cómo funciona la compra por teléfono?", r: "Llamas al 91 232 03 20 y compras billetes de Alta Velocidad, Larga Distancia, Media Distancia y Avant hasta 30 minutos antes de la salida. También puedes cambiar y anular (salvo Media Distancia). Pagas con tarjeta de un banco español o con Puntos Renfe. Te dan un localizador, que puedes recibir por SMS o correo, y recoges el billete en máquinas o taquillas hasta 5 minutos antes de salir." },
          { p: "¿Qué es PayGold y cómo valido mi tarjeta?", r: "Es el sistema de validación de la venta telefónica. Al llamar al 912 320 320 te envían un enlace seguro de Redsys (válido 72 h) para registrar la tarjeta; se hace un cargo de 1 € que se devuelve al momento. Después puedes comprar solo con tu teléfono o correo, también con tarjetas extranjeras." },
          { p: "He perdido el código de compra o el localizador.", r: "Si estás registrado, búscalo en Mis Viajes. Si no, introduce en una máquina de autoventa la tarjeta con la que pagaste, o llama al 91 919 05 04." },
          { p: "¿Tengo que llevar el billete impreso?", r: "Debes llevar el billete, en papel o en el móvil: billete en el móvil, Passbook o la app Renfe Ticket. Si no, imprímelo en máquina o pídelo en taquilla." },
          { p: "¿Con cuánta antelación debo llegar a la estación?", r: "El acceso al tren cierra 2 minutos antes de la salida. En estaciones grandes o con control de equipajes, llega con bastante margen." },
        ],
      },
      {
        tipo: "faq",
        titulo: "Más Renfe",
        preguntas: [
          { p: "¿Caducan los Puntos Renfe?", r: "Sí, a los 3 años de conseguirlos. Mientras estés en el nivel Platino no caducan." },
          { p: "¿Cómo cambio mis datos personales?", r: "En Mi perfil > Mis datos de tu área privada, o llamando al 919 191 566 / escribiendo a masrenfe@renfe.es." },
          { p: "Necesito una tarjeta nueva.", r: "Ya no hay tarjetas físicas. Descarga la digital (PDF o Passbook) en el apartado Más Renfe de tu área privada." },
          { p: "¿Cómo consulto mi saldo de puntos?", r: "En el apartado Más Renfe del área privada, o por teléfono en el 919 191 566 y por correo en masrenfe@renfe.es." },
          { p: "¿Cómo consigo puntos al comprar billetes?", r: "Da tu número Más Renfe al comprar en cualquier canal. Si ya compraste, asócialo en Mis Viajes antes de viajar. Los puntos llegan tras el viaje y solo cuentan los viajes del titular." },
          { p: "¿Cómo canjeo puntos por billetes?", r: "Elige “Compra con Puntos Renfe” como forma de pago en cualquier canal. Si no te llegan los puntos, conviértelos en un vale descuento (también regalable) desde Mis Puntos." },
          { p: "¿Puedo usar los puntos en otras empresas?", r: "Sí, en las empresas colaboradoras. Se pide desde el área privada o en el 919 191 566, según el partner." },
          { p: "La web me dio un error al comprar.", r: "Llama a la asistencia de venta online: 912 320 320." },
          { p: "¿Puedo pagar una parte con puntos y otra con dinero?", r: "No. Todo el pedido se paga con un único medio de pago." },
          { p: "¿Consigo puntos por los viajes de otras personas?", r: "No. El número es personal; solo suma quien viaja siendo titular." },
          { p: "¿Puedo regalar puntos?", r: "No se transfieren, pero puedes canjearlos por un billete o un servicio para otra persona." },
          { p: "¿Caduca mi alta en el programa?", r: "El nivel inicial no caduca. Plata, Oro y Platino duran 12 meses y después se recalcula el nivel según lo gastado en tren." },
          { p: "¿Necesito ser Más Renfe para pedir la American Express Renfe o la Renfe Mastercard?", r: "Sí, ambas exigen pertenecer al programa. Las tarjetas adicionales no." },
          { p: "¿Quién recibe los puntos si hay titular y beneficiarios en la tarjeta?", r: "Solo el titular principal; lo que gastan los beneficiarios suma en su cuenta." },
          { p: "¿Cómo subo de nivel con la American Express Renfe?", r: "Si al aniversario renuevas la cuota y has gastado al menos 5.000 €: de 5.000 a 9.999 € Plata, de 10.000 a 14.999 € Oro, desde 15.000 € Platino, durante 12 meses. Se aplica el nivel más ventajoso entre tarjeta y gasto en tren." },
          { p: "¿Se suma el gasto con tarjeta al gasto en tren para el nivel?", r: "No. Se valora uno u otro, el que te dé mejor nivel." },
          { p: "¿Cuándo llegan los puntos de las compras con tarjeta?", r: "Al cierre de cada facturación mensual." },
        ],
      },
      {
        tipo: "faq",
        titulo: "Abonos",
        preguntas: [
          { p: "¿Qué abonos puedo comprar en internet?", r: "AVE/LD: Bono Colaborativo, BonoAVE, BonoAVE Flexible y Spain Rail Pass. Avant: Pase Vía y Abono 10-30. Media Distancia y otros: Abono Único, Abono Único Joven, Abono Bonificado 10 Viajes, Mensual, Mensual Joven y Abono Infantil Gratuito." },
          { p: "¿Tengo que registrarme?", r: "Sí, solo los clientes registrados pueden comprar abonos." },
          { p: "¿Qué es formalizar y desformalizar?", r: "Formalizar es reservar con tu abono un tren y un día concretos (Mis abonos > Nueva formalización). Desformalizar es anular esa reserva para que no cuente como viaje." },
        ],
      },
      {
        tipo: "faq",
        titulo: "Cercanías Madrid",
        preguntas: [
          { p: "¿Dónde consulto un trayecto?", r: "En el buscador de horarios, indicando estaciones y fecha, o en la app Cercanías." },
          { p: "¿Cómo se calcula el precio?", r: "Por el número de zonas que atraviesas, contando las de origen y destino, según el mapa zonal." },
          { p: "¿Dónde veo las tarifas?", r: "En la página de precios de Cercanías Madrid." },
          { p: "¿Dónde compro?", r: "En máquinas de autoventa y taquillas de las estaciones." },
          { p: "¿Qué es la tarjeta +Renfe&Tú?", r: "El soporte sin contacto donde se cargan los títulos de Cercanías." },
          { p: "¿Qué tipos hay?", r: "No personalizada (billetes sencillos, ida y vuelta y bonotrén de 10) y personalizada (todo lo anterior más tarifas con descuento)." },
          { p: "¿Dónde pido la personalizada?", r: "En cualquier estación y en el Centro de Gestión de Cercanías Madrid." },
          { p: "¿Dónde la recargo?", r: "En máquinas y taquillas de las estaciones." },
          { p: "¿Puedo cargar títulos distintos?", r: "No; el último título cargado sustituye al anterior." },
          { p: "¿Puedo llevar más de un título?", r: "Hasta dos iguales, si son multiviaje del mismo número de zonas." },
          { p: "¿Y si pierdo la no personalizada?", r: "No hay duplicado ni devolución del saldo." },
          { p: "Tengo derecho a descuento, ¿qué hago?", r: "Pide la +Renfe&Tú personalizada en una estación con personal." },
          { p: "¿Cómo viajo en grupo?", r: "Llama a la Oficina de Coordinación de Grupos: 91 50 66 356." },
          { p: "¿Qué es el Combinado Cercanías?", r: "Un billete de Cercanías gratis que acompaña a tu billete AVE o Larga Distancia." },
          { p: "¿Dónde reclamo?", r: "En el libro de reclamaciones de cualquier estación o en Atención al Cliente, eligiendo el núcleo de Madrid." },
          { p: "¿Dónde pregunto por un objeto perdido?", r: "En la oficina de Nuevos Ministerios o en el 91 50 66 969." },
          { p: "¿Puedo pedir factura de las recargas?", r: "Sí, en estaciones con personal o centros de gestión, presentando los justificantes." },
          { p: "¿Hay indemnización por retraso?", r: "Sí, según la normativa de retrasos de Cercanías. Los abonos del Consorcio de Transportes de Madrid quedan fuera." },
          { p: "¿Dónde sigo las novedades?", r: "En la cuenta @CercaniasMadrid y en la app Cercanías." },
          { p: "¿Puedo viajar con mi mascota?", r: "Sí, con perros, gatos y aves sin límite de peso, según las normas de animales de compañía." },
          { p: "¿Y con bicicleta?", r: "Sí, con condiciones específicas de horario y espacio." },
          { p: "¿Dónde pido un justificante de retraso?", r: "Al personal de la estación, enseñando un billete válido." },
          { p: "Me han cobrado de más con tarjeta.", r: "Pide el formulario de reclamación en una estación con personal." },
        ],
      },
      {
        tipo: "faq",
        titulo: "Grupos",
        preguntas: [
          { p: "¿Hay ofertas para grupos escolares?", r: "Pagan precio de grupo y por cada 20 alumnos viaja uno gratis (la plaza 21), presentando una carta del centro. Otros colectivos usan las condiciones generales de grupo." },
          { p: "¿Puedo sumar descuentos?", r: "No. El precio de grupo es cerrado y no se combina con Carné Joven, niño, Tarjeta Dorada o familia numerosa." },
          { p: "¿Podemos reservar plaza H para silla de ruedas?", r: "Sí, lo gestiona el departamento de grupos. Después hay que pedir asistencia a Adif Acerca en el 917 744 040." },
          { p: "¿Qué es la fecha de liberación?", r: "El último día para emitir los billetes del grupo. Si pasa, las plazas vuelven a la venta general. Suele ser unas dos semanas antes del viaje." },
          { p: "¿Por qué canales compramos?", r: "De 4 a 9 personas: taquilla, web, teléfono o agencia. De 10 a 25: lo mismo en AVE, LD, Avant y MD; en Cercanías, en taquilla. Más de 25: presupuesto en grupos@renfe.es o en el 912 320 320 y compra con localizador." },
          { p: "¿Puedo cambiar una reserva de precio concertado?", r: "Sí, si no está emitida, por correo y al menos 72 h antes de la fecha de liberación. Si el grupo cambia mucho, se vuelve a presupuestar." },
          { p: "¿Cómo pido el cambio?", r: "Por correo al departamento de grupos adjuntando la reserva. Atención telefónica en el 912 320 320 de 7:00 a 23:00 entre semana." },
          { p: "¿Cuándo pago?", r: "Desde que recibes la reserva. Una vez emitidos, los billetes no admiten cambios." },
          { p: "¿Hay billetes individuales?", r: "No, el grupo viaja con un único billete." },
          { p: "Hemos perdido el billete.", r: "Se reimprime desde el PDF de la agencia o con el localizador en la estación." },
          { p: "¿Cómo embarcamos?", r: "Todos juntos y en la estación de origen del grupo." },
          { p: "¿Con cuánta antelación llegamos?", r: "El acceso cierra 5 minutos antes; recomendamos entre 30 y 45 minutos." },
          { p: "¿Qué equipaje podemos llevar?", r: "Cada viajero, 3 bultos que sumen como máximo 290 cm y 25 kg; el mayor, hasta 85 × 55 × 35 cm. En Avlo las reglas son distintas." },
          { p: "¿Incluye parking, Sala Club o comida?", r: "No." },
          { p: "¿Incluye Cercanías gratis?", r: "Sí, en AVE o LD, con el QR del billete, si todos comparten origen y destino." },
          { p: "¿Cómo consigo factura?", r: "La emite la agencia si compraste allí; si fue en estación, en su centro de atención; también puedes pedirla en la web." },
        ],
      },
    ],
  },

  {
    ruta: "/ayuda/objetos-perdidos",
    titulo: "Objetos perdidos",
    resumen: "A quién avisar si olvidas algo en un tren o una estación, en España, Francia o Portugal.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "texto",
        titulo: "AVE, Larga y Media Distancia en España",
        parrafos: [
          "Los objetos que aparecen en trenes y estaciones los gestiona Adif. Puedes preguntar en las oficinas de objetos perdidos de las estaciones o hacer la búsqueda en línea desde la web de Adif.",
          "Adif guarda los objetos 1 mes. La documentación oficial se entrega a la Policía a las 24 horas.",
        ],
      },
      {
        tipo: "lista",
        titulo: "Estaciones y trenes en Francia",
        items: [
          "Declara la pérdida en la web de SNCF Gares & Connexions.",
          "O en la app Ma Gare.",
          "O en las oficinas de objetos perdidos de las 27 estaciones principales. Si aparece, te avisan; lo guardan 30 días.",
        ],
      },
      {
        tipo: "tabla",
        titulo: "Teléfonos de objetos perdidos en Cercanías",
        columnas: ["Núcleo", "Teléfono"],
        filas: [
          ["Asturias", "985 981 267"], ["Barcelona", "900 410 041"], ["Bilbao", "944 879 460"], ["Cádiz", "856 170 290"],
          ["Cantabria", "942 209 524"], ["Madrid", "915 066 969"], ["Málaga", "952 128 079"], ["Murcia/Alicante", "968 975 299"],
          ["San Sebastián", "943 649 787"], ["Sevilla", "954 485 672"], ["València", "963 357 400"], ["Zaragoza", "976 764 648"],
          ["León–Cistierna (Ancho Métrico, L-V 8:00-14:00)", "987 876 514"], ["Ferrol–Ortigueira (Ancho Métrico, L-V 8:00-14:00)", "981 370 529"],
          ["Tren Celta a Portugal (desde España)", "+351 218 545 212"], ["Tren Celta a Portugal (desde Portugal)", "808 208 208"],
        ],
      },
      { tipo: "aviso", nivel: "info", texto: "Normalmente los objetos se guardan entre 15 días y 2 meses. Para recogerlos tendrás que demostrar que son tuyos y pagar los gastos que haya." },
      { tipo: "herramienta", id: "form-objetos-perdidos" },
    ],
  },

  {
    ruta: "/ayuda/telefonos",
    titulo: "Teléfonos de atención",
    resumen: "Cada número atiende un tipo de consulta. Desde fuera de España, añade el prefijo +34.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "tabla",
        columnas: ["Para qué", "Teléfono"],
        filas: [
          ["Información, compra, cambios, anulaciones, asistencia, ayuda con la web y grupos de particulares (Renfe Contigo)", "91 232 03 20"],
          ["Agencias de viajes y empresas", "919 190 505"],
          ["Más Renfe y servicio exclusivo Oro/Platino", "91 919 15 66"],
          ["Trenes turísticos", "91 255 59 12"],
          ["Venta para personas con discapacidad visual", "900 400 555"],
          ["Asistencia a personas con discapacidad en Cercanías Madrid", "900 920 922"],
          ["Abonos recurrentes", "919 191 567"],
          ["Incidencias y reclamaciones", "900 878 333"],
          ["Venta por internet (billetes perdidos o sin imprimir)", "91 919 05 04"],
        ],
      },
      { tipo: "aviso", nivel: "info", texto: "Si tienes discapacidad auditiva, puedes hablar con nosotros en lengua de signos por videollamada." },
      { tipo: "cta", texto: "Atención en lengua de signos", enlace: "/ayuda/videollamada", etiqueta: "Ir a videollamada" },
    ],
  },

  {
    ruta: "/ayuda/contacto",
    titulo: "Contactar con Renfe",
    resumen: "Reclamaciones, solicitudes de información, sugerencias y felicitaciones.",
    seccion: "ayuda",
    bloques: [
      { tipo: "aviso", nivel: "info", texto: "Antes de reclamar por un retraso, mira si tienes indemnización automática. Ten a mano el número de billete." },
      { tipo: "cta", texto: "¿Llegaste tarde?", enlace: "/gestiona/posventa/indemnizacion", etiqueta: "Solicitar indemnización" },
      {
        tipo: "tarjetas",
        tarjetas: [
          { titulo: "Reclamaciones", texto: "Presenta una queja sobre cualquiera de nuestros servicios en el portal de reclamaciones.", enlace: "/gestiona/posventa/reclamacion" },
          { titulo: "Información, sugerencias y felicitaciones", texto: "Cuéntanos tu duda, tu idea o lo que te ha gustado con el formulario de esta página." },
        ],
      },
      { tipo: "herramienta", id: "form-contacto" },
    ],
  },

  {
    ruta: "/ayuda/compromiso-puntualidad",
    titulo: "Compromiso de puntualidad",
    resumen: "Si tu tren llega tarde te devolvemos una parte o todo el billete. El porcentaje depende del tipo de tren y de los minutos de retraso.",
    seccion: "ayuda",
    bloques: [
      { tipo: "aviso", nivel: "alerta", texto: "Los billetes y abonos comprados desde el 31 de enero de 2026 no dan derecho a indemnización cuando el retraso se debe a limitaciones temporales de velocidad impuestas por Adif." },
      {
        tipo: "texto",
        titulo: "Régimen aplicable",
        parrafos: [
          "La Ley de Movilidad Sostenible (4 de diciembre de 2025) pide al Gobierno un nuevo sistema de indemnizaciones, que aún no está desarrollado. Hasta entonces se siguen aplicando la Ley y el Reglamento del Sector Ferroviario y el Reglamento europeo de derechos de los viajeros, así que la política actual no cambia.",
        ],
      },
      {
        tipo: "tabla",
        titulo: "Servicios comerciales: AVE, Avlo, Alvia, Euromed, Intercity y Larga Distancia",
        columnas: ["Retraso en la llegada", "Devolución"],
        filas: [["60 minutos o más", "50 %"], ["Más de 90 minutos", "100 %"]],
      },
      {
        tipo: "tabla",
        titulo: "AVE Internacional España–Francia",
        columnas: ["Tramo", "Retraso", "Devolución"],
        filas: [
          ["Dentro de España", "60 minutos o más", "50 %"],
          ["Dentro de España", "Más de 90 minutos", "100 %"],
          ["Dentro de Francia", "Más de 30 minutos", "25 %"],
          ["Dentro de Francia", "Más de 120 minutos", "50 %"],
          ["Dentro de Francia", "Más de 180 minutos", "75 %"],
          ["Internacional (España–Francia)", "Más de 30 minutos", "25 %"],
          ["Internacional (España–Francia)", "Más de 120 minutos", "50 %"],
        ],
      },
      {
        tipo: "tabla",
        titulo: "Servicios públicos: Avant, Media Distancia y Regionales",
        columnas: ["Servicio", "Retraso", "Devolución"],
        filas: [
          ["Avant", "Más de 15 minutos", "50 %"],
          ["Avant", "Más de 30 minutos", "100 %"],
          ["Media Distancia", "Más de 15 minutos", "25 %"],
          ["Media Distancia", "Más de 30 minutos", "50 %"],
          ["Media Distancia", "Más de 60 minutos", "100 %"],
          ["Regional y Regional Exprés", "Más de 30 minutos", "25 %"],
          ["Regional y Regional Exprés", "Más de 45 minutos", "50 %"],
          ["Regional y Regional Exprés", "Más de 60 minutos", "100 %"],
        ],
      },
      {
        tipo: "tabla",
        titulo: "Billetes integrados (con enlace)",
        columnas: ["Combinación", "Retraso", "Devolución"],
        filas: [
          ["Avant + Avant", "Más de 30 / más de 60 minutos", "50 % / 100 %"],
          ["Avant + Media Distancia", "Más de 30 / más de 60 minutos", "50 % / 100 %"],
          ["Media Distancia + Media Distancia", "Más de 30 / más de 60 minutos", "50 % / 100 %"],
          ["Resto de enlaces", "Más de 60 / más de 90 minutos", "50 % / 100 %"],
        ],
      },
      {
        tipo: "pasos",
        titulo: "Plazos",
        pasos: [
          { titulo: "Espera 24 horas", texto: "Puedes pedir la indemnización cuando hayan pasado 24 horas desde la llegada del tren." },
          { titulo: "Pídela antes de 3 meses", texto: "El plazo máximo es de 3 meses desde la fecha del viaje." },
        ],
      },
      {
        tipo: "tabla",
        titulo: "Cómo cobrarla en servicios comerciales (AVE, AVE Internacional, LD, Avlo)",
        columnas: ["Opción", "Importe", "Dónde pedirla y condiciones"],
        filas: [
          ["Mismo medio de pago", "100 % de la indemnización", "Web (salvo pago en efectivo), taquillas, atención al cliente o la agencia emisora"],
          ["Código descuento", "Indemnización + 50 %", "Solo en la web. Tienes 6 meses para usarlo en un billete de igual o mayor precio, que no admite cambios"],
          ["Puntos Renfe (socios Más Renfe)", "Indemnización + 100 %", "Solo en la web. Los puntos caducan a los 3 años"],
        ],
      },
      {
        tipo: "texto",
        parrafos: [
          "Las opciones de código descuento y de Puntos Renfe sirven para billetes pagados con tarjeta, Bizum, PayPal o efectivo, pero no para los pagados con puntos.",
          "En Avant y Media Distancia el dinero se devuelve siempre por el mismo medio de pago.",
          "En billetes integrados, si el retraso ocurre en el último tren puedes pedirla en la web, en taquilla o en atención al cliente. Si ocurre en un tren anterior, solo en taquilla o atención al cliente.",
        ],
      },
      {
        tipo: "faq",
        preguntas: [
          { p: "¿Me indemnizan si el retraso es por fuerza mayor?", r: "No. El artículo 19.10 del Reglamento (UE) 2021/782 exime a la empresa si demuestra que el retraso, la pérdida de enlace o la cancelación se debieron a fuerza mayor." },
          { p: "¿Y si el retraso es por limitaciones de velocidad de Adif?", r: "Si compraste el billete o abono desde el 31 de enero de 2026, ese retraso no da derecho a indemnización." },
        ],
      },
      { tipo: "cta", texto: "Pide tu indemnización", enlace: "/gestiona/posventa/indemnizacion", etiqueta: "Solicitar indemnización" },
    ],
  },

  {
    ruta: "/ayuda/solicitar-factura",
    titulo: "Solicitar factura",
    resumen: "Pide la factura de tus billetes y abonos, estés registrado o no.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "lista",
        titulo: "Si eres usuario registrado",
        items: [
          "Pide la factura al comprar o más tarde desde Mis Viajes.",
          "Las facturas rectificativas por anulación o devolución se generan solas.",
          "Consulta e imprime tu historial en Mis Facturas.",
          "Necesitas tener tu NIF o CIF en el perfil; se guarda para las siguientes veces.",
          "La factura sale a nombre del NIF/CIF de tu perfil.",
        ],
      },
      { tipo: "cta", texto: "Desde tu área de cliente", enlace: "/gestiona/posventa/factura", etiqueta: "Solicitar factura" },
      {
        tipo: "lista",
        titulo: "Si no estás registrado (o para otros casos), usa el formulario",
        items: [
          "Billetes o localizadores comprados en cualquier canal.",
          "Billetes de Cercanías (opción “Otras solicitudes”).",
          "Facturas de un rango de fechas.",
          "Gastos de anulación o de cambio.",
          "Emisión de Tarjeta Dorada o Más Renfe Joven.",
          "Rectificar o pedir copia de facturas ya emitidas.",
        ],
      },
    ],
  },

  {
    ruta: "/ayuda/cita-previa",
    titulo: "Cita previa",
    resumen: "Reserva hora en la estación y evita colas. Puedes consultar, cambiar o anular tu cita desde el móvil.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "lista",
        titulo: "Estaciones con cita previa",
        items: [
          "A Coruña", "Albacete Los Llanos", "Alicante/Alacant", "Barcelona Sants", "Burgos", "Cáceres", "Cádiz", "Castellón",
          "Ciudad Real", "Córdoba", "Granada", "Madrid Chamartín - Clara Campoamor", "Madrid Puerta de Atocha - Almudena Grandes",
          "Málaga María Zambrano", "Murcia del Carmen", "Ourense", "Pontevedra", "Salamanca", "Santiago de Compostela",
          "Sevilla Santa Justa", "Toledo", "València Joaquín Sorolla", "Valladolid", "Vigo Urzaiz", "Vilagarcía de Arousa",
        ],
      },
      {
        tipo: "lista",
        titulo: "Qué puedes hacer con cita",
        items: [
          "Comprar billetes para otro día (no sirve para trenes que salen el mismo día de la cita: elige “viajo en otras fechas”).",
          "Solicitar la Tarjeta Dorada.",
        ],
      },
      { tipo: "herramienta", id: "form-cita-previa" },
    ],
  },

  {
    ruta: "/ayuda/notificacion-accidentes",
    titulo: "Notificación de accidentes",
    resumen: "Cómo comunicar un accidente sufrido en un tren o en una estación gestionada por Renfe.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "texto",
        parrafos: [
          "El Reglamento del Seguro Obligatorio de Viajeros (Real Decreto 1575/1989) obliga a cubrir los daños personales que sufran los viajeros en el transporte por tren. La cobertura se amplía también a las estaciones gestionadas por Renfe.",
        ],
      },
      {
        tipo: "tabla",
        titulo: "Qué aseguradora lleva tu caso",
        columnas: ["Fecha del accidente", "Aseguradora"],
        filas: [
          ["Hasta el 31/12/2024", "AIG Europe S.A., sucursal en España"],
          ["Desde el 01/01/2025", "Everest Insurance (Ireland) DAC, sucursal en España"],
        ],
      },
      {
        tipo: "lista",
        titulo: "Con el formulario (FNAV) puedes",
        items: ["Comunicar un parte de accidente.", "Consultar en qué estado está tu parte.", "Reclamar sobre la tramitación de tu expediente."],
      },
      { tipo: "aviso", nivel: "info", texto: "Los accidentes de Adamuz (18/01/2026) y Gélida (20/01/2026) tienen formularios propios." },
      { tipo: "cta", texto: "Más información sobre el seguro", enlace: "/ayuda/informacion-legal/seguro-viajeros", etiqueta: "Seguro de viajeros" },
    ],
  },

  {
    ruta: "/ayuda/videollamada",
    titulo: "Atención por videollamada",
    resumen: "Servicio en lengua de signos española para personas con discapacidad auditiva.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "texto",
        parrafos: [
          "Te atendemos solo en lengua de signos española. Puedes informarte de nuestros servicios y comprar, cambiar o anular billetes.",
          "La llamada se graba para mejorar la calidad y como prueba de lo que se gestiona. Como el servicio está pensado para personas con discapacidad auditiva, al usarlo das tu consentimiento para que se trate ese dato de salud.",
        ],
      },
      { tipo: "tabla", columnas: ["Horario", "Días"], filas: [["08:00 a 00:00", "Lunes a viernes"]] },
      { tipo: "aviso", nivel: "alerta", texto: "En este proyecto académico la videollamada es simulada: no conecta con ningún servicio real." },
    ],
  },

  {
    ruta: "/ayuda/avisos-whatsapp",
    titulo: "Avisos por WhatsApp",
    resumen: "Recibe gratis en WhatsApp el estado de la circulación de las líneas que elijas.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "pasos",
        titulo: "Cómo funciona",
        pasos: [
          { titulo: "Date de alta", texto: "Introduce y verifica tu número de móvil. Si ya eres cliente registrado, se reconoce el de tu cuenta." },
          { titulo: "Elige servicio y línea", texto: "Media Distancia o Proximidad, la zona y la línea. Puedes suscribirte a todas las que quieras." },
          { titulo: "Ajusta días y horas", texto: "Selecciona los días y la franja horaria. Activa, pausa o borra avisos cuando quieras." },
        ],
      },
      {
        tipo: "lista",
        titulo: "Líneas disponibles por ahora",
        items: ["Media Distancia Miranda de Ebro – Vitoria – Alsasua.", "Proximidad Palma del Río – Córdoba – Villa del Río."],
      },
      { tipo: "texto", parrafos: ["No cuesta nada y complementa los canales de WhatsApp de Cercanías. Se irán añadiendo más líneas."] },
      { tipo: "herramienta", id: "alta-avisos" },
    ],
  },

  {
    ruta: "/ayuda/notificacion-personas-afectadas",
    titulo: "Personas afectadas por un incidente de ciberseguridad",
    resumen: "Qué pasó en el incidente de septiembre de 2026, qué datos pueden estar afectados y qué te recomendamos.",
    seccion: "ayuda",
    bloques: [
      { tipo: "aviso", nivel: "info", texto: "Resumen informativo de un aviso publicado en renfe.com. En este proyecto académico no se ha tratado ningún dato tuyo." },
      {
        tipo: "texto",
        titulo: "Qué ha ocurrido",
        parrafos: [
          "Un tercero accedió sin permiso a sistemas relacionados con la venta de billetes. El acceso se produjo el 24 de septiembre de 2026 y lo detectó la monitorización interna, que activó la contención. La investigación sigue abierta.",
        ],
      },
      {
        tipo: "lista",
        titulo: "Datos que podrían estar afectados",
        items: [
          "Datos de identidad y contacto.",
          "Billetes comprados y viajes realizados.",
          "DNI, NIE u otros documentos de identidad.",
          "Contraseñas, guardadas cifradas (no se pueden leer directamente).",
        ],
      },
      {
        tipo: "lista",
        titulo: "Qué te recomendamos",
        items: [
          "No des contraseñas, códigos ni datos bancarios por correo, SMS o teléfono.",
          "Desconfía de mensajes que mencionen tus viajes, reservas o supuestas compensaciones; compruébalos por canales oficiales.",
          "Cambia tu contraseña y también en otros servicios donde uses la misma.",
          "Vigila actividad extraña en tus cuentas y avisa enseguida.",
          "Consulta los consejos de INCIBE.",
        ],
      },
      {
        tipo: "lista",
        titulo: "Medidas adoptadas",
        items: [
          "Protocolos de respuesta y monitorización reforzada.",
          "Investigación forense.",
          "Aviso a CCN, OCC, CNPIC y Guardia Civil.",
          "Notificación a la Agencia Española de Protección de Datos.",
          "Nuevas medidas técnicas y organizativas.",
        ],
      },
    ],
  },

  // ---------- Información legal ----------
  {
    ruta: "/ayuda/informacion-legal",
    titulo: "Información legal",
    resumen: "Condiciones de transporte, derechos de los viajeros, privacidad, accesibilidad y aviso legal.",
    seccion: "ayuda",
    bloques: [
      { tipo: "aviso", nivel: "alerta", texto: AVISO_ACADEMICO },
      {
        tipo: "texto",
        parrafos: ["Aquí resumimos, con nuestras palabras, cómo organiza renfe.com su información legal. Los textos legales oficiales son los publicados por Renfe Viajeros S.M.E., S.A. en su web."],
      },
      {
        tipo: "tarjetas",
        tarjetas: [
          { titulo: "Condiciones de transporte", texto: "Qué incluye el contrato de transporte y cómo se aplica.", enlace: "/ayuda/informacion-legal/condiciones-transporte" },
          { titulo: "Derechos de los viajeros", texto: "Lo que te garantiza el reglamento europeo de viajeros de tren.", enlace: "/ayuda/informacion-legal/derechos-viajeros" },
          { titulo: "Reclamaciones", texto: "Canales para reclamar y vías alternativas.", enlace: "/ayuda/informacion-legal/reclamaciones" },
          { titulo: "Seguro de viajeros", texto: "El seguro obligatorio que cubre los accidentes.", enlace: "/ayuda/informacion-legal/seguro-viajeros" },
          { titulo: "Privacidad y cookies", texto: "Cómo trata datos este proyecto (no trata ninguno real).", enlace: "/ayuda/informacion-legal/privacidad-cookies" },
          { titulo: "Accesibilidad web", texto: "Nuestro compromiso de accesibilidad.", enlace: "/ayuda/informacion-legal/accesibilidad" },
          { titulo: "Aviso legal", texto: "Quién hace este sitio y para qué.", enlace: "/ayuda/informacion-legal/aviso-legal" },
        ],
      },
    ],
  },
  {
    ruta: "/ayuda/informacion-legal/aviso-legal",
    titulo: "Aviso legal",
    resumen: "Este sitio es una práctica académica. No es la web de Renfe.",
    seccion: "ayuda",
    bloques: [
      { tipo: "aviso", nivel: "alerta", texto: AVISO_ACADEMICO },
      {
        tipo: "texto",
        parrafos: [
          "Lo hemos hecho como ejercicio de clase para practicar el desarrollo de una web con una estructura parecida a la de un operador ferroviario real.",
          "Las marcas Renfe, AVE, Avlo, Más Renfe y similares pertenecen a sus titulares. Aquí solo aparecen para dar contexto al ejercicio, sin ánimo de lucro.",
          "Los datos de teléfonos, plazos y porcentajes se tomaron de información pública en octubre de 2026 y pueden estar desactualizados. Para viajar, consulta siempre la web oficial.",
          "Los formularios, compras y cuentas de este sitio son simulados. No se cobra nada ni se envían datos a terceros.",
        ],
      },
    ],
  },
  {
    ruta: "/ayuda/informacion-legal/privacidad-cookies",
    titulo: "Privacidad y cookies",
    resumen: "Qué datos usa este proyecto académico (spoiler: ninguno real).",
    seccion: "ayuda",
    bloques: [
      { tipo: "aviso", nivel: "alerta", texto: AVISO_ACADEMICO },
      {
        tipo: "lista",
        titulo: "Cómo tratamos los datos en este proyecto",
        items: [
          "No pidas ni introduzcas datos reales: los formularios son de prueba.",
          "Lo que escribas puede guardarse solo en tu navegador o en una base de datos de pruebas de la práctica, y se puede borrar en cualquier momento.",
          "No vendemos ni cedemos datos y no usamos cookies publicitarias ni de seguimiento.",
          "Solo usamos almacenamiento local para cosas como mantener la sesión simulada o tus preferencias.",
        ],
      },
      {
        tipo: "texto",
        titulo: "Cómo lo organiza la web real",
        parrafos: [
          "renfe.com publica políticas de privacidad separadas para su web, sus apps, las tarjetas sin contacto de Cercanías, la videovigilancia de estaciones, el plan de asistencia a víctimas de accidentes (PAVAFF) y algunas campañas, además de una política de cookies y otra de seguridad de los sistemas. Si te interesan, léelas allí.",
        ],
      },
    ],
  },
  {
    ruta: "/ayuda/informacion-legal/accesibilidad",
    titulo: "Accesibilidad web",
    resumen: "Queremos que cualquier persona pueda usar este sitio, también con lector de pantalla o solo con teclado.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "lista",
        titulo: "Qué hemos intentado cuidar",
        items: [
          "Textos alternativos en imágenes con información.",
          "Estructura de títulos y regiones que entienda el lector de pantalla.",
          "Contraste suficiente y foco visible al navegar con teclado.",
          "Formularios con etiquetas y mensajes de error claros.",
          "Diseño que funciona con zoom y en móvil.",
        ],
      },
      {
        tipo: "texto",
        titulo: "Contexto",
        parrafos: [
          "En España, las webs del sector público siguen el Real Decreto 1112/2018 y la norma UNE-EN 301549. La declaración de renfe.com (revisada el 29 de septiembre de 2024) la considera parcialmente conforme y enumera puntos pendientes, como contrastes, subtítulos o algunos formularios.",
          "Si encuentras una barrera en este proyecto, cuéntanoslo desde la página de contacto.",
        ],
      },
      { tipo: "cta", texto: "¿Has encontrado un problema?", enlace: "/ayuda/contacto", etiqueta: "Escríbenos" },
    ],
  },
  {
    ruta: "/ayuda/informacion-legal/condiciones-transporte",
    titulo: "Condiciones de transporte",
    resumen: "Resumen práctico de qué regula el contrato de transporte de viajeros.",
    seccion: "ayuda",
    bloques: [
      { tipo: "aviso", nivel: "info", texto: "Resumen orientativo de un proyecto académico. No sustituye a las condiciones generales oficiales de Renfe Viajeros ni a las específicas de Avlo." },
      {
        tipo: "lista",
        titulo: "Qué suelen regular",
        items: [
          "El billete como prueba del contrato y la obligación de llevarlo durante todo el viaje.",
          "Cambios y anulaciones según la opción o tarifa (ver Cambiar billete y Anular billete).",
          "Indemnizaciones por retraso (ver Compromiso de puntualidad).",
          "Equipaje: hasta 3 bultos por viajero, que sumen 290 cm y 25 kg en AVE y Larga Distancia; Avlo tiene reglas propias.",
          "Animales de compañía, bicicletas y menores que viajan solos.",
          "Viajeros sin billete válido y uso indebido de abonos nominativos.",
        ],
      },
      {
        tipo: "tarjetas",
        tarjetas: [
          { titulo: "Cambiar billete", texto: "Costes por tipo de tren.", enlace: "/ayuda/cambiar-billete" },
          { titulo: "Anular billete", texto: "Porcentajes de devolución.", enlace: "/ayuda/anular-billete" },
          { titulo: "Compromiso de puntualidad", texto: "Tabla de indemnizaciones.", enlace: "/ayuda/compromiso-puntualidad" },
        ],
      },
    ],
  },
  {
    ruta: "/ayuda/informacion-legal/derechos-viajeros",
    titulo: "Derechos de los viajeros",
    resumen: "Lo esencial del Reglamento (UE) 2021/782 sobre los derechos de los viajeros de tren.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "lista",
        titulo: "Tus derechos principales",
        items: [
          "Recibir información antes y durante el viaje, también sobre retrasos y cancelaciones.",
          "Si se prevé un retraso de más de 60 minutos: elegir entre que te devuelvan el billete, seguir el viaje por otra ruta o hacerlo más tarde.",
          "Asistencia (comida, bebida y, si hace falta, alojamiento) en retrasos largos.",
          "Indemnización por retraso según las tablas del operador, salvo fuerza mayor.",
          "Asistencia gratuita a personas con discapacidad o movilidad reducida.",
          "Presentar una reclamación y recibir respuesta en un plazo razonable.",
        ],
      },
      { tipo: "cta", texto: "¿Quieres reclamar?", enlace: "/ayuda/informacion-legal/reclamaciones", etiqueta: "Ver reclamaciones" },
    ],
  },
  {
    ruta: "/ayuda/informacion-legal/reclamaciones",
    titulo: "Reclamaciones",
    resumen: "Dónde reclamar y qué otras vías tienes si no te convence la respuesta.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "lista",
        titulo: "Canales de reclamación",
        items: ["Teléfono de reclamaciones: 900 878 333.", "Libro u hojas de reclamaciones en las estaciones.", "Formulario electrónico de reclamaciones."],
      },
      {
        tipo: "texto",
        parrafos: [
          "Reclamar a la empresa (artículos 98 y siguientes del Reglamento del Sector Ferroviario, RD 2387/2004) no te impide acudir a las Juntas Arbitrales de Transporte y de Consumo ni a los tribunales.",
        ],
      },
      { tipo: "cta", texto: "Presenta tu reclamación", enlace: "/gestiona/posventa/reclamacion", etiqueta: "Tramitar reclamación" },
    ],
  },
  {
    ruta: "/ayuda/informacion-legal/seguro-viajeros",
    titulo: "Seguro de viajeros",
    resumen: "Todo viajero con billete está cubierto por el seguro obligatorio de viajeros.",
    seccion: "ayuda",
    bloques: [
      {
        tipo: "texto",
        parrafos: [
          "El Seguro Obligatorio de Viajeros (RD 1575/1989) indemniza a los viajeros, o a sus herederos, por daños personales sufridos en un accidente durante el viaje. Renfe lo extiende también a las estaciones que gestiona.",
          "Desde el 1 de enero de 2025 la aseguradora es Everest Insurance (Ireland) DAC; los accidentes anteriores los tramita AIG Europe.",
        ],
      },
      { tipo: "cta", texto: "¿Has tenido un accidente?", enlace: "/ayuda/notificacion-accidentes", etiqueta: "Notificar accidente" },
    ],
  },
];
