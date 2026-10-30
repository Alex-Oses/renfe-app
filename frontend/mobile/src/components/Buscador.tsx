import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import { DESCUENTOS } from "@renfe/shared/api/simulado-precios";
import type { Estacion, IdDescuento } from "@renfe/shared/api/tipos";
import { colores, espaciado, fuentes, tipografia, tonos } from "@/tema";
import { Aviso } from "./Aviso";
import { Boton } from "./Boton";
import { CampoBoton } from "./Campo";
import { Chip } from "./Chip";
import { Icono } from "./Icono";
import {
  SelectorDescuento,
  SelectorEstacion,
  SelectorFecha,
  SelectorViajeros,
  resumenViajeros,
  textoFecha,
} from "./Selectores";

export interface Criterios {
  origen: Estacion;
  destino: Estacion;
  fecha: string;
  adultos: number;
  ninos: number;
  bebes: number;
  descuento: IdDescuento;
  vuelta?: string;
}

export interface CriteriosIniciales {
  origen?: string;
  destino?: string;
  fecha?: string;
  adultos?: number;
  pasajeros?: number;
  ninos?: number;
  bebes?: number;
  descuento?: string;
  vuelta?: string;
}

const hoyIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const descuentoNombre = (id: string) => DESCUENTOS.find((d) => d.id === id)?.nombre ?? "Sin descuento";
const estacionDe = (id?: string) => ESTACIONES.find((e) => e.id === id) ?? null;

