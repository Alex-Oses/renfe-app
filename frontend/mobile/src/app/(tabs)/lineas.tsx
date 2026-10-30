import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { buscarTrenes, posicionesTrenes } from "@renfe/shared/api/cliente";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import type { Estacion, LineaFavorita, PosicionTren, Tren } from "@renfe/shared/api/tipos";
import { retrasoDe } from "@renfe/shared/estado/vigilante-reglas";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { CampoBoton } from "@/components/Campo";
import { Cristal } from "@/components/Cristal";
import { Icono } from "@/components/Icono";
import { Pantalla } from "@/components/Pantalla";
import { SelectorEstacion } from "@/components/Selectores";
import { colores, espaciado, estilos, fuentes, radios, tipografia, tonos } from "@/tema";
import { hora } from "@/formato";

const CLAVE = "anden.favoritos";

function leerFavoritos(): LineaFavorita[] {
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE) ?? "[]") as unknown;
    if (!Array.isArray(lista)) return [];
    return lista.filter(
      (f): f is LineaFavorita =>
        !!f &&
        typeof f === "object" &&
        typeof (f as LineaFavorita).id === "string" &&
        typeof (f as LineaFavorita).origen === "string" &&
        typeof (f as LineaFavorita).destino === "string",
    );
  } catch {
    return [];
  }
}

function guardarFavoritos(lista: LineaFavorita[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    /* sin almacenamiento: se queda en memoria */
  }
}

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const nombreDe = (id: string) => ESTACIONES.find((e) => e.id === id)?.nombre ?? id;

function cuenta(ms: number) {
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "sale ya";
  if (min < 60) return `en ${min} min`;
  return `en ${Math.floor(min / 60)} h ${min % 60} min`;
}

