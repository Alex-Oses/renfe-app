// Estructura del menú principal y del pie (misma arquitectura de información que renfe.com).
export type Enlace = { texto: string; ruta: string };
export type Grupo = { titulo: string; ruta: string; enlaces: Enlace[] };
export type Menu = { titulo: string; ruta: string; grupos: Grupo[] };

const NUCLEOS = [
  ["Asturias", "asturias"], ["Bilbao", "bilbao"], ["Cádiz", "cadiz"], ["Cantabria", "cantabria"],
  ["Cartagena", "cartagena"], ["Ferrol", "ferrol"], ["León", "leon"], ["Madrid", "madrid"],
  ["Málaga", "malaga"], ["Murcia/Alicante", "murcia-alicante"], ["Rodalies Catalunya", "rodalies-catalunya"],
  ["San Sebastián", "san-sebastian"], ["Sevilla", "sevilla"], ["València", "valencia"], ["Zaragoza", "zaragoza"],
] as const;

export const nucleosCercanias: Enlace[] = NUCLEOS.map(([texto, id]) => ({ texto, ruta: `/cercanias/${id}` }));

export const menuPrincipal: Menu[] = [
  {
    titulo: "Cercanías",
    ruta: "/cercanias",
    grupos: [{ titulo: "Núcleos de Cercanías", ruta: "/cercanias", enlaces: nucleosCercanias }],
  },
  {
    titulo: "Viajar",
    ruta: "/viajar",
    grupos: [
      {
        titulo: "Prepara tu viaje",
        ruta: "/viajar/prepara-tu-viaje",
        enlaces: [
          { texto: "Billetes AVE y Larga Distancia", ruta: "/viajar/prepara-tu-viaje/billetes-ave-larga-distancia" },
          { texto: "Abonos AVE y Larga Distancia", ruta: "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia" },
          { texto: "Avant y Media Distancia", ruta: "/viajar/prepara-tu-viaje/avant-media-distancia" },
          { texto: "Descuentos", ruta: "/viajar/prepara-tu-viaje/descuentos" },
          { texto: "Avlo", ruta: "/viajar/prepara-tu-viaje/avlo" },
          { texto: "AVE Francia", ruta: "/viajar/prepara-tu-viaje/ave-francia" },
          { texto: "Viajes y paquetes", ruta: "/viajar/prepara-tu-viaje/viajes-paquetes" },
          { texto: "Combina tren", ruta: "/viajar/prepara-tu-viaje/combina-tren" },
        ],
      },
      {
        titulo: "El viaje",
        ruta: "/viajar/el-viaje",
        enlaces: [
          { texto: "En tierra", ruta: "/viajar/el-viaje/en-tierra" },
          { texto: "A bordo", ruta: "/viajar/el-viaje/a-bordo" },
          { texto: "Wifi", ruta: "/viajar/el-viaje/wifi" },
        ],
      },
      {
        titulo: "Información útil",
        ruta: "/viajar/informacion-util",
        enlaces: [
          { texto: "Horarios", ruta: "/viajar/informacion-util/horarios" },
          { texto: "Mapas y líneas", ruta: "/viajar/informacion-util/mapas-y-lineas" },
          { texto: "Equipajes", ruta: "/viajar/informacion-util/equipajes" },
          { texto: "Bicicletas", ruta: "/viajar/informacion-util/bicicletas" },
          { texto: "Mascotas", ruta: "/viajar/informacion-util/mascotas" },
          { texto: "Dónde comprar", ruta: "/viajar/informacion-util/donde-comprar" },
          { texto: "Aplicaciones", ruta: "/viajar/informacion-util/aplicaciones" },
          { texto: "Menores que viajan solos", ruta: "/viajar/informacion-util/menores-que-viajan-solos" },
          { texto: "Asistencia PMR", ruta: "/viajar/informacion-util/servicio-de-asistencia" },
        ],
      },
    ],
  },
  {
    titulo: "Inspírate",
    ruta: "/inspirate",
    grupos: [
      { titulo: "Rutas", ruta: "/inspirate/rutas", enlaces: [] },
      { titulo: "Destinos", ruta: "/inspirate/destinos", enlaces: [] },
      { titulo: "Estaciones", ruta: "/inspirate/estaciones", enlaces: [] },
      { titulo: "Experiencias", ruta: "/inspirate/experiencias", enlaces: [] },
    ],
  },
  {
    titulo: "Gestiona tu billete",
    ruta: "/gestiona",
    grupos: [
      {
        titulo: "Tus reservas",
        ruta: "/gestiona/tus-reservas",
        enlaces: [
          { texto: "Consulta tus viajes", ruta: "/gestiona/tus-reservas/consulta-tus-viajes" },
          { texto: "Cambia tu billete", ruta: "/gestiona/tus-reservas/cambia-tu-billete" },
          { texto: "Anula tu billete", ruta: "/gestiona/tus-reservas/anula-tu-billete" },
          { texto: "Grupos de 10 a 25", ruta: "/gestiona/tus-reservas/grupos-10-25" },
          { texto: "Compra con localizador", ruta: "/gestiona/tus-reservas/compra-con-localizador" },
          { texto: "Estado de tu tren", ruta: "/gestiona/tus-reservas/estado-de-tu-tren" },
        ],
      },
      {
        titulo: "Añade extras",
        ruta: "/gestiona/anade-extras",
        enlaces: [
          { texto: "Billete de niño", ruta: "/gestiona/anade-extras/billete-nino" },
          { texto: "Extras de viaje", ruta: "/gestiona/anade-extras/extras-de-viaje" },
        ],
      },
      {
        titulo: "Posventa",
        ruta: "/gestiona/posventa",
        enlaces: [
          { texto: "Solicita indemnización", ruta: "/gestiona/posventa/indemnizacion" },
          { texto: "Solicita tu factura", ruta: "/gestiona/posventa/factura" },
          { texto: "Tramita tu reclamación", ruta: "/gestiona/posventa/reclamacion" },
        ],
      },
    ],
  },
  {
    titulo: "Más Renfe",
    ruta: "/mas-renfe",
    grupos: [
      {
        titulo: "Programa de puntos",
        ruta: "/mas-renfe",
        enlaces: [
          { texto: "Qué es", ruta: "/mas-renfe/que-es" },
          { texto: "Tarjeta de crédito", ruta: "/mas-renfe/tarjeta" },
          { texto: "Abonos y promociones", ruta: "/mas-renfe/promociones" },
        ],
      },
    ],
  },
];

