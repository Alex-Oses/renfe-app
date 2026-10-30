import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { buscarEstaciones } from "@renfe/shared/api/cliente";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import { DESCUENTOS } from "@renfe/shared/api/simulado-precios";
import type { Estacion } from "@renfe/shared/api/tipos";
import { colores, espaciado, fuentes, tipografia, tonos } from "@/tema";
import { Cristal } from "./Cristal";
import { Hoja } from "./Hoja";
import { Icono } from "./Icono";

const normal = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// ---------------- Estaciones ----------------
export function SelectorEstacion({
  visible,
  titulo,
  seleccion,
  onCerrar,
  onElegir,
}: {
  visible: boolean;
  titulo: string;
  seleccion: Estacion | null;
  onCerrar: () => void;
  onElegir: (e: Estacion) => void;
}) {
  const [texto, setTexto] = useState("");
  const [lista, setLista] = useState<Estacion[]>(ESTACIONES);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTexto("");
    setLista(ESTACIONES);
    setCargando(false);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let vivo = true;
    const t = setTimeout(() => {
      setCargando(true);
      buscarEstaciones(texto)
        .then((l) => vivo && setLista(l))
        .catch(() => vivo && setLista(ESTACIONES.filter((e) => normal(`${e.nombre} ${e.ciudad}`).includes(normal(texto)))))
        .finally(() => vivo && setCargando(false));
    }, 220);
    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [texto, visible]);

  return (
    <Hoja visible={visible} onCerrar={onCerrar} titulo={titulo} maximo={0.88}>
      <View style={{ gap: espaciado[3] }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: espaciado[2],
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colores.borde,
            paddingHorizontal: espaciado[3],
          }}
        >
          <Icono nombre="mapa" tamano={19} color={colores.textoSuave} />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Ciudad o estación"
            placeholderTextColor="#8a8a8a"
            autoFocus
            returnKeyType="search"
            style={{
              flex: 1,
              minHeight: 48,
              fontFamily: fuentes.normal,
              fontSize: tipografia.tamanos.base,
              color: colores.texto,
            }}
          />
          {cargando ? <ActivityIndicator color={colores.marca} size="small" /> : null}
        </View>

        {lista.length === 0 ? (
          <Text style={{ fontFamily: fuentes.medio, fontSize: 14, color: colores.textoSuave, paddingVertical: espaciado[4] }}>
            No encontramos esa estación. Prueba con la ciudad.
          </Text>
        ) : (
          <FlatList
            data={lista}
            keyExtractor={(e) => e.id}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 420 }}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
            renderItem={({ item }) => {
              const activa = seleccion?.id === item.id;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: activa }}
                  onPress={() => {
                    onElegir(item);
                    onCerrar();
                  }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: espaciado[3],
                    paddingHorizontal: espaciado[3],
                    paddingVertical: espaciado[3],
                    borderRadius: 14,
                    backgroundColor: activa ? tonos.rosaFuerte : pressed ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.72)",
                    borderWidth: 1,
                    borderColor: activa ? "rgba(129,0,94,0.35)" : "rgba(255,255,255,0.9)",
                  })}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      backgroundColor: activa ? colores.marca : tonos.moradoSuave,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icono nombre="tren" tamano={20} color={activa ? "#fff" : colores.marca} />
                  </View>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={{ fontFamily: fuentes.seminegrita, fontSize: 15, color: colores.texto }} numberOfLines={1}>
                      {item.nombre}
                    </Text>
                    <Text style={{ fontFamily: fuentes.normal, fontSize: 13, color: colores.textoSuave }}>{item.ciudad}</Text>
                  </View>
                  {activa ? <Icono nombre="check" tamano={20} color={colores.marca} /> : null}
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Hoja>
  );
}

// ---------------- Fecha ----------------
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function textoFecha(fecha: string) {
  const d = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(d.getTime())) return fecha;
  return `${DIAS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}`;
}

