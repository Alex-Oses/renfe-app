import type { Pagina } from "../tipos";

// Datos de renfe.com/es/es/inspirate; textos redactados para esta app.
export const paginas: Pagina[] = [
 {
  "ruta": "/inspirate/rutas/barcelona-malaga",
  "titulo": "Tren Barcelona - Málaga",
  "resumen": "Viaja en tren de Barcelona a Málaga: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Málaga sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Málaga, a la estación Málaga María Zambrano, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Málaga"
     ],
     [
      "Duración",
      "5 h 50 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 05:50 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Málaga María Zambrano",
    "items": [
     "Horario de apertura: de 05:00 h a 00:45 h",
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con las líneas C1 y C2 de Cercanías",
     "Conexión con metro y autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Málaga",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-tarragona",
  "titulo": "Tren Madrid - Tarragona",
  "resumen": "Viaja en tren de Madrid a Tarragona: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Tarragona sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Tarragona, a la estación Camp de Tarragona, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Tarragona"
     ],
     [
      "Duración",
      "2 h 25 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:30 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Camp de Tarragona",
    "items": [
     "Horario de apertura: de 05:45 h a 23:15 h",
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Conexiones con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Tarragona",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-cordoba",
  "titulo": "Tren Barcelona - Córdoba",
  "resumen": "Viaja en tren de Barcelona a Córdoba: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Córdoba sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Córdoba, a la estación Córdoba, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Córdoba"
     ],
     [
      "Duración",
      "4 h 50 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 05:50 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Córdoba",
    "items": [
     "Horario de apertura: de 06:00 h a 00:00 h",
     "Venta de billetes",
     "Zona de restauración",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Conexión con autobús",
     "Parada de taxi adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Córdoba",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-alicante",
  "titulo": "Tren Madrid - Alicante/Alacant",
  "resumen": "Viaja en tren de Madrid a Alicante/Alacant: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Alicante/Alacant sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Alicante/Alacant, a la estación Alicante/Alacant Terminal, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Alicante/Alacant"
     ],
     [
      "Duración",
      "2 h 15 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:30 h"
     ],
     [
      "Tipos de tren",
      "AVE, Avlo, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Alicante/Alacant Terminal",
    "items": [
     "Horario de apertura: de 05:30 h a 23:50 h",
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Comer a bordo",
    "items": [
     "Menú Box servido en el asiento con billetes Elige y Elige Confort",
     "Menú Prémium incluido con billete Prémium",
     "Cafetería y bar móvil en los AVE y en la mayoría de trenes de Larga Distancia"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Alicante/Alacant",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-zaragoza",
  "titulo": "Tren Barcelona - Zaragoza",
  "resumen": "Viaja en tren de Barcelona a Zaragoza: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Zaragoza sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Zaragoza, a la estación Zaragoza Delicias, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Zaragoza"
     ],
     [
      "Duración",
      "1 h 30 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 05:50 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Zaragoza Delicias",
    "items": [
     "Horario de apertura: de 05:30 h a 00:00 h",
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Zaragoza",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-malaga",
  "titulo": "Tren Madrid - Málaga",
  "resumen": "Viaja en tren de Madrid a Málaga: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Málaga sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Málaga, a la estación Málaga María Zambrano, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Málaga"
     ],
     [
      "Duración",
      "2 h 40 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07.35 h"
     ],
     [
      "Tipos de tren",
      "AVE, Avlo, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Málaga María Zambrano",
    "items": [
     "Horario de apertura: de 05:00 h a 00:45 h",
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con las líneas C1 y C2 de Cercanías",
     "Conexión con metro y autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Comer a bordo",
    "items": [
     "Menú Box servido en el asiento con billetes Elige y Elige Confort",
     "Menú Prémium incluido con billete Prémium",
     "Cafetería y bar móvil en los AVE y en la mayoría de trenes de Larga Distancia"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Málaga",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-sevilla",
  "titulo": "Tren Barcelona - Sevilla",
  "resumen": "Viaja en tren de Barcelona a Sevilla: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Sevilla sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Sevilla, a la estación Barcelona - Sants con destino Sevilla Santa Justa, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Sevilla"
     ],
     [
      "Duración",
      "5 h 40 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 05:50 h"
     ],
     [
      "Tipos de tren",
      "AVE, Avlo, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Barcelona - Sants con destino Sevilla Santa Justa",
    "items": [
     "Horario de apertura: de 04:30 h a 00:30 h",
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con todas las líneas de Cercanías",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Sevilla",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/leon-madrid",
  "titulo": "Tren León - Madrid",
  "resumen": "Viaja en tren de León a Madrid: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une León y Madrid sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Madrid, a la estación Madrid Chamartín Clara Campoamor, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "León"
     ],
     [
      "Destino",
      "Madrid"
     ],
     [
      "Duración",
      "2 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 6:40 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Madrid Chamartín Clara Campoamor",
    "items": [
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con las líneas de Cercanías",
     "Conexión con metro y autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios León - Madrid",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-valencia",
  "titulo": "Tren Madrid - València",
  "resumen": "Viaja en tren de Madrid a València: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y València sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de València, a la estación València Joaquín Sorolla, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "València"
     ],
     [
      "Duración",
      "1 h 40 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:30 h"
     ],
     [
      "Tipos de tren",
      "AVE, Avlo, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: València Joaquín Sorolla",
    "items": [
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con metro y autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Comer a bordo",
    "items": [
     "Menú Box servido en el asiento con billetes Elige y Elige Confort",
     "Menú Prémium incluido con billete Prémium",
     "Cafetería y bar móvil en los AVE y en la mayoría de trenes de Larga Distancia"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - València",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-madrid",
  "titulo": "Tren Barcelona - Madrid",
  "resumen": "Viaja en tren de Barcelona a Madrid: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Madrid sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Madrid, a la estación Madrid Puerta de Atocha - Almudena Grandes, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Madrid"
     ],
     [
      "Duración",
      "2 h 30 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 05:50 h"
     ],
     [
      "Tipos de tren",
      "AVE, Avlo, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Madrid Puerta de Atocha - Almudena Grandes",
    "items": [
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con todas las líneas de Cercanías",
     "Conexión con metro y autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Comer a bordo",
    "items": [
     "Menú Box servido en el asiento con billetes Elige y Elige Confort",
     "Menú Prémium incluido con billete Prémium",
     "Cafetería y bar móvil en los AVE y en la mayoría de trenes de Larga Distancia"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Madrid",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/alicante-madrid",
  "titulo": "Tren Alicante/Alacant - Madrid",
  "resumen": "Viaja en tren de Alicante/Alacant a Madrid: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Alicante/Alacant y Madrid sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Madrid, a la estación Madrid Chamartín Clara Campoamor, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Alicante/Alacant"
     ],
     [
      "Destino",
      "Madrid"
     ],
     [
      "Duración",
      "2 h 15 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 05:55 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Madrid Chamartín Clara Campoamor",
    "items": [
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Conexión con metro y autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Comer a bordo",
    "items": [
     "Menú Box servido en el asiento con billetes Elige y Elige Confort",
     "Menú Prémium incluido con billete Prémium",
     "Cafetería y bar móvil en los AVE y en la mayoría de trenes de Larga Distancia"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Alicante/Alacant - Madrid",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-leon",
  "titulo": "Tren Madrid - León",
  "resumen": "Viaja en tren de Madrid a León: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y León sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de León, a la estación León, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "León"
     ],
     [
      "Duración",
      "2 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:06 h"
     ],
     [
      "Tipos de tren",
      "Consultar en el buscador"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: León",
    "items": [
     "Horario de apertura: de 06:30 h a 00:00 h",
     "Información y venta de billetes",
     "Máquinas autoventa de billetes",
     "Zona de restauración",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Parada de taxi",
     "Conexión con autobús",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - León",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-sevilla",
  "titulo": "Tren Madrid - Sevilla",
  "resumen": "Viaja en tren de Madrid a Sevilla: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Sevilla sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Sevilla, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Sevilla"
     ],
     [
      "Duración",
      "2 h 30 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:00 h"
     ],
     [
      "Tipos de tren",
      "AVE, Avlo, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada",
    "items": [
     "Horario de apertura: de 04:30 h a 00:30 h",
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con todas las líneas de Cercanías",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Comer a bordo",
    "items": [
     "Menú Box servido en el asiento con billetes Elige y Elige Confort",
     "Menú Prémium incluido con billete Prémium",
     "Cafetería y bar móvil en los AVE y en la mayoría de trenes de Larga Distancia"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Sevilla",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/zaragoza-barcelona",
  "titulo": "Tren Zaragoza - Barcelona",
  "resumen": "Viaja en tren de Zaragoza a Barcelona: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Zaragoza y Barcelona sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Barcelona, a la estación Barcelona Sants, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Zaragoza"
     ],
     [
      "Destino",
      "Barcelona"
     ],
     [
      "Duración",
      "1 h 30 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 7:52 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Barcelona Sants",
    "items": [
     "Horario de apertura: de 04:30 h a 00:15 h",
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Conexión con metro y autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Zaragoza - Barcelona",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-ourense",
  "titulo": "Tren Madrid - Ourense",
  "resumen": "Viaja en tren de Madrid a Ourense: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Ourense sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Ourense, a la estación Ourense, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Ourense"
     ],
     [
      "Duración",
      "2 h 15 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:20 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Ourense",
    "items": [
     "Horario de apertura: de 05:30 h a 23:15 h",
     "Información y venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Ourense",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-lyon",
  "titulo": "Tren Barcelona - Lyon",
  "resumen": "Viaja en tren de Barcelona a Lyon: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Lyon sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Lyon, a la estación Lyon Part Dieu, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Lyon"
     ],
     [
      "Duración",
      "5 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 08:22 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Lyon Part Dieu",
    "items": [
     "Horario de apertura: de 04:40 h a 00:45 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona comercial",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con metro",
     "Conexión con autobús",
     "Conexión con tranvía",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Lyon",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-marsella",
  "titulo": "Tren Madrid - Marsella",
  "resumen": "Viaja en tren de Madrid a Marsella: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Marsella sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Marsella, a la estación Marsella Saint Charles, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Marsella"
     ],
     [
      "Duración",
      "7 h 50 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 13:25 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Marsella Saint Charles",
    "items": [
     "Horario de apertura: de 05:00 h a 01:00 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con autobús",
     "Conexión con metro",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Marsella",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-valence",
  "titulo": "Tren Barcelona - Valence",
  "resumen": "Viaja en tren de Barcelona a Valence: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Valence sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Valence, a la estación Valence TGV se encuentra a 10 km del centro y, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Valence"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 08:22 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Valence TGV se encuentra a 10 km del centro y",
    "items": [
     "Horario de apertura: de 05:20 h a 23:00 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Valence",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-avignon",
  "titulo": "Tren Madrid - Avignon",
  "resumen": "Viaja en tren de Madrid a Avignon: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Avignon sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Avignon, a la estación Avignon TGV, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Avignon"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 13:25 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Avignon TGV",
    "items": [
     "Horario de apertura: de 05:00 h a 00:00 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Avignon",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-aix-en-provence",
  "titulo": "Tren Madrid - Aix en Provence",
  "resumen": "Viaja en tren de Madrid a Aix en Provence: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Aix en Provence sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Aix en Provence, a la estación Aix en Provence TGV, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Aix en Provence"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 12:50 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Aix en Provence TGV",
    "items": [
     "Horario de apertura: de 05:00 h a 00:45 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Aix en Provence",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-perpignan",
  "titulo": "Tren Barcelona - Perpignan",
  "resumen": "Viaja en tren de Barcelona a Perpignan: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Perpignan sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Perpignan, a la estación Perpignan, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Perpignan"
     ],
     [
      "Duración",
      "1 h 20 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 08:22 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Perpignan",
    "items": [
     "Horario de apertura: de 05:00 h a 23:45 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con metro",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Perpignan",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-perpignan",
  "titulo": "Tren Madrid - Perpignan",
  "resumen": "Viaja en tren de Madrid a Perpignan: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Perpignan sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Perpignan, a la estación Perpignan, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Perpignan"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 13:25 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Perpignan",
    "items": [
     "Horario de apertura: de 05:00 h a 23:45 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con metro",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Perpignan",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-narbonne",
  "titulo": "Tren Barcelona - Narbona",
  "resumen": "Viaja en tren de Barcelona a Narbona: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Narbona sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Narbona, a la estación Narbonne, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Narbona"
     ],
     [
      "Duración",
      "2 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 08:22 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Narbonne",
    "items": [
     "Horario de apertura: de 05:00 h a 00:00 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Narbona",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-narbonne",
  "titulo": "Tren Madrid - Narbona",
  "resumen": "Viaja en tren de Madrid a Narbona: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Narbona sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Narbona, a la estación Narbonne, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Narbona"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 13:25 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Narbonne",
    "items": [
     "Horario de apertura: de 05:00 h a 00:00 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Narbona",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-montpellier",
  "titulo": "Tren Barcelona - Montpellier",
  "resumen": "Viaja en tren de Barcelona a Montpellier: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Montpellier sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Montpellier, a la estación Montpellier Stc Roch, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Montpellier"
     ],
     [
      "Duración",
      "3 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Montpellier Stc Roch",
    "items": [
     "Horario de apertura: de 04:45 h a 23:30 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con autobús",
     "Conexión con tranvía",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Montpellier",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-montpellier",
  "titulo": "Tren Madrid - Montpellier",
  "resumen": "Viaja en tren de Madrid a Montpellier: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Montpellier sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Montpellier, a la estación Montpellier St Roch, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Montpellier"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Montpellier St Roch",
    "items": [
     "Horario de apertura: de 04:45 h a 23:30 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con autobús",
     "Conexión con tranvía",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Montpellier",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-nimes",
  "titulo": "Tren Barcelona - Nîmes",
  "resumen": "Viaja en tren de Barcelona a Nîmes: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Nîmes sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Nîmes, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Nîmes"
     ],
     [
      "Duración",
      "3 h 30 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 08:22 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Nîmes",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-nimes",
  "titulo": "Tren Madrid - Nîmes",
  "resumen": "Viaja en tren de Madrid a Nîmes: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Nîmes sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Nîmes, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Nîmes"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 13:25 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada",
    "items": [
     "Horario de apertura: de 04:45 h a 00:00 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con autobús y autocar",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Nîmes",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-marsella",
  "titulo": "Tren Barcelona - Marsella",
  "resumen": "Viaja en tren de Barcelona a Marsella: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Marsella sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Marsella, a la estación Barcelona Sants hacia la estación de Marsella Saint Charles, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Marsella"
     ],
     [
      "Duración",
      "4 h 20 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 16:34 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Barcelona Sants hacia la estación de Marsella Saint Charles",
    "items": [
     "Horario de apertura: de 05:00 h a 01:00 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con autobús",
     "Conexión con metro",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Marsella",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/narbonne-lyon",
  "titulo": "Tren Narbonne - Lyon",
  "resumen": "Viaja en tren de Narbonne a Lyon: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Narbonne y Lyon sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Lyon, a la estación Lyon Part Dieu, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Narbonne"
     ],
     [
      "Destino",
      "Lyon"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 10:32 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Lyon Part Dieu",
    "items": [
     "Horario de apertura: de 04:40 h a 00:45 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona comercial",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con metro",
     "Conexión con autobús",
     "Conexión con tranvía",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Narbonne - Lyon",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/perpignan-marsella",
  "titulo": "Tren Perpignan - Marsella",
  "resumen": "Viaja en tren de Perpignan a Marsella: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Perpignan y Marsella sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Marsella, a la estación Perpignan hacia la estación de Marsella Saint Charles, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Perpignan"
     ],
     [
      "Destino",
      "Marsella"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 18:02 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Perpignan hacia la estación de Marsella Saint Charles",
    "items": [
     "Horario de apertura: de 05:00 h a 01:00 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con autobús",
     "Conexión con metro",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Perpignan - Marsella",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/valence-perpignan",
  "titulo": "Tren Valence - Perpignan",
  "resumen": "Viaja en tren de Valence a Perpignan: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Valence y Perpignan sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Perpignan, a la estación Perpignan, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Valence"
     ],
     [
      "Destino",
      "Perpignan"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 15:11 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Perpignan",
    "items": [
     "Horario de apertura: de 05:00 h a 23:45 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con metro",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Valence - Perpignan",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/nimes-lyon",
  "titulo": "Tren Nîmes - Lyon",
  "resumen": "Viaja en tren de Nîmes a Lyon: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Nîmes y Lyon sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Lyon, a la estación Lyon Part Dieu, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Nîmes"
     ],
     [
      "Destino",
      "Lyon"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 12:00 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Lyon Part Dieu",
    "items": [
     "Horario de apertura: de 04:40 h a 00:45 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona comercial",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con metro",
     "Conexión con autobús",
     "Conexión con tranvía",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Nîmes - Lyon",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/marsella-perpignan",
  "titulo": "Tren Marsella - Perpignan",
  "resumen": "Viaja en tren de Marsella a Perpignan: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Marsella y Perpignan sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Perpignan, a la estación Perpignan, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Marsella"
     ],
     [
      "Destino",
      "Perpignan"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 08:04 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Perpignan",
    "items": [
     "Horario de apertura: de 05:00 h a 23:45 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con metro",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Marsella - Perpignan",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/lyon-nimes",
  "titulo": "Tren Lyon - Nîmes",
  "resumen": "Viaja en tren de Lyon a Nîmes: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Lyon y Nîmes sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Nîmes, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Lyon"
     ],
     [
      "Destino",
      "Nîmes"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 14:32 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Lyon - Nîmes",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/perpignan-valence",
  "titulo": "Tren Perpignan - Valence",
  "resumen": "Viaja en tren de Perpignan a Valence: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Perpignan y Valence sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Valence, a la estación Valence TGV se encuentra a 10 km del centro y, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Perpignan"
     ],
     [
      "Destino",
      "Valence"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 09:52 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Valence TGV se encuentra a 10 km del centro y",
    "items": [
     "Horario de apertura: de 05:20 h a 23:00 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Perpignan - Valence",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/lyon-narbonne",
  "titulo": "Tren Lyon - Narbonne",
  "resumen": "Viaja en tren de Lyon a Narbonne: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Lyon y Narbonne sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Narbonne, a la estación Narbonne, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Lyon"
     ],
     [
      "Destino",
      "Narbonne"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 14:32 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Narbonne",
    "items": [
     "Horario de apertura: de 05:00 h a 00:00 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Lyon - Narbonne",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/perpignan-lyon",
  "titulo": "Tren Perpignan - Lyon",
  "resumen": "Viaja en tren de Perpignan a Lyon: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Perpignan y Lyon sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Lyon, a la estación Lyon Part Dieu, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Perpignan"
     ],
     [
      "Destino",
      "Lyon"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 09:48 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Lyon Part Dieu",
    "items": [
     "Horario de apertura: de 04:40 h a 00:45 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona comercial",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con metro",
     "Conexión con autobús",
     "Conexión con tranvía",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Perpignan - Lyon",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/lyon-perpignan",
  "titulo": "Tren Lyon - Perpignan",
  "resumen": "Viaja en tren de Lyon a Perpignan: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Lyon y Perpignan sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Perpignan, a la estación Perpignan, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Lyon"
     ],
     [
      "Destino",
      "Perpignan"
     ],
     [
      "Duración",
      "Según tren y horario; consúltala en el buscador"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 14:32 h"
     ],
     [
      "Tipos de tren",
      "AVE"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Perpignan",
    "items": [
     "Horario de apertura: de 05:00 h a 23:45 h",
     "Venta de billetes",
     "Atención al cliente",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Conexión con metro",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Lyon - Perpignan",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-san-sebastian",
  "titulo": "Tren Madrid - San Sebastián",
  "resumen": "Viaja en tren de Madrid a San Sebastián: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y San Sebastián sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de San Sebastián, a la estación San Sebastián, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "San Sebastián"
     ],
     [
      "Duración",
      "5 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 08:43 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: San Sebastián",
    "items": [
     "Horario de apertura: de 05:00 h a 23:30 h",
     "Área comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - San Sebastián",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-huelva",
  "titulo": "Tren Madrid - Huelva",
  "resumen": "Viaja en tren de Madrid a Huelva: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Huelva sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Huelva, a la estación Huelva, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Huelva"
     ],
     [
      "Duración",
      "3 h 40 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:00 h"
     ],
     [
      "Tipos de tren",
      "Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Huelva",
    "items": [
     "Horario de apertura: de 06:00 h a 23:00 h",
     "Venta de billetes",
     "Máquinas vending",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Huelva",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/santander-madrid",
  "titulo": "Tren Santander - Madrid",
  "resumen": "Viaja en tren de Santander a Madrid: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Santander y Madrid sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Madrid, a la estación Madrid Chamartín Clara Campoamor, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Santander"
     ],
     [
      "Destino",
      "Madrid"
     ],
     [
      "Duración",
      "4 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:05 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Madrid Chamartín Clara Campoamor",
    "items": [
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con todas las líneas de Cercanías",
     "Conexión con metro y autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Santander - Madrid",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-pamplona-iruna",
  "titulo": "Tren Madrid - Pamplona/Iruña",
  "resumen": "Viaja en tren de Madrid a Pamplona/Iruña: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Pamplona/Iruña sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Pamplona/Iruña, a la estación Pamplona/Iruña, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Pamplona/Iruña"
     ],
     [
      "Duración",
      "3 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:35 h"
     ],
     [
      "Tipos de tren",
      "Alvia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Pamplona/Iruña",
    "items": [
     "Horario de apertura: de 06:00 h a 23:30 h"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Pamplona/Iruña",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-castello",
  "titulo": "Tren Barcelona - Castelló",
  "resumen": "Viaja en tren de Barcelona a Castelló: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Castelló sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Castelló, a la estación Castelló, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Castelló"
     ],
     [
      "Duración",
      "2 h 30 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:15 h"
     ],
     [
      "Tipos de tren",
      "Consultar en el buscador"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Castelló",
    "items": [
     "Horario de apertura: de 05:25 h a 23:50 h",
     "Información y venta de billetes",
     "Máquinas autoventa de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con autobús",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Castelló",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-cadiz",
  "titulo": "Tren Madrid - Cádiz",
  "resumen": "Viaja en tren de Madrid a Cádiz: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Cádiz sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Cádiz, a la estación Cádiz, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Cádiz"
     ],
     [
      "Duración",
      "4 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:05 h"
     ],
     [
      "Tipos de tren",
      "Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Cádiz",
    "items": [
     "Horario de apertura: de 06:00 h a 23:45 h",
     "Venta de billetes",
     "Zona de restauración",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Cádiz",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-gijon",
  "titulo": "Tren Madrid - Gijón",
  "resumen": "Viaja en tren de Madrid a Gijón: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Gijón sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Gijón, a la estación Gijón, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Gijón"
     ],
     [
      "Duración",
      "3 h 40 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:36 h"
     ],
     [
      "Tipos de tren",
      "Consultar en el buscador"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Gijón",
    "items": [
     "Horario de apertura: de 05:30 h a 00:30 h",
     "Información y venta de billetes",
     "Máquinas autoventa de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Parada de taxi",
     "Conexión con autobús",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Gijón",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-badajoz",
  "titulo": "Tren Madrid - Badajoz",
  "resumen": "Viaja en tren de Madrid a Badajoz: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Badajoz sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Badajoz, a la estación Badajoz, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Badajoz"
     ],
     [
      "Duración",
      "4 h 30 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 08:30 h"
     ],
     [
      "Tipos de tren",
      "Alvia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Badajoz",
    "items": [
     "Horario de apertura: de 06:00 h a 22:15 h",
     "Información y venta de billetes",
     "Zona comercial",
     "Aparcamiento de vehículos",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Badajoz",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-figueres",
  "titulo": "Tren Barcelona - Figueres",
  "resumen": "Viaja en tren de Barcelona a Figueres: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Figueres sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Figueres, a la estación Figueres, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Figueres"
     ],
     [
      "Duración",
      "55 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:55 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Figueres",
    "items": [
     "Horario de apertura: de 06:00 h a 22:45 h",
     "Información y venta de billetes",
     "Máquinas autoventa de billetes",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Paradas de taxi y autobús",
     "Zona comercial",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Figueres",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-girona",
  "titulo": "Tren Barcelona - Girona",
  "resumen": "Viaja en tren de Barcelona a Girona: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Girona sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Girona, a la estación Girona, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Girona"
     ],
     [
      "Duración",
      "40 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:55 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Girona",
    "items": [
     "Horario de apertura: de 05:45 h a 23:15 h",
     "Información y venta de billetes",
     "Máquinas autoventa de billetes",
     "Aparcamiento de vehículos",
     "Área comercial",
     "Alquiler de coches",
     "Paradas de taxi y autobús",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Girona",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-tarragona",
  "titulo": "Tren Barcelona - Tarragona",
  "resumen": "Viaja en tren de Barcelona a Tarragona: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y Tarragona sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Tarragona, a la estación Camp de Tarragona, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "Tarragona"
     ],
     [
      "Duración",
      "35 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 05:50 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Camp de Tarragona",
    "items": [
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Conexiones con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - Tarragona",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/barcelona-valencia",
  "titulo": "Tren Barcelona - València",
  "resumen": "Viaja en tren de Barcelona a València: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Barcelona y València sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de València, a la estación València Joaquín Sorolla, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Barcelona"
     ],
     [
      "Destino",
      "València"
     ],
     [
      "Duración",
      "3 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:15 h"
     ],
     [
      "Tipos de tren",
      "AVE, Euromed, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: València Joaquín Sorolla",
    "items": [
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con metro y autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Comer a bordo",
    "items": [
     "Menú Box servido en el asiento con billetes Elige y Elige Confort",
     "Menú Prémium incluido con billete Prémium",
     "Cafetería y bar móvil en los AVE y en la mayoría de trenes de Larga Distancia"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Barcelona - València",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-a-coruna",
  "titulo": "Tren Madrid - A Coruña",
  "resumen": "Viaja en tren de Madrid a A Coruña: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y A Coruña sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de A Coruña, a la estación A Coruña, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "A Coruña"
     ],
     [
      "Duración",
      "3 h 20 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 09:30 h"
     ],
     [
      "Tipos de tren",
      "Consultar en el buscador"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: A Coruña",
    "items": [
     "Horario de apertura: de 05:00 h a 00:00 h",
     "Información y venta de billetes",
     "Zona comercial",
     "Aparcamiento de vehículos",
     "Alquiler de coches",
     "Parada de taxi",
     "Conexión con autobús",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - A Coruña",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-almeria",
  "titulo": "Tren Madrid - Almería",
  "resumen": "Viaja en tren de Madrid a Almería: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Almería sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Almería, a la estación Almería, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Almería"
     ],
     [
      "Duración",
      "6 h 30 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias"
     ],
     [
      "Tipos de tren",
      "Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Almería",
    "items": [
     "Horario de apertura: de 05:15 h a 01:00 h",
     "Información al viajero",
     "Máquinas vending",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Almería",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-barcelona",
  "titulo": "Tren Madrid - Barcelona",
  "resumen": "Viaja en tren de Madrid a Barcelona: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Barcelona sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Barcelona, a la estación Barcelona Sants, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Barcelona"
     ],
     [
      "Duración",
      "2 h 30 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 6:20 h"
     ],
     [
      "Tipos de tren",
      "AVE, Avlo, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Barcelona Sants",
    "items": [
     "Horario de apertura: de 04:30 h a 00:15 h",
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Conexión con metro y autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Comer a bordo",
    "items": [
     "Menú Box servido en el asiento con billetes Elige y Elige Confort",
     "Menú Prémium incluido con billete Prémium",
     "Cafetería y bar móvil en los AVE y en la mayoría de trenes de Larga Distancia"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Barcelona",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-bilbao",
  "titulo": "Tren Madrid - Bilbao",
  "resumen": "Viaja en tren de Madrid a Bilbao: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Bilbao sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Bilbao, a la estación Bilbao, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Bilbao"
     ],
     [
      "Duración",
      "4 h 45 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:15 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Bilbao",
    "items": [
     "Horario de apertura: de 04:45 h a 00:00 h",
     "Información y venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Conexión con metro y autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Bilbao",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-burgos",
  "titulo": "Tren Madrid - Burgos",
  "resumen": "Viaja en tren de Madrid a Burgos: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Burgos sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Burgos, a la estación Burgos Rosa Manzano, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Burgos"
     ],
     [
      "Duración",
      "1 h 35 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:15 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Burgos Rosa Manzano",
    "items": [
     "Información y venta de billetes",
     "Máquinas autoventa",
     "Máquinas vending",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Burgos",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-cordoba",
  "titulo": "Tren Madrid - Córdoba",
  "resumen": "Viaja en tren de Madrid a Córdoba: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Córdoba sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Córdoba, a la estación Córdoba, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Córdoba"
     ],
     [
      "Duración",
      "1 h 45 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:27 h"
     ],
     [
      "Tipos de tren",
      "AVE, Avlo, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Córdoba",
    "items": [
     "Horario de apertura: de 06:00 h a 00:00 h",
     "Venta de billetes",
     "Zona de restauración",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Comer a bordo",
    "items": [
     "Menú Box servido en el asiento con billetes Elige y Elige Confort",
     "Menú Prémium incluido con billete Prémium",
     "Cafetería y bar móvil en los AVE y en la mayoría de trenes de Larga Distancia"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Córdoba",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-cuenca",
  "titulo": "Tren Madrid - Cuenca",
  "resumen": "Viaja en tren de Madrid a Cuenca: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Cuenca sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Cuenca, a la estación Cuenca Fernando Zóbel, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Cuenca"
     ],
     [
      "Duración",
      "55 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:30 h"
     ],
     [
      "Tipos de tren",
      "AVE, Avlo"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Cuenca Fernando Zóbel",
    "items": [
     "Horario de apertura: de 06:45 h a 22:30 h",
     "Información y venta de billetes",
     "Aparcamiento de vehículos",
     "Paradas de taxi y autobús",
     "Zona comercial",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Cuenca",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-granada",
  "titulo": "Tren Madrid - Granada",
  "resumen": "Viaja en tren de Madrid a Granada: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Granada sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Granada, a la estación Granada, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Granada"
     ],
     [
      "Duración",
      "3 h 15 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:00 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Granada",
    "items": [
     "Horario de apertura: de 06:00 h a 23:15 h",
     "Información al viajero",
     "Máquinas vending",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con autobús",
     "Conexión con metro",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Granada",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-murcia",
  "titulo": "Tren Madrid - Murcia",
  "resumen": "Viaja en tren de Madrid a Murcia: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Murcia sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Murcia, a la estación Murcia, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Murcia"
     ],
     [
      "Duración",
      "2 h 50 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:15 h"
     ],
     [
      "Tipos de tren",
      "AVE, Avlo, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Murcia",
    "items": [
     "Horario de apertura: de 05:05 h a 23:59 h",
     "Venta de billetes",
     "Zona de restauración",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Murcia",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-oviedo",
  "titulo": "Tren Madrid - Oviedo",
  "resumen": "Viaja en tren de Madrid a Oviedo: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Oviedo sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Oviedo, a la estación Oviedo, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Oviedo"
     ],
     [
      "Duración",
      "3 h 15 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:36 h"
     ],
     [
      "Tipos de tren",
      "Consultar en el buscador"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Oviedo",
    "items": [
     "Horario de apertura: de 05:00 h a 00:30 h",
     "Información y venta de billetes",
     "Máquinas autoventa de billetes",
     "Zona comercial",
     "Aparcamiento de vehículos",
     "Parada de taxi",
     "Conexión con autobús",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Oviedo",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-salamanca",
  "titulo": "Tren Madrid - Salamanca",
  "resumen": "Viaja en tren de Madrid a Salamanca: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Salamanca sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Salamanca, a la estación Salamanca, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Salamanca"
     ],
     [
      "Duración",
      "1 h 35 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:40 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Salamanca",
    "items": [
     "Información y venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Salamanca",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-santiago",
  "titulo": "Tren Madrid - Santiago de Compostela",
  "resumen": "Viaja en tren de Madrid a Santiago de Compostela: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Santiago de Compostela sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Santiago de Compostela, a la estación Santiago de Compostela, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Santiago de Compostela"
     ],
     [
      "Duración",
      "3 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:20 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Santiago de Compostela",
    "items": [
     "Información y venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Santiago de Compostela",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-segovia",
  "titulo": "Tren Madrid - Segovia",
  "resumen": "Viaja en tren de Madrid a Segovia: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Segovia sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Segovia, a la estación Segovia Guiomar, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Segovia"
     ],
     [
      "Duración",
      "30 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:20 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia, Media Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Segovia Guiomar",
    "items": [
     "Horario de apertura: de 06:00 h a 22:30 h",
     "Información y venta de billetes",
     "Área comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Segovia",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-toledo",
  "titulo": "Tren Madrid - Toledo",
  "resumen": "Viaja en tren de Madrid a Toledo: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Toledo sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Toledo, a la estación Toledo, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Toledo"
     ],
     [
      "Duración",
      "33 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:45 h"
     ],
     [
      "Tipos de tren",
      "Avant"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Toledo",
    "items": [
     "Horario de apertura: de 06:00 h a 22:30 h",
     "Información y venta de billetes",
     "Área comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Toledo",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-valladolid",
  "titulo": "Tren Madrid - Valladolid",
  "resumen": "Viaja en tren de Madrid a Valladolid: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Valladolid sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Valladolid, a la estación Valladolid, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Valladolid"
     ],
     [
      "Duración",
      "1 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 07:48 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Valladolid",
    "items": [
     "Horario de apertura: de 05:45 h a 00:00 h",
     "Información y venta de billetes",
     "Área comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Valladolid",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-vigo",
  "titulo": "Tren Madrid - Vigo",
  "resumen": "Viaja en tren de Madrid a Vigo: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Vigo sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Vigo, a la estación Vigo, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Vigo"
     ],
     [
      "Duración",
      "4 h (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:40 h"
     ],
     [
      "Tipos de tren",
      "Consultar en el buscador"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Vigo",
    "items": [
     "Horario de apertura: de 05:00 h a 23:00 h",
     "Información y venta de billetes",
     "Zona de restauración",
     "Aparcamiento de vehículos",
     "Conexión con autobús",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Vigo",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/madrid-zaragoza",
  "titulo": "Tren Madrid - Zaragoza",
  "resumen": "Viaja en tren de Madrid a Zaragoza: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Madrid y Zaragoza sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Zaragoza, a la estación Zaragoza Delicias permanece abierta de 05:30 h a 00:00 h y, así que puedes empezar la visita nada más bajar."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Madrid"
     ],
     [
      "Destino",
      "Zaragoza"
     ],
     [
      "Duración",
      "1 h 20 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:30 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Desde 7 € con Avlo (tarifa promocional sujeta a disponibilidad)"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Zaragoza Delicias permanece abierta de 05:30 h a 00:00 h y",
    "items": [
     "Horario de apertura: de 05:30 h a 00:00 h",
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con Cercanías",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Comer a bordo",
    "items": [
     "Menú Box servido en el asiento con billetes Elige y Elige Confort",
     "Menú Prémium incluido con billete Prémium",
     "Cafetería y bar móvil en los AVE y en la mayoría de trenes de Larga Distancia"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Madrid - Zaragoza",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/malaga-granada",
  "titulo": "Tren Málaga - Granada",
  "resumen": "Viaja en tren de Málaga a Granada: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Málaga y Granada sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Granada, a la estación Granada, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Málaga"
     ],
     [
      "Destino",
      "Granada"
     ],
     [
      "Duración",
      "1 h 10 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 08:58 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Granada",
    "items": [
     "Horario de apertura: de 06:00 h a 23:15 h",
     "Información al viajero",
     "Máquinas vending",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexión con autobús",
     "Conexión con metro",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Málaga - Granada",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/sevilla-malaga",
  "titulo": "Tren Sevilla - Málaga",
  "resumen": "Viaja en tren de Sevilla a Málaga: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une Sevilla y Málaga sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Málaga, a la estación Málaga María Zambrano, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "Sevilla"
     ],
     [
      "Destino",
      "Málaga"
     ],
     [
      "Duración",
      "1 h 55 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:50 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: Málaga María Zambrano",
    "items": [
     "Horario de apertura: de 05:00 h a 00:45 h",
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con las líneas C1 y C2 de Cercanías",
     "Conexión con metro y autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios Sevilla - Málaga",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 },
 {
  "ruta": "/inspirate/rutas/valencia-sevilla",
  "titulo": "Tren València - Sevilla",
  "resumen": "Viaja en tren de València a Sevilla: duración, tipos de tren y precios orientativos.",
  "seccion": "inspirate",
  "bloques": [
   {
    "tipo": "texto",
    "parrafos": [
     "El tren une València y Sevilla sin atascos ni esperas de aeropuerto. Si reservas con antelación y aplicas el descuento que te toque (niños, jóvenes, mayores de 60, familia numerosa...), pagas menos.",
     "Llegas al centro de Sevilla, a la estación València Joaquín Sorolla con destino Sevilla Santa Justa, así que puedes empezar la visita nada más bajar. Con billete de AVE o Larga Distancia tienes además un trayecto gratis de Cercanías en origen y destino (Combinado Cercanías)."
    ]
   },
   {
    "tipo": "tabla",
    "titulo": "Datos del trayecto",
    "columnas": [
     "Dato",
     "Valor"
    ],
    "filas": [
     [
      "Origen",
      "València"
     ],
     [
      "Destino",
      "Sevilla"
     ],
     [
      "Duración",
      "3 h 50 min (aprox., trayecto directo más rápido)"
     ],
     [
      "Frecuencias",
      "Varias salidas diarias; el primer tren sale a las 06:43 h"
     ],
     [
      "Tipos de tren",
      "AVE, Larga Distancia"
     ],
     [
      "Precio desde",
      "Consulta el precio para tu fecha en el buscador"
     ]
    ]
   },
   {
    "tipo": "lista",
    "titulo": "Estación de llegada: València Joaquín Sorolla con destino Sevilla Santa Justa",
    "items": [
     "Horario de apertura: de 04:30 h a 00:30 h",
     "Venta de billetes",
     "Zona comercial",
     "Alquiler de coches",
     "Aparcamiento de vehículos",
     "Conexiones con todas las líneas de Cercanías",
     "Conexión con autobús",
     "Parada de taxi",
     "Adaptada a personas con movilidad reducida"
    ]
   },
   {
    "tipo": "aviso",
    "nivel": "info",
    "texto": "Duración y precio son orientativos. Los horarios y tarifas reales dependen de la fecha y del tren: compruébalos siempre en el buscador."
   },
   {
    "tipo": "cta",
    "texto": "Busca horarios y precios València - Sevilla",
    "enlace": "/trenes",
    "etiqueta": "Buscar trenes"
   }
  ]
 }
];
