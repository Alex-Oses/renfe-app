import { deflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { lineasCsv, registrosCsv } from "./csv.js";
import { leerCatalogo } from "./gtfs/avld.js";
import { leerEstacionesCsv } from "./gtfs/estaciones.js";
import { fechaGtfs, horaGtfs, permiteGtfs, booleanoGtfs } from "./gtfs/tiempo.js";
import { normalizarNombre, tipoServicio } from "./gtfs/tipo-servicio.js";
import { descomprimirZip } from "./zip.js";

// --- utilidades de prueba ---------------------------------------------------

/** Construye un ZIP en memoria (método 0 y 8) para probar el lector. */
function crearZip(entradas: Record<string, string>, comprimir = true): Buffer {
  const locales: Buffer[] = [];
  const centrales: Buffer[] = [];
  let desplazamiento = 0;

  for (const [nombre, contenido] of Object.entries(entradas)) {
    const datos = Buffer.from(contenido, "utf8");
    const cuerpo = comprimir ? deflateRawSync(datos) : datos;
    const nombreBuffer = Buffer.from(nombre, "utf8");
    const metodo = comprimir ? 8 : 0;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(metodo, 8);
    local.writeUInt32LE(cuerpo.length, 18);
    local.writeUInt32LE(datos.length, 22);
    local.writeUInt16LE(nombreBuffer.length, 26);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(metodo, 10);
    central.writeUInt32LE(cuerpo.length, 20);
    central.writeUInt32LE(datos.length, 24);
    central.writeUInt16LE(nombreBuffer.length, 28);
    central.writeUInt32LE(desplazamiento, 42);

    locales.push(local, nombreBuffer, cuerpo);
    centrales.push(central, nombreBuffer);
    desplazamiento += local.length + nombreBuffer.length + cuerpo.length;
  }

  const directorio = Buffer.concat(centrales);
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0);
  fin.writeUInt16LE(Object.keys(entradas).length, 8);
  fin.writeUInt16LE(Object.keys(entradas).length, 10);
  fin.writeUInt32LE(directorio.length, 12);
  fin.writeUInt32LE(desplazamiento, 16);

  return Buffer.concat([...locales, directorio, fin]);
}

/** Cabecera y filas con el relleno de espacios que mete Renfe al final de línea. */
function gtfs(cabecera: string, filas: string[][]): string {
  const linea = (campos: string[]): string => `${campos.join(",")}${" ".repeat(20)}`;
  return [linea(cabecera.split(",")), ...filas.map(linea)].join("\n");
}

const ESTACIONES_CSV = [
  '"CODIGO";"DESCRIPCION";"LATITUD";"LONGITUD";"DIRECION";"CP";"POBLACION";"PROVINCIA";"PAIS";"CERCANIAS";"ANCHO MÉTRICO";"COMUN"',
  '"01003";"ARAHAL";"37.2680810";"-5.5485140";"C/ Virgen, S/N";"41600";"ARAHAL";"SEVILLA";"ESPAÑA";"NO";"NO";""',
  '"01005";"MARCHENA";"37.3342820";" -5.4255190 ";"Avda. Maestro, 8";"41620";"MARCHENA";"SEVILLA";"ESPAÑA";"NO";"NO";""',
].join("\r\n");

const estacionesCsv = (): Buffer => Buffer.from(ESTACIONES_CSV, "latin1");