// Buscador de la portada y de los resultados: misma estructura que el de la web (trayecto con
// línea morada, Solo ida / Ida y vuelta, fecha, viajeros y descuento) adaptada a campos táctiles.
export function Buscador({ onBuscar, inicial }: { onBuscar: (c: Criterios) => void; inicial?: CriteriosIniciales }) {
  const madrid = ESTACIONES.find((e) => e.id === "60000") ?? null;
  const barcelona = ESTACIONES.find((e) => e.id === "71801") ?? null;
  const ninosInicial = inicial?.ninos ?? 0;
  const [origen, setOrigen] = useState<Estacion | null>(() =>
    inicial?.origen !== undefined ? estacionDe(inicial.origen) : madrid,
  );
  const [destino, setDestino] = useState<Estacion | null>(() =>
    inicial?.destino !== undefined ? estacionDe(inicial.destino) : barcelona,
  );
  const [fecha, setFecha] = useState(inicial?.fecha || hoyIso());
  const [idaVuelta, setIdaVuelta] = useState(!!inicial?.vuelta);
  const [vuelta, setVuelta] = useState(inicial?.vuelta ?? "");
  const [adultos, setAdultos] = useState(
    Math.max(inicial?.adultos ?? (inicial?.pasajeros ?? 1) - ninosInicial, 1),
  );
  const [ninos, setNinos] = useState(ninosInicial);
  const [bebes, setBebes] = useState(inicial?.bebes ?? 0);
  const [descuento, setDescuento] = useState<string>(inicial?.descuento ?? "ninguno");
  const [error, setError] = useState("");
  const [hoja, setHoja] = useState<null | "origen" | "destino" | "fecha" | "vuelta" | "viajeros" | "descuento">(null);

  const intercambiar = () => {
    setOrigen(destino);
    setDestino(origen);
  };

  const buscar = () => {
    if (!origen || !destino) {
      setError("Elige la estación de origen y la de destino.");
      return;
    }
    if (origen.id === destino.id) {
      setError("El origen y el destino tienen que ser estaciones distintas.");
      return;
    }
    if (idaVuelta && (!vuelta || vuelta < fecha)) {
      setError("La fecha de vuelta tiene que ser igual o posterior a la de ida.");
      return;
    }
    if (adultos + ninos > 9) {
      setError("Como máximo 9 viajeros con asiento por compra.");
      return;
    }
    if (bebes > adultos) {
      setError("Cada bebé tiene que viajar con un adulto.");
      return;
    }
    setError("");
    onBuscar({
      origen,
      destino,
      fecha,
      adultos,
      ninos,
      bebes,
      descuento: descuento as IdDescuento,
      vuelta: idaVuelta ? vuelta : undefined,
    });
  };

  return (
    <View style={{ gap: espaciado[4] }}>
      <View style={styles.trayecto}>
        <View style={styles.via} pointerEvents="none">
          <View style={styles.circulo} />
          <View style={styles.linea} />
          <View style={styles.punto} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Origen: ${origen?.nombre ?? "sin elegir"}`}
          onPress={() => setHoja("origen")}
          style={({ pressed }) => [styles.campoTrayecto, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.etiquetaTrayecto}>Desde</Text>
          <Text style={[styles.valorTrayecto, !origen && styles.placeholder]} numberOfLines={1}>
            {origen?.nombre ?? "Estación de origen"}
          </Text>
        </Pressable>
        <View style={styles.lineaCampo} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Destino: ${destino?.nombre ?? "sin elegir"}`}
          onPress={() => setHoja("destino")}
          style={({ pressed }) => [styles.campoTrayecto, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.etiquetaTrayecto}>Hasta</Text>
          <Text style={[styles.valorTrayecto, !destino && styles.placeholder]} numberOfLines={1}>
            {destino?.nombre ?? "Estación de destino"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Intercambiar origen y destino"
          onPress={intercambiar}
          style={({ pressed }) => [styles.intercambiar, pressed && { transform: [{ rotate: "180deg" }] }]}
        >
          <Icono nombre="intercambiar" tamano={21} color={colores.marca} grosor={2} />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: espaciado[2] }}>
        <Chip texto="Solo ida" activo={!idaVuelta} onPress={() => setIdaVuelta(false)} />
        <Chip texto="Ida y vuelta" activo={idaVuelta} onPress={() => setIdaVuelta(true)} />
      </View>

      <View style={{ height: 1, backgroundColor: colores.borde }} />

      <CampoBoton
        etiqueta="Fecha de ida"
        valor={textoFecha(fecha)}
        placeholder="Elige el día"
        icono="calendario"
        onPress={() => setHoja("fecha")}
      />
      {idaVuelta ? (
        <CampoBoton
          etiqueta="Fecha de vuelta"
          valor={vuelta ? textoFecha(vuelta) : ""}
          placeholder="Elige el día de vuelta"
          icono="calendario"
          onPress={() => setHoja("vuelta")}
        />
      ) : null}
      <CampoBoton
        etiqueta="Adultos"
        valor={`${adultos} ${adultos === 1 ? "adulto" : "adultos"}`}
        placeholder="1 adulto"
        onPress={() => setHoja("viajeros")}
      />
      <CampoBoton
        etiqueta="Niños (4-13)"
        valor={`${ninos} ${ninos === 1 ? "niño" : "niños"}`}
        placeholder="0 niños"
        onPress={() => setHoja("viajeros")}
      />
      <CampoBoton
        etiqueta="Bebés (0-3)"
        valor={`${bebes} ${bebes === 1 ? "bebé" : "bebés"}`}
        placeholder="0 bebés"
        onPress={() => setHoja("viajeros")}
      />
      <CampoBoton
        etiqueta="Tarjeta o descuento"
        valor={descuentoNombre(descuento)}
        placeholder="Sin descuento"
        onPress={() => setHoja("descuento")}
      />

      {error ? <Aviso texto={error} /> : null}

      <Boton texto="Buscar trenes" onPress={buscar} icono="comprar" />

      <SelectorEstacion
        visible={hoja === "origen"}
        titulo="Estación de origen"
        seleccion={origen}
        onCerrar={() => setHoja(null)}
        onElegir={setOrigen}
      />
      <SelectorEstacion
        visible={hoja === "destino"}
        titulo="Estación de destino"
        seleccion={destino}
        onCerrar={() => setHoja(null)}
        onElegir={setDestino}
      />
      <SelectorFecha
        visible={hoja === "fecha"}
        titulo="Fecha de ida"
        valor={fecha}
        onCerrar={() => setHoja(null)}
        onElegir={setFecha}
      />
      <SelectorFecha
        visible={hoja === "vuelta"}
        titulo="Fecha de vuelta"
        valor={vuelta}
        minimo={fecha}
        onCerrar={() => setHoja(null)}
        onElegir={setVuelta}
      />
      <SelectorViajeros
        visible={hoja === "viajeros"}
        adultos={adultos}
        ninos={ninos}
        bebes={bebes}
        onCerrar={() => setHoja(null)}
        onCambio={(v) => {
          setAdultos(v.adultos);
          setNinos(v.ninos);
          setBebes(v.bebes);
        }}
      />
      <SelectorDescuento
        visible={hoja === "descuento"}
        valor={descuento}
        onCerrar={() => setHoja(null)}
        onElegir={setDescuento}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  trayecto: {
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingVertical: espaciado[2],
    paddingRight: 62,
    paddingLeft: 38,
    gap: 2,
  },
  via: {
    position: "absolute",
    left: 16,
    top: 32,
    bottom: 32,
    width: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  circulo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2.5,
    borderColor: colores.marca,
    backgroundColor: "#fff",
  },
  linea: { flex: 1, width: 2.5, backgroundColor: colores.marca, marginVertical: 2 },
  punto: { width: 12, height: 12, borderRadius: 6, backgroundColor: colores.marca },
  campoTrayecto: { paddingVertical: 10, minHeight: 54, justifyContent: "center" },
  etiquetaTrayecto: { fontFamily: fuentes.medio, fontSize: 13, color: colores.textoSuave },
  valorTrayecto: { fontFamily: fuentes.normal, fontSize: 17, color: colores.texto, letterSpacing: -0.2 },
  placeholder: { color: "#8a8a8a" },
  lineaCampo: { height: 1, backgroundColor: colores.borde, marginVertical: 1 },
  intercambiar: {
    position: "absolute",
    right: 10,
    top: "50%",
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: tonos.sombra,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
});
