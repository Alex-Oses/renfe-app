// Consulta de horarios: trenes AVE/LD contra la API y salidas simuladas de Cercanías.
// Mismos datos y reglas que la web (BuscadorHorarios.tsx y CercaniasHorarios.tsx).
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { buscarTrenes } from "@renfe/shared/api/cliente";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import type { Tren } from "@renfe/shared/api/tipos";
import { nucleosCercanias } from "@renfe/shared/contenido/navegacion";
import { euros, hora } from "@renfe/shared/formato/formato";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { colores, espaciado, estilos } from "@/tema";
import { Herramienta, Selector, SelectorDia } from "./comun";
import { horariosCercanias, hoyIso, lineasNucleo } from "./logica";

const OPCIONES_ESTACIONES = ESTACIONES.map((e) => ({ valor: e.id, texto: e.nombre }));

export function BuscadorHorarios() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState(hoyIso());
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [trenes, setTrenes] = useState<Tren[] | null>(null);

  async function enviar() {
    if (!origen || !destino) return setError("Elige origen y destino.");
    if (origen === destino) return setError("El origen y el destino no pueden ser la misma estación.");
    setError("");
    setCargando(true);
    try {
      setTrenes(await buscarTrenes({ origen, destino, fecha }));
    } catch {
      setError("No hemos podido cargar los horarios. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  const comprar = (t: Tren) =>
    router.push({
      pathname: "/pasajero",
      params: {
        trenId: t.id,
        origen,
        destino,
        pasajeros: "1",
        adultos: "1",
        ninos: "0",
        bebes: "0",
        descuento: "ninguno",
        tarifa: "basico",
      },
    } as never);

  return (
    <Herramienta titulo="Consulta horarios">
      <View style={{ gap: 12 }}>
        <Selector etiqueta="Origen" valor={origen} placeholder="Elige estación" opciones={OPCIONES_ESTACIONES} onElegir={setOrigen} />
        <Selector etiqueta="Destino" valor={destino} placeholder="Elige estación" opciones={OPCIONES_ESTACIONES} onElegir={setDestino} />
        <SelectorDia etiqueta="Fecha" valor={fecha} desdeDias={0} onElegir={setFecha} />
        <Boton texto={cargando ? "Buscando…" : "Ver horarios"} onPress={() => void enviar()} cargando={cargando} desactivado={cargando} />
        {error ? <Aviso texto={error} /> : null}
      </View>

      {trenes ? (
        trenes.length === 0 ? (
          <Text style={estilos.suave}>No hay trenes para ese trayecto.</Text>
        ) : (
          <View style={{ gap: 6 }}>
            {trenes.map((t) => (
              <View key={t.id} style={fila}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={estilos.textoMedio}>
                    {hora(t.salida)} → {hora(t.llegada)} · {t.tipo} {t.numero}
                  </Text>
                  <Text style={estilos.suave}>{t.plazasLibres ? `Desde ${euros(t.precioDesde)}` : "Completo"}</Text>
                </View>
                {t.plazasLibres > 0 ? <Boton texto="Comprar" compacto onPress={() => comprar(t)} /> : null}
              </View>
            ))}
          </View>
        )
      ) : null}
    </Herramienta>
  );
}

export function CercaniasHorarios() {
  const [nucleo, setNucleo] = useState(nucleosCercanias[0].ruta);
  const lineas = useMemo(() => lineasNucleo(nucleo), [nucleo]);
  const [linea, setLinea] = useState(0);
  const [origen, setOrigen] = useState(0);
  const [destino, setDestino] = useState(1);
  const [error, setError] = useState("");
  const [tabla, setTabla] = useState<ReturnType<typeof horariosCercanias> | null>(null);
  const estaciones = lineas[linea]?.estaciones ?? [];

  const cambiarNucleo = (n: string) => {
    setNucleo(n);
    setLinea(0);
    setOrigen(0);
    setDestino(1);
    setTabla(null);
  };

  function enviar() {
    if (origen === destino) return setError("El origen y el destino deben ser distintos.");
    setError("");
    setTabla(horariosCercanias(nucleo, lineas[linea].id, origen, destino));
  }

  return (
    <Herramienta titulo="Horarios de Cercanías">
      <View style={{ gap: 12 }}>
        <Selector
          etiqueta="Núcleo"
          valor={nucleo}
          opciones={nucleosCercanias.map((n) => ({ valor: n.ruta, texto: n.texto }))}
          onElegir={cambiarNucleo}
        />
        <Selector
          etiqueta="Línea"
          valor={String(linea)}
          opciones={lineas.map((l, i) => ({ valor: String(i), texto: l.id }))}
          onElegir={(v) => {
            setLinea(Number(v));
            setTabla(null);
          }}
        />
        <Selector
          etiqueta="Origen"
          valor={String(origen)}
          opciones={estaciones.map((s, i) => ({ valor: String(i), texto: s }))}
          onElegir={(v) => setOrigen(Number(v))}
        />
        <Selector
          etiqueta="Destino"
          valor={String(destino)}
          error={error}
          opciones={estaciones.map((s, i) => ({ valor: String(i), texto: s }))}
          onElegir={(v) => setDestino(Number(v))}
        />
        <Boton texto="Ver horarios" onPress={enviar} />
      </View>

      {tabla ? (
        <View style={{ gap: 6 }}>
          <Text style={estilos.suave}>
            Salidas de {estaciones[origen]} a {estaciones[destino]}
          </Text>
          {tabla.map((h) => (
            <View key={h.sale} style={[fila, { paddingVertical: espaciado[2] }]}>
              <Text style={[estilos.textoMedio, { flex: 1 }]}>
                {h.sale} → {h.llega}
              </Text>
              <Text style={estilos.suave}>{h.duracion} min</Text>
            </View>
          ))}
          <Text style={estilos.suave}>Horarios simulados.</Text>
        </View>
      ) : null}
    </Herramienta>
  );
}

const fila = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: espaciado[2],
  paddingHorizontal: espaciado[3],
  paddingVertical: espaciado[3],
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colores.borde,
  backgroundColor: "rgba(255,255,255,0.72)",
};