const feed = (): Buffer =>
  crearZip({
    "routes.txt": gtfs("route_id,agency_id,route_short_name,route_long_name,route_desc,route_type,route_url,route_color,route_text_color", [
      ["R1", "1071", "AVE", "", "", "2", "", "F2F5F5", ""],
      ["R2", "1071", "PROXIMDAD", "", "", "2", "", "f2f5f5", ""],
    ]),
    "stops.txt": gtfs("stop_id,stop_name,stop_lat,stop_lon,wheelchair_boarding", [
      ["01003", "ARAHAL", "37.2680810", "-5.5485140", "1"],
      ["01005", "MARCHENA", "37.3342820", "-5.4255190", "0"],
      ["99999", "PARADA SUELTA", "40.0", "-3.0", ""],
    ]),
    "calendar.txt": gtfs(
      "service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date",
      [["S1", "1", "1", "1", "1", "1", "0", "0", "20261001", "20261231"]],
    ),
    "calendar_dates.txt": gtfs("service_id,date,exception_type", [
      ["S1", "20261028", "2"],
      ["S1", "20261225", "1"],
      ["NO_EXISTE", "20261028", "1"],
    ]),
    "trips.txt": gtfs(
      "route_id,service_id,trip_id,trip_headsign,trip_short_name,direction_id,block_id,shape_id,wheelchair_accessible",
      [
        ["R1", "S1", "T1", "Madrid", "0019012026-10-28", "", "", "", "1"],
        ["R2", "S1", "T2", "Sevilla", "0020022026-10-28", "", "", "", "2"],
        ["R2", "S1", "T3", "Sin paradas", "0030032026-10-28", "", "", "", ""],
      ],
    ),
    "stop_times.txt": gtfs("trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type", [
      ["T1", "8:30:00", "8:30:00", "01003", "01", "0", "1"],
      ["T1", "25:10:00", "25:10:00", "01005", "02", "1", "0"],
      ["T2", "", "9:00:00", "01005", "01", "0", "0"],
      ["T2", "10:00:00", "", "99999", "02", "0", "0"],
    ]),
  });

// --- csv --------------------------------------------------------------------

describe("csv", () => {
  it("separa por comas y recorta el relleno de espacios de Renfe", () => {
    const filas = [...lineasCsv('a,b  \r\n"1,5","di ""hola"""\r\n')];
    expect(filas).toEqual([
      ["a", "b  "],
      ["1,5", 'di "hola"'],
    ]);
  });

  it("usa la primera línea como cabecera y se salta las líneas de relleno", () => {
    const registros = [...registrosCsv('a,b\n1,2\n   \n3,4\n')];
    expect(registros).toEqual([
      { a: "1", b: "2" },
      { a: "3", b: "4" },
    ]);
  });

  it("acepta `;` como separador (estaciones.csv)", () => {
    const registros = [...registrosCsv('"CODIGO";"DESCRIPCION"\n"01003";"ARAHAL"\n', { separador: ";" })];
    expect(registros).toEqual([{ CODIGO: "01003", DESCRIPCION: "ARAHAL" }]);
  });
});

// --- zip --------------------------------------------------------------------

describe("zip", () => {
  it("lee entradas comprimidas con deflate", () => {
    const entradas = descomprimirZip(crearZip({ "a.txt": "hola", "b.txt": "adiós" }));
    expect(entradas.get("a.txt")?.toString("utf8")).toBe("hola");
    expect(entradas.get("b.txt")?.toString("utf8")).toBe("adiós");
  });

  it("lee entradas sin comprimir", () => {
    const entradas = descomprimirZip(crearZip({ "a.txt": "hola" }, false));
    expect(entradas.get("a.txt")?.toString("utf8")).toBe("hola");
  });

  it("falla con un fichero que no es un zip", () => {
    expect(() => descomprimirZip(Buffer.from("no soy un zip"))).toThrow(/fin del directorio central/);
  });
});

// --- tiempo -----------------------------------------------------------------

describe("tiempo", () => {
  it("normaliza las horas de GTFS y respeta las que pasan de 24 h", () => {
    expect(horaGtfs("8:30:00")).toBe("08:30:00");
    expect(horaGtfs("25:10:00")).toBe("25:10:00");
    expect(horaGtfs("7:05")).toBe("07:05:00");
    expect(horaGtfs("  ")).toBeNull();
  });

  it("rechaza horas imposibles", () => {
    expect(() => horaGtfs("ocho y media")).toThrow(/Hora GTFS/);
  });

  it("convierte las fechas YYYYMMDD a ISO", () => {
    expect(fechaGtfs("20261028")).toBe("2026-10-28");
    expect(() => fechaGtfs("2026-10-28")).toThrow(/Fecha GTFS/);
    expect(() => fechaGtfs("20260231")).toThrow(/inexistente/);
  });

  it("interpreta pickup/drop_off: 0 o ausente es «sí»", () => {
    expect(permiteGtfs("0")).toBe(true);
    expect(permiteGtfs("")).toBe(true);
    expect(permiteGtfs(undefined)).toBe(true);
    expect(permiteGtfs("1")).toBe(false);
  });

  it("interpreta accesibilidad: 1 sí, 2 no, 0 desconocido", () => {
    expect(booleanoGtfs("1")).toBe(true);
    expect(booleanoGtfs("2")).toBe(false);
    expect(booleanoGtfs("0")).toBeNull();
    expect(booleanoGtfs(undefined)).toBeNull();
  });
});