export function textoFechaCorta(fecha: string) {
  const d = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(d.getTime())) return fecha;
  return `${DIAS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`;
}

export function SelectorFecha({
  visible,
  titulo,
  valor,
  onCerrar,
  onElegir,
  minimo,
}: {
  visible: boolean;
  titulo: string;
  valor: string;
  onCerrar: () => void;
  onElegir: (f: string) => void;
  minimo?: string;
}) {
  const dias = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(12, 0, 0, 0);
    return Array.from({ length: 45 }, (_, i) => {
      const d = new Date(hoy);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);
  const hoyIso = iso(new Date());
  const mananaIso = iso(new Date(Date.now() + 86400000));

  return (
    <Hoja visible={visible} onCerrar={onCerrar} titulo={titulo} maximo={0.86}>
      <View style={{ gap: 6 }}>
        {dias.map((d) => {
          const f = iso(d);
          if (minimo && f < minimo) return null;
          const activo = f === valor;
          const etiqueta = f === hoyIso ? "Hoy" : f === mananaIso ? "Mañana" : null;
          return (
            <Pressable
              key={f}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
              onPress={() => {
                onElegir(f);
                onCerrar();
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: espaciado[3],
                paddingVertical: 13,
                borderRadius: 13,
                backgroundColor: activo ? colores.marca : pressed ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.68)",
              })}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fuentes.seminegrita,
                    fontSize: 15,
                    color: activo ? "#fff" : colores.texto,
                    textTransform: "capitalize",
                  }}
                >
                  {DIAS[d.getDay()]}, {d.getDate()} {MESES[d.getMonth()]}
                </Text>
                {etiqueta ? (
                  <Text style={{ fontFamily: fuentes.medio, fontSize: 12, color: activo ? "rgba(255,255,255,0.8)" : colores.textoSuave }}>
                    {etiqueta}
                  </Text>
                ) : null}
              </View>
              {activo ? <Icono nombre="check" tamano={20} color="#fff" /> : null}
            </Pressable>
          );
        })}
      </View>
    </Hoja>
  );
}

// ---------------- Viajeros ----------------
function Contador({
  etiqueta,
  detalle,
  valor,
  minimo,
  maximo,
  onCambio,
}: {
  etiqueta: string;
  detalle: string;
  valor: number;
  minimo: number;
  maximo: number;
  onCambio: (n: number) => void;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: espaciado[3] }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: fuentes.seminegrita, fontSize: 16, color: colores.texto }}>{etiqueta}</Text>
        <Text style={{ fontFamily: fuentes.normal, fontSize: 13, color: colores.textoSuave }}>{detalle}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: espaciado[3] }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Quitar ${etiqueta}`}
          disabled={valor <= minimo}
          onPress={() => onCambio(valor - 1)}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: valor <= minimo ? colores.borde : colores.marca,
            backgroundColor: "#fff",
            opacity: valor <= minimo ? 0.45 : 1,
          }}
        >
          <Icono nombre="menos" tamano={18} color={colores.marca} />
        </Pressable>
        <Text style={{ fontFamily: fuentes.negrita, fontSize: 18, color: colores.titulo, minWidth: 22, textAlign: "center" }}>
          {valor}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Añadir ${etiqueta}`}
          disabled={valor >= maximo}
          onPress={() => onCambio(valor + 1)}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: valor >= maximo ? colores.borde : colores.marca,
            backgroundColor: valor >= maximo ? "#fff" : colores.marca,
            opacity: valor >= maximo ? 0.45 : 1,
          }}
        >
          <Icono nombre="mas" tamano={18} color={valor >= maximo ? colores.marca : "#fff"} />
        </Pressable>
      </View>
    </View>
  );
}