export const enlacesAyuda: Enlace[] = [
  { texto: "Cambiar billete", ruta: "/ayuda/cambiar-billete" },
  { texto: "Anular billete", ruta: "/ayuda/anular-billete" },
  { texto: "Cercanías", ruta: "/ayuda/cercanias" },
  { texto: "Preguntas frecuentes", ruta: "/ayuda/faqs" },
  { texto: "Objetos perdidos", ruta: "/ayuda/objetos-perdidos" },
  { texto: "Teléfonos de atención", ruta: "/ayuda/telefonos" },
  { texto: "Contacto", ruta: "/ayuda/contacto" },
  { texto: "Compromiso de puntualidad", ruta: "/ayuda/compromiso-puntualidad" },
  { texto: "Solicitar factura", ruta: "/ayuda/solicitar-factura" },
  { texto: "Cita previa", ruta: "/ayuda/cita-previa" },
  { texto: "Notificación de accidentes", ruta: "/ayuda/notificacion-accidentes" },
  { texto: "Atención por videollamada", ruta: "/ayuda/videollamada" },
  { texto: "Avisos por WhatsApp", ruta: "/ayuda/avisos-whatsapp" },
  { texto: "Información legal", ruta: "/ayuda/informacion-legal" },
];

export const enlacesLegal: Enlace[] = [
  { texto: "Privacidad y cookies", ruta: "/ayuda/informacion-legal/privacidad-cookies" },
  { texto: "Accesibilidad web", ruta: "/ayuda/informacion-legal/accesibilidad" },
  { texto: "Condiciones de transporte", ruta: "/ayuda/informacion-legal/condiciones-transporte" },
  { texto: "Aviso legal", ruta: "/ayuda/informacion-legal/aviso-legal" },
];

/** Barra de aviso destacado sobre la cabecera. Texto vacío = no se muestra. */
export const avisoDestacado: Enlace = {
  texto: "Antes de salir, revisa el estado de tu tren: los avisos de cada línea se actualizan durante el día.",
  ruta: "/gestiona/tus-reservas/estado-de-tu-tren",
};