// --- tipo de servicio -------------------------------------------------------

describe("tipoServicio", () => {
  it("clasifica por el nombre corto completo del feed real", () => {
    expect(tipoServicio("avld", "AVE", "")).toBe("ave");
    expect(tipoServicio("avld", "AVE INT", "")).toBe("ave");
    expect(tipoServicio("avld", "AVLO", "")).toBe("avlo");
    expect(tipoServicio("avld", "AVANT EXP", "")).toBe("avant");
    expect(tipoServicio("avld", "ALVIA", "")).toBe("alvia");
    expect(tipoServicio("avld", "Intercity", "")).toBe("intercity");
    expect(tipoServicio("avld", "EUROMED", "")).toBe("intercity");
    expect(tipoServicio("avld", "MD", "")).toBe("media_distancia");
    expect(tipoServicio("avld", "REG.EXP.", "")).toBe("regional");
  });

  it("no confunde PROXIMDAD con MD (búsqueda por nombre completo, no por subcadena)", () => {
    expect(tipoServicio("avld", "PROXIMDAD", "")).toBe("media_distancia");
    expect(tipoServicio("avld", "PROXIMDAD", "")).not.toBe("otro");
  });

  it("en Cercanías todo es cercanías, sin mirar el nombre", () => {
    expect(tipoServicio("cercanias", "C1", "Cercanías Madrid")).toBe("cercanias");
  });

  it("un producto nuevo cae en «otro» en vez de clasificarse mal", () => {
    expect(tipoServicio("avld", "TREN TURÍSTICO", "")).toBe("otro");
  });

  it("normaliza acentos, mayúsculas y puntuación", () => {
    expect(normalizarNombre("Reg.Exp.")).toBe("REGEXP");
    expect(normalizarNombre("Cercanías  Ávila")).toBe("CERCANIAS AVILA");
  });
});

// --- estaciones.csv ---------------------------------------------------------

describe("estaciones.csv", () => {
  it("lee latin-1 con `;` y todos los campos entre comillas", () => {
    const { estaciones, descartadas } = leerEstacionesCsv(estacionesCsv());
    expect(descartadas).toEqual([]);
    expect(estaciones).toHaveLength(2);
    expect(estaciones[0]).toEqual({
      id: "01003",
      nombre: "ARAHAL",
      ciudad: "ARAHAL",
      provincia: "SEVILLA",
      lat: 37.268081,
      lon: -5.548514,
      accesible: null,
    });
    // Los espacios de relleno de la longitud no rompen el número.
    expect(estaciones[1]?.lon).toBeCloseTo(-5.425519);
  });

  it("descarta filas sin nombre o con coordenadas imposibles", () => {
    const csv = [
      '"CODIGO";"DESCRIPCION";"LATITUD";"LONGITUD";"POBLACION";"PROVINCIA"',
      '"1";"SIN COORDENADAS";"";"";"";""',
      '"2";"";"40.0";"-3.0";"";""',
      '"3";"BIEN";"40.0";"-3.0";"MADRID";"MADRID"',
    ].join("\n");
    const { estaciones, descartadas } = leerEstacionesCsv(Buffer.from(csv, "latin1"));
    expect(estaciones.map((estacion) => estacion.id)).toEqual(["3"]);
    expect(descartadas).toEqual([
      { codigo: "1", motivo: "coordenadas no válidas" },
      { codigo: "2", motivo: "sin DESCRIPCION" },
    ]);
  });
});

// --- feed completo ----------------------------------------------------------