export function SelectorViajeros({
  visible,
  adultos,
  ninos,
  bebes,
  onCerrar,
  onCambio,
}: {
  visible: boolean;
  adultos: number;
  ninos: number;
  bebes: number;
  onCerrar: () => void;
  onCambio: (v: { adultos: number; ninos: number; bebes: number }) => void;
}) {
  const conAsiento = adultos + ninos;
  return (
    <Hoja visible={visible} onCerrar={onCerrar} titulo="Viajeros" maximo={0.75}>
      <Cristal intensidad={20} padding={espaciado[4]} style={{ backgroundColor: "rgba(255,255,255,0.75)" }}>
        <Contador
          etiqueta="Adultos"
          detalle="14 años o más"
          valor={adultos}
          minimo={1}
          maximo={9 - ninos}
          onCambio={(n) => onCambio({ adultos: n, ninos, bebes: Math.min(bebes, n) })}
        />
        <View style={{ height: 1, backgroundColor: colores.borde }} />
        <Contador
          etiqueta="Niños"
          detalle="De 4 a 13 años · 40 % de descuento"
          valor={ninos}
          minimo={0}
          maximo={Math.min(8, 9 - adultos)}
          onCambio={(n) => onCambio({ adultos, ninos: n, bebes })}
        />
        <View style={{ height: 1, backgroundColor: colores.borde }} />
        <Contador
          etiqueta="Bebés"
          detalle="De 0 a 3 años · gratis, en brazos"
          valor={bebes}
          minimo={0}
          maximo={Math.min(4, adultos)}
          onCambio={(n) => onCambio({ adultos, ninos, bebes: n })}
        />
      </Cristal>
      <Text style={{ fontFamily: fuentes.normal, fontSize: 12.6, color: colores.textoSuave, marginTop: espaciado[3] }}>
        {conAsiento} {conAsiento === 1 ? "viajero con asiento" : "viajeros con asiento"} · máximo 9 por compra.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onCerrar}
        style={({ pressed }) => ({
          marginTop: espaciado[4],
          minHeight: 50,
          borderRadius: 999,
          backgroundColor: colores.marca,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ fontFamily: fuentes.seminegrita, fontSize: 16, color: "#fff" }}>Listo</Text>
      </Pressable>
    </Hoja>
  );
}

// ---------------- Descuento ----------------
export function SelectorDescuento({
  visible,
  valor,
  onCerrar,
  onElegir,
}: {
  visible: boolean;
  valor: string;
  onCerrar: () => void;
  onElegir: (id: string) => void;
}) {
  return (
    <Hoja visible={visible} onCerrar={onCerrar} titulo="Tarjeta o descuento" maximo={0.8}>
      <View style={{ gap: 6 }}>
        {DESCUENTOS.map((d) => {
          const activo = d.id === valor;
          return (
            <Pressable
              key={d.id}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
              onPress={() => {
                onElegir(d.id);
                onCerrar();
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: espaciado[3],
                paddingHorizontal: espaciado[3],
                paddingVertical: 14,
                borderRadius: 13,
                backgroundColor: activo ? colores.marca : pressed ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.68)",
              })}
            >
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={{ fontFamily: fuentes.seminegrita, fontSize: 15, color: activo ? "#fff" : colores.texto }}>{d.nombre}</Text>
                {d.pct > 0 ? (
                  <Text style={{ fontFamily: fuentes.medio, fontSize: 12.5, color: activo ? "rgba(255,255,255,0.82)" : colores.textoSuave }}>
                    {d.pct} % de descuento
                  </Text>
                ) : null}
              </View>
              {activo ? <Icono nombre="check" tamano={20} color="#fff" /> : null}
            </Pressable>
          );
        })}
      </View>
    </Hoja>
  );
}

// ---------------- Resumen de viajeros para el campo ----------------
export function resumenViajeros(adultos: number, ninos: number, bebes: number) {
  const partes = [`${adultos} ${adultos === 1 ? "adulto" : "adultos"}`];
  if (ninos) partes.push(`${ninos} ${ninos === 1 ? "niño" : "niños"}`);
  if (bebes) partes.push(`${bebes} ${bebes === 1 ? "bebé" : "bebés"}`);
  return partes.join(" · ");
}
