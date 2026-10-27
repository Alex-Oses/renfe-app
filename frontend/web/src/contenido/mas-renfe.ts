import type { Pagina } from "./tipos";

// Sección Más Renfe (programa de puntos, tarjetas, abonos y promociones).
// Datos tomados de renfe.com en oct. 2026; textos redactados de nuevo. Proyecto académico, sin relación con Renfe.

export const paginas: Pagina[] = [
  {
    ruta: "/mas-renfe",
    titulo: "Más Renfe",
    resumen: "Más viajes, más puntos. El programa de fidelización que premia a quien viaja a menudo en tren.",
    seccion: "mas-renfe",
    bloques: [
      {
        tipo: "tarjetas",
        tarjetas: [
          { titulo: "Qué es Más Renfe", texto: "Cómo sumar Puntos Renfe y canjearlos por billetes o vales descuento.", enlace: "/mas-renfe/que-es" },
          { titulo: "Niveles", texto: "Más Renfe, Plata, Oro y Platino: qué ofrece cada uno y cómo subir.", enlace: "/mas-renfe/niveles" },
          { titulo: "Tarjetas de crédito", texto: "Renfe Mastercard y American Express Renfe: puntos con cada compra.", enlace: "/mas-renfe/tarjeta" },
          { titulo: "Empresas colaboradoras", texto: "Suma y gasta puntos en hoteles, alquiler de coches, carburante y ONG.", enlace: "/mas-renfe/partners" },
          { titulo: "Abonos y promociones", texto: "Abonos bonificados 2026, abonos gratuitos y ofertas del momento.", enlace: "/mas-renfe/promociones", etiqueta: "2026" },
        ],
      },
      { tipo: "aviso", nivel: "info", texto: "Novedad: si no te llegan los puntos para un billete entero, conviértelos en un vale descuento. También puedes regalarlo." },
      { tipo: "cta", texto: "Darse de alta es gratis", enlace: "/mas-renfe/que-es", etiqueta: "Quiero unirme" },
    ],
  },

  {
    ruta: "/mas-renfe/que-es",
    titulo: "Qué es Más Renfe",
    resumen: "El programa gratuito con el que acumulas Puntos Renfe al viajar y los cambias por billetes, vales o servicios.",
    seccion: "mas-renfe",
    bloques: [
      {
        tipo: "texto",
        parrafos: [
          "Más Renfe está pensado para quien viaja con frecuencia. Al pertenecer al programa sumas Puntos Renfe y, según lo que viajes, subes de nivel y consigues ventajas como salas club, parking, mejoras de clase o puntos que no caducan.",
        ],
      },
      {
        tipo: "lista",
        titulo: "Cómo se consiguen puntos",
        items: [
          "Viajando en AVE, Avlo, Larga Distancia y Avant. Los puntos dependen de tu nivel y de la opción de billete.",
          "Indica siempre tu número Más Renfe al comprar, en cualquier canal (web, app, taquilla, máquina, teléfono 91 232 03 20 o agencia).",
          "En las empresas colaboradoras.",
          "Con la American Express Renfe: 0,15 puntos por cada euro gastado (el 15 % del importe).",
          "Con la Renfe Mastercard: 0,10 puntos por euro en compras de Renfe y 0,05 en el resto.",
        ],
      },
      {
        tipo: "tabla",
        titulo: "Ejemplo: puntos por cada 50 € en AVE comprados en web o app",
        columnas: ["Nivel", "Puntos Renfe"],
        filas: [["Clásica (Más Renfe)", "15"], ["Plata", "20"], ["Oro", "25"], ["Platino", "40"]],
      },
      { tipo: "herramienta", id: "simulador-puntos" },
      {
        tipo: "lista",
        titulo: "Cómo se canjean",
        items: [
          "10 Puntos Renfe = 1 €.",
          "Billetes gratis en AVE, Avlo, Larga Distancia, Media Distancia, Avant y Cercanías/Rodalies: al comprar verás el precio en puntos.",
          "Vale descuento de hasta 1.000 puntos, regalable, desde Mis Puntos (no vale para billetes con enlace ni para Cercanías).",
          "Hoteles, coches de alquiler, donaciones a ONG y más, con las empresas colaboradoras.",
        ],
      },
      {
        tipo: "pasos",
        titulo: "Cómo darte de alta",
        pasos: [
          { titulo: "Regístrate gratis", texto: "Crea tu cuenta Más Renfe en línea." },
          { titulo: "Usa tu número", texto: "Dalo en cada compra de billete, en cualquier canal." },
          { titulo: "Suma tras viajar", texto: "Al comprar ves los puntos que ganarás; se anotan cuando haces el viaje." },
          { titulo: "Canjea", texto: "Paga billetes con puntos o úsalos con los partners." },
        ],
      },
      {
        tipo: "faq",
        titulo: "Dudas rápidas",
        preguntas: [
          { p: "¿Caducan los puntos?", r: "A los 3 años, salvo mientras seas Platino." },
          { p: "¿Puedo mezclar puntos y dinero en un billete?", r: "No, pero puedes crear un vale descuento con tus puntos." },
          { p: "¿Sumo puntos por los viajes de mis acompañantes?", r: "No; cada viajero necesita su propio número Más Renfe." },
        ],
      },
      { tipo: "cta", texto: "Más preguntas sobre el programa", enlace: "/ayuda/faqs", etiqueta: "Ver preguntas frecuentes" },
    ],
  },

  {
    ruta: "/mas-renfe/niveles",
    titulo: "Niveles Más Renfe",
    resumen: "Cuanto más gastas en billetes con puntos, más alto es tu nivel y mejores son las ventajas.",
    seccion: "mas-renfe",
    bloques: [
      {
        tipo: "tabla",
        columnas: ["Nivel", "Gasto anual en billetes", "Puntos por viaje", "Ventajas destacadas"],
        filas: [
          ["Más Renfe", "Hasta 750 €", "3 %", "Puntos por viajes y abonos nominativos AVE/Avant, ofertas de partners"],
          ["Plata", "Desde 750 €", "4 %", "Un billete al año con 50 % de descuento, 4 accesos a salas club, sorteos"],
          ["Oro", "Desde 2.000 €", "5 %", "Billete anual gratis, sala club con acompañante, atención preferente, teléfono exclusivo, parking"],
          ["Platino", "Desde 6.000 €", "8 %", "Todo lo de Oro, 3 mejoras a Prémium al año, puntos sin caducidad, regalar un año de Plata"],
        ],
      },
      {
        tipo: "texto",
        parrafos: [
          "Plata, Oro y Platino duran 12 meses; después se revisa el nivel según tu gasto. El nivel inicial no caduca.",
          "Los billetes anuales (descuento del 50 % en Plata, gratis en Oro y Platino) son de ida, para una persona, en AVE y Larga Distancia, sin combinados ni internacionales.",
          "Las mejoras de Platino se piden en el 919 191 566 antes de comprar: viajas en Prémium al precio de Básico.",
        ],
      },
      {
        tipo: "texto",
        titulo: "Más Renfe Joven",
        parrafos: [
          "Para jóvenes de 14 a 25 años. Cuesta 50 € y es personal. Da un 30 % de descuento en AVE y Larga Distancia y un 25 % en Avant, Media Distancia y Cercanías/Rodalies, sobre el mejor precio disponible.",
        ],
      },
      { tipo: "aviso", nivel: "info", texto: "Con la American Express Renfe también puedes subir de nivel: 5.000 € al año para Plata, 10.000 € para Oro y 15.000 € para Platino." },
    ],
  },

  {
    ruta: "/mas-renfe/tarjeta",
    titulo: "Tarjetas de crédito Más Renfe",
    resumen: "Dos tarjetas que suman Puntos Renfe con todo lo que compras: Renfe Mastercard y American Express Renfe.",
    seccion: "mas-renfe",
    bloques: [
      {
        tipo: "tabla",
        columnas: ["", "Renfe Mastercard", "American Express Renfe"],
        filas: [
          ["Emisor", "BBVA", "American Express"],
          ["Cuota", "0 € al año", "8 € al mes"],
          ["Puntos por compras", "2 puntos por cada 20 € en Renfe; 1 por cada 20 € en el resto", "0,15 puntos por euro (15 % del importe)"],
          ["Bienvenida", "450 puntos (45 €) si la pides entre el 1 y el 31 de octubre de 2026", "Hasta 1.200 puntos (120 €) gastando 2.000 € en los 6 primeros meses"],
          ["Seguros", "Atraco en cajero, accidentes y asistencia en viaje", "Accidentes de viaje, asistencia médica en el extranjero, compras y equipaje"],
          ["Otros", "Sin comisión por cambio de divisa", "Acceso a niveles Plata, Oro y Platino por gasto"],
        ],
      },
      {
        tipo: "lista",
        titulo: "Requisitos",
        items: [
          "Ser miembro de Más Renfe (las tarjetas adicionales no lo necesitan).",
          "Indicar tu número Más Renfe en la solicitud.",
          "Los puntos van siempre al titular y se anotan al cierre de cada mes.",
        ],
      },
      { tipo: "aviso", nivel: "alerta", texto: "Proyecto académico: aquí no se puede pedir ninguna tarjeta real." },
      { tipo: "cta", texto: "Primero, únete al programa", enlace: "/mas-renfe/que-es", etiqueta: "Darme de alta" },
    ],
  },

  {
    ruta: "/mas-renfe/partners",
    titulo: "Empresas colaboradoras",
    resumen: "Gana y gasta Puntos Renfe fuera del tren: carburante, hoteles, coches, compras y donaciones.",
    seccion: "mas-renfe",
    bloques: [
      {
        tipo: "tabla",
        columnas: ["Empresa", "Sector", "Qué ofrece"],
        filas: [
          ["Repsol (Waylet)", "Energía", "1 punto por 5 l de carburante premium, por 10 l de básico o por 15 kWh de recarga. Máx. 30 puntos/mes en carburante y 90 en recarga. 10 % de descuento en AVE/LD para dos"],
          ["El Club Carrefour", "Comercios", "15 puntos = 1 € en tu ChequeAhorro"],
          ["Europcar", "Alquiler de coches", "Hasta el 70 % del alquiler en Puntos Renfe"],
          ["AVIS", "Alquiler de coches", "Suma y canjea puntos"],
          ["Meliá Hotels", "Hoteles", "Canje de puntos por estancias"],
          ["Rusticae", "Hoteles", "Reserva con puntos en el 914 879 017 y 10 % en Llaves Regalo"],
          ["Renfe Viajes", "Viajes", "Paquetes y escapadas"],
          ["Unidad Editorial", "Publicaciones", "Suscripciones"],
          ["Membership Rewards", "Financiero", "Conversión de puntos American Express"],
          ["Aldeas Infantiles, Nuevo Futuro, Federación Española de Familias de Cáncer Infantil", "ONG", "Dona tus puntos"],
        ],
      },
    ],
  },

  {
    ruta: "/mas-renfe/promociones",
    titulo: "Abonos y promociones",
    resumen: "Abonos bonificados y gratuitos de 2026 y las ofertas activas para viajar en tren.",
    seccion: "mas-renfe",
    bloques: [
      {
        tipo: "tarjetas",
        titulo: "Abonos 2026",
        tarjetas: [
          { titulo: "Abonos bonificados", texto: "Cercanías desde 20 €/mes (10 € joven) y Media Distancia con un 40 % de descuento.", enlace: "/mas-renfe/promociones/abonos-bonificados" },
          { titulo: "Abonos gratuitos Asturias y Cantabria", texto: "Abono cuatrimestral gratis con fianza de 10 €.", enlace: "/mas-renfe/promociones/abonos-gratuitos" },
        ],
      },
      { tipo: "lista", titulo: "Otros abonos", items: ["Pase Vía", "Abono Único", "Abono 10-30"] },
      {
        tipo: "tarjetas",
        titulo: "Ofertas del momento",
        tarjetas: [
          { titulo: "Tarifa 4 o más", texto: "Descuento si viajáis 4 personas o más juntas.", enlace: "/viajar/prepara-tu-viaje/descuentos" },
          { titulo: "Avlo niños a 5 €", texto: "Billetes Avlo para niños a precio fijo.", enlace: "/viajar/prepara-tu-viaje/avlo" },
          { titulo: "Tu mascota viaja contigo", texto: "Perros de hasta 40 kg ya pueden viajar en todos los trenes.", enlace: "/viajar/informacion-util/mascotas" },
          { titulo: "Vales con tus puntos", texto: "Canjea Puntos Renfe por vales descuento.", enlace: "/mas-renfe/que-es" },
          { titulo: "Triple de puntos con Mastercard", texto: "450 puntos de bienvenida en octubre.", enlace: "/mas-renfe/tarjeta" },
        ],
      },
    ],
  },

  {
    ruta: "/mas-renfe/promociones/abonos-bonificados",
    titulo: "Abonos bonificados 2026",
    resumen: "Abonos con descuento para Cercanías, Rodalies y Media Distancia, válidos del 1 de enero al 31 de diciembre de 2026.",
    seccion: "mas-renfe",
    bloques: [
      {
        tipo: "tabla",
        titulo: "Cercanías (Bilbao, Cádiz, Madrid, Málaga, Murcia/Alicante, Rodalies, San Sebastián, Sevilla, València, Zaragoza, Cartagena, Ferrol y León)",
        columnas: ["Abono", "Precio", "Condiciones"],
        filas: [
          ["10 viajes (Bonotren)", "Según zonas", "Compartible, 1 año de validez"],
          ["Mensual bonificado", "20 €/mes", "Personal, ilimitado en todos los núcleos con tarjeta Renfe&Tú personalizada"],
          ["Mensual Joven", "10 €/mes", "Nacidos entre 2000 y 2011, con código del Ministerio"],
          ["Niños", "Gratis", "Nacidos desde 2012, todo el año, con código del Ministerio"],
        ],
      },
      {
        tipo: "tabla",
        titulo: "Media Distancia (entre dos estaciones concretas)",
        columnas: ["Abono", "Descuento", "Condiciones"],
        filas: [
          ["10 viajes", "40 % sobre la Tarjeta 10", "Compartible, 1 año de validez"],
          ["Mensual bonificado", "40 % sobre la Tarjeta 40", "Personal, 1 mes"],
          ["Mensual Joven", "50 % sobre el mensual de adulto", "Nacidos entre 2000 y 2011"],
          ["Niños", "Gratis", "Nacidos desde 2012"],
        ],
      },
      {
        tipo: "lista",
        titulo: "Normas de buen uso en Media Distancia",
        items: [
          "Un solo abono mensual por trayecto en cada periodo.",
          "Máximo 4 formalizaciones activas al día (no aplica al de 10 viajes).",
          "No puedes formalizar dos viajes en el mismo sentido hasta que pase el triple del tiempo de viaje, con un mínimo de 180 minutos.",
          "Anula lo que no vayas a usar con al menos 60 minutos de antelación. Reservar y no viajar cuenta como infracción.",
          "Con 3 infracciones se anula el abono sin reembolso y no puedes sacar otro en 60 días.",
        ],
      },
      { tipo: "aviso", nivel: "alerta", texto: "Si otra persona usa tu abono nominativo, se bloquea sin devolución y no podrás comprar otro bonificado durante 60 días." },
      { tipo: "texto", parrafos: ["Se compran desde 30 días antes de la fecha de inicio en la app Renfe Cercanías, la web, máquinas y taquillas. Dudas: 91 919 15 67."] },
    ],
  },

  {
    ruta: "/mas-renfe/promociones/abonos-gratuitos",
    titulo: "Abonos gratuitos en Asturias y Cantabria",
    resumen: "Abono cuatrimestral gratis para viajeros frecuentes de Cercanías Asturias y Cercanías Cantabria hasta el 31 de diciembre de 2026.",
    seccion: "mas-renfe",
    bloques: [
      {
        tipo: "pasos",
        pasos: [
          { titulo: "Regístrate", texto: "En la web o en las apps Renfe y Renfe Cercanías." },
          { titulo: "Paga la fianza", texto: "10 €, mejor con tarjeta para que te la devuelvan sola." },
          { titulo: "Viaja al menos 16 veces", texto: "Valida el abono en cada viaje durante los 4 meses." },
          { titulo: "Recupera la fianza", texto: "Se devuelve automáticamente a la tarjeta al terminar el cuatrimestre." },
        ],
      },
      {
        tipo: "tabla",
        titulo: "Cuatrimestres 2026",
        columnas: ["Periodo", "Validez"],
        filas: [["1.º", "Enero – abril"], ["2.º", "Mayo – agosto"], ["3.º", "Septiembre – diciembre (a la venta desde el 1 de agosto)"]],
      },
      { tipo: "aviso", nivel: "info", texto: "Guarda la tarjeta o el QR y el justificante de compra hasta que te devuelvan la fianza. Dudas: 91 919 15 67." },
    ],
  },
];
