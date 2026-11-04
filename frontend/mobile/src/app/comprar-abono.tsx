import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { comprarAbono } from "@renfe/shared/api/cliente";
import { TIPOS_ABONO, finAbono, hoyIso, infoAbono } from "@renfe/shared/api/simulado-abonos";
import type { Estacion, TipoAbono } from "@renfe/shared/api/tipos";
import { compraConfirmada, compraEnviando, compraFallida, compraInicial, tonoCompra, type ResultadoCompraAbono } from "@renfe/shared/api/resultado-compra";
import { Aviso } from "@/components/Aviso";
import { Boton } from "@/components/Boton";
import { CampoBoton } from "@/components/Campo";
import { Cristal } from "@/components/Cristal";
import { Pantalla } from "@/components/Pantalla";
import { SelectorEstacion, SelectorFecha, textoFecha } from "@/components/Selectores";
import { aFecha, euros } from "@renfe/shared/formato/formato";
import { colores, espaciado, estilos, fuentes, tonos } from "@/tema";

// Compra de abonos, igual que Abonos.tsx de la web: tipo, trayecto (si lo lleva), inicio y pago simulado.
export default function ComprarAbono() {
  const [tipo, setTipo] = useState<TipoAbono>("ave-ld-mensual");
  const [origen, setOrigen] = useState<Estacion | null>(null);
  const [destino, setDestino] = useState<Estacion | null>(null);
  const [inicio, setInicio] = useState(hoyIso());
  const [hoja, setHoja] = useState<"origen" | "destino" | "fecha" | null>(null);
  const [resultado, setResultado] = useState<ResultadoCompraAbono>(compraInicial);
  const comprado = resultado.estado === "exito" ? resultado.abono : null;
  const cargando = resultado.estado === "enviando";
  const error = resultado.estado === "error" ? resultado.mensaje : "";
  const info = infoAbono(tipo);

  const pagar = async () => {
    if (info.trayecto && (!origen || !destino)) return setResultado(compraFallida("Elige el origen y el destino del abono."));
    if (info.trayecto && origen?.id === destino?.id) {
      return setResultado(compraFallida("El origen y el destino tienen que ser distintos."));
    }
    setResultado(compraEnviando());
    try {
      const abono = await comprarAbono(
        info.trayecto && origen && destino ? { tipo, origenId: origen.id, destinoId: destino.id, inicio } : { tipo, inicio },
      );
      setResultado(compraConfirmada(abono));
    } catch (e) {
      setResultado(compraFallida((e as Error).message));
    }
  };

  if (comprado)
    return (
      <Pantalla volver={() => router.back()}>
        <Text style={estilos.h1}>Abono comprado</Text>
        <Aviso
          tipo={tonoCompra(resultado)}
          texto={`${comprado.nombre}${comprado.origen ? ` · ${comprado.origen.nombre} – ${comprado.destino?.nombre}` : ""}. Válido del ${aFecha(comprado.inicio)} al ${aFecha(comprado.fin)}.`}
        />
        <Boton
          texto="Ver el QR"
          icono="billetes"
          onPress={() => router.replace({ pathname: "/abono/[id]", params: { id: comprado.id } } as never)}
        />
        <Boton texto="Comprar otro" variante="secundario" onPress={() => setResultado(compraInicial())} />
      </Pantalla>
    );

  return (
    <Pantalla volver={() => router.back()}>
      <View style={{ gap: espaciado[2] }}>
        <Text style={estilos.h1}>Abonos y bonos</Text>
        <Text style={estilos.suave}>Compra un abono para viajar a menudo. Es una simulación: no se cobra nada.</Text>
      </View>

      <Text style={styles.paso}>1. Elige el tipo</Text>
      {TIPOS_ABONO.map((t) => {
        const activo = t.tipo === tipo;
        return (
          <Pressable
            key={t.tipo}
            accessibilityRole="radio"
            accessibilityState={{ checked: activo }}
            onPress={() => setTipo(t.tipo)}
            style={[styles.tipo, activo && styles.tipoActivo]}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.tipoNombre}>{t.nombre}</Text>
              <Text style={styles.tipoDesc}>{t.descripcion}</Text>
            </View>
            <Text style={styles.precio}>{euros(t.precio)}</Text>
          </Pressable>
        );
      })}

      <Text style={styles.paso}>2. {info.trayecto ? "Trayecto y fecha de inicio" : "Fecha de inicio"}</Text>
      <Cristal gap={espaciado[3]}>
        {info.trayecto ? (
          <>
            <CampoBoton etiqueta="Origen" valor={origen?.nombre} placeholder="Elige estación" onPress={() => setHoja("origen")} />
            <CampoBoton etiqueta="Destino" valor={destino?.nombre} placeholder="Elige estación" onPress={() => setHoja("destino")} />
          </>
        ) : null}
        <CampoBoton
          etiqueta="Empieza el"
          valor={textoFecha(inicio)}
          placeholder="Elige fecha"
          icono="calendario"
          onPress={() => setHoja("fecha")}
        />
        <Text style={styles.tipoDesc}>
          Válido hasta el {aFecha(finAbono(tipo, inicio))}
          {info.viajes ? `, ${info.viajes} viajes` : ", viajes ilimitados"}.
        </Text>
      </Cristal>

      <Text style={styles.paso}>3. Pago</Text>
      <Text style={estilos.suave}>Pago en modo prueba: no se pide tarjeta ni se cobra nada.</Text>
      {error ? <Aviso tipo={tonoCompra(resultado)} texto={error} /> : null}
      {cargando ? <Aviso tipo="info" texto="Procesando el pago…" /> : null}
      <Boton texto={`Pagar ${euros(info.precio)} (simulado)`} onPress={pagar} cargando={cargando} desactivado={cargando} />

      <SelectorEstacion
        visible={hoja === "origen" || hoja === "destino"}
        titulo={hoja === "destino" ? "Destino" : "Origen"}
        seleccion={hoja === "destino" ? destino : origen}
        onCerrar={() => setHoja(null)}
        onElegir={(e) => {
          if (hoja === "destino") setDestino(e);
          else setOrigen(e);
          setHoja(null);
        }}
      />
      <SelectorFecha
        visible={hoja === "fecha"}
        titulo="Empieza el"
        valor={inicio}
        minimo={hoyIso()}
        onCerrar={() => setHoja(null)}
        onElegir={(f) => {
          setInicio(f);
          setHoja(null);
        }}
      />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  paso: { fontFamily: fuentes.seminegrita, fontSize: 16, color: colores.titulo, marginTop: espaciado[2] },
  tipo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado[3],
    padding: espaciado[3],
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.95)",
  },
  tipoActivo: { borderColor: colores.marca, backgroundColor: tonos.rosa },
  tipoNombre: { fontFamily: fuentes.seminegrita, fontSize: 14.4, color: colores.texto },
  tipoDesc: { fontFamily: fuentes.normal, fontSize: 12.2, color: colores.textoSuave },
  precio: { fontFamily: fuentes.negrita, fontSize: 15, color: colores.marca },
});