describe("leerCatalogo", () => {
  const catalogo = leerCatalogo(feed(), estacionesCsv());

  it("cuenta las filas de cada fichero", () => {
    expect(catalogo.informe.ficheros).toEqual({
      "routes.txt": 2,
      "stops.txt": 3,
      "trips.txt": 2,
      "stop_times.txt": 4,
      "calendar.txt": 1,
      "calendar_dates.txt": 2,
    });
  });

  it("usa estaciones.csv como fuente canónica y añade las paradas sueltas", () => {
    expect(catalogo.estaciones).toHaveLength(3);
    expect(catalogo.informe.estacionesCsv).toBe(2);
    expect(catalogo.informe.paradasSinCodigo).toBe(1);
    expect(catalogo.estaciones.map((estacion) => estacion.id).sort()).toEqual(["01003", "01005", "avld:99999"]);
    expect(catalogo.informe.avisos.join("\n")).toMatch(/99999/);
  });

  it("rellena la accesibilidad desde stops.txt y no la inventa cuando es 0", () => {
    const porId = new Map(catalogo.estaciones.map((estacion) => [estacion.id, estacion]));
    expect(porId.get("01003")?.accesible).toBe(true);
    expect(porId.get("01005")?.accesible).toBeNull();
  });

  it("nunca deja rutas.nombre a null (usa el nombre corto de respaldo)", () => {
    expect(catalogo.rutas).toEqual([
      { feed: "avld", id: "R1", nombre: "AVE", nombre_corto: "AVE", tipo_servicio: "ave", color: "F2F5F5" },
      {
        feed: "avld",
        id: "R2",
        nombre: "PROXIMDAD",
        nombre_corto: "PROXIMDAD",
        tipo_servicio: "media_distancia",
        color: "F2F5F5",
      },
    ]);
  });

  it("descarta las excepciones de servicios que no existen", () => {
    expect(catalogo.excepciones).toEqual([
      { feed: "avld", servicio_id: "S1", fecha: "2026-10-28", tipo: "eliminado" },
      { feed: "avld", servicio_id: "S1", fecha: "2026-12-25", tipo: "añadido" },
    ]);
    expect(catalogo.informe.excepcionesHuerfanas).toBe(1);
  });

  it("resume cada viaje con su origen, destino y horas reales", () => {
    const porId = new Map(catalogo.viajes.map((viaje) => [viaje.id, viaje]));
    expect(catalogo.viajes).toHaveLength(2);

    const t1 = porId.get("T1");
    expect(t1).toMatchObject({
      origen_id: "01003",
      destino_id: "01005",
      salida: "08:30:00",
      llegada: "25:10:00",
      num_paradas: 2,
      sentido: null,
      accesible: true,
      fecha_inicio: "2026-10-01",
      fecha_fin: "2026-12-31",
    });

    const t2 = porId.get("T2");
    expect(t2).toMatchObject({
      origen_id: "01005",
      destino_id: "avld:99999",
      salida: "09:00:00",
      llegada: "10:00:00",
      accesible: false,
    });
    expect(catalogo.informe.viajesSinParadas).toBe(1);
  });

  it("guarda los horarios con secuencia numérica y recoge/deja interpretados", () => {
    expect(catalogo.horarios).toHaveLength(4);
    expect(catalogo.horarios[0]).toEqual({
      feed: "avld",
      viaje_id: "T1",
      secuencia: 1,
      estacion_id: "01003",
      llega: "08:30:00",
      sale: "08:30:00",
      recoge: true,
      deja: false,
    });
  });

  it("avisa si el zip no es el de AV/LD/MD", () => {
    expect(() => leerCatalogo(crearZip({ "agency.txt": "x" }), estacionesCsv())).toThrow(/no contiene/);
  });

  it("acepta un feed sin calendar_dates.txt, como el de Cercanías", () => {
    const sinFechas = descomprimirZip(feed());
    sinFechas.delete("calendar_dates.txt");
    const zip = crearZip(Object.fromEntries([...sinFechas].map(([n, b]) => [n, b.toString("utf8")])));
    const c = leerCatalogo(zip, estacionesCsv(), "cercanias");
    expect(c.excepciones).toEqual([]);
    expect(c.viajes.length).toBeGreaterThan(0);
    expect(c.viajes.every((v) => v.feed === "cercanias")).toBe(true);
  });
});
