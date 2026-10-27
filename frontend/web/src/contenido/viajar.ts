// Sección "Viajar": datos (precios, plazos, condiciones) tomados de renfe.com en octubre de 2026, redactados con palabras propias.
// Fichero generado; las páginas índice llevan tarjetas automáticas hacia sus hijas directas.
import type { Pagina } from "./tipos";

export const paginas: Pagina[] = [
  {
    "ruta": "/viajar",
    "titulo": "Viajar",
    "resumen": "Todo lo necesario para planificar un viaje en tren: billetes, abonos, descuentos, servicios en la estación y a bordo, e información práctica.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "La sección Viajar reúne la oferta comercial de los trenes AVE, Avlo, Larga Distancia, Avant y Media Distancia, los servicios que el viajero encuentra antes y durante el trayecto y las normas prácticas (equipaje, mascotas, bicicletas, menores, asistencia).",
          "Está organizada en tres bloques: preparar el viaje, el viaje en sí e información útil."
        ]
      },
      {
        "tipo": "cta",
        "texto": "¿Ya sabes adónde vas? Busca tu tren y compara precios.",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Prepara tu viaje",
            "texto": "Billetes, abonos y descuentos para cada tipo de tren, además de Avlo, AVE a Francia, paquetes y billetes combinados.",
            "enlace": "/viajar/prepara-tu-viaje"
          },
          {
            "titulo": "El viaje",
            "texto": "Servicios disponibles en la estación (salas Club, aparcamiento, puntos de atención) y a bordo (restauración, tipos de asiento, coche en silencio, wifi).",
            "enlace": "/viajar/el-viaje"
          },
          {
            "titulo": "Información útil",
            "texto": "Horarios, mapas de líneas, equipaje, bicicletas, mascotas, canales de compra, apps, menores que viajan solos y asistencia a personas con discapacidad.",
            "enlace": "/viajar/informacion-util"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje",
    "titulo": "Prepara tu viaje",
    "resumen": "Billetes, abonos y descuentos para cada tipo de tren, además de Avlo, AVE a Francia, paquetes y billetes combinados.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Antes de comprar conviene elegir el tipo de billete que encaja con tu viaje: un billete sencillo con más o menos flexibilidad, un abono si repites trayecto o un descuento si perteneces a algún colectivo (niños, mayores de 60, familia numerosa, grupos...)."
        ]
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Los abonos bonificados de Cercanías y Media Distancia y los abonos Avant al 50% para trayectos de alta velocidad declarados Obligación de Servicio Público (OSP) están vigentes en 2026. Consulta la página de Avant y Media Distancia."
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Billetes AVE y Larga Distancia",
            "texto": "Compara los billetes Básico, Elige Estándar, Elige Confort y Prémium y los extras que puedes añadir.",
            "enlace": "/viajar/prepara-tu-viaje/billetes-ave-larga-distancia"
          },
          {
            "titulo": "Abonos AVE y Larga Distancia",
            "texto": "Bonos para viajeros frecuentes: Bono AVE, Bono AVE Flexible, Bono Colaborativo, Galicia Rail Pass y Spain Rail Pass.",
            "enlace": "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia"
          },
          {
            "titulo": "Avant y Media Distancia",
            "texto": "Billetes y abonos para trenes Avant y Media Distancia, abonos bonificados de 2026, servicios de proximidad y Renfe Álava.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia"
          },
          {
            "titulo": "Descuentos",
            "texto": "Descuentos para niños, mayores de 60, familias numerosas, grupos, personas con discapacidad, congresos y empresas.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos"
          },
          {
            "titulo": "Avlo",
            "texto": "Alta velocidad low cost: billetes desde 7 € y 5 € para menores de 14 años, con wifi gratis.",
            "enlace": "/viajar/prepara-tu-viaje/avlo"
          },
          {
            "titulo": "AVE Francia",
            "texto": "AVE Internacional entre España y Francia: Barcelona–Lyon y Madrid–Barcelona–Marsella, hasta 28 trenes semanales.",
            "enlace": "/viajar/prepara-tu-viaje/ave-francia"
          },
          {
            "titulo": "Viajes y paquetes",
            "texto": "Renfe Viajes: tren más hotel, entradas y experiencias en una sola reserva.",
            "enlace": "/viajar/prepara-tu-viaje/viajes-paquetes"
          },
          {
            "titulo": "Combina tren",
            "texto": "Billetes combinados Tren + Bus y Train & Fly (tren + avión con Iberia).",
            "enlace": "/viajar/prepara-tu-viaje/combina-tren"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje",
    "titulo": "El viaje",
    "resumen": "Servicios disponibles en la estación (salas Club, aparcamiento, puntos de atención) y a bordo (restauración, tipos de asiento, coche en silencio, wifi).",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "En tierra",
            "texto": "Servicios en la estación: Salas Club, aparcamientos y puntos de atención.",
            "enlace": "/viajar/el-viaje/en-tierra"
          },
          {
            "titulo": "A bordo",
            "texto": "Restauración, tipos de asiento, coche en silencio y entretenimiento durante el viaje.",
            "enlace": "/viajar/el-viaje/a-bordo"
          },
          {
            "titulo": "Wifi PlayRenfe",
            "texto": "Wifi gratuito en AVE, AVE a Francia, Avlo y la mayoría de Larga Distancia.",
            "enlace": "/viajar/el-viaje/wifi"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util",
    "titulo": "Información útil",
    "resumen": "Horarios, mapas de líneas, equipaje, bicicletas, mascotas, canales de compra, apps, menores que viajan solos y asistencia a personas con discapacidad.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Horarios",
            "texto": "Consulta los horarios de AVE, Larga Distancia, Avant y Media Distancia entre dos estaciones.",
            "enlace": "/viajar/informacion-util/horarios"
          },
          {
            "titulo": "Mapas y líneas",
            "texto": "Mapa de líneas AVE y Larga Distancia, Media Distancia y Avant, y AVE a Francia.",
            "enlace": "/viajar/informacion-util/mapas-y-lineas"
          },
          {
            "titulo": "Equipajes",
            "texto": "Hasta 3 bultos de mano con 25 kg y 290 cm en total; normas especiales para Avlo.",
            "enlace": "/viajar/informacion-util/equipajes"
          },
          {
            "titulo": "Bicicletas y patinetes",
            "texto": "Cómo viajar con bicicleta plegable, desmontada o completa y con patinete eléctrico según el tren.",
            "enlace": "/viajar/informacion-util/bicicletas"
          },
          {
            "titulo": "Mascotas",
            "texto": "Mascotas de hasta 10 kg en transportín y perros de hasta 40 kg sin transportín, según el tren.",
            "enlace": "/viajar/informacion-util/mascotas"
          },
          {
            "titulo": "Dónde comprar",
            "texto": "Web, app, teléfono, estación, agencias y puntos de venta en el extranjero.",
            "enlace": "/viajar/informacion-util/donde-comprar"
          },
          {
            "titulo": "Aplicaciones",
            "texto": "Apps para comprar, consultar horarios y planificar el viaje.",
            "enlace": "/viajar/informacion-util/aplicaciones"
          },
          {
            "titulo": "Menores que viajan solos",
            "texto": "Servicio para niños de 6 a 13 años con billete Prémium o Elige Confort en AVE y Larga Distancia.",
            "enlace": "/viajar/informacion-util/menores-que-viajan-solos"
          },
          {
            "titulo": "Servicio de asistencia (Adif Acerca)",
            "texto": "Asistencia gratuita a personas con discapacidad o movilidad reducida en estaciones y al subir o bajar del tren.",
            "enlace": "/viajar/informacion-util/servicio-de-asistencia"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/billetes-ave-larga-distancia",
    "titulo": "Billetes AVE y Larga Distancia",
    "resumen": "Compara los billetes Básico, Elige Estándar, Elige Confort y Prémium y los extras que puedes añadir.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "En AVE, AVE Internacional y Larga Distancia el precio depende de la antelación (cuanto antes compras, más barato) y del nivel de flexibilidad elegido. Hay cuatro opciones de billete y una serie de extras opcionales."
        ]
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Prestación",
          "Básico",
          "Elige Estándar",
          "Elige Confort",
          "Prémium"
        ],
        "filas": [
          [
            "Tipo de asiento",
            "Estándar",
            "Estándar",
            "XL Confort",
            "XL Confort"
          ],
          [
            "Cambios (se paga la diferencia de precio, si la hay)",
            "Extra: 10 €",
            "Primer cambio gratis",
            "Primer cambio gratis",
            "Ilimitados gratis"
          ],
          [
            "Anulación",
            "Sin reembolso",
            "Devolución del 70 %",
            "Devolución del 70 %",
            "Devolución hasta el 100 %"
          ],
          [
            "Cambio de titular",
            "40 €",
            "20 €",
            "20 €",
            "Incluido"
          ],
          [
            "Cambio por pérdida de tren",
            "No",
            "30 % del nuevo billete",
            "30 % del nuevo billete",
            "Incluido"
          ],
          [
            "Acceso a Salas Club",
            "No",
            "No",
            "No",
            "Incluido"
          ],
          [
            "Selección de asiento",
            "Extra: 5 €",
            "Extra: 5 €",
            "Extra: 5 €",
            "Incluida"
          ],
          [
            "Mascota hasta 10 kg (transportín)",
            "Extra: 10 €",
            "Extra: 10 €",
            "Extra: 10 €",
            "Incluida"
          ],
          [
            "Perro hasta 40 kg (sin transportín)",
            "No",
            "Extra: 40 €",
            "No",
            "No"
          ],
          [
            "Cambios gratuitos ilimitados",
            "No",
            "Extra: 5 €",
            "Extra: 5 €",
            "Incluido"
          ],
          [
            "Puente AVE",
            "No",
            "Extra: 5 €",
            "Extra: 5 €",
            "Incluido"
          ],
          [
            "Reembolso total",
            "No",
            "Extra: 5 €",
            "Extra: 5 €",
            "Incluido"
          ],
          [
            "Pack Superflex (3 en 1)",
            "No",
            "Extra: 10 €",
            "Extra: 10 €",
            "Incluido"
          ],
          [
            "Restauración a bordo",
            "Menú box desde 11,35 € (recogida en cafetería)",
            "Menú box desde 11,35 € (recogida en cafetería)",
            "Menú box desde 11,35 € (servido en el asiento)",
            "Menú Prémium servido en el asiento"
          ]
        ],
        "titulo": "Tabla comparativa"
      },
      {
        "tipo": "lista",
        "items": [
          "Puente AVE: adelantar o retrasar el tren el mismo día, sin gastos ni diferencia de precio, hasta 30 minutos antes de la salida y según disponibilidad.",
          "Reembolso total: 100 % si anulas hasta 7 días antes; 95 % en los 6 últimos días.",
          "Pack Superflex: reúne los tres extras anteriores por 10 € en lugar de 15 €."
        ],
        "titulo": "Qué significa cada extra"
      },
      {
        "tipo": "lista",
        "items": [
          "Hasta 3 bultos de equipaje de mano",
          "Compromiso de puntualidad",
          "Wifi PlayRenfe y, salvo en Intercity, canal de audio y vídeo",
          "Coche en silencio (AVE y Euromed)",
          "Cafetería o bar móvil",
          "Combinado Cercanías",
          "Centros de atención al cliente y puntos de última hora en estación",
          "Máquinas autoventa",
          "Asistencia a personas con movilidad reducida",
          "Acumulación de Puntos Renfe"
        ],
        "titulo": "Servicios incluidos en cualquier billete"
      },
      {
        "tipo": "lista",
        "items": [
          "Los extras de flexibilidad (Cambios gratuitos ilimitados, Puente AVE, Reembolso total y Pack Superflex) solo se contratan en el momento de comprar y no existen para el billete Básico.",
          "Cualquier billete se puede anular sin gastos durante las 2 horas siguientes a la compra.",
          "Los billetes AVE y Larga Distancia son nominativos: lleva DNI, pasaporte, permiso de conducir o tarjeta de residencia en vigor, porque puede haber controles en el acceso o a bordo.",
          "En el AVE Internacional entre España y Francia hay Básico, Elige Estándar y Elige Confort, pero no Prémium."
        ],
        "titulo": "Ten en cuenta"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Con un billete AVE o Larga Distancia tienes incluido el Combinado Cercanías: un trayecto en Cercanías, Rodalies o TRAM de Alicante desde 4 horas antes de la salida hasta 4 horas después de la llegada.",
          "Se saca en máquinas autoventa o taquillas leyendo el código de barras del billete o tecleando su código numérico. En los núcleos de Madrid, Málaga, València y Murcia/Alicante basta con pasar el código BIDI del billete por los tornos."
        ],
        "titulo": "Combinado Cercanías"
      },
      {
        "tipo": "cta",
        "texto": "Busca tu tren AVE o Larga Distancia",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Billete Básico",
            "texto": "La opción más barata: asiento Estándar, un cambio por 10 € y sin reembolso al anular.",
            "enlace": "/viajar/prepara-tu-viaje/billetes-ave-larga-distancia/basico"
          },
          {
            "titulo": "Billetes Elige Estándar y Elige Confort",
            "texto": "Billete configurable: eliges asiento Estándar o XL Confort, primer cambio gratis y 70 % de devolución.",
            "enlace": "/viajar/prepara-tu-viaje/billetes-ave-larga-distancia/elige"
          },
          {
            "titulo": "Billete Prémium",
            "texto": "Todo incluido: asiento XL Confort, Pack Superflex, Sala Club, selección de asiento, mascota y restauración en el asiento.",
            "enlace": "/viajar/prepara-tu-viaje/billetes-ave-larga-distancia/premium"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/billetes-ave-larga-distancia/basico",
    "titulo": "Billete Básico",
    "resumen": "La opción más barata: asiento Estándar, un cambio por 10 € y sin reembolso al anular.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Es el billete de precio más bajo para AVE y Larga Distancia. Se viaja siempre en asiento Estándar (butaca reclinable, luz de lectura y enchufe) y también acumula Puntos Renfe.",
          "Se puede anular, pero no se devuelve el importe, y no admite los extras de flexibilidad ni el cambio por pérdida de tren."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Asiento Estándar.",
          "Un cambio por 10 € más la diferencia de precio; si el nuevo billete es más barato no se devuelve la diferencia. Debe hacerse como mínimo 24 horas antes de la salida del tren original.",
          "Cambio de titular por 40 €."
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "lista",
        "items": [
          "Selección de asiento: 5 €.",
          "Mascota de hasta 10 kg en transportín (máx. 60x35x35 cm): 10 €.",
          "Menú box desde 11,35 €, para recoger en la cafetería."
        ],
        "titulo": "Extras disponibles"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "El billete Básico también se vende en el AVE Internacional entre España y Francia."
      },
      {
        "tipo": "lista",
        "items": [
          "Hasta 3 bultos de equipaje de mano",
          "Compromiso de puntualidad",
          "Wifi PlayRenfe y, salvo en Intercity, canal de audio y vídeo",
          "Coche en silencio (AVE y Euromed)",
          "Cafetería o bar móvil",
          "Combinado Cercanías",
          "Centros de atención al cliente y puntos de última hora en estación",
          "Máquinas autoventa",
          "Asistencia a personas con movilidad reducida",
          "Acumulación de Puntos Renfe"
        ],
        "titulo": "Servicios incluidos en cualquier billete"
      },
      {
        "tipo": "lista",
        "items": [
          "Los extras de flexibilidad (Cambios gratuitos ilimitados, Puente AVE, Reembolso total y Pack Superflex) solo se contratan en el momento de comprar y no existen para el billete Básico.",
          "Cualquier billete se puede anular sin gastos durante las 2 horas siguientes a la compra.",
          "Los billetes AVE y Larga Distancia son nominativos: lleva DNI, pasaporte, permiso de conducir o tarjeta de residencia en vigor, porque puede haber controles en el acceso o a bordo.",
          "En el AVE Internacional entre España y Francia hay Básico, Elige Estándar y Elige Confort, pero no Prémium."
        ],
        "titulo": "Ten en cuenta"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Con un billete AVE o Larga Distancia tienes incluido el Combinado Cercanías: un trayecto en Cercanías, Rodalies o TRAM de Alicante desde 4 horas antes de la salida hasta 4 horas después de la llegada.",
          "Se saca en máquinas autoventa o taquillas leyendo el código de barras del billete o tecleando su código numérico. En los núcleos de Madrid, Málaga, València y Murcia/Alicante basta con pasar el código BIDI del billete por los tornos."
        ],
        "titulo": "Combinado Cercanías"
      },
      {
        "tipo": "cta",
        "texto": "Encuentra billetes Básico",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/billetes-ave-larga-distancia/elige",
    "titulo": "Billetes Elige Estándar y Elige Confort",
    "resumen": "Billete configurable: eliges asiento Estándar o XL Confort, primer cambio gratis y 70 % de devolución.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Elige permite decidir el tipo de asiento (Estándar con Elige Estándar, XL Confort con Elige Confort) y añadir solo los extras que necesites. Gana flexibilidad respecto al Básico y acumula Puntos Renfe."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Primer cambio gratis (pagas solo la diferencia, si la hay); los siguientes, 10 € cada uno. Si el nuevo billete es más barato no se devuelve la diferencia.",
          "Si anulas, se devuelve el 70 % del importe.",
          "Cambio de titular por 20 €.",
          "Pérdida de tren: puedes pasar al siguiente pagando el 30 % del nuevo billete si lo pides tras la salida y antes de que pasen 30 minutos."
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "lista",
        "items": [
          "Cambios gratuitos ilimitados: 5 €.",
          "Puente AVE: 5 € (no disponible si compras el mismo día del viaje).",
          "Reembolso total: 5 € (100 % hasta 7 días antes, 95 % después).",
          "Pack Superflex con los tres anteriores: 10 € (no disponible si compras el mismo día del viaje).",
          "Selección de asiento: 5 €.",
          "Mascota hasta 10 kg: 10 €.",
          "Perro de hasta 40 kg sin transportín: 40 € (solo con asiento Estándar).",
          "Menú box desde 11,35 €: servido en el asiento con Elige Confort, recogida en cafetería con Elige Estándar."
        ],
        "titulo": "Extras disponibles"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Elige (Estándar y Confort) está disponible también en el AVE Internacional entre España y Francia."
      },
      {
        "tipo": "lista",
        "items": [
          "Hasta 3 bultos de equipaje de mano",
          "Compromiso de puntualidad",
          "Wifi PlayRenfe y, salvo en Intercity, canal de audio y vídeo",
          "Coche en silencio (AVE y Euromed)",
          "Cafetería o bar móvil",
          "Combinado Cercanías",
          "Centros de atención al cliente y puntos de última hora en estación",
          "Máquinas autoventa",
          "Asistencia a personas con movilidad reducida",
          "Acumulación de Puntos Renfe"
        ],
        "titulo": "Servicios incluidos en cualquier billete"
      },
      {
        "tipo": "lista",
        "items": [
          "Los extras de flexibilidad (Cambios gratuitos ilimitados, Puente AVE, Reembolso total y Pack Superflex) solo se contratan en el momento de comprar y no existen para el billete Básico.",
          "Cualquier billete se puede anular sin gastos durante las 2 horas siguientes a la compra.",
          "Los billetes AVE y Larga Distancia son nominativos: lleva DNI, pasaporte, permiso de conducir o tarjeta de residencia en vigor, porque puede haber controles en el acceso o a bordo.",
          "En el AVE Internacional entre España y Francia hay Básico, Elige Estándar y Elige Confort, pero no Prémium."
        ],
        "titulo": "Ten en cuenta"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Con un billete AVE o Larga Distancia tienes incluido el Combinado Cercanías: un trayecto en Cercanías, Rodalies o TRAM de Alicante desde 4 horas antes de la salida hasta 4 horas después de la llegada.",
          "Se saca en máquinas autoventa o taquillas leyendo el código de barras del billete o tecleando su código numérico. En los núcleos de Madrid, Málaga, València y Murcia/Alicante basta con pasar el código BIDI del billete por los tornos."
        ],
        "titulo": "Combinado Cercanías"
      },
      {
        "tipo": "cta",
        "texto": "Configura tu billete Elige",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/billetes-ave-larga-distancia/premium",
    "titulo": "Billete Prémium",
    "resumen": "Todo incluido: asiento XL Confort, Pack Superflex, Sala Club, selección de asiento, mascota y restauración en el asiento.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Prémium es el billete de gama alta en AVE y Larga Distancia. El precio ya incluye todos los extras y es el que más Puntos Renfe genera para los socios Más Renfe. No existe en el AVE Internacional a Francia."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Asiento XL Confort.",
          "Pack Superflex: cambios ilimitados sin penalización, Puente AVE el mismo día y reembolso del 100 % hasta 7 días antes (95 % en los 6 últimos días).",
          "Cambio de titular gratuito.",
          "Pérdida de tren: cambio gratis al siguiente si lo pides dentro de los 30 minutos posteriores a la salida.",
          "Selección de asiento sin coste.",
          "Acceso a la Sala Club de la estación de origen desde 2 horas antes.",
          "Mascota de hasta 10 kg gratis (el extra de perro de hasta 40 kg solo existe con Elige Estándar).",
          "Restauración servida en el asiento."
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "lista",
        "items": [
          "Hasta 3 bultos de equipaje de mano",
          "Compromiso de puntualidad",
          "Wifi PlayRenfe y, salvo en Intercity, canal de audio y vídeo",
          "Coche en silencio (AVE y Euromed)",
          "Cafetería o bar móvil",
          "Combinado Cercanías",
          "Centros de atención al cliente y puntos de última hora en estación",
          "Máquinas autoventa",
          "Asistencia a personas con movilidad reducida",
          "Acumulación de Puntos Renfe"
        ],
        "titulo": "Servicios incluidos en cualquier billete"
      },
      {
        "tipo": "lista",
        "items": [
          "Los extras de flexibilidad (Cambios gratuitos ilimitados, Puente AVE, Reembolso total y Pack Superflex) solo se contratan en el momento de comprar y no existen para el billete Básico.",
          "Cualquier billete se puede anular sin gastos durante las 2 horas siguientes a la compra.",
          "Los billetes AVE y Larga Distancia son nominativos: lleva DNI, pasaporte, permiso de conducir o tarjeta de residencia en vigor, porque puede haber controles en el acceso o a bordo.",
          "En el AVE Internacional entre España y Francia hay Básico, Elige Estándar y Elige Confort, pero no Prémium."
        ],
        "titulo": "Ten en cuenta"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Con un billete AVE o Larga Distancia tienes incluido el Combinado Cercanías: un trayecto en Cercanías, Rodalies o TRAM de Alicante desde 4 horas antes de la salida hasta 4 horas después de la llegada.",
          "Se saca en máquinas autoventa o taquillas leyendo el código de barras del billete o tecleando su código numérico. En los núcleos de Madrid, Málaga, València y Murcia/Alicante basta con pasar el código BIDI del billete por los tornos."
        ],
        "titulo": "Combinado Cercanías"
      },
      {
        "tipo": "cta",
        "texto": "Viaja en Prémium",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Restauración Prémium",
            "texto": "Menús asesorados por el chef Ramón Freixa, servidos en el asiento con el billete Prémium en AVE y Euromed.",
            "enlace": "/viajar/prepara-tu-viaje/billetes-ave-larga-distancia/premium/restauracion-premium"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/billetes-ave-larga-distancia/premium/restauracion-premium",
    "titulo": "Restauración Prémium",
    "resumen": "Menús asesorados por el chef Ramón Freixa, servidos en el asiento con el billete Prémium en AVE y Euromed.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Con billete Prémium en AVE (salvo AVE Internacional a Francia) y Euromed la comida se sirve en el asiento y está incluida en el precio. La carta cuenta con el asesoramiento del chef Ramón Freixa (2 estrellas Michelin y 3 soles Repsol).",
          "Según el horario del tren se ofrece desayuno, aperitivo, comida, merienda o cena; en trayectos cortos se da un refrigerio de cortesía (bebida y snack)."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Desayuno: caliente, frío o fruta con yogur.",
          "Comida y cena: carne («De la granja»), pescado («De la barca») o pasta («Del molino»), además de platos de ensalada.",
          "Aperitivo y merienda: salado, mixto o fruta."
        ],
        "titulo": "Opciones de menú"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "La elección se hace al comprar (web, taquilla o agencia) hasta 24 horas antes. Si no se elige, la tripulación ofrece tres opciones sujetas a disponibilidad.",
          "Menús especiales bajo petición con al menos 24 horas de antelación: bajo en azúcar, sin gluten, sin lactosa, vegetariano, vegano, infantil, bajo en sal, halal, kosher y vigilia (solo en Cuaresma)."
        ],
        "titulo": "Cómo elegir"
      },
      {
        "tipo": "lista",
        "items": [
          "Información de alérgenos disponible a bordo; consulta a la tripulación si tienes alergias.",
          "Puedes llevarte lo que no consumas sin coste.",
          "No se vende alcohol a menores de 18 años.",
          "El pescado se congela a -20 ºC durante al menos 24 horas para prevenir el anisakis."
        ],
        "titulo": "Normativa"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Si no quieres Prémium, Elige Confort te sienta en asiento XL y permite añadir un menú box servido en la plaza; con Básico y Elige Estándar el box se recoge en cafetería."
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia",
    "titulo": "Abonos AVE y Larga Distancia",
    "resumen": "Bonos para viajeros frecuentes: Bono AVE, Bono AVE Flexible, Bono Colaborativo, Galicia Rail Pass y Spain Rail Pass.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Si repites trayecto, un abono sale más barato que comprar billetes sueltos. Todos los abonos nominativos, salvo el Galicia Rail Pass, suman Puntos Más Renfe si indicas tu número de socio al comprarlos."
        ]
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Abono",
          "Viajes",
          "Trayecto",
          "Validez"
        ],
        "filas": [
          [
            "Bono AVE",
            "10",
            "Fijo entre dos estaciones",
            "6 meses"
          ],
          [
            "Bono AVE Flexible",
            "10",
            "Libre",
            "6 meses"
          ],
          [
            "Bono Colaborativo",
            "Hasta 8 (hasta 4 titulares)",
            "Fijo entre dos estaciones",
            "6 meses"
          ],
          [
            "Galicia Rail Pass",
            "Ilimitados 3 días seguidos",
            "Toda Galicia",
            "7 días desde la compra"
          ],
          [
            "Spain Rail Pass",
            "4, 6, 8 o 10",
            "Libre (no residentes)",
            "1 mes desde el primer uso"
          ]
        ],
        "titulo": "Resumen"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Bono AVE",
            "texto": "10 viajes en un mismo trayecto durante 6 meses, en AVE, Avlo, Alvia, Euromed e Intercity.",
            "enlace": "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia/bono-ave"
          },
          {
            "titulo": "Bono AVE Flexible",
            "texto": "10 viajes combinando distintos orígenes y destinos, a precio único según modalidad.",
            "enlace": "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia/bono-ave-flexible"
          },
          {
            "titulo": "Bono Colaborativo",
            "texto": "Hasta 8 viajes compartidos entre un máximo de 4 titulares en un mismo trayecto.",
            "enlace": "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia/bono-colaborativo"
          },
          {
            "titulo": "Galicia Rail Pass",
            "texto": "45 € (12 € menores de 14) para viajar sin límite por Galicia durante tres días seguidos.",
            "enlace": "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia/galicia-rail-pass"
          },
          {
            "titulo": "Spain Rail Pass",
            "texto": "Pase para residentes fuera de España: 4, 6, 8 o 10 viajes sin origen ni destino fijos.",
            "enlace": "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia/spain-rail-pass"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia/bono-ave",
    "titulo": "Bono AVE",
    "resumen": "10 viajes en un mismo trayecto durante 6 meses, en AVE, Avlo, Alvia, Euromed e Intercity.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "10 viajes entre dos estaciones fijadas al comprar.",
          "Válido en cualquier relación con servicios AVE, Avlo, Alvia, Euromed e Intercity.",
          "Nominativo e intransferible.",
          "Modalidad Estándar (asiento Estándar; Confort pagando la diferencia) o Confort (cualquier asiento).",
          "Validez de 6 meses naturales desde la compra, hasta el día anterior a la misma fecha del sexto mes."
        ],
        "titulo": "Características"
      },
      {
        "tipo": "lista",
        "items": [
          "Ahorro: el precio es fijo aunque viajes en hora punta o en días de mucha demanda.",
          "Es la única opción que permite anular un viaje sin coste.",
          "La selección de asiento siempre es gratuita."
        ],
        "titulo": "Ventajas"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Con el Bono AVE puedes llevar mascota abonando el 25 % del precio del viaje en asiento Estándar."
      },
      {
        "tipo": "cta",
        "texto": "Comprar Bono AVE",
        "enlace": "/trenes",
        "etiqueta": "Ir a comprar"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia/bono-ave-flexible",
    "titulo": "Bono AVE Flexible",
    "resumen": "10 viajes combinando distintos orígenes y destinos, a precio único según modalidad.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "10 viajes en los trayectos que quieras.",
          "Precio único según la modalidad elegida.",
          "Válido en AVE, Avlo, Alvia, Euromed e Intercity.",
          "Nominativo e intransferible.",
          "Modalidad Estándar (Confort pagando la diferencia) o Confort.",
          "Validez de 6 meses naturales desde la compra."
        ],
        "titulo": "Características"
      },
      {
        "tipo": "cta",
        "texto": "Comprar Bono AVE Flexible",
        "enlace": "/trenes",
        "etiqueta": "Ir a comprar"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia/bono-colaborativo",
    "titulo": "Bono Colaborativo",
    "resumen": "Hasta 8 viajes compartidos entre un máximo de 4 titulares en un mismo trayecto.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Admite hasta 4 titulares: pensado para familias o amigos que repiten trayecto.",
          "Hasta 8 viajes entre dos estaciones fijadas al comprar.",
          "Válido en AVE, Avlo y Larga Distancia.",
          "Modalidad Estándar o Confort.",
          "Validez de 6 meses naturales desde la compra."
        ],
        "titulo": "Características"
      },
      {
        "tipo": "lista",
        "items": [
          "Ahorro: el precio es fijo aunque viajes en hora punta o en días de mucha demanda.",
          "Es la única opción que permite anular un viaje sin coste.",
          "La selección de asiento siempre es gratuita."
        ],
        "titulo": "Ventajas"
      },
      {
        "tipo": "cta",
        "texto": "Comprar Bono Colaborativo",
        "enlace": "/trenes",
        "etiqueta": "Ir a comprar"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia/galicia-rail-pass",
    "titulo": "Galicia Rail Pass",
    "resumen": "45 € (12 € menores de 14) para viajar sin límite por Galicia durante tres días seguidos.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Abono turístico para recorrer Galicia en tren durante tres días consecutivos en AVE, Avlo, Alvia, Intercity, Avant y Media Distancia Convencional (ancho ibérico y métrico), siempre en asiento Estándar o clase Turista. Válido hasta el 31 de diciembre de 2026."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Haber obtenido la «Compostela» al llegar a Santiago.",
          "Llegar a Galicia en Larga Distancia con un billete de 20 € o más.",
          "Tener billete de alguno de los trenes turísticos de Galicia."
        ],
        "titulo": "Quién puede pedirlo (documento de los últimos 30 días)"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Concepto",
          "Condición"
        ],
        "filas": [
          [
            "Precio adulto",
            "45 €"
          ],
          [
            "Precio menor de 14 años",
            "12 €"
          ],
          [
            "Validez",
            "7 días desde la compra; 3 días seguidos desde el primer uso"
          ],
          [
            "Días de uso",
            "Fines de semana (viernes a domingo), puentes y festivos; del 1 de junio al 30 de septiembre, todos los días"
          ],
          [
            "Dónde se compra",
            "Taquillas de estación (salvo las de Ancho Métrico)"
          ],
          [
            "Cambios / anulación",
            "Sin cambios; anulación gratuita si no se ha usado"
          ],
          [
            "Descuentos acumulables",
            "Solo Familia Numerosa"
          ]
        ]
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Antes de cada viaje hay que formalizar (sacar el billete del trayecto) en taquilla. En Ancho Métrico se hace en sus taquillas o, si no es posible, a bordo."
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/abonos-ave-larga-distancia/spain-rail-pass",
    "titulo": "Spain Rail Pass",
    "resumen": "Pase para residentes fuera de España: 4, 6, 8 o 10 viajes sin origen ni destino fijos.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Pensado para turistas que quieren moverse por España a su aire: no tiene recorrido prefijado y se elige el número de viajes y el tipo de asiento."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Solo para personas con residencia fuera de España; personal e intransferible.",
          "4, 6, 8 o 10 viajes, en asiento Estándar o Confort (no Prémium).",
          "Válido en Larga Distancia (incluido AVE) y regionales (Media Distancia y Avant con reserva de plaza).",
          "Primer viaje en los 6 meses siguientes a la compra; después, un mes de validez.",
          "Anulación gratis en las 24 horas posteriores a la compra; después, si no se ha usado, con un 15 % de gastos."
        ],
        "titulo": "Condiciones"
      },
      {
        "tipo": "pasos",
        "pasos": [
          {
            "titulo": "Formaliza cada viaje",
            "texto": "Desde «Mis abonos» en tu área personal de la web, o en taquillas, agencias o por teléfono presentando el pase."
          },
          {
            "titulo": "Lleva tu documentación",
            "texto": "Pasaporte o tarjeta de residencia que acredite que vives fuera de España, junto al pase y el billete, en el control de acceso."
          }
        ],
        "titulo": "Cómo se usa"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia",
    "titulo": "Avant y Media Distancia",
    "resumen": "Billetes y abonos para trenes Avant y Media Distancia, abonos bonificados de 2026, servicios de proximidad y Renfe Álava.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Los trenes Avant son servicios de Media Distancia prestados con material de alta velocidad para trayectos cortos; la Media Distancia convencional une capitales y poblaciones de una misma región o regiones vecinas.",
          "En 2026 siguen vigentes los abonos bonificados de Media Distancia (40 % y 70 % jóvenes, gratuito para niños), el Abono Único de 60 €/30 € y los abonos Avant con un 50 % de descuento."
        ]
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Si tu tren lo ofrece, puedes recibir avisos por WhatsApp sobre el estado de la circulación."
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Billetes Avant y Media Distancia",
            "texto": "Billete sencillo, ida y vuelta con un 20 % de descuento y billete con enlace.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/billetes"
          },
          {
            "titulo": "Abonos Avant y Media Distancia",
            "texto": "Abonos Avant al 50 % (Abono 10-30 y Pase Vía) y abonos bonificados de Media Distancia para 2026.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos"
          },
          {
            "titulo": "Servicios de proximidad",
            "texto": "Rutas OSP con frecuencias entre Cercanías y Media Distancia, con acceso a los abonos bonificados.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/servicios-proximidad"
          },
          {
            "titulo": "Renfe Álava",
            "texto": "Información del núcleo de Álava: tarifas, abonos, descuentos, horarios, mapa y atención al cliente.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/billetes",
    "titulo": "Billetes Avant y Media Distancia",
    "resumen": "Billete sencillo, ida y vuelta con un 20 % de descuento y billete con enlace.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Billete",
          "Qué es",
          "Anulación"
        ],
        "filas": [
          [
            "Sencillo",
            "Un viaje para un trayecto y fecha",
            "15 % de gastos"
          ],
          [
            "Ida y vuelta",
            "Ahorra un 20 % sobre la tarifa General/Base de cada trayecto; puede combinar AVE, Larga Distancia, Avant y Media Distancia en cualquier clase",
            "Desde el 15 % si anulas ambos trayectos; 40 % si solo anulas uno"
          ],
          [
            "Con enlace",
            "Un solo billete para dos trenes distintos con enlace garantizado; descuento según trayecto",
            "Desde el 15 %"
          ]
        ],
        "titulo": "Tipos de billete"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "En Media Distancia de Ancho Métrico la ida y vuelta tiene las mismas condiciones y el mismo 20 % de descuento."
        ]
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Los billetes de Media Distancia y Avant son personalizados: al comprar se piden datos básicos del viajero y un móvil de contacto para avisar de incidencias o retrasos."
      },
      {
        "tipo": "aviso",
        "nivel": "alerta",
        "texto": "En Avant, AVE y Larga Distancia los menores de 14 años deben ir con un adulto o con el servicio de menores sin acompañante cuando exista."
      },
      {
        "tipo": "cta",
        "texto": "Busca tu tren Avant o Media Distancia",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos",
    "titulo": "Abonos Avant y Media Distancia",
    "resumen": "Abonos Avant al 50 % (Abono 10-30 y Pase Vía) y abonos bonificados de Media Distancia para 2026.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "En Avant hay dos títulos con un 50 % de descuento en 2026: el Abono 10-30 y la suscripción Pase Vía. En Castilla y León la Junta financia un 25 % adicional en los Avant de su territorio.",
          "En Media Distancia los abonos bonificados de 2026 son el Abono 10 Viajes (40 %), el Mensual (40 %), el Mensual Jóvenes (70 %), el Infantil gratuito y el Abono Único."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Formalizar un viaje y no hacerlo, o cancelarlo fuera de plazo, en 3 ocasiones durante la validez se considera uso fraudulento: en Avant se pierde el derecho a abonos con descuento durante 60 días; en Media Distancia se anula el abono, se retiene la fianza y no se emite otro hasta pasados 60 días.",
          "Las formalizaciones que no vayas a usar se cancelan con al menos 60 minutos de antelación.",
          "No se pueden formalizar dos viajes en el mismo sentido hasta que pase el triple del tiempo de viaje (en Media Distancia, mínimo 3 horas). Ejemplo: trayecto de 1 h con salida a las 8:00, el siguiente en ese sentido a partir de las 11:00.",
          "En Media Distancia, máximo 4 viajes al día por trayecto.",
          "Ocupa siempre la plaza asignada; dejarla vacía puede anotarse como uso indebido.",
          "Los abonos son nominativos: si lo usa otra persona se trata como viajero sin billete."
        ],
        "titulo": "Normas de buen uso (Ministerio de Transportes)"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Los abonos Avant permiten viajar con un 50 % de descuento, solo en clase Estándar, en estos trayectos AVE y Larga Distancia declarados OSP: Segovia–Medina AV, Medina AV–Salamanca, Madrid–Medina AV, Segovia–Salamanca, Cuenca–Madrid, Cuenca–Albacete, Madrid–Albacete, Cuenca–Requena, Cuenca–Valencia, Segovia–Palencia, Segovia–León, Valladolid–Palencia, Valladolid–León, Palencia–León, Palencia–Madrid, Segovia–Zamora, Medina AV–Zamora, Puebla de Sanabria–Gudiña, Puebla de Sanabria–Ourense, Puebla de Sanabria–Zamora, Gudiña–Ourense, Gudiña–Zamora, Madrid–Zamora, Ourense–Zamora, Valladolid–Burgos, Burgos–Madrid y Zaragoza–Huesca."
        ],
        "titulo": "Abono Avant en trayectos de alta velocidad OSP"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Fianzas de abonos gratuitos de 2025: la de enero-abril se podía reclamar hasta el 30 de abril de 2026 y la de mayo-junio hasta el 30 de junio de 2026. Conserva el abono y el justificante hasta que te la devuelvan."
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Abono 10-30 (Avant)",
            "texto": "10 viajes en 30 días en un mismo trayecto Avant, con un 50 % de descuento en 2026.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-10-30"
          },
          {
            "titulo": "Pase Vía (Avant)",
            "texto": "Suscripción trimestral gratuita para Avant: pagas cada viaje con un 50 % bonificado más descuentos crecientes desde el 45 %.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/pase-via"
          },
          {
            "titulo": "Abono Bonificado 10 Viajes",
            "texto": "10 viajes con un 40 % de descuento, multipersonal, válido un año desde el 1 de enero de 2026.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-bonificado-10-viajes"
          },
          {
            "titulo": "Abono Bonificado Mensual",
            "texto": "Abono mensual nominativo con un 40 % de descuento para nacidos antes del 1 de enero de 2000.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-bonificado-mensual"
          },
          {
            "titulo": "Abono Bonificado Mensual Jóvenes",
            "texto": "70 % de descuento para nacidos entre 2000 y 2011.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-bonificado-mensual-jovenes"
          },
          {
            "titulo": "Abono Infantil Gratuito",
            "texto": "Abono gratis para nacidos a partir de 2012, válido todo 2026.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-gratuito-ninos"
          },
          {
            "titulo": "Abono Único Media Distancia y Cercanías",
            "texto": "30 días de viajes ilimitados en Media Distancia, Cercanías y autobuses estatales: 60 € o 30 € para jóvenes y niños.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-unico"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-10-30",
    "titulo": "Abono 10-30 (Avant)",
    "resumen": "10 viajes en 30 días en un mismo trayecto Avant, con un 50 % de descuento en 2026.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Hasta 10 viajes de ida o vuelta en 30 días, entre dos estaciones elegidas al comprar.",
          "Se compra con hasta 30 días de antelación eligiendo la fecha de inicio.",
          "Nominativo e intransferible.",
          "Canales: renfe.com, teléfono, taquillas y agencias.",
          "No se paga con Puntos Renfe; suma puntos en la primera reserva de viaje posterior al 13 de febrero de 2026.",
          "Solo acumulable con Familia Numerosa y convenios específicos."
        ],
        "titulo": "Condiciones"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Antes de cada viaje tienes que reservar el billete para el día y el tren concretos."
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Si no has hecho ninguna operación, se anula gratis; si ya has formalizado algo pero no has viajado, con un 15 % de gastos."
        ],
        "titulo": "Anulación"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/pase-via",
    "titulo": "Pase Vía (Avant)",
    "resumen": "Suscripción trimestral gratuita para Avant: pagas cada viaje con un 50 % bonificado más descuentos crecientes desde el 45 %.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Pase Vía no es un abono prepago: te suscribes gratis cada trimestre y pagas cada viaje al hacerlo. Al 50 % de bonificación se suma un descuento inicial del 45 % sobre la tarifa base que crece cuantos más viajes haces, hasta un máximo del 90 % por viaje."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Mínimo de 20 viajes por trimestre (10 si entre el primero y el último pasan 45 días o menos); si no llegas, se cobra la diferencia.",
          "Válido en cualquier origen y destino Avant y en servicios comerciales autorizados como Avant recurrentes (clase turista).",
          "Hasta 4 viajes al día.",
          "Validez por trimestre natural: enero-marzo, abril-junio, julio-septiembre y octubre-diciembre.",
          "Suscripción desde 30 días antes del inicio del trimestre.",
          "Nominativo, personal e intransferible."
        ],
        "titulo": "Características"
      },
      {
        "tipo": "pasos",
        "pasos": [
          {
            "titulo": "Suscríbete en renfe.com",
            "texto": "Datos personales y una tarjeta bancaria donde se cargarán los viajes."
          },
          {
            "titulo": "Reserva cada viaje",
            "texto": "En taquilla, autoventa, agencia, teléfono, app o web (registrado). Máximo una plaza por tren y día."
          },
          {
            "titulo": "Viaja y paga",
            "texto": "El cargo se hace en tu tarjeta con el descuento que corresponda según los viajes acumulados."
          },
          {
            "titulo": "Cancela lo que no uses",
            "texto": "Con al menos 60 minutos de antelación; si no, se cobra el viaje."
          }
        ],
        "titulo": "Cómo funciona"
      },
      {
        "tipo": "lista",
        "items": [
          "No se paga con Puntos Renfe; suma puntos desde el 13 de febrero de 2026.",
          "Solo acumulable con Familia Numerosa y descuentos que lo indiquen; inclúyelos al suscribirte.",
          "No se cambia fecha u hora de una reserva: se anula gratis y se hace otra.",
          "La suscripción se puede anular si no hay viajes ni reservas activas; sin uso no hay cargos.",
          "No se pueden reservar dos trenes seguidos en el mismo sentido con menos de 180 minutos o del triple del tiempo de viaje entre ellos.",
          "Si falla un cobro se bloquean nuevas reservas; a los 4 días sin regularizar se cancelan las reservas vigentes.",
          "Los viajes mínimos no realizados se cobran al precio del trayecto más usado, con el descuento Pase Vía pero sin otros adicionales."
        ],
        "titulo": "Otras condiciones"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Pase Vía: preguntas frecuentes",
            "texto": "Dudas habituales sobre modalidades, recurrencia, descuentos y comparativa con las antiguas Tarjetas Plus.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/pase-via/preguntas-frecuentes"
          },
          {
            "titulo": "Calculadora de Pase Vía",
            "texto": "Compara el coste de Pase Vía con otros títulos según tu trayecto y número de viajes.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/pase-via/comparador"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/pase-via/preguntas-frecuentes",
    "titulo": "Pase Vía: preguntas frecuentes",
    "resumen": "Dudas habituales sobre modalidades, recurrencia, descuentos y comparativa con las antiguas Tarjetas Plus.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "faq",
        "titulo": "Preguntas frecuentes",
        "preguntas": [
          {
            "p": "¿Qué es Pase Vía?",
            "r": "Una suscripción para Avant en la que solo pagas los viajes que haces y el descuento aumenta con la frecuencia de uso. Tiene una modalidad de 10 viajes en 45 días y otra de 20 viajes por trimestre."
          },
          {
            "p": "¿Tengo que elegir modalidad?",
            "r": "No. El sistema aplica la más ventajosa: si solo viajas en un periodo de 45 días, exige 10 viajes; si viajas más tiempo, 20."
          },
          {
            "p": "¿Y al completar los viajes mínimos?",
            "r": "Sigues viajando y el descuento continúa subiendo hasta un máximo del 90 % por viaje."
          },
          {
            "p": "¿En qué se diferencia de un abono clásico?",
            "r": "El abono clásico da un descuento fijo para un número de viajes en un plazo. Pase Vía aplica descuentos progresivos, dura un trimestre natural y no hace perder viajes no usados."
          },
          {
            "p": "¿Qué es la recurrencia?",
            "r": "La relación entre viajes realizados y días de validez. A más recurrencia, más descuento por viaje."
          },
          {
            "p": "¿Cuánto se ahorra?",
            "r": "Con una frecuencia como la antigua Tarjeta Plus 10-45 (unos 20 viajes al trimestre) el descuento medio es del 48 % (antes 35 %). Con 75 viajes al trimestre, como la Tarjeta Plus 30-50 de 50 viajes, ronda el 65 % (antes 64 %); con 100 viajes sube al 69 %."
          },
          {
            "p": "¿Puede salir más cara una Tarjeta Plus?",
            "r": "Solo si concentras todos los viajes en muy poco tiempo y no vuelves a viajar en el trimestre, algo poco habitual."
          },
          {
            "p": "¿Por qué parece más caro al principio?",
            "r": "Los primeros viajes tienen menos descuento; se compensa al acumular viajes durante el trimestre."
          },
          {
            "p": "¿Abono 10-30 o Pase Vía?",
            "r": "Si vas a hacer solo 10 viajes en un mes en un trayecto concreto, el Abono 10-30. Si usas Avant todo el trimestre o varios trayectos, Pase Vía."
          },
          {
            "p": "¿Habrá un simulador?",
            "r": "Sí; existe una calculadora para comparar el coste según tus viajes."
          }
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/pase-via/comparador",
    "titulo": "Calculadora de Pase Vía",
    "resumen": "Compara el coste de Pase Vía con otros títulos según tu trayecto y número de viajes.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "pasos",
        "pasos": [
          {
            "titulo": "Indica tu trayecto y viajes",
            "texto": "Origen, destino y número de viajes previstos."
          },
          {
            "titulo": "Compara",
            "texto": "Se calcula el coste total y por viaje de cada título."
          },
          {
            "titulo": "Elige",
            "texto": "Se muestra la opción más económica y el detalle de descuentos por viaje."
          }
        ],
        "titulo": "Cómo funciona"
      },
      {
        "tipo": "lista",
        "items": [
          "Cuantos más viajes, más ahorro.",
          "Los descuentos no dependen de un único recorrido.",
          "La mejor opción cambia según el número de viajes, durante cuánto tiempo y los destinos."
        ],
        "titulo": "A tener en cuenta"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-bonificado-10-viajes",
    "titulo": "Abono Bonificado 10 Viajes",
    "resumen": "10 viajes con un 40 % de descuento, multipersonal, válido un año desde el 1 de enero de 2026.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "No nominativo y multipersonal: varias personas pueden usarlo en el mismo tren.",
          "10 viajes de ida o vuelta entre dos estaciones elegidas al comprar.",
          "40 % de descuento sobre el precio de la Tarjeta 10 Sencilla.",
          "Validez de un año desde el inicio de vigencia; a la venta desde el 29 de diciembre de 2025.",
          "Válido en toda la Media Distancia, incluido Ancho Métrico."
        ],
        "titulo": "Características"
      },
      {
        "tipo": "lista",
        "items": [
          "Compra en renfe.com (no disponible para Ancho Métrico ni regionales de Rodalies), máquinas autoventa y taquillas.",
          "Reserva de viajes en app, web, autoventa o taquilla.",
          "También vale en Avant Madrid–Salamanca, A Coruña–Ourense y Murcia–Alicante (con paradas intermedias) y Avant Exprés Barcelona–Tortosa (salvo Barcelona–Tarragona).",
          "Mientras se venden los abonos bonificados, se suspende la venta del resto de abonos habituales."
        ],
        "titulo": "Compra y uso"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-bonificado-mensual",
    "titulo": "Abono Bonificado Mensual",
    "resumen": "Abono mensual nominativo con un 40 % de descuento para nacidos antes del 1 de enero de 2000.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Para adultos nacidos antes del 1 de enero de 2000.",
          "Viajes ilimitados durante un mes desde la fecha de inicio elegida, con un máximo de 4 al día.",
          "40 % de descuento sobre la Tarjeta 40 Sencilla.",
          "Se compra hasta 30 días antes del inicio; hay que dar DNI/NIE o pasaporte y un móvil.",
          "Válido en toda la Media Distancia, Ancho Métrico y regionales de Rodalies."
        ],
        "titulo": "Características"
      },
      {
        "tipo": "lista",
        "items": [
          "Compra en renfe.com (no disponible para Ancho Métrico ni regionales de Rodalies), máquinas autoventa y taquillas.",
          "Reserva de viajes en app, web, autoventa o taquilla.",
          "También vale en Avant Madrid–Salamanca, A Coruña–Ourense y Murcia–Alicante (con paradas intermedias) y Avant Exprés Barcelona–Tortosa (salvo Barcelona–Tarragona).",
          "Mientras se venden los abonos bonificados, se suspende la venta del resto de abonos habituales."
        ],
        "titulo": "Compra y uso"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-bonificado-mensual-jovenes",
    "titulo": "Abono Bonificado Mensual Jóvenes",
    "resumen": "70 % de descuento para nacidos entre 2000 y 2011.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Para jóvenes nacidos entre el 1 de enero de 2000 y el 31 de diciembre de 2011.",
          "Descuento total del 70 % sobre la Tarjeta 40 Sencilla (50 % extra sobre el mensual bonificado).",
          "Viajes ilimitados un mes, máximo 4 al día.",
          "Requiere un código de registro del Ministerio de Transportes, que se pide en la compra.",
          "A la venta desde el 1 de enero de 2026."
        ],
        "titulo": "Características"
      },
      {
        "tipo": "lista",
        "items": [
          "Compra en renfe.com (no disponible para Ancho Métrico ni regionales de Rodalies), máquinas autoventa y taquillas.",
          "Reserva de viajes en app, web, autoventa o taquilla.",
          "También vale en Avant Madrid–Salamanca, A Coruña–Ourense y Murcia–Alicante (con paradas intermedias) y Avant Exprés Barcelona–Tortosa (salvo Barcelona–Tarragona).",
          "Mientras se venden los abonos bonificados, se suspende la venta del resto de abonos habituales."
        ],
        "titulo": "Compra y uso"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-gratuito-ninos",
    "titulo": "Abono Infantil Gratuito",
    "resumen": "Abono gratis para nacidos a partir de 2012, válido todo 2026.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Para menores nacidos después del 1 de enero de 2012.",
          "Gratuito y nominativo.",
          "Válido del 1 de enero al 31 de diciembre de 2026, hasta 4 viajes al día.",
          "Requiere código de registro del Ministerio de Transportes.",
          "Se eligen las dos estaciones al comprar."
        ],
        "titulo": "Características"
      },
      {
        "tipo": "lista",
        "items": [
          "Compra en renfe.com (no disponible para Ancho Métrico ni regionales de Rodalies), máquinas autoventa y taquillas.",
          "Reserva de viajes en app, web, autoventa o taquilla.",
          "También vale en Avant Madrid–Salamanca, A Coruña–Ourense y Murcia–Alicante (con paradas intermedias) y Avant Exprés Barcelona–Tortosa (salvo Barcelona–Tarragona).",
          "Mientras se venden los abonos bonificados, se suspende la venta del resto de abonos habituales."
        ],
        "titulo": "Compra y uso"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-unico",
    "titulo": "Abono Único Media Distancia y Cercanías",
    "resumen": "30 días de viajes ilimitados en Media Distancia, Cercanías y autobuses estatales: 60 € o 30 € para jóvenes y niños.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Modalidad",
          "Precio",
          "Para quién"
        ],
        "filas": [
          [
            "Normal",
            "60 € / 30 días",
            "Cualquier viajero"
          ],
          [
            "Jóvenes y Niños",
            "30 € / 30 días",
            "Nacidos entre el 1 de enero de 2000 y el 31 de diciembre de 2026"
          ]
        ],
        "titulo": "Precios"
      },
      {
        "tipo": "lista",
        "items": [
          "Toda la Media Distancia, regionales OSP de Catalunya y todos los núcleos de Cercanías.",
          "Algunos Avant: A Coruña–Santiago–Ourense, Madrid–Salamanca, Murcia–Alicante y Barcelona–Tortosa (salvo Barcelona–Tarragona).",
          "Autobuses de competencia estatal y consorcios adheridos.",
          "Viajes ilimitados durante 30 días desde el inicio elegido; se compra con hasta 30 días de antelación."
        ],
        "titulo": "Dónde vale"
      },
      {
        "tipo": "pasos",
        "pasos": [
          {
            "titulo": "Cómpralo",
            "texto": "Taquillas, autoventa o renfe.com (registrado). La modalidad joven exige un código del Ministerio, solicitado con 24 h de antelación."
          },
          {
            "titulo": "Pásalo al soporte adecuado",
            "texto": "Para Cercanías, cárgalo en una tarjeta sin contacto Renfe&Tú (nueva: 1 €). Para Media Distancia, emite gratis el abono MD con tu PIN."
          },
          {
            "titulo": "Reserva o valida",
            "texto": "En trenes con plaza reservada, reserva (máx. 4 al día, anulación gratis hasta 60 min antes). En Cercanías, Ancho Métrico y regionales catalanes, valida en el torno."
          }
        ],
        "titulo": "Cómo se usa"
      },
      {
        "tipo": "lista",
        "items": [
          "Sin cambios ni anulaciones; uno por persona y periodo.",
          "Solo clase Estándar.",
          "No acumula ni admite Puntos Renfe.",
          "Solo acumulable con Familia Numerosa.",
          "3 reservas no usadas o canceladas tarde suponen la anulación del abono y 60 días sin poder comprar otro."
        ],
        "titulo": "Condiciones"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Abono Único: preguntas frecuentes",
            "texto": "Respuestas sobre validez, soportes, reservas y uso fraudulento del Abono Único.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-unico/preguntas-frecuentes"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos/abono-unico/preguntas-frecuentes",
    "titulo": "Abono Único: preguntas frecuentes",
    "resumen": "Respuestas sobre validez, soportes, reservas y uso fraudulento del Abono Único.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "faq",
        "titulo": "Preguntas frecuentes",
        "preguntas": [
          {
            "p": "¿Qué es?",
            "r": "Un abono de 30 días con viajes ilimitados en los operadores adheridos al sistema."
          },
          {
            "p": "¿Cuánto cuesta?",
            "r": "60 € la modalidad normal y 30 € la de jóvenes y niños."
          },
          {
            "p": "¿Qué soporte necesito?",
            "r": "Para Cercanías, la tarjeta sin contacto Renfe&Tú. Para Media Distancia y Avant permitidos, el abono en papel (ATB) o digital (PDF, Passbook o app)."
          },
          {
            "p": "¿Cómo reservo con un abono ya comprado?",
            "r": "Desde el 12 de marzo, en la web: busca el tren y en «Descuentos, códigos promocionales/vales descuento» elige «Form. Abono Único», con tu DNI/NIE y PIN."
          },
          {
            "p": "¿La reserva cuesta dinero?",
            "r": "No. Es gratuita y se anula sin coste hasta 60 minutos antes; después cuenta como viaje realizado."
          },
          {
            "p": "Lo compré a otro operador, ¿puedo usar Renfe?",
            "r": "Sí, traspasándolo con tu DNI y PIN: a una tarjeta Renfe&Tú para Cercanías o emitiendo gratis el abono de Media Distancia."
          },
          {
            "p": "¿Puede usarlo otra persona?",
            "r": "No, es nominativo. Intervención puede pedirte el documento de identidad."
          },
          {
            "p": "¿Qué pasa si hago un uso indebido?",
            "r": "Se retira el abono, no podrás comprar otro durante 60 días y no se compensan los días no usados."
          }
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/servicios-proximidad",
    "titulo": "Servicios de proximidad",
    "resumen": "Rutas OSP con frecuencias entre Cercanías y Media Distancia, con acceso a los abonos bonificados.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Desde 2023 y durante tres años se prestan servicios ferroviarios de proximidad: rutas sujetas a Obligaciones de Servicio Público con frecuencias intermedias entre Cercanías y Media Distancia. Desde julio de 2025 admiten los abonos bonificados."
        ]
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Relación",
          "Oferta"
        ],
        "filas": [
          [
            "Murcia – Cartagena",
            "10 circulaciones por sentido en laborables y 6 en sábados y domingos"
          ],
          [
            "Palma del Río – Villa del Río",
            "4 trenes adicionales por sentido en laborables"
          ],
          [
            "Málaga – El Chorro – Caminito del Rey",
            "2 nuevos servicios de la C2; 5 trenes Málaga→El Chorro y 6 en sentido contrario en laborables"
          ],
          [
            "Medina del Campo – Valladolid – Palencia",
            "18 servicios por sentido Valladolid–Medina y 15 Valladolid–Palencia"
          ],
          [
            "Illescas – Fuenlabrada/Humanes",
            "2 lanzaderas nuevas por sentido de lunes a viernes; 7 circulaciones diarias por sentido"
          ]
        ],
        "titulo": "Rutas"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Billetes sencillos, ida y vuelta y descuentos: taquilla, agencias, teléfono, web y autoventa. Títulos multiviaje: taquilla, autoventa y web."
        ],
        "titulo": "Dónde comprar"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava",
    "titulo": "Renfe Álava",
    "resumen": "Información del núcleo de Álava: tarifas, abonos, descuentos, horarios, mapa y atención al cliente.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "El servicio de Álava une Miranda de Ebro, Vitoria-Gasteiz y Altsasu con paradas intermedias. Gracias al Gobierno Vasco hay precios especiales para el Abono Mensual entre Manzanos y Araia."
        ]
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Tarifas Renfe Álava",
            "texto": "Precios de billete sencillo e ida y vuelta entre las estaciones de Álava.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas"
          },
          {
            "titulo": "Viajar con bici y mascota (Álava)",
            "texto": "Condiciones para bicicletas, patinetes y mascotas en los trenes de Álava.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/viajar-con"
          },
          {
            "titulo": "Horarios Renfe Álava",
            "texto": "Consulta los horarios entre las estaciones del núcleo de Álava.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/horarios"
          },
          {
            "titulo": "Mapa de líneas de Álava",
            "texto": "Mapa de la red de Renfe Álava.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/mapas"
          },
          {
            "titulo": "Atención al cliente Álava",
            "texto": "Teléfonos y contacto de Renfe Álava.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/atencion-al-cliente"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas",
    "titulo": "Tarifas Renfe Álava",
    "resumen": "Precios de billete sencillo e ida y vuelta entre las estaciones de Álava.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Origen / destino",
          "Miranda de Ebro",
          "Manzanos",
          "La Puebla Arganz.",
          "Nanclares-Langraiz",
          "Vitoria-Gasteiz",
          "Alegría-Dulantzi",
          "Agurain-Salvatierra",
          "Araia",
          "Altsasu"
        ],
        "filas": [
          [
            "Miranda de Ebro",
            "—",
            "1,95 €",
            "2,10 €",
            "2,90 €",
            "3,80 €",
            "4,40 €",
            "4,40 €",
            "5,65 €",
            "7,40 €"
          ],
          [
            "Manzanos",
            "1,95 €",
            "—",
            "1,95 €",
            "2,10 €",
            "2,90 €",
            "3,80 €",
            "4,40 €",
            "4,40 €",
            "5,65 €"
          ],
          [
            "La Puebla Arganz.",
            "2,10 €",
            "1,95 €",
            "—",
            "1,95 €",
            "2,10 €",
            "3,80 €",
            "3,80 €",
            "4,40 €",
            "5,65 €"
          ],
          [
            "Nanclares-Langraiz",
            "2,90 €",
            "2,10 €",
            "1,95 €",
            "—",
            "2,10 €",
            "2,90 €",
            "3,80 €",
            "3,80 €",
            "4,40 €"
          ],
          [
            "Vitoria-Gasteiz",
            "3,80 €",
            "2,90 €",
            "2,10 €",
            "2,10 €",
            "—",
            "2,10 €",
            "2,90 €",
            "3,80 €",
            "3,80 €"
          ],
          [
            "Alegría-Dulantzi",
            "4,40 €",
            "3,80 €",
            "3,80 €",
            "2,90 €",
            "2,10 €",
            "—",
            "2,10 €",
            "2,10 €",
            "2,90 €"
          ],
          [
            "Agurain-Salvatierra",
            "4,40 €",
            "4,40 €",
            "3,80 €",
            "3,80 €",
            "2,90 €",
            "2,10 €",
            "—",
            "1,95 €",
            "2,10 €"
          ],
          [
            "Araia",
            "5,65 €",
            "4,40 €",
            "4,40 €",
            "3,80 €",
            "3,80 €",
            "2,10 €",
            "1,95 €",
            "—",
            "2,10 €"
          ],
          [
            "Altsasu",
            "7,40 €",
            "5,65 €",
            "5,65 €",
            "4,40 €",
            "3,80 €",
            "2,90 €",
            "2,10 €",
            "2,10 €",
            "—"
          ]
        ],
        "titulo": "Billete sencillo"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Origen / destino",
          "Miranda de Ebro",
          "Manzanos",
          "La Puebla Arganz.",
          "Nanclares-Langraiz",
          "Vitoria-Gasteiz",
          "Alegría-Dulantzi",
          "Agurain-Salvatierra",
          "Araia",
          "Altsasu"
        ],
        "filas": [
          [
            "Miranda de Ebro",
            "—",
            "3,10 €",
            "3,40 €",
            "4,60 €",
            "6,10 €",
            "7,00 €",
            "7,00 €",
            "9,00 €",
            "11,80 €"
          ],
          [
            "Manzanos",
            "3,10 €",
            "—",
            "3,10 €",
            "3,40 €",
            "4,60 €",
            "6,10 €",
            "7,00 €",
            "7,00 €",
            "9,00 €"
          ],
          [
            "La Puebla Arganz.",
            "3,40 €",
            "3,10 €",
            "—",
            "3,10 €",
            "3,40 €",
            "6,10 €",
            "6,10 €",
            "7,00 €",
            "9,00 €"
          ],
          [
            "Nanclares-Langraiz",
            "4,60 €",
            "3,40 €",
            "3,10 €",
            "—",
            "3,40 €",
            "4,60 €",
            "6,10 €",
            "6,10 €",
            "7,00 €"
          ],
          [
            "Vitoria-Gasteiz",
            "6,10 €",
            "4,60 €",
            "3,40 €",
            "3,40 €",
            "—",
            "3,40 €",
            "4,60 €",
            "6,10 €",
            "6,10 €"
          ],
          [
            "Alegría-Dulantzi",
            "7,00 €",
            "6,10 €",
            "6,10 €",
            "4,60 €",
            "3,40 €",
            "—",
            "3,40 €",
            "3,40 €",
            "4,60 €"
          ],
          [
            "Agurain-Salvatierra",
            "7,00 €",
            "7,00 €",
            "6,10 €",
            "6,10 €",
            "4,60 €",
            "3,40 €",
            "—",
            "3,10 €",
            "3,40 €"
          ],
          [
            "Araia",
            "9,00 €",
            "7,00 €",
            "7,00 €",
            "6,10 €",
            "6,10 €",
            "3,40 €",
            "3,10 €",
            "—",
            "3,40 €"
          ],
          [
            "Altsasu",
            "11,80 €",
            "9,00 €",
            "9,00 €",
            "7,00 €",
            "6,10 €",
            "4,60 €",
            "3,40 €",
            "3,40 €",
            "—"
          ]
        ],
        "titulo": "Ida y vuelta"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Estos precios no aplican en trenes de Larga Distancia (incluidos Alvia e Intercity)."
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Compra en taquillas, autoventa y máquinas Ares, por teléfono, en renfe.com, app o agencias. Los billetes admiten cambios y anulaciones, a veces con recargo."
        ]
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Abonos Renfe Álava",
            "texto": "Abonos bonificados de Media Distancia aplicables en Álava y convenio Manzanos–Araia.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/abonos"
          },
          {
            "titulo": "Descuentos Renfe Álava",
            "texto": "Descuentos para mayores de 60, niños y jóvenes, familia numerosa y grupos en Álava.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/descuentos"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/abonos",
    "titulo": "Abonos Renfe Álava",
    "resumen": "Abonos bonificados de Media Distancia aplicables en Álava y convenio Manzanos–Araia.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "En Álava son válidos los abonos bonificados de Media Distancia de 2026 (10 Viajes, Mensual, Mensual Jóvenes, Infantil gratuito y Abono Único) con sus normas de buen uso: 4 viajes al día por trayecto, cancelación con 60 minutos y penalización tras 3 usos indebidos."
        ]
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Abonos bonificados Media Distancia",
            "texto": "Condiciones completas de cada abono.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/abonos"
          }
        ]
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Convenio Manzanos–Araia",
            "texto": "Abono Mensual a 20 € y Mensual Joven a 10 € entre Manzanos y Araia gracias al Gobierno Vasco.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/abonos/convenio-manzanos-araia"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/abonos/convenio-manzanos-araia",
    "titulo": "Convenio Manzanos–Araia",
    "resumen": "Abono Mensual a 20 € y Mensual Joven a 10 € entre Manzanos y Araia gracias al Gobierno Vasco.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Un convenio entre Renfe Viajeros y el Gobierno Vasco fija, desde el 1 de julio, precios especiales para los abonos mensuales nominativos, manteniendo las condiciones del Real Decreto-ley 1/2025."
        ]
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Abono",
          "Precio"
        ],
        "filas": [
          [
            "Abono Mensual",
            "20 €"
          ],
          [
            "Abono Mensual Joven",
            "10 €"
          ]
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Manzanos",
          "La Puebla de Arganzón",
          "Nanclares/Langraiz",
          "Vitoria/Gasteiz",
          "Alegría de Álava-Dulantzi",
          "Salvatierra/Agurain",
          "Araia"
        ],
        "titulo": "Estaciones incluidas"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/descuentos",
    "titulo": "Descuentos Renfe Álava",
    "resumen": "Descuentos para mayores de 60, niños y jóvenes, familia numerosa y grupos en Álava.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Mayores de 60 (Álava)",
            "texto": "40 % de descuento todos los días con la Tarjeta Dorada.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/descuentos/mayores-de-60"
          },
          {
            "titulo": "Niños y jóvenes (Álava)",
            "texto": "Hasta 3 años gratis, de 4 a 13 con un 40 % y jóvenes con la Tarjeta Más Renfe Joven 50.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/descuentos/ninos-y-jovenes"
          },
          {
            "titulo": "Familia numerosa (Álava)",
            "texto": "20 % en categoría general y 50 % en especial.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/descuentos/familia-numerosa"
          },
          {
            "titulo": "Grupos y escolares (Álava)",
            "texto": "Grupos desde 10 personas con un 20 % de descuento.",
            "enlace": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/descuentos/grupos-y-escolares"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/descuentos/mayores-de-60",
    "titulo": "Mayores de 60 (Álava)",
    "resumen": "40 % de descuento todos los días con la Tarjeta Dorada.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Con la Tarjeta Dorada los mayores de 60 años tienen un 40 % de descuento en billetes sencillos o de ida y vuelta, cualquier día de la semana."
        ]
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Validez",
          "Precio"
        ],
        "filas": [
          [
            "1 año",
            "6 €"
          ],
          [
            "2 años",
            "12 €"
          ],
          [
            "3 años",
            "15 € (ahorro del 16 %)"
          ]
        ],
        "titulo": "Precio de la tarjeta"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "También pueden obtenerla pensionistas mayores de 18 años con incapacidad permanente total, absoluta o gran invalidez y personas con discapacidad igual o superior al 33 %. Con un 65 % o más, el acompañante viaja en las mismas condiciones."
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/descuentos/ninos-y-jovenes",
    "titulo": "Niños y jóvenes (Álava)",
    "resumen": "Hasta 3 años gratis, de 4 a 13 con un 40 % y jóvenes con la Tarjeta Más Renfe Joven 50.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Niños hasta 3 años: gratis (uno por billete de adulto).",
          "De 4 a 13 años: 40 % de descuento."
        ],
        "titulo": "Niños"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Entre 14 y 25 años, la Tarjeta Más Renfe Joven 50 cuesta 50 €, dura un año y da un 25 % de descuento en Cercanías, además de las ventajas Más Renfe. Sus billetes admiten cambios y anulaciones con gastos."
        ],
        "titulo": "Jóvenes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/descuentos/familia-numerosa",
    "titulo": "Familia numerosa (Álava)",
    "resumen": "20 % en categoría general y 50 % en especial.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Categoría",
          "Descuento"
        ],
        "filas": [
          [
            "General",
            "20 %"
          ],
          [
            "Especial",
            "50 %"
          ]
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/tarifas/descuentos/grupos-y-escolares",
    "titulo": "Grupos y escolares (Álava)",
    "resumen": "Grupos desde 10 personas con un 20 % de descuento.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "20 % de descuento para grupos desde 10 personas.",
          "Menores de 4 años gratis.",
          "De 4 a 13 años, 40 % de descuento."
        ],
        "titulo": "Grupos"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Coordinación de Grupos de Cercanías: 944 879 256. Colegios: clientearaba@renfe.es para actividades y horarios."
        ],
        "titulo": "Contacto"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/viajar-con",
    "titulo": "Viajar con bici y mascota (Álava)",
    "resumen": "Condiciones para bicicletas, patinetes y mascotas en los trenes de Álava.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "aviso",
        "nivel": "alerta",
        "texto": "Por seguridad no se admiten patinetes ni monociclos eléctricos o similares; sí sillas para personas con movilidad reducida y bicicletas eléctricas."
      },
      {
        "tipo": "lista",
        "items": [
          "Plegadas o embaladas viajan como equipaje de mano o especial, sin extra.",
          "Sin plegar requieren el extra Bicicleta (gratuito), reservado al comprar; una por persona y hasta 3 por tren.",
          "Con abono, el extra se pide en taquilla."
        ],
        "titulo": "Bicicletas y patinetes no eléctricos"
      },
      {
        "tipo": "lista",
        "items": [
          "Perros, gatos, hurones, hámsteres, cobayas, conejos y aves no de corral.",
          "Hasta 10 kg, en transportín de máximo 60x35x35 cm.",
          "Una por persona; no ocupa plaza.",
          "Billete: 25 % de la tarifa general."
        ],
        "titulo": "Mascotas"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/horarios",
    "titulo": "Horarios Renfe Álava",
    "resumen": "Consulta los horarios entre las estaciones del núcleo de Álava.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Estaciones: Alegría-Dulantzi, Altsasu Estación, Altsasu Pueblo, Araia, La Puebla de Arganzón, Manzanos, Miranda de Ebro, Nanclares-Langraiz, Salvatierra/Agurain y Vitoria/Gasteiz."
        ]
      },
      {
        "tipo": "herramienta",
        "id": "buscador-horarios"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/mapas",
    "titulo": "Mapa de líneas de Álava",
    "resumen": "Mapa de la red de Renfe Álava.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Consulta las líneas y paradas del servicio de Álava para planificar tu ruta."
        ]
      },
      {
        "tipo": "herramienta",
        "id": "mapa-lineas"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avant-media-distancia/alava/atencion-al-cliente",
    "titulo": "Atención al cliente Álava",
    "resumen": "Teléfonos y contacto de Renfe Álava.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Servicio",
          "Contacto"
        ],
        "filas": [
          [
            "Información e incidencias",
            "944 879 222"
          ],
          [
            "Viajes en grupo",
            "944 879 256"
          ],
          [
            "Correo",
            "clientearaba@renfe.es"
          ],
          [
            "Dirección postal",
            "Plaza Circular, 2 - 2º, 48008 Bilbao"
          ]
        ]
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Atención telefónica de lunes a jueves de 9:00 a 14:00 y de 16:00 a 18:00; viernes de 9:00 a 14:00."
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos",
    "titulo": "Descuentos",
    "resumen": "Descuentos para niños, mayores de 60, familias numerosas, grupos, personas con discapacidad, congresos y empresas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Colectivo",
          "AVE / Larga Distancia",
          "Avant / Media Distancia"
        ],
        "filas": [
          [
            "Niños de 4 a 13 años",
            "40 %",
            "40 %"
          ],
          [
            "Niños de 0 a 3 sin plaza",
            "Gratis",
            "Gratis"
          ],
          [
            "Mayores de 60 (Tarjeta Dorada)",
            "25 %",
            "Avant 25 % L-V y 40 % S-D; MD 40 %"
          ],
          [
            "Familia numerosa",
            "20 % general / 50 % especial",
            "20 % general / 50 % especial"
          ],
          [
            "Grupo de 4 a 9",
            "8 %",
            "—"
          ],
          [
            "Grupo de 10 a 25",
            "8 %",
            "Avant 15 %; MD 20 %"
          ],
          [
            "Discapacidad ≥ 33 % (Tarjeta Dorada)",
            "25 %",
            "Avant 25 % L-V y 40 % S-D; MD desde 40 %"
          ],
          [
            "Congresos y ferias",
            "5 %",
            "—"
          ]
        ],
        "titulo": "Resumen"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Niños",
            "texto": "Menores de 14 años con un 40 % de descuento y gratis hasta 3 años si no ocupan plaza.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos/ninos"
          },
          {
            "titulo": "Mayores de 60: Tarjeta Dorada",
            "texto": "Tarjeta de 6 € al año con descuentos del 25 % al 40 % según el tren.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos/mayores-de-60"
          },
          {
            "titulo": "Familia numerosa",
            "texto": "20 % de descuento en categoría general y 50 % en especial.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos/familia-numerosa"
          },
          {
            "titulo": "Grupos",
            "texto": "Descuentos para grupos de 4 a 9, de 10 a 25 y de más de 25 personas.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos/grupos"
          },
          {
            "titulo": "Personas con discapacidad",
            "texto": "Tarjeta Dorada para discapacidad desde el 33 % y plaza H a 7 €.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos/personas-con-discapacidad"
          },
          {
            "titulo": "Trenes chárter",
            "texto": "Trenes a medida para incentivos, presentaciones, paquetes turísticos o eventos.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos/trenes-charter"
          },
          {
            "titulo": "Congresos y ferias",
            "texto": "5 % de descuento para asistentes a congresos o ferias de hasta 4 días y más de 75 personas.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos/congresos-y-eventos"
          },
          {
            "titulo": "Empresas",
            "texto": "Programa Renfe Empresas para grandes empresas y pymes.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos/empresas"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos/ninos",
    "titulo": "Niños",
    "resumen": "Menores de 14 años con un 40 % de descuento y gratis hasta 3 años si no ocupan plaza.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Menores de 14 años: 40 % sobre cualquier precio, con billete propio y plaza.",
          "De 0 a 3 años sin ocupar plaza: gratis con billete gratuito de niño.",
          "Cambios y anulaciones según la opción de billete (Básico, Elige o Prémium)."
        ],
        "titulo": "AVE, AVE Internacional y Larga Distancia"
      },
      {
        "tipo": "lista",
        "items": [
          "Menores de 14 años: 40 %, con billete y plaza.",
          "De 0 a 3 años sin plaza: gratis (en Avant necesitan billete gratuito).",
          "Cambios permitidos; anulación con un 15 % de deducción; permiten elegir asiento."
        ],
        "titulo": "Avant y Media Distancia"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "En Cercanías viajan gratis los menores de 6 años (máximo dos por adulto); en Rodalies, los menores de 4."
        ],
        "titulo": "Cercanías y Rodalies"
      },
      {
        "tipo": "aviso",
        "nivel": "alerta",
        "texto": "En AVE, AVE Internacional, Larga Distancia y Avant los menores de 14 años deben ir con un adulto o con el servicio de menores sin acompañante. Ese servicio no tiene el descuento de niño."
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Los menores de 18 que viajen al extranjero necesitan la documentación que exige el Ministerio del Interior."
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos/mayores-de-60",
    "titulo": "Mayores de 60: Tarjeta Dorada",
    "resumen": "Tarjeta de 6 € al año con descuentos del 25 % al 40 % según el tren.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "La Tarjeta Dorada es nominativa y se compra en taquillas o agencias. Cuesta 6 € (1 año), 12 € (2 años) o 15 € (3 años, un 16 % de ahorro)."
        ]
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Tren",
          "Descuento"
        ],
        "filas": [
          [
            "AVE, AVE Internacional y Larga Distancia",
            "25 % sobre cualquier precio"
          ],
          [
            "Avant de lunes a viernes",
            "25 % sobre tarifa General/Base"
          ],
          [
            "Avant sábados y domingos",
            "40 % sobre tarifa General/Base"
          ],
          [
            "Media Distancia",
            "40 % sobre tarifa General/Base"
          ]
        ],
        "titulo": "Descuentos"
      },
      {
        "tipo": "lista",
        "items": [
          "Renovación desde 90 días antes de caducar (salvo tarjetas emitidas por bancos), indicando documento, número de tarjeta, email y móvil.",
          "Pago con tarjeta o Bizum; se recibe en PDF o Passbook.",
          "Consulta, reimpresión y reenvío online.",
          "Anulación en los 15 días siguientes a una renovación online."
        ],
        "titulo": "Gestión online"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "No se acumula con otros descuentos salvo Familia Numerosa, ni con el de ida y vuelta. Cambios y anulaciones según el billete."
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos/familia-numerosa",
    "titulo": "Familia numerosa",
    "resumen": "20 % de descuento en categoría general y 50 % en especial.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Aplica en AVE (salvo AVE Internacional a Francia), Larga Distancia, Avant, Media Distancia, Cercanías y Feve. En AVE y Larga Distancia, los cambios y anulaciones dependen del billete elegido."
        ]
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Categoría",
          "Descuento"
        ],
        "filas": [
          [
            "General",
            "20 %"
          ],
          [
            "Especial",
            "50 %"
          ]
        ]
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Los títulos de familia monoparental de la Generalitat de Catalunya solo valen como familia numerosa en Rodalies."
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos/grupos",
    "titulo": "Grupos",
    "resumen": "Descuentos para grupos de 4 a 9, de 10 a 25 y de más de 25 personas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Grupos de 4 a 9 personas",
            "texto": "Oferta «4 o más»: 8 % de descuento en AVE y Larga Distancia.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos/grupos/grupos-de-4-a-9"
          },
          {
            "titulo": "Grupos de 10 a 25 personas",
            "texto": "8 % en AVE y Larga Distancia, 15 % en Avant, 20 % en Media Distancia y hasta 40 % en Cercanías.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos/grupos/grupos-de-10-a-25"
          },
          {
            "titulo": "Grupos de más de 25 personas",
            "texto": "Presupuesto cerrado a medida; solicítalo con al menos 10 días de antelación.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos/grupos/grupos-de-mas-25"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos/grupos/grupos-de-4-a-9",
    "titulo": "Grupos de 4 a 9 personas",
    "resumen": "Oferta «4 o más»: 8 % de descuento en AVE y Larga Distancia.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Para 4 a 9 viajeros en AVE, AVE Internacional y Larga Distancia hay un 8 % sobre el total en cualquier precio. Los niños de 4 a 13 años tienen un 40 % sobre billete de niño, los menores de 4 sin plaza van gratis y se acumula Familia Numerosa."
        ]
      },
      {
        "tipo": "pasos",
        "pasos": [
          {
            "titulo": "Indica entre 4 y 9 viajeros",
            "texto": "En el buscador de la web."
          },
          {
            "titulo": "Elige «4 o más»",
            "texto": "Aparece en la lista de trenes si está disponible."
          },
          {
            "titulo": "Asigna adulto o niño",
            "texto": "Se emite un billete por persona; añade la mascota tras elegir tarifa si viaja con vosotros."
          }
        ],
        "titulo": "Cómo comprar"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Billete",
          "Cambios",
          "Anulación (sobre todos los billetes)"
        ],
        "filas": [
          [
            "Básico 4 o más",
            "No",
            "No"
          ],
          [
            "Elige 4 o más",
            "No",
            "30 % de deducción"
          ],
          [
            "Elige Confort 4 o más",
            "No",
            "30 % de deducción"
          ],
          [
            "Prémium 4 o más",
            "No",
            "Gratis hasta 7 días antes; 5 % en los 6 días previos"
          ]
        ],
        "titulo": "Cambios y anulaciones"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Disponible en renfe.com, taquillas, agencias presenciales y teléfono."
        ]
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes para tu grupo",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos/grupos/grupos-de-10-a-25",
    "titulo": "Grupos de 10 a 25 personas",
    "resumen": "8 % en AVE y Larga Distancia, 15 % en Avant, 20 % en Media Distancia y hasta 40 % en Cercanías.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "8 % sobre la suma de billetes individuales.",
          "Sin extras ni selección de asiento; sin cambios ni anulaciones parciales.",
          "Menores de 4 sin plaza gratis, hasta 4 por cada 25 personas.",
          "Básico: no reembolsable. Elige y Elige Confort: 70 % de reembolso si anulas más de 48 h antes y 25 % dentro de las 48 h.",
          "No aplica en Avlo."
        ],
        "titulo": "AVE, AVE Internacional y Larga Distancia"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Tren",
          "Descuento"
        ],
        "filas": [
          [
            "Avant",
            "15 %"
          ],
          [
            "Media Distancia",
            "20 % (menores de 4 gratis; de 4 a 13, 40 %)"
          ],
          [
            "Cercanías y Feve ida",
            "30 %"
          ],
          [
            "Cercanías y Feve ida y vuelta",
            "40 % (menores de 12, 50 %)"
          ]
        ],
        "titulo": "Avant, Media Distancia y Cercanías"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Sin cambios; solo anulación total con un 15 % de deducción. Avant y MD se compran en taquillas con venta electrónica, agencias y teléfono; Cercanías y Feve, en taquilla o autoventa.",
          "Centros de enseñanza, asociaciones y entidades culturales tienen en Media Distancia descuentos del 40 % (hasta el 50 % para menores)."
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos/grupos/grupos-de-mas-25",
    "titulo": "Grupos de más de 25 personas",
    "resumen": "Presupuesto cerrado a medida; solicítalo con al menos 10 días de antelación.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "pasos",
        "pasos": [
          {
            "titulo": "Pide presupuesto",
            "texto": "Con un mínimo de 10 días: formulario, 912 320 320 (particulares) o 919 190 505 (empresas y agencias), de 7:00 a 23:00."
          },
          {
            "titulo": "Acepta el precio",
            "texto": "Es cerrado y no acumulable. Indica si alguien necesita asistencia o plaza H."
          },
          {
            "titulo": "Compra con el localizador",
            "texto": "En taquillas o agencias presenciales."
          }
        ],
        "titulo": "Cómo funciona"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Los cambios se piden por correo al departamento de Grupos con 72 horas de antelación y solo antes de comprar los billetes."
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos/personas-con-discapacidad",
    "titulo": "Personas con discapacidad",
    "resumen": "Tarjeta Dorada para discapacidad desde el 33 % y plaza H a 7 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Con discapacidad igual o superior al 33 %, o siendo pensionista mayor de 18 con incapacidad permanente, puedes obtener la Tarjeta Dorada (6 €, validez de 1, 2 o 3 años) en taquilla o agencia aportando el certificado."
        ]
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Tren",
          "Descuento"
        ],
        "filas": [
          [
            "AVE, AVE Internacional y Larga Distancia",
            "25 %"
          ],
          [
            "Avant L-V / S-D",
            "25 % / 40 %"
          ],
          [
            "Media Distancia",
            "Desde 40 %"
          ],
          [
            "Cercanías",
            "Con descuento"
          ]
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Con un 65 % o más, el acompañante obtiene el mismo descuento.",
          "Plaza H (espacio para silla de ruedas): 7 € fijos en AVE, Avlo, Alvia, Euromed, Intercity y AVE a Francia; desde 2026, máximo 7 € también en Media Distancia y Avant. No aplica al acompañante."
        ],
        "titulo": "Además"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Servicio de asistencia",
            "texto": "Cómo pedir ayuda en estación y tren.",
            "enlace": "/viajar/informacion-util/servicio-de-asistencia"
          }
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos/trenes-charter",
    "titulo": "Trenes chárter",
    "resumen": "Trenes a medida para incentivos, presentaciones, paquetes turísticos o eventos.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Para alquilar un tren completo, contacta con el departamento de Grupos indicando fecha, horarios, número de viajeros, origen, destino, paradas y servicios que necesitas. Se responde con un presupuesto."
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos/congresos-y-eventos",
    "titulo": "Congresos y ferias",
    "resumen": "5 % de descuento para asistentes a congresos o ferias de hasta 4 días y más de 75 personas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Instituciones feriales, palacios de congresos, convention bureaus, organizadores profesionales, asociaciones o agencias pueden pedir el descuento para eventos de 4 días como máximo y más de 75 asistentes.",
          "Asistentes y organizadores viajan en AVE, AVE Internacional, Avlo o Larga Distancia hasta la ciudad del evento con un 5 % de descuento."
        ]
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "La solicitud es online y debe hacerse al menos 30 días antes de la inauguración. Dudas: congresos@renfe.es o 919 190 505."
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Cómo comprar con autorización de congreso",
            "texto": "Pasos para aplicar el descuento de Congresos y Ferias en la web.",
            "enlace": "/viajar/prepara-tu-viaje/descuentos/congresos-y-eventos/tutorial"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos/congresos-y-eventos/tutorial",
    "titulo": "Cómo comprar con autorización de congreso",
    "resumen": "Pasos para aplicar el descuento de Congresos y Ferias en la web.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "pasos",
        "pasos": [
          {
            "titulo": "Origen, destino y fechas",
            "texto": "Elige la ciudad del evento y fechas dentro de su periodo."
          },
          {
            "titulo": "Elige precio",
            "texto": "Cualquier opción: Básica Avlo, Básico, Elige o Prémium."
          },
          {
            "titulo": "Aplica el descuento",
            "texto": "En «Descuentos» selecciona Congresos/Ferias e introduce el número de autorización."
          },
          {
            "titulo": "Paga",
            "texto": "Termina la compra con normalidad."
          }
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/descuentos/empresas",
    "titulo": "Empresas",
    "resumen": "Programa Renfe Empresas para grandes empresas y pymes.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Más de 30 destinos de alta velocidad y más de 250 de Larga Distancia.",
          "Combinado Cercanías incluido.",
          "Wifi y enchufes estándar y USB en cada asiento.",
          "Precios exclusivos y tarifas Elige, Elige Confort y Prémium con restauración.",
          "Sala Executive: sala privada en el tren reservable por miembros.",
          "Programa Más Renfe.",
          "Certificado AENOR CO2 Neutro."
        ],
        "titulo": "Ventajas"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Contacto: empresas@renfe.es o 91 919 05 05 (lunes a viernes, 9:00 a 21:00)."
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo",
    "titulo": "Avlo",
    "resumen": "Alta velocidad low cost: billetes desde 7 € y 5 € para menores de 14 años, con wifi gratis.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Avlo es el servicio de alta velocidad de bajo coste: asientos reclinables, enchufe y luz de lectura en cada plaza y velocidad de 300 km/h, con billetes desde 7 €. Los menores de 14 años pagan un precio fijo de 5 €."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Madrid – València (paradas en Cuenca y Requena-Utiel).",
          "Madrid – Alicante (Cuenca, Albacete y Villena).",
          "Madrid – Málaga (Ciudad Real, Puertollano, Villanueva de Córdoba, Córdoba, Puente Genil y Antequera).",
          "Madrid – Sevilla (Ciudad Real, Puertollano, Villanueva de Córdoba y Córdoba).",
          "Madrid – Murcia (Cuenca, Albacete, Villena, Alicante, Elche y Orihuela).",
          "Murcia – Valladolid (pasando por Madrid).",
          "Madrid – Gijón (Segovia, Valladolid, Palencia, León, La Pola, Mieres y Oviedo)."
        ],
        "titulo": "Rutas"
      },
      {
        "tipo": "lista",
        "items": [
          "Llega 30 minutos antes: el control de acceso cierra 2 minutos antes de la salida.",
          "El billete es nominativo: lleva documento de identidad con foto.",
          "Para comprar hay que estar registrado."
        ],
        "titulo": "Antes de viajar"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Los trenes son accesibles, con plazas H y acceso a nivel de andén; a bordo hay espacio para maletas, máquinas de bebida y snacks y aseos adaptados. La asistencia PMR se solicita al comprar o con la app Servicio de Asistencia."
        ],
        "titulo": "Accesibilidad"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Tarifas y servicios Avlo",
            "texto": "Tarifa Básica desde 7 €, extras de 8 € y equipaje adicional de 10 € o 15 €.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/tarifas-y-servicios"
          },
          {
            "titulo": "Destinos Avlo",
            "texto": "Ciudades a las que llega Avlo, con ideas para la escapada e información de cada estación.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos"
          },
          {
            "titulo": "Ayuda Avlo",
            "texto": "Preguntas frecuentes sobre compra, cambios, equipaje, mascotas, servicios a bordo e indemnizaciones en Avlo.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/ayuda"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/tarifas-y-servicios",
    "titulo": "Tarifas y servicios Avlo",
    "resumen": "Tarifa Básica desde 7 €, extras de 8 € y equipaje adicional de 10 € o 15 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Concepto",
          "Precio / condición"
        ],
        "filas": [
          [
            "Tarifa Básica",
            "Desde 7 €"
          ],
          [
            "Niño menor de 14 años",
            "5 € fijos (máx. 2 por Tarifa Básica)"
          ],
          [
            "Familia numerosa",
            "20 % general / 50 % especial"
          ],
          [
            "Cambio y anulación",
            "8 € (solo al comprar; un cambio de fecha/hora hasta 30 min antes)"
          ],
          [
            "Selección de asiento",
            "8 € por trayecto (al comprar)"
          ],
          [
            "Equipaje adicional",
            "10 € al comprar; 15 € después, en estación o a bordo"
          ],
          [
            "Mascota hasta 10 kg",
            "10 €"
          ],
          [
            "Perro hasta 40 kg",
            "40 €"
          ],
          [
            "Wifi",
            "Gratis"
          ]
        ],
        "titulo": "Precios"
      },
      {
        "tipo": "lista",
        "items": [
          "Un bolso o mochila de hasta 36x27x25 cm, sin límite de peso.",
          "Una maleta de cabina de hasta 55x35x25 cm, sin límite de peso."
        ],
        "titulo": "Equipaje incluido"
      },
      {
        "tipo": "lista",
        "items": [
          "Maletas de hasta 85x60x35 cm o 180 cm sumando lados.",
          "Bicicletas urbanas y patinetes no eléctricos plegados de hasta 180 cm.",
          "Bicicletas desmontadas en funda de hasta 140x90x40 cm.",
          "Patinetes eléctricos y VMP plegados y apagados de hasta 120x50x55 cm, con etiqueta, marcaje del fabricante y seguro."
        ],
        "titulo": "Se considera equipaje adicional"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Avlo admite Bono AVE, Bono AVE Flexible y Bono Colaborativo. Los socios Más Renfe Plata, Oro y Platino pueden entrar en las Salas Club."
        ],
        "titulo": "Abonos y Salas Club"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos",
    "titulo": "Destinos Avlo",
    "resumen": "Ciudades a las que llega Avlo, con ideas para la escapada e información de cada estación.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Avlo a Albacete",
            "texto": "Escapada a Albacete en Avlo: qué ver y datos de la estación Albacete Los Llanos.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/albacete"
          },
          {
            "titulo": "Avlo a Alicante/Alacant",
            "texto": "Escapada a Alicante/Alacant en Avlo: qué ver y datos de la estación Alicante/Alacant Terminal.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/alicante"
          },
          {
            "titulo": "Avlo a Antequera",
            "texto": "Escapada a Antequera en Avlo: qué ver y datos de la estación Antequera-Santa Ana.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/antequera"
          },
          {
            "titulo": "Avlo a Ciudad Real",
            "texto": "Escapada a Ciudad Real en Avlo: qué ver y datos de la estación Ciudad Real.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/ciudad-real"
          },
          {
            "titulo": "Avlo a Córdoba",
            "texto": "Escapada a Córdoba en Avlo: qué ver y datos de la estación Córdoba.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/cordoba"
          },
          {
            "titulo": "Avlo a Cuenca",
            "texto": "Escapada a Cuenca en Avlo: qué ver y datos de la estación Cuenca Fernando Zóbel.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/cuenca"
          },
          {
            "titulo": "Avlo a Elche/Elx",
            "texto": "Escapada a Elche/Elx en Avlo: qué ver y datos de la estación Elche/Elx Alta Velocidad.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/elche"
          },
          {
            "titulo": "Avlo a Madrid",
            "texto": "Escapada a Madrid en Avlo: qué ver y datos de la estación Madrid Puerta de Atocha - Almudena Grandes.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/madrid"
          },
          {
            "titulo": "Avlo a Málaga",
            "texto": "Escapada a Málaga en Avlo: qué ver y datos de la estación Málaga María Zambrano.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/malaga"
          },
          {
            "titulo": "Avlo a Murcia",
            "texto": "Escapada a Murcia en Avlo: qué ver y datos de la estación Murcia del Carmen.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/murcia"
          },
          {
            "titulo": "Avlo a Orihuela",
            "texto": "Escapada a Orihuela en Avlo: qué ver y datos de la estación Orihuela-Miguel Hernández.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/orihuela"
          },
          {
            "titulo": "Avlo a Puente Genil",
            "texto": "Escapada a Puente Genil en Avlo: qué ver y datos de la estación Puente Genil-Herrera.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/puente-genil"
          },
          {
            "titulo": "Avlo a Puertollano",
            "texto": "Escapada a Puertollano en Avlo: qué ver y datos de la estación Puertollano.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/puertollano"
          },
          {
            "titulo": "Avlo a Requena-Utiel",
            "texto": "Escapada a Requena-Utiel en Avlo: qué ver y datos de la estación Requena-Utiel.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/requena-utiel"
          },
          {
            "titulo": "Avlo a Sevilla",
            "texto": "Escapada a Sevilla en Avlo: qué ver y datos de la estación Sevilla Santa Justa.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/sevilla"
          },
          {
            "titulo": "Avlo a València",
            "texto": "Escapada a València en Avlo: qué ver y datos de la estación València Joaquín Sorolla.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/valencia"
          },
          {
            "titulo": "Avlo a Villanueva de Córdoba",
            "texto": "Escapada a Villanueva de Córdoba en Avlo: qué ver y datos de la estación Villanueva de Córdoba-Los Pedroches.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/villanueva-de-cordoba"
          },
          {
            "titulo": "Avlo a Villena",
            "texto": "Escapada a Villena en Avlo: qué ver y datos de la estación Villena Alta Velocidad.",
            "enlace": "/viajar/prepara-tu-viaje/avlo/destinos/villena"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/albacete",
    "titulo": "Avlo a Albacete",
    "resumen": "Escapada a Albacete en Avlo: qué ver y datos de la estación Albacete Los Llanos.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Ciudad manchega de centro modernista (Pasaje de Lodares, Gran Hotel, Casa Cabot), parques como el de Abelardo Sánchez, museo de la cuchillería y feria de interés turístico internacional."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Albacete Los Llanos",
            "5:00 a 23:30 (sábados, domingos y festivos de 7:00 a 23:30)"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Albacete",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/alicante",
    "titulo": "Avlo a Alicante/Alacant",
    "resumen": "Escapada a Alicante/Alacant en Avlo: qué ver y datos de la estación Alicante/Alacant Terminal.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Playas de San Juan y el Postiguet, Castillo de Santa Bárbara sobre el Benacantil y paseo por la Explanada de España."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Alicante/Alacant Terminal",
            "5:30 a 23:50"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Alicante/Alacant",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/antequera",
    "titulo": "Avlo a Antequera",
    "resumen": "Escapada a Antequera en Avlo: qué ver y datos de la estación Antequera-Santa Ana.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Ciudad de origen romano en el centro de Andalucía, con la Colegiata de Santa María, la porra antequerana y el Torcal, Patrimonio Mundial."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Antequera-Santa Ana",
            "6:30 a 23:15"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Antequera",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/ciudad-real",
    "titulo": "Avlo a Ciudad Real",
    "resumen": "Escapada a Ciudad Real en Avlo: qué ver y datos de la estación Ciudad Real.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Capital medieval con la Puerta de Toledo y la catedral, tapeo de pisto y migas y cerca de las Tablas de Daimiel."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Ciudad Real",
            "lunes no festivos 5:30 a 23:45; resto 6:00 a 23:45"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Ciudad Real",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/cordoba",
    "titulo": "Avlo a Córdoba",
    "resumen": "Escapada a Córdoba en Avlo: qué ver y datos de la estación Córdoba.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Mezcla romana, árabe y judía: callejuelas, patios, Mezquita-Catedral, Torre de la Calahorra y salmorejo."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Córdoba",
            "6:00 a 0:00"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Córdoba",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/cuenca",
    "titulo": "Avlo a Cuenca",
    "resumen": "Escapada a Cuenca en Avlo: qué ver y datos de la estación Cuenca Fernando Zóbel.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Ciudad Patrimonio de la Humanidad con las Casas Colgadas, miradores sobre el Huécar, morteruelo y rutas de senderismo."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Cuenca Fernando Zóbel",
            "6:45 a 22:30"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Cuenca",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/elche",
    "titulo": "Avlo a Elche/Elx",
    "resumen": "Escapada a Elche/Elx en Avlo: qué ver y datos de la estación Elche/Elx Alta Velocidad.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Palacio de Altamira, Basílica de Santa María, arroz con costra y playas cercanas como L'Altet y Arenals del Sol."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Elche/Elx Alta Velocidad",
            "6:00 a 22:30"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Elche/Elx",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/madrid",
    "titulo": "Avlo a Madrid",
    "resumen": "Escapada a Madrid en Avlo: qué ver y datos de la estación Madrid Puerta de Atocha - Almudena Grandes.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Paseo del Arte, compras, tapeo en Las Letras, La Latina o Lavapiés y bocadillo de calamares en la Plaza Mayor."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Madrid Puerta de Atocha - Almudena Grandes",
            "5:00 a 1:00"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Madrid",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/malaga",
    "titulo": "Avlo a Málaga",
    "resumen": "Escapada a Málaga en Avlo: qué ver y datos de la estación Málaga María Zambrano.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Teatro Romano, Alcazaba, catedral, museos como el Carmen Thyssen, mercado de Atarazanas y calle Larios."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Málaga María Zambrano",
            "5:00 a 0:45"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Málaga",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/murcia",
    "titulo": "Avlo a Murcia",
    "resumen": "Escapada a Murcia en Avlo: qué ver y datos de la estación Murcia del Carmen.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Ciudad para recorrer a pie: catedral, Casino, Palacio Episcopal y terrazas todo el año."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Murcia del Carmen",
            "5:15 a 0:15"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Murcia",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/orihuela",
    "titulo": "Avlo a Orihuela",
    "resumen": "Escapada a Orihuela en Avlo: qué ver y datos de la estación Orihuela-Miguel Hernández.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Catedral, Convento de Santo Domingo, huella de Miguel Hernández, arte urbano en San Isidro y calas cercanas."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Orihuela-Miguel Hernández",
            "5:45 a 23:45"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Orihuela",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/puente-genil",
    "titulo": "Avlo a Puente Genil",
    "resumen": "Escapada a Puente Genil en Avlo: qué ver y datos de la estación Puente Genil-Herrera.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Entre Córdoba, Málaga y Sevilla, rodeada por las Subbéticas, con el Pantano de Cordobilla y casas palacio."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Puente Genil-Herrera",
            "6:15 a 23:00"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Puente Genil",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/puertollano",
    "titulo": "Avlo a Puertollano",
    "resumen": "Escapada a Puertollano en Avlo: qué ver y datos de la estación Puertollano.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Pasado minero y arte de vanguardia, quesos manchegos, azafrán y aceite con denominación de origen."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Puertollano",
            "6:00 a 23:45"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Puertollano",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/requena-utiel",
    "titulo": "Avlo a Requena-Utiel",
    "resumen": "Escapada a Requena-Utiel en Avlo: qué ver y datos de la estación Requena-Utiel.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Tierra Bobal de viñedos, Iglesia de Santa María y Palacio del Cid en Requena, y bodegas subterráneas en Utiel."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Requena-Utiel",
            "6:50 a 22:50"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Requena-Utiel",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/sevilla",
    "titulo": "Avlo a Sevilla",
    "resumen": "Escapada a Sevilla en Avlo: qué ver y datos de la estación Sevilla Santa Justa.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Catedral, Giralda, Real Alcázar, Plaza de España, Torre del Oro y tapeo en la Plaza del Salvador."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Sevilla Santa Justa",
            "4:30 a 0:30"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Sevilla",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/valencia",
    "titulo": "Avlo a València",
    "resumen": "Escapada a València en Avlo: qué ver y datos de la estación València Joaquín Sorolla.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Ciutat Vella, catedral y Miguelete, Ruzafa, Fallas en marzo, paella y tapas en El Cabanyal."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "València Joaquín Sorolla",
            "5:45 a 0:00"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a València",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/villanueva-de-cordoba",
    "titulo": "Avlo a Villanueva de Córdoba",
    "resumen": "Escapada a Villanueva de Córdoba en Avlo: qué ver y datos de la estación Villanueva de Córdoba-Los Pedroches.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "En Sierra Morena, entre dehesas de encinas, con aceite ecológico y jamón ibérico con denominación de origen."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Villanueva de Córdoba-Los Pedroches",
            "7:00 a 23:30 (sábados, domingos y festivos desde 7:30)"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Villanueva de Córdoba",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/destinos/villena",
    "titulo": "Avlo a Villena",
    "resumen": "Escapada a Villena en Avlo: qué ver y datos de la estación Villena Alta Velocidad.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Yacimientos como Cabezo Redondo, Castillo de la Atalaya, iglesias y vías ferratas."
        ],
        "titulo": "Qué ver"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario de apertura"
        ],
        "filas": [
          [
            "Villena Alta Velocidad",
            "5:50 a 23:40 (sábados 6:50 a 21:00; domingos 6:50 a 23:40)"
          ]
        ],
        "titulo": "La estación"
      },
      {
        "tipo": "lista",
        "items": [
          "Venta de billetes",
          "Taxi y conexiones de autobús",
          "Aparcamiento",
          "Adaptada a personas con movilidad reducida"
        ],
        "titulo": "Servicios habituales"
      },
      {
        "tipo": "cta",
        "texto": "Busca billetes Avlo a Villena",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/avlo/ayuda",
    "titulo": "Ayuda Avlo",
    "resumen": "Preguntas frecuentes sobre compra, cambios, equipaje, mascotas, servicios a bordo e indemnizaciones en Avlo.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "faq",
        "titulo": "Preguntas frecuentes",
        "preguntas": [
          {
            "p": "¿Dónde se compra?",
            "r": "renfe.com, taquillas, teléfono (912 320 320), agencias físicas y online, oficinas de Correos y autoventa (sin complementos)."
          },
          {
            "p": "¿Genera Puntos Renfe?",
            "r": "Sí, y también se pueden usar para pagar billetes Avlo."
          },
          {
            "p": "¿Cuántos billetes por compra?",
            "r": "Hasta 9."
          },
          {
            "p": "¿Hay descuentos?",
            "r": "Solo Familia Numerosa (20 % general, 50 % especial) y el precio fijo de 5 € para menores de 14 (máximo 2 por adulto, ocupando plaza)."
          },
          {
            "p": "¿Hace falta registrarse?",
            "r": "Sí, los billetes son identificativos."
          },
          {
            "p": "¿Puedo cambiar o anular?",
            "r": "La Tarifa Básica no lo permite salvo que añadas el extra de 8 € al comprar: un cambio de fecha u hora (no de origen, destino ni titular) o la anulación hasta 30 minutos antes. Si el nuevo tren es más caro pagas la diferencia; si es más barato no se devuelve. Hay 2 horas de cortesía para anular gratis."
          },
          {
            "p": "¿Se pueden anular los extras por separado?",
            "r": "No. Si anulas el billete se devuelven los extras, salvo el de cambio y anulación."
          },
          {
            "p": "¿Puedo llevar el cochecito del bebé?",
            "r": "Sí, plegado y uno por billete de niño, sin coste."
          },
          {
            "p": "¿Y una bicicleta?",
            "r": "Plegada (hasta 180 cm) o desmontada en funda (hasta 140x90x40 cm), como equipaje adicional de pago."
          },
          {
            "p": "¿Mascotas?",
            "r": "Hasta 10 kg en transportín por 10 €, o perro de hasta 40 kg sin transportín por 40 €. Perros guía y de asistencia gratis."
          },
          {
            "p": "¿Puedo elegir asiento?",
            "r": "Con el extra de 8 € por trayecto; en ida y vuelta se aplica a ambos."
          },
          {
            "p": "¿Incluye Combinado Cercanías o coche en silencio?",
            "r": "No."
          },
          {
            "p": "¿Hay cafetería?",
            "r": "No; hay máquinas de bebidas y snacks (solo tarjeta) o bar móvil según la ruta. Tampoco hay canal de audio y vídeo, pero sí wifi."
          },
          {
            "p": "¿Y si pierdo algo?",
            "r": "Escribe a objetosperdidosestaciones@adif.es o acude a Objetos Perdidos de la estación."
          },
          {
            "p": "¿Indemnización por retraso?",
            "r": "Más de 60 minutos: 50 % del billete. Más de 90 minutos: 100 %. En vale descuento o a la forma de pago original."
          },
          {
            "p": "¿Factura?",
            "r": "Al comprar o después desde tu área personal, con DNI o CIF en el perfil."
          },
          {
            "p": "¿Contacto?",
            "r": "91 232 03 20, Portal de Reclamaciones o formulario de sugerencias; también centros de servicio y puntos de última hora."
          }
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/ave-francia",
    "titulo": "AVE Francia",
    "resumen": "AVE Internacional entre España y Francia: Barcelona–Lyon y Madrid–Barcelona–Marsella, hasta 28 trenes semanales.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "El AVE Internacional une de forma directa ciudades como Madrid, Barcelona y Girona con Marsella, Lyon o Montpellier. Hay hasta 28 trenes de lunes a domingo en las rutas Barcelona–Lyon y Madrid–Barcelona–Marsella.",
          "Se venden billetes Básico, Elige Estándar y Elige Confort (no Prémium) y el menú box está incluido."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Horarios de los trenes AVE Internacional (PDF).",
          "Mapa de rutas (PDF)."
        ],
        "titulo": "Descargas"
      },
      {
        "tipo": "cta",
        "texto": "Busca tu AVE a Francia",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Servicios del AVE Francia",
            "texto": "Personal multilingüe y megafonía en cuatro idiomas.",
            "enlace": "/viajar/prepara-tu-viaje/ave-francia/servicios"
          },
          {
            "titulo": "Información útil AVE Francia",
            "texto": "Horarios, mapa de rutas, equipaje y documentación para viajar a Francia.",
            "enlace": "/viajar/prepara-tu-viaje/ave-francia/informacion-util"
          },
          {
            "titulo": "Contacto AVE Francia",
            "texto": "Teléfono, reclamaciones y formulario para el AVE Internacional.",
            "enlace": "/viajar/prepara-tu-viaje/ave-francia/contacto"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/ave-francia/servicios",
    "titulo": "Servicios del AVE Francia",
    "resumen": "Personal multilingüe y megafonía en cuatro idiomas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "La tripulación atiende en varios idiomas durante todo el trayecto y la megafonía se emite en español, catalán, inglés y francés según el territorio."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Horarios de los trenes AVE Internacional (PDF).",
          "Mapa de rutas (PDF)."
        ],
        "titulo": "Descargas"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/ave-francia/informacion-util",
    "titulo": "Información útil AVE Francia",
    "resumen": "Horarios, mapa de rutas, equipaje y documentación para viajar a Francia.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "El equipaje de mano y especial sigue las mismas reglas que en los trenes nacionales, pero el etiquetado es obligatorio."
        ]
      },
      {
        "tipo": "aviso",
        "nivel": "alerta",
        "texto": "Los menores de 18 años que viajen al extranjero deben llevar la documentación exigida por el Ministerio del Interior."
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Equipajes",
            "texto": "Medidas y bultos permitidos.",
            "enlace": "/viajar/informacion-util/equipajes"
          },
          {
            "titulo": "Mapa AVE Francia",
            "texto": "Rutas internacionales.",
            "enlace": "/viajar/informacion-util/mapas-y-lineas/ave-francia"
          }
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Horarios de los trenes AVE Internacional (PDF).",
          "Mapa de rutas (PDF)."
        ],
        "titulo": "Descargas"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/ave-francia/contacto",
    "titulo": "Contacto AVE Francia",
    "resumen": "Teléfono, reclamaciones y formulario para el AVE Internacional.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Teléfono 91 232 03 20, Portal de Reclamaciones o formulario de sugerencias, felicitaciones y solicitudes de información sobre el AVE Internacional entre España y Francia."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Horarios de los trenes AVE Internacional (PDF).",
          "Mapa de rutas (PDF)."
        ],
        "titulo": "Descargas"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/viajes-paquetes",
    "titulo": "Viajes y paquetes",
    "resumen": "Renfe Viajes: tren más hotel, entradas y experiencias en una sola reserva.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Renfe Viajes combina el billete de AVE, Avlo, Alvia, Avant o Intercity con alojamiento, entradas y actividades en una única compra y pago, acumulando Puntos Más Renfe."
        ]
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Musical en Madrid",
            "texto": "Escapada con tren y entradas a un musical con canciones de Alejandro Sanz.",
            "enlace": "/",
            "etiqueta": "Desde 27 €"
          },
          {
            "titulo": "PortAventura World",
            "texto": "AVE más entradas para la temporada de Halloween.",
            "enlace": "/",
            "etiqueta": "Desde 48 €"
          },
          {
            "titulo": "Parador de Toledo",
            "texto": "Tren y estancia en el Parador; suma Puntos Renfe.",
            "enlace": "/",
            "etiqueta": "Desde 215,90 €"
          },
          {
            "titulo": "Coche de alquiler",
            "texto": "Reserva con Europcar y gana un 4 % en Puntos Renfe.",
            "enlace": "/"
          },
          {
            "titulo": "Alojamiento",
            "texto": "Hoteles a través de Booking.com en Renfe Viajes.",
            "enlace": "/"
          },
          {
            "titulo": "Trenes de lujo 2026",
            "texto": "Rutas en trenes históricos con gastronomía de alto nivel.",
            "enlace": "/"
          }
        ],
        "titulo": "Ofertas destacadas"
      },
      {
        "tipo": "lista",
        "items": [
          "Precio mínimo garantizado.",
          "4 % del importe en Puntos Renfe y pago mixto con puntos.",
          "Sin gastos de gestión.",
          "Reserva 100 % online con confirmación inmediata.",
          "Traslados, actividades y extras en la misma reserva.",
          "Tarjeta regalo digital sin caducidad.",
          "Atención por expertos."
        ],
        "titulo": "Por qué reservar aquí"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/combina-tren",
    "titulo": "Combina tren",
    "resumen": "Billetes combinados Tren + Bus y Train & Fly (tren + avión con Iberia).",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Tren + Bus",
            "texto": "Un único billete para llegar en tren y autobús a destinos como Benidorm, Marbella, el Pirineo o el Algarve.",
            "enlace": "/viajar/prepara-tu-viaje/combina-tren/tren-bus"
          },
          {
            "titulo": "Train & Fly",
            "texto": "Tren + avión con Iberia desde 20 ciudades españolas, vía Madrid, en un solo billete.",
            "enlace": "/viajar/prepara-tu-viaje/combina-tren/tren-avion"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/combina-tren/tren-bus",
    "titulo": "Tren + Bus",
    "resumen": "Un único billete para llegar en tren y autobús a destinos como Benidorm, Marbella, el Pirineo o el Algarve.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "El billete combinado se gestiona con Avanza, Alsa, Baile, Teisa y La Regional."
        ]
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Destino",
          "Desde",
          "Transbordo"
        ],
        "filas": [
          [
            "Barbastro y Huesca",
            "Barcelona Aeropuerto El Prat",
            "Barcelona Sants"
          ],
          [
            "Marbella, Estepona, Gibraltar/La Línea y Algeciras",
            "Madrid Puerta de Atocha",
            "Málaga"
          ],
          [
            "Pirineo Aragonés (Monzón, Benasque, Jaca, Candanchú, Astún...)",
            "Madrid, Sevilla y Málaga",
            "Zaragoza y Huesca"
          ],
          [
            "Benidorm y Altea-Calpe",
            "Madrid, Ciudad Real, Albacete, Barcelona, Figueres, Santander y León",
            "Alicante"
          ],
          [
            "Denia-Jávea",
            "Madrid, Barcelona y Burgos",
            "Valencia Joaquín Sorolla"
          ],
          [
            "Vielha-Andorra",
            "Madrid Puerta de Atocha",
            "Lleida-Pirineus"
          ],
          [
            "Algarve (Faro, Albufeira, Portimão, Lagos)",
            "Madrid y Barcelona",
            "Sevilla"
          ],
          [
            "L'Altet, Los Arenales y Santa Pola",
            "Asturias, Cantabria, Galicia, Cataluña y Madrid",
            "Alicante"
          ],
          [
            "Figueres",
            "Madrid y Barcelona",
            "Figueres Vilafant"
          ],
          [
            "Toro",
            "Madrid Chamartín y Galicia",
            "Zamora"
          ]
        ],
        "titulo": "Destinos"
      },
      {
        "tipo": "faq",
        "titulo": "Preguntas frecuentes",
        "preguntas": [
          {
            "p": "¿Dónde se compra?",
            "r": "renfe.com, taquillas, oficinas de venta, agencias y teléfono 912 320 320."
          },
          {
            "p": "¿Admite cambios o anulaciones?",
            "r": "Según el billete de tren, afectando a todo el combinado y solo hasta 10 horas antes de la salida del primer trayecto."
          },
          {
            "p": "¿Qué equipaje puedo llevar?",
            "r": "Hasta 3 bultos de mano que no sumen más de 290 cm ni 25 kg; el mayor, de hasta 85x55x35 cm. No se admiten bicicletas ni patinetes."
          },
          {
            "p": "¿Y mascotas?",
            "r": "No se admiten."
          },
          {
            "p": "¿Asistencia PMR?",
            "r": "Sí, para el tramo en tren, en el 912 320 320."
          },
          {
            "p": "¿Menores sin acompañante?",
            "r": "No incluido."
          }
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/prepara-tu-viaje/combina-tren/tren-avion",
    "titulo": "Train & Fly",
    "resumen": "Tren + avión con Iberia desde 20 ciudades españolas, vía Madrid, en un solo billete.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Train & Fly conecta en un único billete 20 ciudades (A Coruña, Albacete, Alicante, Córdoba, Gijón, Granada, León, Málaga, Murcia, Ourense, Oviedo, Palencia, Pamplona, Salamanca, Santiago, Sevilla, València, Valladolid, Vigo y Zaragoza) con los vuelos internacionales de Iberia desde Madrid."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "El Combinado Cercanías incluido lleva de Atocha o Chamartín a la estación Aeropuerto-T4 y viceversa.",
          "Una sola búsqueda y compra.",
          "Garantías de pasajero en conexión ante retrasos o cancelaciones.",
          "Más barato que comprar tren y avión por separado."
        ],
        "titulo": "Ventajas"
      },
      {
        "tipo": "faq",
        "titulo": "Preguntas frecuentes",
        "preguntas": [
          {
            "p": "¿Dónde se compra?",
            "r": "En los canales de Iberia y agencias de viaje."
          },
          {
            "p": "¿Uno o dos billetes?",
            "r": "Uno, con dos documentos de viaje (tren y avión)."
          },
          {
            "p": "¿Cuánto cuesta el tren?",
            "r": "Está incluido en la tarifa aérea."
          },
          {
            "p": "Si vuelo en Business, ¿qué asiento tengo en el tren?",
            "r": "Elige Confort, asiento Confort."
          },
          {
            "p": "¿Cambios y anulaciones?",
            "r": "Según la tarifa aérea y solo en canales de Iberia (901 111 500), no en puntos Renfe."
          },
          {
            "p": "¿Equipaje?",
            "r": "El de la tarifa aérea; en el tren se aplican las normas de equipaje ferroviario. No hay facturación en el tren."
          },
          {
            "p": "¿Cuánto tiempo de conexión?",
            "r": "Mínimo 2,5 horas entre tren y avión."
          },
          {
            "p": "¿Puntos Más Renfe o Avios?",
            "r": "No suma Puntos Renfe; los Avios solo en el tramo aéreo."
          },
          {
            "p": "¿Indemnización por retraso?",
            "r": "La legal: 50 % con 60 minutos o más y 100 % con más de 90. Contacta con Serviberia (901 111 500)."
          },
          {
            "p": "¿Asistencia PMR?",
            "r": "Sí, en el 91 214 05 05 o en un centro de asistencia; no cubre el traslado estación-aeropuerto, que presta AENA en el aeropuerto."
          },
          {
            "p": "¿Menores solos o mascotas?",
            "r": "No disponibles."
          }
        ]
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Con billete de avión a Baleares, Canarias o Melilla, o de crucero en puertos españoles, hay entre un 10 % y un 25 % de descuento en el tren si entre ambos transportes pasan 48 horas como máximo."
        ],
        "titulo": "Tarifa Intermodal"
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/en-tierra",
    "titulo": "En tierra",
    "resumen": "Servicios en la estación: Salas Club, aparcamientos y puntos de atención.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Salas Club",
            "texto": "Salas de espera con descanso, zona de trabajo, aseos y cafetería autoservicio.",
            "enlace": "/viajar/el-viaje/en-tierra/salas-club"
          },
          {
            "titulo": "Aparcamientos en estaciones",
            "texto": "Aparca en la estación; gratis 24 h para Más Renfe Oro y Platino en AVE, Alvia, Intercity, Euromed o Avant.",
            "enlace": "/viajar/el-viaje/en-tierra/aparcamiento"
          },
          {
            "titulo": "Puntos de última hora y centros de servicio",
            "texto": "Espacios en las grandes estaciones para resolver incidencias del viaje.",
            "enlace": "/viajar/el-viaje/en-tierra/puntos-de-ultima-hora"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/en-tierra/salas-club",
    "titulo": "Salas Club",
    "resumen": "Salas de espera con descanso, zona de trabajo, aseos y cafetería autoservicio.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Las Salas Club ofrecen zona de descanso y lectura, espacio de reuniones, aseos y autoservicio de snacks y bebidas. Se accede desde 2 horas antes de la salida en la estación de origen."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Billete Prémium.",
          "Billete de un tren turístico de lujo.",
          "Billete intermodal Renfe-Iberia siendo Más Renfe Plata (4 accesos al año), Oro o Platino.",
          "Más Renfe Plata (4 accesos al año), Oro o Platino con billete AVE o Larga Distancia, o Platino con Avant (salvo Avant Alicante–Murcia). El número de socio debe figurar en el billete.",
          "Más Renfe Plata, Oro o Platino con billete Avlo."
        ],
        "titulo": "Quién puede entrar"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Oro y Platino pueden entrar con un acompañante que viaje en el mismo tren y fecha, y con menores de 18 que viajen con ellos. Se puede entrar con la mascota respetando sus condiciones de transporte."
        ]
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Adif puede limitar el tiempo de acceso a las zonas de embarque en algunas estaciones por seguridad."
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Estaciones con Sala Club",
            "texto": "Horarios de las Salas Club por estación.",
            "enlace": "/viajar/el-viaje/en-tierra/salas-club/estaciones"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/en-tierra/salas-club/estaciones",
    "titulo": "Estaciones con Sala Club",
    "resumen": "Horarios de las Salas Club por estación.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Horario",
          "Observaciones"
        ],
        "filas": [
          [
            "Alicante Terminal",
            "L-V 05:25-21:55; S-D 06:30-21:55",
            ""
          ],
          [
            "Albacete Los Llanos",
            "L-V 05:20-22:00; S-D 07:20-22:00",
            ""
          ],
          [
            "Barcelona Sants",
            "L-S 05:00-22:30; D 05:50-22:30",
            ""
          ],
          [
            "Camp de Tarragona",
            "L-S 05:45-22:50; D 06:40-23:00",
            ""
          ],
          [
            "Girona",
            "L-D 05:10-23:45",
            ""
          ],
          [
            "Lleida-Pirineus",
            "L-S 06:15-23:00; D 07:00-23:00",
            ""
          ],
          [
            "Málaga María Zambrano",
            "L-V 05:05-20:45; S-D 06:35-20:45",
            ""
          ],
          [
            "Madrid Chamartín - Clara Campoamor",
            "L-D 05:50-21:30",
            "Cerrada temporalmente"
          ],
          [
            "Madrid Puerta de Atocha - Almudena Grandes",
            "L-S 05:15-22:15; D 05:30-22:15",
            "Acceso limitado por Adif a 90 min antes de la salida"
          ],
          [
            "Sevilla Santa Justa",
            "L-V 05:20-21:30; S-D 05:20-21:00",
            ""
          ],
          [
            "Valencia Joaquín Sorolla",
            "L-V 05:50-21:45; S-D 06:20-21:45",
            ""
          ],
          [
            "Valladolid Campo Grande",
            "L-S 06:50-22:30; D 08:00-22:30",
            "Cerrada temporalmente"
          ],
          [
            "Zaragoza Delicias",
            "L-J 06:20-22:10; V-S 07:00-22:10; D 07:15-22:10",
            ""
          ]
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/en-tierra/aparcamiento",
    "titulo": "Aparcamientos en estaciones",
    "resumen": "Aparca en la estación; gratis 24 h para Más Renfe Oro y Platino en AVE, Alvia, Intercity, Euromed o Avant.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Muchas estaciones tienen aparcamiento. Los socios Más Renfe Oro y Platino aparcan gratis 24 horas si viajan en AVE, Alvia, Intercity, Euromed o Avant (salvo Avant Alicante–Murcia), con la membresía en vigor y el número impreso en el billete."
        ]
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "En Madrid Puerta de Atocha - Almudena Grandes la franquicia solo vale en los parkings P1 y P2."
      },
      {
        "tipo": "pasos",
        "pasos": [
          {
            "titulo": "Coge el ticket",
            "texto": "Siempre al entrar en el parking."
          },
          {
            "titulo": "Valida al pagar",
            "texto": "En el cajero escaneando el código del billete (barras, BIDI o QR) o entregándolo al personal."
          }
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/en-tierra/puntos-de-ultima-hora",
    "titulo": "Puntos de última hora y centros de servicio",
    "resumen": "Espacios en las grandes estaciones para resolver incidencias del viaje.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "En las estaciones con más viajeros hay Puntos de Última Hora y Centros de Servicio para resolver incidencias. Los Centros de Servicio, además de informar, tramitan cambios y devoluciones."
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo",
    "titulo": "A bordo",
    "resumen": "Restauración, tipos de asiento, coche en silencio y entretenimiento durante el viaje.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Comer en el tren",
            "texto": "Menús box desde 11,35 €, restauración Prémium en el asiento, cafetería y bar móvil.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren"
          },
          {
            "titulo": "Tipos de asiento",
            "texto": "Asiento Estándar (2+2) o Confort XL (2+1) según el billete.",
            "enlace": "/viajar/el-viaje/a-bordo/tipos-asiento"
          },
          {
            "titulo": "Coche en silencio",
            "texto": "Coche tranquilo sin coste extra en asiento Estándar de AVE y Euromed.",
            "enlace": "/viajar/el-viaje/a-bordo/coche-en-silencio"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren",
    "titulo": "Comer en el tren",
    "resumen": "Menús box desde 11,35 €, restauración Prémium en el asiento, cafetería y bar móvil.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "El extra Restauración se añade al comprar o hasta 12 horas antes de la salida desde el origen. Con Elige Confort el menú box se sirve en el asiento; con Básico o Elige se recoge en la cafetería. En el AVE Internacional a Francia el box está incluido.",
          "Con billete Prémium en AVE o Euromed el menú Prémium está incluido y se sirve en la plaza.",
          "Todos los AVE y la mayoría de trenes de Larga Distancia tienen cafetería y bar móvil."
        ]
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Menú",
          "Precio"
        ],
        "filas": [
          [
            "Box Capricho",
            "11,35 €"
          ],
          [
            "Box Caliente",
            "14,40 €"
          ],
          [
            "Box Fresco",
            "12,55 €"
          ],
          [
            "Box Clásico",
            "11,95 €"
          ],
          [
            "Box Ibérico",
            "15,55 €"
          ],
          [
            "Box del Norte",
            "15,35 €"
          ]
        ],
        "titulo": "Carta de menús box para viajes hasta el 27 de octubre"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Menú",
          "Precio"
        ],
        "filas": [
          [
            "Box Saludable",
            "11,35 €"
          ],
          [
            "Box Caliente (nueva carta)",
            "12,55 €"
          ],
          [
            "Box Frío",
            "15,35 €"
          ],
          [
            "Box Dulce",
            "15,55 €"
          ],
          [
            "Box Salado",
            "14,40 €"
          ],
          [
            "Box Ligero",
            "11,95 €"
          ]
        ],
        "titulo": "Nueva carta para viajes desde el 28 de octubre"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Box Capricho",
            "texto": "Box Capricho por 11,35 €.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-capricho"
          },
          {
            "titulo": "Box Caliente",
            "texto": "Box Caliente por 14,40 €.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-caliente"
          },
          {
            "titulo": "Box Fresco",
            "texto": "Box Fresco por 12,55 €.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-fresco"
          },
          {
            "titulo": "Box Clásico",
            "texto": "Box Clásico por 11,95 €.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-clasico"
          },
          {
            "titulo": "Box Ibérico",
            "texto": "Box Ibérico por 15,55 €.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-iberico"
          },
          {
            "titulo": "Box del Norte",
            "texto": "Box del Norte por 15,35 €.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-del-norte"
          },
          {
            "titulo": "Box Saludable",
            "texto": "Box Saludable por 11,35 €.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-saludable"
          },
          {
            "titulo": "Box Caliente (nueva carta)",
            "texto": "Box Caliente (nueva carta) por 12,55 €.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-caliente2"
          },
          {
            "titulo": "Box Frío",
            "texto": "Box Frío por 15,35 €.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-frio"
          },
          {
            "titulo": "Box Dulce",
            "texto": "Box Dulce por 15,55 €.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-dulce"
          },
          {
            "titulo": "Box Salado",
            "texto": "Box Salado por 14,40 €.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-salado"
          },
          {
            "titulo": "Box Ligero",
            "texto": "Box Ligero por 11,95 €.",
            "enlace": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-ligero"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-capricho",
    "titulo": "Box Capricho",
    "resumen": "Box Capricho por 11,35 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Galletas con chocolate sin azúcares",
          "Yogur natural con mermelada",
          "Zumo de naranja y mandarina",
          "Bombón negro 70 %"
        ],
        "titulo": "Contenido"
      },
      {
        "tipo": "lista",
        "items": [
          "Bebida fría o caliente",
          "Cubiertos, servilleta y toallita"
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Alérgenos: Gluten, soja, lácteos y sulfitos. Trazas de frutos de cáscara. Ante cualquier duda consulta a la tripulación."
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-caliente",
    "titulo": "Box Caliente",
    "resumen": "Box Caliente por 14,40 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Bocadillo de paleta ibérica de cebo",
          "Aceite de oliva virgen extra y tomate",
          "Almendras sin sal",
          "Bombón negro 70 %"
        ],
        "titulo": "Contenido"
      },
      {
        "tipo": "lista",
        "items": [
          "Bebida fría o caliente",
          "Cubiertos, servilleta y toallita"
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Alérgenos: Gluten, soja, frutos de cáscara y sulfitos. Trazas de huevo, leche, cacahuete, mostaza y sésamo. Ante cualquier duda consulta a la tripulación."
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-fresco",
    "titulo": "Box Fresco",
    "resumen": "Box Fresco por 12,55 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Ensalada mixta",
          "Picos de pan",
          "Fruta",
          "Yogur con muesli y miel",
          "Bombón negro 70 %"
        ],
        "titulo": "Contenido"
      },
      {
        "tipo": "lista",
        "items": [
          "Bebida fría o caliente",
          "Cubiertos, servilleta y toallita"
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Alérgenos: Gluten, huevo, lácteos, pescado, soja y sulfitos. Trazas de frutos de cáscara. Ante cualquier duda consulta a la tripulación."
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-clasico",
    "titulo": "Box Clásico",
    "resumen": "Box Clásico por 11,95 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Sándwich mediterráneo",
          "Patatas fritas",
          "Bombón negro 70 %"
        ],
        "titulo": "Contenido"
      },
      {
        "tipo": "lista",
        "items": [
          "Bebida fría o caliente",
          "Cubiertos, servilleta y toallita"
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Alérgenos: Gluten, huevo, lácteos, soja, frutos de cáscara y sulfitos. Trazas de mostaza y sésamo. Ante cualquier duda consulta a la tripulación."
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-iberico",
    "titulo": "Box Ibérico",
    "resumen": "Box Ibérico por 15,55 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Ensalada mixta",
          "Surtido de paleta ibérica, cecina, quesos, fuet, higo y nueces",
          "Picos de pan",
          "Fruta",
          "Bombón negro 70 %"
        ],
        "titulo": "Contenido"
      },
      {
        "tipo": "lista",
        "items": [
          "Bebida fría o caliente",
          "Cubiertos, servilleta y toallita"
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Alérgenos: Gluten, huevo, soja, lácteos, frutos de cáscara, pescado y sulfitos. Ante cualquier duda consulta a la tripulación."
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-del-norte",
    "titulo": "Box del Norte",
    "resumen": "Box del Norte por 15,35 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Ensalada de pasta con salmón ahumado, maíz, huevo, tomate seco y nueces",
          "Picos de pan",
          "Fruta",
          "Bombón negro 70 %"
        ],
        "titulo": "Contenido"
      },
      {
        "tipo": "lista",
        "items": [
          "Bebida fría o caliente",
          "Cubiertos, servilleta y toallita"
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Alérgenos: Gluten, huevo, pescado, soja, frutos de cáscara y sulfitos. Trazas de leche. Ante cualquier duda consulta a la tripulación."
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-saludable",
    "titulo": "Box Saludable",
    "resumen": "Box Saludable por 11,35 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Ensalada de quinoa con pollo y hierbas provenzales",
          "Yogur con muesli",
          "Fruta de temporada"
        ],
        "titulo": "Contenido"
      },
      {
        "tipo": "lista",
        "items": [
          "Bebida fría o caliente",
          "Cubiertos, servilleta y toallita"
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Alérgenos: Gluten, soja, lácteos y sulfitos. Ante cualquier duda consulta a la tripulación."
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-caliente2",
    "titulo": "Box Caliente (nueva carta)",
    "resumen": "Box Caliente (nueva carta) por 12,55 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Bocadillo de paleta ibérica de cebo",
          "Patatas fritas",
          "Almendras sin sal"
        ],
        "titulo": "Contenido"
      },
      {
        "tipo": "lista",
        "items": [
          "Bebida fría o caliente",
          "Cubiertos, servilleta y toallita"
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Alérgenos: Gluten y frutos de cáscara. Trazas de huevo, leche, soja, cacahuete, mostaza y sésamo. Ante cualquier duda consulta a la tripulación."
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-frio",
    "titulo": "Box Frío",
    "resumen": "Box Frío por 15,35 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Ensalada mixta",
          "Embutidos y quesos con picos",
          "Fruta de temporada"
        ],
        "titulo": "Contenido"
      },
      {
        "tipo": "lista",
        "items": [
          "Bebida fría o caliente",
          "Cubiertos, servilleta y toallita"
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Alérgenos: Gluten, huevo, pescado, lácteos y frutos de cáscara. Ante cualquier duda consulta a la tripulación."
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-dulce",
    "titulo": "Box Dulce",
    "resumen": "Box Dulce por 15,55 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Tortita con miel",
          "Tarta de queso con avellanas y arándanos",
          "Fruta de temporada"
        ],
        "titulo": "Contenido"
      },
      {
        "tipo": "lista",
        "items": [
          "Bebida fría o caliente",
          "Cubiertos, servilleta y toallita"
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Alérgenos: Gluten, huevo, soja, lácteos y frutos de cáscara. Ante cualquier duda consulta a la tripulación."
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-salado",
    "titulo": "Box Salado",
    "resumen": "Box Salado por 14,40 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Queso curado, mini fuets y almendras con picos",
          "Bagel vegetal con atún",
          "Yogur natural"
        ],
        "titulo": "Contenido"
      },
      {
        "tipo": "lista",
        "items": [
          "Bebida fría o caliente",
          "Cubiertos, servilleta y toallita"
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Alérgenos: Gluten, huevo, pescado, lácteos y frutos de cáscara. Ante cualquier duda consulta a la tripulación."
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/comer-en-el-tren/box-ligero",
    "titulo": "Box Ligero",
    "resumen": "Box Ligero por 11,95 €.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "lista",
        "items": [
          "Ensalada de mozzarella y cherry",
          "Sándwich de queso, nueces y rúcula",
          "Fruta y galletas sin azúcares añadidos"
        ],
        "titulo": "Contenido"
      },
      {
        "tipo": "lista",
        "items": [
          "Bebida fría o caliente",
          "Cubiertos, servilleta y toallita"
        ],
        "titulo": "Incluye"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Alérgenos: Gluten, soja, lácteos y frutos de cáscara. Ante cualquier duda consulta a la tripulación."
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/tipos-asiento",
    "titulo": "Tipos de asiento",
    "resumen": "Asiento Estándar (2+2) o Confort XL (2+1) según el billete.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Billete",
          "Asiento"
        ],
        "filas": [
          [
            "Básico",
            "Estándar"
          ],
          [
            "Elige Estándar",
            "Estándar"
          ],
          [
            "Elige Confort",
            "Confort (XL)"
          ],
          [
            "Prémium",
            "Confort (XL)"
          ]
        ]
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Confort: coches en configuración 2+1, con asientos más amplios (en los AVE serie 106, 2+2).",
          "Estándar: configuración 2+2 (en los AVE 106, 3+2), con todos los servicios del tren."
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/a-bordo/coche-en-silencio",
    "titulo": "Coche en silencio",
    "resumen": "Coche tranquilo sin coste extra en asiento Estándar de AVE y Euromed.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Disponible con billete Básico y Elige Estándar en AVE (no en AVE Internacional a Francia) y Euromed, sin coste. Se compra en web, taquillas y agencias; conviene hacerlo con antelación porque se llena."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Sin llamadas de móvil.",
          "Auriculares para audio o vídeo, a volumen bajo.",
          "Dispositivos en silencio.",
          "Conversaciones breves y en voz baja."
        ],
        "titulo": "Normas"
      },
      {
        "tipo": "lista",
        "items": [
          "No pasa el bar móvil.",
          "No viajan menores de 14 años ni mascotas.",
          "No se vende a grupos.",
          "Solo megafonía imprescindible.",
          "Iluminación atenuada cuando es posible."
        ],
        "titulo": "Además"
      }
    ]
  },
  {
    "ruta": "/viajar/el-viaje/wifi",
    "titulo": "Wifi PlayRenfe",
    "resumen": "Wifi gratuito en AVE, AVE a Francia, Avlo y la mayoría de Larga Distancia.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "pasos",
        "pasos": [
          {
            "titulo": "Conéctate a la red",
            "texto": "Selecciona la red wifi PlayRenfe en tu dispositivo."
          },
          {
            "titulo": "Identifícate",
            "texto": "Con el número de billete, con tu número Más Renfe y tu DNI/NIE/pasaporte como contraseña, o con un código promocional."
          },
          {
            "titulo": "Navega",
            "texto": "Correo, redes y chat sin gastar datos."
          }
        ],
        "titulo": "Cómo conectarse"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "En viajes internacionales sin billete Renfe se usa el código promocional (pídelo al personal) junto con el documento de identidad. Los menores que viajan solos pueden usarlo con autorización de su madre, padre o tutor."
        ]
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Canal",
          "Contacto"
        ],
        "filas": [
          [
            "Teléfono",
            "(+34) 91 783 25 35"
          ],
          [
            "Correo",
            "soporteplayrenfe@renfe.es"
          ],
          [
            "Chat",
            "Desde la pantalla de registro"
          ]
        ],
        "titulo": "Soporte"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/horarios",
    "titulo": "Horarios",
    "resumen": "Consulta los horarios de AVE, Larga Distancia, Avant y Media Distancia entre dos estaciones.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Elige estación de origen y destino y la fecha del viaje para ver todos los trenes disponibles. Las ciudades con varias estaciones aparecen como «(TODAS)»."
        ]
      },
      {
        "tipo": "herramienta",
        "id": "buscador-horarios"
      },
      {
        "tipo": "cta",
        "texto": "¿Quieres comprar? Busca precios",
        "enlace": "/trenes",
        "etiqueta": "Buscar trenes"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/mapas-y-lineas",
    "titulo": "Mapas y líneas",
    "resumen": "Mapa de líneas AVE y Larga Distancia, Media Distancia y Avant, y AVE a Francia.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "En el mapa la línea morada corresponde a AVE y la gris a Larga Distancia, incluyendo trayectos nacionales e internacionales."
        ]
      },
      {
        "tipo": "herramienta",
        "id": "mapa-lineas"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Mapa Media Distancia y Avant",
            "texto": "Relaciones Avant de alta velocidad para trayectos cortos.",
            "enlace": "/viajar/informacion-util/mapas-y-lineas/media-distancia-y-avant"
          },
          {
            "titulo": "Mapa AVE Francia",
            "texto": "Rutas del AVE Internacional entre España y Francia.",
            "enlace": "/viajar/informacion-util/mapas-y-lineas/ave-francia"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/mapas-y-lineas/media-distancia-y-avant",
    "titulo": "Mapa Media Distancia y Avant",
    "resumen": "Relaciones Avant de alta velocidad para trayectos cortos.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Avant son servicios de Media Distancia con trenes de alta velocidad diseñados para trayectos cortos y viajeros frecuentes."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Madrid – Segovia – Valladolid",
          "Málaga – Córdoba – Sevilla",
          "Granada – Málaga",
          "Granada – Córdoba – Sevilla",
          "Madrid – Ciudad Real – Puertollano",
          "Madrid – Toledo",
          "Barcelona – Tarragona – Lleida",
          "Calatayud – Zaragoza",
          "Ourense – Santiago – A Coruña",
          "Barcelona – Girona",
          "Barcelona – Figueres Vilafant",
          "Valencia – Requena Utiel",
          "Salamanca – Segovia – Madrid (solo títulos multiviaje)",
          "Albacete – Cuenca – Madrid (solo títulos multiviaje)",
          "Murcia – Alicante"
        ],
        "titulo": "Relaciones Avant"
      },
      {
        "tipo": "herramienta",
        "id": "mapa-lineas"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/mapas-y-lineas/ave-francia",
    "titulo": "Mapa AVE Francia",
    "resumen": "Rutas del AVE Internacional entre España y Francia.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Rutas Barcelona–Lyon y Madrid–Barcelona–Marsella, con paradas como Girona, Figueres, Perpignan, Narbonne, Montpellier, Nîmes, Avignon o Valence."
        ]
      },
      {
        "tipo": "herramienta",
        "id": "mapa-lineas"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "AVE Francia",
            "texto": "Billetes y servicios.",
            "enlace": "/viajar/prepara-tu-viaje/ave-francia"
          }
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/equipajes",
    "titulo": "Equipajes",
    "resumen": "Hasta 3 bultos de mano con 25 kg y 290 cm en total; normas especiales para Avlo.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Concepto",
          "Límite"
        ],
        "filas": [
          [
            "Bultos de mano",
            "3 por persona"
          ],
          [
            "Peso total",
            "25 kg"
          ],
          [
            "Suma de medidas de los 3",
            "290 cm"
          ],
          [
            "Bulto más grande",
            "85x55x35 cm"
          ],
          [
            "Instrumento musical en funda",
            "30x120x38 cm"
          ],
          [
            "Bici o patinete plegado en funda",
            "180 cm sumando lados"
          ]
        ],
        "titulo": "AVE, Larga Distancia, Avant y Media Distancia"
      },
      {
        "tipo": "lista",
        "items": [
          "Maletas, bolsos, mochilas y maletines de portátil.",
          "Sillas y cochecitos de bebé plegados.",
          "Instrumentos musicales en funda dentro del límite.",
          "Bicicletas y patinetes plegados en funda de hasta 180 cm (gratis en todos los servicios regulares)."
        ],
        "titulo": "Qué cuenta como equipaje de mano"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "En el AVE Internacional a Francia las condiciones son las mismas, pero el equipaje debe ir etiquetado."
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Concepto",
          "Límite / precio"
        ],
        "filas": [
          [
            "Bolso o mochila",
            "36x27x25 cm, sin límite de peso"
          ],
          [
            "Maleta de cabina",
            "55x35x25 cm, sin límite de peso"
          ],
          [
            "Equipaje adicional (hasta 85x60x35 cm o 180 cm)",
            "10 € al comprar; 15 € después y hasta 30 min antes"
          ]
        ],
        "titulo": "Avlo"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Equipajes especiales",
            "texto": "Palos de golf, esquís, pesca, bicicletas desmontadas y transporte de armas u objetos peligrosos.",
            "enlace": "/viajar/informacion-util/equipajes/equipajes-especiales"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/equipajes/equipajes-especiales",
    "titulo": "Equipajes especiales",
    "resumen": "Palos de golf, esquís, pesca, bicicletas desmontadas y transporte de armas u objetos peligrosos.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Son bultos que por tamaño o naturaleza no cuentan como equipaje de mano. Se admite uno por persona, junto a otro bulto de mano de hasta 55x35x25 cm."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Palos de golf, equipos de esquí y de pesca deportiva, en su bolsa cerrada.",
          "Bicicletas y patinetes no eléctricos plegados o desmontados en funda de más de 180 cm y hasta 140x90x40 cm."
        ],
        "titulo": "Qué se considera equipaje especial"
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Objeto",
          "Condición"
        ],
        "filas": [
          [
            "Armas de fuego de particulares",
            "Con licencia y guía de pertenencia"
          ],
          [
            "Armas reglamentarias",
            "Personal habilitado acreditado con placa o carné"
          ],
          [
            "Armas blancas o históricas",
            "Solo como equipo reglamentario de Fuerzas y Cuerpos de Seguridad o Fuerzas Armadas"
          ],
          [
            "Armas deportivas",
            "Embaladas y acreditando estar federado"
          ],
          [
            "Herramientas cortantes o contundentes",
            "Embaladas y acreditando la profesión"
          ],
          [
            "Munición",
            "Prohibida (RD 130/2017), salvo en cargador para armas cortas con licencia B o personal habilitado"
          ]
        ],
        "titulo": "Objetos peligrosos"
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "En Avlo la política es más restrictiva: el equipaje adicional cuesta 10 € al comprar o 15 € después."
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas",
    "titulo": "Bicicletas y patinetes",
    "resumen": "Cómo viajar con bicicleta plegable, desmontada o completa y con patinete eléctrico según el tren.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Tipo",
          "Medida máxima",
          "Cercanías / MD sin reserva / Ancho Métrico",
          "MD con reserva y Avant",
          "AVE, AVE Int., Alvia, Euromed, Intercity",
          "Avlo"
        ],
        "filas": [
          [
            "Plegada",
            "180 cm sumando lados (funda opcional)",
            "Gratis",
            "Gratis",
            "Gratis",
            "Equipaje adicional"
          ],
          [
            "Desmontada",
            "Funda de 140x90x40 cm",
            "Gratis",
            "Gratis",
            "Complemento específico",
            "Equipaje adicional"
          ],
          [
            "Completa",
            "Hasta 2 m",
            "Gratis, sin reserva",
            "Complemento «Tren+bici» (sin coste)",
            "No permitida",
            "No permitida"
          ]
        ],
        "titulo": "Resumen"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Puede moverse desplegada por la estación, pero hay que plegarla antes de subir y colocarla en la zona de equipaje."
        ],
        "titulo": "Bicicleta plegable"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Hay que quitar al menos una rueda, girar el manillar paralelo al cuadro y meterla en una funda de hasta 140x90x40 cm."
        ],
        "titulo": "Bicicleta desmontada"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "En trenes de Cercanías, Regionales y Proximidad sin reserva viaja gratis (busca «Admite bicicleta sin reserva»). En Avant, MD, Regionales y Proximidad con reserva se pide el complemento «Tren+bici» («Plaza bicicleta disponible»); con abono, en taquilla o por teléfono."
        ],
        "titulo": "Bicicleta completa"
      },
      {
        "tipo": "lista",
        "items": [
          "No se admiten triciclos ni bicis especiales de más de 2 metros.",
          "Nunca cargues vehículos eléctricos en los enchufes del tren.",
          "Usa los anclajes o colócala sin invadir pasillos ni vías de evacuación.",
          "Puedes llevar además un bulto de mano y una silla infantil de bicicleta.",
          "El espacio es limitado y puede agotarse con alta ocupación.",
          "En Rodalies las condiciones las fija la Generalitat."
        ],
        "titulo": "Recuerda"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "Desde el 7 de septiembre de 2026 se admiten patinetes eléctricos, monociclos y otros VMP con batería si llevan etiqueta identificativa, marcaje del fabricante y seguro en vigor."
        ],
        "titulo": "Patinetes eléctricos y VMP"
      },
      {
        "tipo": "lista",
        "items": [
          "Gratis como equipaje especial, más un bulto de mano de hasta 55x35x25 cm.",
          "Máximo 120x50x55 cm.",
          "Plegado y apagado desde el andén y durante todo el viaje.",
          "Manejable por ti sin ayuda y en la zona de equipaje.",
          "Limpio; la funda se recomienda pero no es obligatoria.",
          "No hace falta reservar ni declararlo al comprar."
        ],
        "titulo": "En AVE, Euromed, Alvia, Intercity y Avant"
      },
      {
        "tipo": "lista",
        "items": [
          "Avlo: cuenta como equipaje adicional de pago.",
          "Cercanías y Media Distancia: sin funda, plegado y dentro de medidas."
        ],
        "titulo": "Otros trenes"
      },
      {
        "tipo": "aviso",
        "nivel": "alerta",
        "texto": "No se permite cargarlos a bordo ni llevar patinetes de alquiler compartido. Prohibidos en Cercanías de Bilbao, Cercanías de San Sebastián y regionales Miranda–Alsasua. No aplica a vehículos para PMR ni a bicicletas eléctricas."
      },
      {
        "tipo": "texto",
        "parrafos": [
          "La mayoría de estaciones tienen aparcabicis gratuitos de «U invertida» y muchas cuentan con aparcamientos protegidos."
        ],
        "titulo": "Aparcar la bici"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Aparcamientos de bicicletas",
            "texto": "Estaciones con aparcabicis abierto, cerrado, de alquiler o cercano, por núcleo de Cercanías.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos",
    "titulo": "Aparcamientos de bicicletas",
    "resumen": "Estaciones con aparcabicis abierto, cerrado, de alquiler o cercano, por núcleo de Cercanías.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Puedes dejar la bici o el patinete en la estación mientras viajas. Hay aparcamientos abiertos gratuitos y espacios cerrados o vigilados que protegen de robos y del mal tiempo."
        ]
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Aparcabicis en estaciones de larga distancia",
            "texto": "Tipos de aparcamiento de bicicletas en las principales estaciones multioperador.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos/multioperador"
          },
          {
            "titulo": "Aparcabicis: Cercanías de Asturias",
            "texto": "Estaciones de Cercanías de Asturias con aparcamiento para bicicletas.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos/asturias"
          },
          {
            "titulo": "Aparcabicis: Cercanías de Bilbao/Bizcaya",
            "texto": "Estaciones de Cercanías de Bilbao/Bizcaya con aparcamiento para bicicletas.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos/bilbao-bizcaya"
          },
          {
            "titulo": "Aparcabicis: Cercanías Cádiz",
            "texto": "Estaciones de Cercanías Cádiz con aparcamiento para bicicletas.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos/cadiz"
          },
          {
            "titulo": "Aparcabicis: Cercanías de Cantabria",
            "texto": "Estaciones de Cercanías de Cantabria con aparcamiento para bicicletas.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos/cantabria"
          },
          {
            "titulo": "Aparcabicis: Cercanías de Madrid",
            "texto": "Estaciones de Cercanías de Madrid con aparcamiento para bicicletas.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos/madrid"
          },
          {
            "titulo": "Aparcabicis: Cercanías de Málaga",
            "texto": "Estaciones de Cercanías de Málaga con aparcamiento para bicicletas.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos/malaga"
          },
          {
            "titulo": "Aparcabicis: Cercanías de Murcia / Alicante",
            "texto": "Estaciones de Cercanías de Murcia / Alicante con aparcamiento para bicicletas.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos/murcia-alicante"
          },
          {
            "titulo": "Aparcabicis: Cercanías de San Sebastián",
            "texto": "Estaciones de Cercanías de San Sebastián con aparcamiento para bicicletas.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos/san-sebastian"
          },
          {
            "titulo": "Aparcabicis: Cercanías de Sevilla",
            "texto": "Estaciones de Cercanías de Sevilla con aparcamiento para bicicletas.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos/sevilla"
          },
          {
            "titulo": "Aparcabicis: Cercanías de Valencia",
            "texto": "Estaciones de Cercanías de Valencia con aparcamiento para bicicletas.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos/valencia"
          },
          {
            "titulo": "Aparcabicis: Cercanías de Zaragoza",
            "texto": "Estaciones de Cercanías de Zaragoza con aparcamiento para bicicletas.",
            "enlace": "/viajar/informacion-util/bicicletas/aparcamientos/zaragoza"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos/multioperador",
    "titulo": "Aparcabicis en estaciones de larga distancia",
    "resumen": "Tipos de aparcamiento de bicicletas en las principales estaciones multioperador.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Estación",
          "Abierto",
          "Cerrado",
          "Alquiler",
          "Cercano",
          "Acceso carril bici"
        ],
        "filas": [
          [
            "Albacete Los Llanos",
            "Sí",
            "No",
            "Sí",
            "Sí",
            "Sí"
          ],
          [
            "Barcelona Sants",
            "Sí",
            "No",
            "Sí",
            "No",
            "Sí"
          ],
          [
            "Córdoba",
            "Sí",
            "No",
            "Sí",
            "No",
            "Sí"
          ],
          [
            "Figueres Vilafant",
            "Sí",
            "No",
            "No",
            "No",
            "No"
          ],
          [
            "Girona AV",
            "Sí",
            "No",
            "No",
            "No",
            "No"
          ],
          [
            "León",
            "No",
            "No",
            "No",
            "No",
            "Sí"
          ],
          [
            "Lleida Pirineus",
            "Sí",
            "No",
            "No",
            "No",
            "No"
          ],
          [
            "Madrid Chamartín Clara Campoamor",
            "Sí",
            "Sí",
            "Sí",
            "No",
            "No"
          ],
          [
            "Madrid Puerta de Atocha",
            "Sí",
            "No",
            "Sí",
            "Sí",
            "No"
          ],
          [
            "Pamplona",
            "Sí",
            "No",
            "No",
            "No",
            "Sí"
          ],
          [
            "Santiago de Compostela",
            "Sí",
            "No",
            "No",
            "No",
            "No"
          ],
          [
            "Valencia Joaquín Sorolla",
            "No",
            "No",
            "Sí",
            "No",
            "Sí"
          ],
          [
            "Valladolid Campo Grande",
            "Sí",
            "No",
            "No",
            "Sí",
            "Sí"
          ],
          [
            "Zaragoza Delicias",
            "Sí",
            "Sí",
            "Sí",
            "Sí",
            "Sí"
          ]
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos/asturias",
    "titulo": "Aparcabicis: Cercanías de Asturias",
    "resumen": "Estaciones de Cercanías de Asturias con aparcamiento para bicicletas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Estas estaciones disponen de algún tipo de aparcamiento para bicicletas (abierto, vigilado, cerrado o con sistema de bicicleta pública cercano)."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Avilés",
          "Gijón-Sanz Crespo",
          "Gudín Laminación",
          "La Calzada",
          "La Corredoria",
          "Llamaquique",
          "Los Campos",
          "Lugo de Llanera",
          "Lugones",
          "Nava",
          "Nubledo",
          "Oviedo",
          "Trasona",
          "Villalegre"
        ],
        "titulo": "Estaciones (14)"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos/bilbao-bizcaya",
    "titulo": "Aparcabicis: Cercanías de Bilbao/Bizcaya",
    "resumen": "Estaciones de Cercanías de Bilbao/Bizcaya con aparcamiento para bicicletas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Estas estaciones disponen de algún tipo de aparcamiento para bicicletas (abierto, vigilado, cerrado o con sistema de bicicleta pública cercano)."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Amurrio",
          "Amurrio Iparralde",
          "Areta",
          "Autonomía",
          "Bilbao La Concordia",
          "Bilbao-Intermod. Abando Indalecio Prieto",
          "Desertu-Barakaldo",
          "La Calzada",
          "Llodio",
          "Luiaondo",
          "Lutxana-Barakaldo",
          "Miribilla",
          "Muskiz",
          "Olabeaga",
          "Ollargan",
          "Peñota",
          "San Mamés",
          "Zorrotza"
        ],
        "titulo": "Estaciones (18)"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos/cadiz",
    "titulo": "Aparcabicis: Cercanías Cádiz",
    "resumen": "Estaciones de Cercanías Cádiz con aparcamiento para bicicletas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Estas estaciones disponen de algún tipo de aparcamiento para bicicletas (abierto, vigilado, cerrado o con sistema de bicicleta pública cercano)."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Cádiz",
          "Cádiz-Estadio",
          "Jerez de la Frontera",
          "La Ardila",
          "Plaza del Carmen",
          "Puerto De Santa María",
          "Puerto Real",
          "San Severiano",
          "Segunda aguada",
          "Valdelagrana"
        ],
        "titulo": "Estaciones (10)"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos/cantabria",
    "titulo": "Aparcabicis: Cercanías de Cantabria",
    "resumen": "Estaciones de Cercanías de Cantabria con aparcamiento para bicicletas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Estas estaciones disponen de algún tipo de aparcamiento para bicicletas (abierto, vigilado, cerrado o con sistema de bicicleta pública cercano)."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Adarzo",
          "Astillero",
          "Barreda",
          "Beranga",
          "Bezana",
          "Boo",
          "Boo De Piélagos",
          "Cabezón De La Sal",
          "Casar De Periedo",
          "Ceceñas",
          "Gama",
          "Gibaja",
          "Golbardo",
          "Gornazo",
          "Heras",
          "La Cantábrica",
          "La Cavada",
          "Liérganes",
          "Maliaño",
          "Maliaño Vidriera",
          "Mar",
          "Marrón",
          "Mogro",
          "Mortera",
          "Nueva Montaña",
          "Orejo",
          "Puente San Miguel",
          "Renedo",
          "Requejada",
          "San Pedro De Rudagüera",
          "Estación",
          "Aparcamiento abierto",
          "Aparcamiento vigilado",
          "Aparcamiento cerrado",
          "Sistema de bicicleta pública",
          "Santa Isabel De Quijas",
          "Santander",
          "Solares",
          "Torrelavega",
          "Torrelavega-Centro",
          "Treto",
          "Unquera",
          "Valdecilla",
          "Villaverde De Pontones",
          "Virgen De La Peña"
        ],
        "titulo": "Estaciones (45)"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos/madrid",
    "titulo": "Aparcabicis: Cercanías de Madrid",
    "resumen": "Estaciones de Cercanías de Madrid con aparcamiento para bicicletas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Estas estaciones disponen de algún tipo de aparcamiento para bicicletas (abierto, vigilado, cerrado o con sistema de bicicleta pública cercano)."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Alcalá de Henares",
          "Alcalá De Henares-Universidad",
          "Alcobendas-San Sebastián de los Reyes",
          "Alcorcón",
          "Aluche",
          "Aranjuez",
          "Aravaca",
          "Asamblea De Madrid-Entrevías",
          "Azuqueca",
          "Cercedilla",
          "Ciempozuelos",
          "Colmenar Viejo",
          "Coslada",
          "Cuatro Vientos",
          "Delicias",
          "Doce de Octubre",
          "El Barrial-Centro Comercial Pozuelo",
          "El Casar",
          "El Escorial",
          "El Pozo",
          "Embajadores",
          "Fuencarral",
          "Fuenlabrada",
          "Fuente de la Mora",
          "Getafe-Centro",
          "Getafe-Sector 3",
          "La Garena",
          "La Serna-Fuenlabrada",
          "Laguna",
          "Las Águilas",
          "Estación",
          "Aparcamiento abierto",
          "Aparcamiento vigilado",
          "Aparcamiento cerrado",
          "Sistema de bicicleta pública",
          "Las Margaritas",
          "Las Matas",
          "Las Retamas",
          "Las Rozas",
          "Las Zorreras-Navalquejigo",
          "Leganés",
          "Madrid-Atocha Cercanías",
          "Madrid-Chamartín-Clara Campoamor",
          "Maestra Justa Freire-Polidep. Aluche",
          "Majadahonda",
          "Meco",
          "Méndez álvaro P.v.",
          "Mirasierra-Paco de Lucía",
          "Móstoles",
          "Nuevos Ministerios",
          "Orcasitas",
          "Parque Polvoranca",
          "Pinto",
          "Pirámides",
          "Pitis",
          "Pozuelo",
          "Príncipe Pío",
          "Puente Alcocer",
          "Ramón Y Cajal",
          "Recoletos",
          "San Cristóbal Industrial",
          "San Fernando De Henares",
          "San José De Valderas",
          "Santa Eugenia",
          "Sol",
          "Estación",
          "Aparcamiento abierto",
          "Aparcamiento vigilado",
          "Aparcamiento cerrado",
          "Sistema de bicicleta pública",
          "Soto del Henares",
          "Torrejón de Ardoz",
          "Tres Cantos",
          "Universidad-Cantoblanco",
          "Valdebebas",
          "Valdelasfuentes",
          "Valdemoro",
          "Vallecas",
          "Vicálvaro",
          "Villalba De Guadarrama",
          "Villaverde Alto",
          "Villaverde Bajo",
          "Zarzaquemada"
        ],
        "titulo": "Estaciones (83)"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos/malaga",
    "titulo": "Aparcabicis: Cercanías de Málaga",
    "resumen": "Estaciones de Cercanías de Málaga con aparcamiento para bicicletas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Estas estaciones disponen de algún tipo de aparcamiento para bicicletas (abierto, vigilado, cerrado o con sistema de bicicleta pública cercano)."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Benalmádena-Arroyo de la Miel",
          "El Pinillo",
          "Málaga M.z. Cercanías",
          "Victoria Kent"
        ],
        "titulo": "Estaciones (4)"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos/murcia-alicante",
    "titulo": "Aparcabicis: Cercanías de Murcia / Alicante",
    "resumen": "Estaciones de Cercanías de Murcia / Alicante con aparcamiento para bicicletas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Estas estaciones disponen de algún tipo de aparcamiento para bicicletas (abierto, vigilado, cerrado o con sistema de bicicleta pública cercano)."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Águilas",
          "Águilas-El Labradorcico",
          "Alcantarilla - Los Romanos",
          "Alhama de Murcia",
          "Alicante/Alacant-Terminal",
          "Almendricos",
          "Beniel",
          "Callosa De Segura",
          "Elche/Elx-Carrús",
          "Elche/Elx-Parc",
          "Jaravía",
          "La Hoya",
          "Librilla",
          "Lorca-San Diego",
          "Lorca-Sutullena",
          "Murcia del Carmen",
          "Orihuela-Miguel Hernández",
          "Puerto Lumbreras",
          "Pulpí",
          "San Isidro-Albatera-Catral",
          "Sant Gabriel",
          "Sant Vicent Centre",
          "Torrellano",
          "Totana",
          "Universidad de Alicante"
        ],
        "titulo": "Estaciones (25)"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos/san-sebastian",
    "titulo": "Aparcabicis: Cercanías de San Sebastián",
    "resumen": "Estaciones de Cercanías de San Sebastián con aparcamiento para bicicletas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Estas estaciones disponen de algún tipo de aparcamiento para bicicletas (abierto, vigilado, cerrado o con sistema de bicicleta pública cercano)."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Ategorrieta",
          "Beasain",
          "Gros",
          "Herrera",
          "Intxaurrondo",
          "Irun",
          "Lezo-Rentería",
          "Loiola",
          "Ordizia",
          "San Sebastián-Donostia",
          "Tolosa",
          "Tolosa-Centro",
          "Zumarraga"
        ],
        "titulo": "Estaciones (13)"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos/sevilla",
    "titulo": "Aparcabicis: Cercanías de Sevilla",
    "resumen": "Estaciones de Cercanías de Sevilla con aparcamiento para bicicletas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Estas estaciones disponen de algún tipo de aparcamiento para bicicletas (abierto, vigilado, cerrado o con sistema de bicicleta pública cercano)."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Bellavista",
          "Benacazón",
          "Camas",
          "Cartuja",
          "Dos Hermanas",
          "Estadio Olímpico",
          "Lebrija",
          "Palacio de Congresos",
          "Salteras",
          "San Bernardo",
          "San Jeronimo",
          "Sanlúcar La Mayor",
          "Sevilla-Santa Justa",
          "Valencina-Santiponce",
          "Villanueva Del Ariscal Y Olivares",
          "Villanueva Del Río-Minas"
        ],
        "titulo": "Estaciones (16)"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos/valencia",
    "titulo": "Aparcabicis: Cercanías de Valencia",
    "resumen": "Estaciones de Cercanías de Valencia con aparcamiento para bicicletas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Estas estaciones disponen de algún tipo de aparcamiento para bicicletas (abierto, vigilado, cerrado o con sistema de bicicleta pública cercano)."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Albal",
          "Albuixech",
          "Alfafar-Benetússer",
          "Algemesí",
          "Almenara",
          "Alzira",
          "Benifaió",
          "Buñol",
          "Burriana-Alquerías Niño Perdido",
          "Carcaixent",
          "Castelló De La Plana",
          "Catarroja",
          "Cheste",
          "Chilches/Xilxes",
          "Chiva",
          "Cullera",
          "Gandia",
          "La Pobla Llarga",
          "L´alcúdia De Crespins",
          "Lenova-Manuel",
          "Loriguilla-Reva",
          "Massanassa",
          "Moixent",
          "Nules La Villavella",
          "Puçol",
          "Sagunt",
          "Silla",
          "Sollana",
          "Sueca",
          "Tavernes De La Valldigna",
          "Estación",
          "Aparcamiento abierto",
          "Aparcamiento vigilado",
          "Aparcamiento cerrado",
          "Sistema de bicicleta pública",
          "Utiel",
          "València-Cabanyal",
          "València-Estació Del Nord",
          "València-La Font De Sant Lluís",
          "València-Sant Isidre",
          "Xàtiva",
          "Xeraco",
          "Xirivella-Alqueries"
        ],
        "titulo": "Estaciones (43)"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/bicicletas/aparcamientos/zaragoza",
    "titulo": "Aparcabicis: Cercanías de Zaragoza",
    "resumen": "Estaciones de Cercanías de Zaragoza con aparcamiento para bicicletas.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Estas estaciones disponen de algún tipo de aparcamiento para bicicletas (abierto, vigilado, cerrado o con sistema de bicicleta pública cercano)."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Casetas",
          "Utebo",
          "Zaragoza Delicias",
          "Zaragoza-Goya",
          "Zaragoza-Miraflores",
          "Zaragoza-Portillo"
        ],
        "titulo": "Estaciones (6)"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/mascotas",
    "titulo": "Mascotas",
    "resumen": "Mascotas de hasta 10 kg en transportín y perros de hasta 40 kg sin transportín, según el tren.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Tren",
          "Animales",
          "Condiciones",
          "Precio"
        ],
        "filas": [
          [
            "AVE, AVE Internacional y Larga Distancia",
            "Perros, gatos, hurones, hámsteres, cobayas, conejos y aves no de corral",
            "Hasta 10 kg, transportín de 60x35x35 cm, 1 por persona, no ocupa plaza",
            "Gratis con Prémium; 10 € con Básico o Elige; 25 % del viaje Estándar con Bono AVE"
          ],
          [
            "Avlo",
            "Los mismos",
            "Hasta 10 kg en transportín",
            "10 €"
          ],
          [
            "Media Distancia y Avant",
            "Los mismos",
            "Hasta 10 kg en transportín",
            "25 % de la tarifa general"
          ],
          [
            "Media Distancia Ancho Métrico",
            "Perros, gatos y aves",
            "Sin límite de peso, con correa; perros con bozal; sin transportín",
            "Gratis"
          ],
          [
            "Cercanías",
            "Perros, gatos y aves",
            "Sin límite de peso, con correa y bozal; 1 por persona",
            "Gratis"
          ]
        ],
        "titulo": "Mascotas pequeñas"
      },
      {
        "tipo": "texto",
        "parrafos": [
          "En AVE, AVE Internacional (solo tramo español), Avlo, Larga Distancia, Avant y Media Distancia (salvo trenes con enlace o con transporte alternativo) se admite un perro de hasta 40 kg sin transportín. Los trenes que lo permiten muestran una huella al comprar."
        ],
        "titulo": "Perros de hasta 40 kg"
      },
      {
        "tipo": "lista",
        "items": [
          "No se admiten razas potencialmente peligrosas, cachorros menores de 1 año ni hembras en celo.",
          "Un perro grande por persona y dos por tren, en un coche asignado («pet friendly»).",
          "Viaja en la plaza de ventanilla contigua; en Avant y Media Distancia no puede subir al asiento.",
          "Bozal y correa no extensible de máx. 1,5 m en estación y embarque; durante el viaje, atado y sin bozal.",
          "Precio: 40 € en AVE, Avlo y Larga Distancia (en AVE y LD solo con Elige Estándar); en Avant y MD, lo mismo que un billete a tarifa general.",
          "Se compra en web, app y agencias hasta 24 horas antes; sin selección de asiento ni cambios; anulación según el billete.",
          "En AVE, Avlo, Euromed, Intercity y Avant se entrega un kit (funda y alfombrilla); en MD no.",
          "Lleva tu kit de limpieza (empapador, toallitas, bolsas, desinfectante) y la cartilla o pasaporte europeo actualizados."
        ],
        "titulo": "Condiciones"
      },
      {
        "tipo": "lista",
        "items": [
          "Perros guía y de asistencia: siempre gratis y sin límites; el RD 409/2025 garantiza también el acceso de los que están en formación si llevan distintivo visible.",
          "En el combinado Tren + Bus no se admiten mascotas.",
          "Recomendación: manta propia, juguete sin ruido y no darle de comer en las 3 horas previas."
        ],
        "titulo": "Además"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/donde-comprar",
    "titulo": "Dónde comprar",
    "resumen": "Web, app, teléfono, estación, agencias y puntos de venta en el extranjero.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Canal",
          "Detalles"
        ],
        "filas": [
          [
            "renfe.com",
            "Todas las ofertas y sin gastos de gestión. Pago con tarjeta (Mastercard, Visa, American Express), PayPal, Bizum, Puntos Renfe, Google Pay y Apple Pay."
          ],
          [
            "App Renfe",
            "iPhone, Android y Huawei; sin gastos de gestión. Compra, gestión, horarios, puntualidad y Puntos Renfe."
          ],
          [
            "Teléfono 912 320 320",
            "24 horas todos los días. Billete en el móvil, en casa o por correo; pago con puntos, tarjeta o en metálico si se envía por correo."
          ],
          [
            "Estación",
            "Taquillas para compra, gestión y atención; máquinas autoventa con pago con tarjeta."
          ],
          [
            "Agencias de viajes",
            "Presenciales y online."
          ],
          [
            "Extranjero",
            "Puntos de venta internacionales y agencias."
          ]
        ]
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Solo en renfe.com y la app se accede a todos los descuentos sin gastos de gestión. Excepcionalmente se puede pagar a bordo el viaje, el tipo de asiento o una prolongación de recorrido."
      },
      {
        "tipo": "aviso",
        "nivel": "info",
        "texto": "Los billetes AVE y Larga Distancia son nominativos: lleva documento de identidad con foto."
      },
      {
        "tipo": "cta",
        "texto": "Compra tu billete",
        "enlace": "/",
        "etiqueta": "Buscar billetes"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Agencias internacionales",
            "texto": "Compra billetes desde fuera de España a través de agencias y puntos de venta autorizados.",
            "enlace": "/viajar/informacion-util/donde-comprar/agencias-internacionales"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/donde-comprar/agencias-internacionales",
    "titulo": "Agencias internacionales",
    "resumen": "Compra billetes desde fuera de España a través de agencias y puntos de venta autorizados.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Si vives fuera de España puedes comprar a través de agencias internacionales autorizadas o de la web y la app, que no tienen gastos de gestión."
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/aplicaciones",
    "titulo": "Aplicaciones",
    "resumen": "Apps para comprar, consultar horarios y planificar el viaje.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "App Renfe",
            "texto": "Horarios de AVE, Avant, Larga y Media Distancia; compra, cambio y anulación de billetes y abonos; datos personales y Puntos Renfe."
          },
          {
            "titulo": "App Cercanías",
            "texto": "Horarios, mapas, incidencias, rutas y conexiones. En Barcelona, Madrid, València, Málaga, Cádiz, Sevilla, Zaragoza, Alicante y Murcia, también compra, tiempos de espera, vía, accesibilidad y transbordos."
          },
          {
            "titulo": "Renfe en Alexa",
            "texto": "Consulta horarios y precios de AVE con la voz, con recomendaciones en destino."
          },
          {
            "titulo": "Rail Planner (Interrail)",
            "texto": "Planifica viajes por Europa, reserva asientos y consigue ventajas."
          },
          {
            "titulo": "Dōcō Mobility",
            "texto": "Combina tren, taxi, VTC y moto eléctrica."
          }
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/menores-que-viajan-solos",
    "titulo": "Menores que viajan solos",
    "resumen": "Servicio para niños de 6 a 13 años con billete Prémium o Elige Confort en AVE y Larga Distancia.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "El servicio permite que menores de 6 a 13 años (inclusive) viajen sin adulto bajo la supervisión del personal de a bordo."
        ]
      },
      {
        "tipo": "lista",
        "items": [
          "Se solicita al comprar en taquilla, teléfono, oficinas de venta o agencias, con al menos 48 horas de antelación.",
          "Con billete Prémium o Elige Confort en la mayoría de AVE y Larga Distancia.",
          "Máximo 4 menores por tren y llegada a destino no posterior a las 22:00.",
          "El día del viaje, presentarse 45 minutos antes: el progenitor o tutor rellena un formulario."
        ],
        "titulo": "Condiciones"
      },
      {
        "tipo": "lista",
        "items": [
          "No pueden comprar a bordo sin autorización; el menú infantil se pide al comprar el billete.",
          "Estos billetes no tienen el descuento de niño.",
          "Pueden usar el wifi con autorización del tutor."
        ],
        "titulo": "Ten en cuenta"
      },
      {
        "tipo": "aviso",
        "nivel": "alerta",
        "texto": "En AVE, Larga Distancia y Avant los menores de 14 años deben ir con un adulto o con este servicio."
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/servicio-de-asistencia",
    "titulo": "Servicio de asistencia (Adif Acerca)",
    "resumen": "Asistencia gratuita a personas con discapacidad o movilidad reducida en estaciones y al subir o bajar del tren.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "texto",
        "parrafos": [
          "Adif Acerca es el servicio gratuito de Adif que orienta, informa y ayuda a personas con discapacidad o movilidad reducida en la estación y al subir y bajar del tren."
        ]
      },
      {
        "tipo": "tabla",
        "columnas": [
          "Modalidad",
          "Plazo de solicitud",
          "Estaciones"
        ],
        "filas": [
          [
            "Servicio permanente",
            "Hasta 30 minutos antes",
            "70"
          ],
          [
            "Servicio puntual",
            "Hasta 12 horas antes",
            "76"
          ]
        ],
        "titulo": "Modalidades"
      },
      {
        "tipo": "lista",
        "items": [
          "Silla de ruedas propia para pasar a un asiento: debe ser plegable.",
          "Otras dificultades de movilidad: silla del servicio y ayuda para subir y bajar.",
          "Discapacidad auditiva: apoyos técnicos de comunicación.",
          "Discapacidad visual: acompañamiento hasta el asiento.",
          "Discapacidad intelectual: orientación y acompañamiento.",
          "Indica si vas con acompañante o perro guía."
        ],
        "titulo": "Indica tus necesidades"
      },
      {
        "tipo": "pasos",
        "pasos": [
          {
            "titulo": "Solicítalo",
            "texto": "Oficina Adif Acerca, oca.asistenciapmr@adif.es o 91 774 40 40; también al comprar, en el 91 320 320, la Línea 900 400 555 (discapacidad visual) o videollamada en lengua de signos (discapacidad auditiva)."
          },
          {
            "titulo": "Recibe el recordatorio",
            "texto": "Adif Acerca envía un mensaje 48 horas antes."
          },
          {
            "titulo": "Preséntate",
            "texto": "En la oficina de Adif Acerca de la estación de origen a la hora indicada."
          },
          {
            "titulo": "Al llegar",
            "texto": "No te muevas del asiento hasta que llegue el asistente."
          }
        ],
        "titulo": "Cómo funciona"
      },
      {
        "tipo": "tarjetas",
        "tarjetas": [
          {
            "titulo": "Consejos y preguntas frecuentes",
            "texto": "Medidas de sillas de ruedas, viajes en grupo y equipaje con asistencia.",
            "enlace": "/viajar/informacion-util/servicio-de-asistencia/consejos-para-viaje"
          },
          {
            "titulo": "Contacto Adif Acerca",
            "texto": "Oficina, correo, teléfono y dirección postal del servicio de asistencia.",
            "enlace": "/viajar/informacion-util/servicio-de-asistencia/contacto"
          }
        ],
        "titulo": "En esta sección"
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/servicio-de-asistencia/consejos-para-viaje",
    "titulo": "Consejos y preguntas frecuentes",
    "resumen": "Medidas de sillas de ruedas, viajes en grupo y equipaje con asistencia.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "faq",
        "titulo": "Preguntas frecuentes",
        "preguntas": [
          {
            "p": "¿Qué medidas puede tener mi silla o escúter?",
            "r": "Máximo 700 mm de ancho, 1.300 mm de fondo y 1.400 mm de alto (RD 1544/2007 y RD 537/2019). Si viajas en plaza normal, deben ser plegables."
          },
          {
            "p": "¿Y si mi tren de Media Distancia no tiene plaza asignada?",
            "r": "Pide la plaza H en el 912 320 320; también la silla del servicio si la necesitas."
          },
          {
            "p": "¿Otros dispositivos de movilidad?",
            "r": "Consulta en la Oficina Central Adif Acerca si pueden embarcar."
          },
          {
            "p": "¿Viajes en grupo?",
            "r": "La Oficina Central Adif Acerca asesora: 91 774 40 40 / oca.asistenciapmr@adif.es."
          },
          {
            "p": "¿Límite de equipaje?",
            "r": "En España, 3 bultos de mano con 25 kg y 290 cm en total. Fuera de España, 15 kg."
          }
        ]
      }
    ]
  },
  {
    "ruta": "/viajar/informacion-util/servicio-de-asistencia/contacto",
    "titulo": "Contacto Adif Acerca",
    "resumen": "Oficina, correo, teléfono y dirección postal del servicio de asistencia.",
    "seccion": "viajar",
    "bloques": [
      {
        "tipo": "tabla",
        "columnas": [
          "Canal",
          "Datos"
        ],
        "filas": [
          [
            "Presencial",
            "Oficina Adif Acerca en estaciones con servicio permanente"
          ],
          [
            "Correo",
            "oca.asistenciapmr@adif.es"
          ],
          [
            "Incidencias y reclamaciones",
            "Sede electrónica de Adif"
          ],
          [
            "Teléfono",
            "917 744 040 (todos los días de 6:00 a 0:00)"
          ],
          [
            "Correo postal",
            "Oficina Central Adif Acerca, edificio andén vía 1, estación Madrid Chamartín-Clara Campoamor, C/ Agustín de Foxá 48, 28046 Madrid"
          ]
        ]
      }
    ]
  }
];