// Tarjeta de una línea guardada: los próximos trenes de hoy, con retraso si se conoce.
function TarjetaLinea({
  linea,
  primera,
  ultima,
  onMover,
  onQuitar,
}: {
  linea: LineaFavorita;
  primera: boolean;
  ultima: boolean;
  onMover: (paso: -1 | 1) => void;
  onQuitar: () => void;
}) {
  const [trenes, setTrenes] = useState<Tren[] | null>(null);
  const [posiciones, setPosiciones] = useState<PosicionTren[]>([]);
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    let vivo = true;
    setTrenes(null);
    buscarTrenes({ origen: linea.origen, destino: linea.destino, fecha: hoy() }).then(
      (t) => vivo && setTrenes(t),
      () => vivo && setTrenes([]),
    );
    posicionesTrenes().then(
      (p) => vivo && setPosiciones(p),
      () => {},
    );
    return () => {
      vivo = false;
    };
  }, [linea.origen, linea.destino]);

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 10_000);
    return () => clearInterval(t);
  }, []);

  const proximos = (trenes ?? []).filter((t) => Date.parse(t.salida) > ahora).slice(0, 4);
  const titulo = `${nombreDe(linea.origen)} a ${nombreDe(linea.destino)}`;

  const buscar = () =>
    router.push({
      pathname: "/resultados",
      params: {
        origen: linea.origen,
        destino: linea.destino,
        fecha: hoy(),
        pasajeros: "1",
        adultos: "1",
        ninos: "0",
        bebes: "0",
        descuento: "ninguno",
      },
    });

  return (
    <View style={styles.linea}>
      <View style={styles.lineaCabecera}>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={styles.lineaRuta} numberOfLines={2}>
            {nombreDe(linea.origen)} → {nombreDe(linea.destino)}
          </Text>
          <Text style={styles.lineaSub}>Tu línea guardada</Text>
        </View>
        <View style={styles.acciones}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Subir ${titulo}`}
            disabled={primera}
            onPress={() => onMover(-1)}
            style={({ pressed }) => [styles.accion, primera && { opacity: 0.28 }, pressed && !primera && styles.accionPulsada]}
          >
            <View style={{ transform: [{ rotate: "180deg" }] }}>
              <Icono nombre="chevron" tamano={18} color={colores.marca} />
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Bajar ${titulo}`}
            disabled={ultima}
            onPress={() => onMover(1)}
            style={({ pressed }) => [styles.accion, ultima && { opacity: 0.28 }, pressed && !ultima && styles.accionPulsada]}
          >
            <Icono nombre="chevron" tamano={18} color={colores.marca} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Quitar ${titulo}`}
            onPress={onQuitar}
            style={({ pressed }) => [styles.accion, pressed && { backgroundColor: tonos.errorFondo }]}
          >
            <Icono nombre="basura" tamano={18} color={colores.error} />
          </Pressable>
        </View>
      </View>

      {trenes === null ? (
        <View style={styles.cargandoHorarios}>
          <ActivityIndicator color={colores.marca} size="small" />
          <Text style={estilos.suave}>Cargando horarios…</Text>
        </View>
      ) : proximos.length === 0 ? (
        <View style={{ gap: espaciado[2] }}>
          <Text style={estilos.suave}>No quedan trenes hoy en esta línea.</Text>
          <Boton texto="Buscar otro día" variante="texto" onPress={buscar} />
        </View>
      ) : (
        <View style={styles.trenes}>
          {proximos.map((t) => {
            const retraso = retrasoDe(t, posiciones);
            return (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityLabel={`Elegir ${t.tipo} de las ${hora(t.salida)}`}
                onPress={buscar}
                style={({ pressed }) => [styles.tren, pressed && { backgroundColor: "rgba(214,45,97,0.07)" }]}
              >
                <View style={{ width: 58, gap: 1 }}>
                  <Text style={styles.cuenta}>{cuenta(Date.parse(t.salida) - ahora)}</Text>
                  <Text style={styles.hora}>{hora(t.salida)}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text style={styles.tipo}>{t.tipo}</Text>
                  <Text style={styles.detalle}>
                    Llega {hora(t.llegada)}
                    {t.plazasLibres != null ? ` · ${t.plazasLibres} plazas` : ""}
                  </Text>
                </View>
                {retraso > 0 ? (
                  <View style={styles.retraso}>
                    <Text style={styles.retrasoTexto}>+{retraso} min</Text>
                  </View>
                ) : null}
                <View style={styles.elegir}>
                  <Text style={styles.elegirTexto}>Elegir</Text>
                  <Icono nombre="delante" tamano={15} color={colores.marca} />
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function Lineas() {
  const [favoritos, setFavoritos] = useState<LineaFavorita[]>(leerFavoritos);
  const [origen, setOrigen] = useState<Estacion | null>(null);
  const [destino, setDestino] = useState<Estacion | null>(null);
  const [hoja, setHoja] = useState<"origen" | "destino" | null>(null);
  const [error, setError] = useState("");

  const guardar = (lista: LineaFavorita[]) => {
    setFavoritos(lista);
    guardarFavoritos(lista);
  };

  const anadir = () => {
    if (!origen || !destino) return setError("Elige el origen y el destino de la lista de estaciones.");
    if (origen.id === destino.id) return setError("El origen y el destino tienen que ser distintos.");
    const id = `${origen.id}-${destino.id}`;
    if (favoritos.some((f) => f.id === id)) return setError("Esa línea ya está en tus líneas.");
    guardar([...favoritos, { id, origen: origen.id, destino: destino.id }]);
    setOrigen(null);
    setDestino(null);
    setError("");
  };

  const mover = (id: string, paso: -1 | 1) => {
    const i = favoritos.findIndex((f) => f.id === id);
    const j = i + paso;
    if (i < 0 || j < 0 || j >= favoritos.length) return;
    const lista = [...favoritos];
    [lista[i], lista[j]] = [lista[j], lista[i]];
    guardar(lista);
  };

  const quitar = (id: string) => guardar(favoritos.filter((f) => f.id !== id));

  const resumen = useMemo(() => {
    if (!favoritos.length) return null;
    return `${favoritos.length} ${favoritos.length === 1 ? "línea guardada" : "líneas guardadas"}`;
  }, [favoritos]);

  return (
    <Pantalla>
      <View style={styles.cabecera}>
        <Text style={estilos.h1}>Mis líneas</Text>
        <Text style={estilos.suave}>
          Guarda los trayectos que haces a menudo y mira de un vistazo cuándo sale el próximo tren.
        </Text>
      </View>

      <Cristal gap={espaciado[3]}>
        <Text style={styles.formTitulo}>Añadir una línea</Text>
        <CampoBoton
          etiqueta="Origen"
          valor={origen?.nombre}
          placeholder="Estación de salida"
          onPress={() => setHoja("origen")}
          icono="chevron"
        />
        <CampoBoton
          etiqueta="Destino"
          valor={destino?.nombre}
          placeholder="Estación de llegada"
          onPress={() => setHoja("destino")}
          icono="chevron"
        />
        {error ? <Aviso texto={error} tipo="error" /> : null}
        <Boton texto="Añadir línea" icono="mas" onPress={anadir} />
      </Cristal>

      {resumen ? (
        <View style={styles.resumen}>
          <Icono nombre="lineas" tamano={17} color={colores.marca} />
          <Text style={styles.resumenTexto}>{resumen}</Text>
        </View>
      ) : null}

      {favoritos.length === 0 ? (
        <View style={styles.vacio}>
          <View style={styles.vacioIcono}>
            <Icono nombre="lineas" tamano={44} color={colores.marca} />
          </View>
          <Text style={styles.vacioTitulo}>Aún no tienes líneas</Text>
          <Text style={styles.vacioTexto}>
            Añade arriba tu trayecto habitual, por ejemplo de Madrid-Puerta de Atocha a Sevilla-Santa Justa.
            También puedes marcar la estrella en los resultados de búsqueda.
          </Text>
        </View>
      ) : (
        <View style={styles.lista}>
          {favoritos.map((f, i) => (
            <TarjetaLinea
              key={f.id}
              linea={f}
              primera={i === 0}
              ultima={i === favoritos.length - 1}
              onMover={(paso) => mover(f.id, paso)}
              onQuitar={() => quitar(f.id)}
            />
          ))}
        </View>
      )}

      <Text style={styles.nota}>
        Los horarios y los retrasos se consultan al abrir la pestaña. Tus líneas se guardan solo en este dispositivo.
      </Text>

      <SelectorEstacion
        visible={hoja === "origen"}
        titulo="Estación de salida"
        seleccion={origen}
        onCerrar={() => setHoja(null)}
        onElegir={setOrigen}
      />
      <SelectorEstacion
        visible={hoja === "destino"}
        titulo="Estación de llegada"
        seleccion={destino}
        onCerrar={() => setHoja(null)}
        onElegir={setDestino}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  cabecera: { gap: espaciado[2], paddingTop: espaciado[2] },
  formTitulo: { fontFamily: fuentes.negrita, fontSize: tipografia.tamanos.xl, color: colores.titulo },
  resumen: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 },
  resumenTexto: { fontFamily: fuentes.medio, fontSize: 13, color: colores.textoSuave },
  vacio: {
    alignItems: "center",
    gap: espaciado[3],
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
  },
  vacioIcono: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(129,0,94,0.08)",
  },
  vacioTitulo: { fontFamily: fuentes.negrita, fontSize: tipografia.tamanos.xl, color: colores.titulo, textAlign: "center" },
  vacioTexto: {
    fontFamily: fuentes.normal,
    fontSize: tipografia.tamanos.base,
    lineHeight: 22,
    color: colores.textoSuave,
    textAlign: "center",
  },
  lista: { gap: espaciado[3] },
  linea: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    padding: espaciado[4],
    gap: espaciado[3],
    shadowColor: tonos.sombra,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  lineaCabecera: { flexDirection: "row", alignItems: "flex-start", gap: espaciado[2] },
  lineaRuta: { fontFamily: fuentes.negrita, fontSize: 17.4, lineHeight: 22, color: colores.titulo, letterSpacing: -0.3 },
  lineaSub: { fontFamily: fuentes.normal, fontSize: 12, color: colores.textoSuave },
  acciones: { flexDirection: "row", gap: 2 },
  accion: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  accionPulsada: { backgroundColor: "rgba(129,0,94,0.08)" },
  cargandoHorarios: { flexDirection: "row", alignItems: "center", gap: espaciado[2], paddingVertical: espaciado[2] },
  trenes: { gap: 4 },
  tren: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[3],
    paddingVertical: 10,
    paddingHorizontal: espaciado[2],
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: "rgba(255,255,255,0.62)",
  },
  cuenta: { fontFamily: fuentes.medio, fontSize: 10.6, color: colores.textoSuave },
  hora: { fontFamily: fuentes.negrita, fontSize: 18, color: colores.titulo, lineHeight: 21 },
  tipo: { fontFamily: fuentes.seminegrita, fontSize: 14, color: colores.texto },
  detalle: { fontFamily: fuentes.normal, fontSize: 11.8, color: colores.textoSuave },
  retraso: {
    borderRadius: 999,
    backgroundColor: tonos.avisoFondo,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  retrasoTexto: { fontFamily: fuentes.negrita, fontSize: 10.8, color: tonos.aviso },
  elegir: { flexDirection: "row", alignItems: "center", gap: 1 },
  elegirTexto: { fontFamily: fuentes.seminegrita, fontSize: 12.4, color: colores.marca },
  nota: {
    fontFamily: fuentes.normal,
    fontSize: 11.6,
    lineHeight: 16.5,
    color: colores.textoSuave,
    textAlign: "center",
    paddingHorizontal: espaciado[3],
    paddingTop: espaciado[2],
  },
});
