import { useEffect, useMemo, useRef, type ComponentType, type Ref } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { WebView, type WebViewMessageEvent, type WebViewProps } from "react-native-webview";
import { ESTACIONES } from "@renfe/shared/api/simulado";
import type { ParadaRuta, PosicionTren } from "@renfe/shared/api/tipos";
import { extremos } from "@renfe/shared/estado/estado-tren";
import { partirRuta, type PuntoRuta } from "@renfe/shared/estado/partir-ruta";
import { colorTipo, colores } from "@/tema";
import { useReducirMovimiento } from "./mapa/movimiento";
import type { PropsMapa } from "./mapa-tipos";

// Mapa nativo: Leaflet + OpenStreetMap dentro de un WebView, como la web. Antes era
// react-native-maps, que en Android usa Google Maps y sin clave de API cerraba la APK al abrir
// el mapa (en Expo Go no pasaba porque trae su propia clave).

// shortcut: los tipos de clase de react-native-webview 14 no casan con @types/react 19 (props: never); quitar al subir de versión.
const Web = WebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebView> }>;

const dibujable = (p: ParadaRuta) => Number.isFinite(p.lat) && Number.isFinite(p.lon);

// Puntos del recorrido del tren elegido: su ruta si la hay y, si no, sus paradas.
function puntosDe(t: PosicionTren): PuntoRuta[] {
  const puntos = t.ruta.length > 1 ? t.ruta : t.paradas.filter(dibujable).map((p): PuntoRuta => [p.lat, p.lon]);
  return puntos.length ? puntos : [[t.lat, t.lon]];
}

// Estaciones con la etiqueta de ciudad solo en la primera de cada ciudad (como la web).
const ESTACIONES_MAPA = ESTACIONES.map((e, i) => ({
  n: e.nombre,
  la: e.lat,
  lo: e.lon,
  c: ESTACIONES.findIndex((x) => x.ciudad === e.ciudad) === i ? e.ciudad : "",
}));

const HTML = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html,body,#m{margin:0;height:100%;background:#eff3f6}
.leaflet-control-attribution{font-size:9px}
.ciudad{font:600 10px sans-serif;color:#464646;background:rgba(255,255,255,.85);border:0;box-shadow:none;padding:0 3px;border-radius:4px}
.ciudad:before{display:none}
.et{font:600 10.5px sans-serif;color:#1d1d1b;background:rgba(255,255,255,.88);border:0;box-shadow:none;padding:1px 4px;border-radius:5px}
.et:before{display:none}
.pasada{opacity:.55}
</style></head><body><div id="m"></div><script>
var enviar=function(o){window.ReactNativeWebView.postMessage(JSON.stringify(o))};
var lienzo=L.canvas({tolerance:10});
var mapa=L.map('m',{zoomControl:false,renderer:lienzo}).setView([40.2,-3.7],5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(mapa);
var capaEst=L.layerGroup().addTo(mapa),capaRuta=L.layerGroup().addTo(mapa),capaTrenes=L.layerGroup().addTo(mapa);
var ciudades=[];
var siguiendo=false,centrado='',tapado=300,reducir=false,estado=null;
mapa.on('dragstart',function(){if(siguiendo)enviar({t:'soltar'})});
mapa.on('zoomend',function(){var cerca=mapa.getZoom()>=7;ciudades.forEach(function(m){cerca?m.openTooltip():m.closeTooltip()})});
window.estaciones=function(lista){lista.forEach(function(e){
  var m=L.circleMarker([e.la,e.lo],{radius:4,color:'#fff',weight:1.5,fillColor:'#81005e',fillOpacity:1}).bindPopup(e.n).addTo(capaEst);
  if(e.c){m.bindTooltip(e.c,{permanent:true,direction:'top',className:'ciudad',offset:[0,-4]});m.closeTooltip();ciudades.push(m)}
})};
function centrar(la,lo,animar){
  var p=mapa.project([la,lo]).add([0,tapado/2]);
  mapa.panTo(mapa.unproject(p),{animate:animar&&!reducir,duration:animar?.45:0});
}
window.actualizar=function(s){
  estado=s;siguiendo=s.siguiendo;tapado=s.tapado;reducir=s.reducir;
  capaTrenes.clearLayers();capaRuta.clearLayers();
  var r=s.ruta;
  if(r){
    if(r.hecho.length>1)L.polyline(r.hecho,{color:r.color,weight:4,dashArray:'6 6'}).addTo(capaRuta);
    if(r.pendiente.length>1){L.polyline(r.pendiente,{color:'#fff',weight:9}).addTo(capaRuta);L.polyline(r.pendiente,{color:r.color,weight:5}).addTo(capaRuta)}
    r.paradas.forEach(function(p){
      L.circleMarker([p.la,p.lo],{radius:5,color:r.color,weight:3,fillColor:p.pasada?'#d9dde2':'#fff',fillOpacity:1,opacity:p.pasada?.5:1})
        .bindTooltip(p.n,{permanent:true,direction:'right',className:'et'+(p.pasada?' pasada':''),offset:[6,0]}).addTo(capaRuta);
    });
    r.extremos.forEach(function(p){
      L.circleMarker([p.la,p.lo],{radius:7,color:r.color,weight:3,fillColor:r.color,fillOpacity:1})
        .bindTooltip(p.n,{permanent:true,direction:'right',className:'et',offset:[8,0]}).addTo(capaRuta);
    });
  }
  s.trenes.forEach(function(t){
    var activo=t.id===s.seleccion;
    if(activo)L.circleMarker([t.la,t.lo],{radius:16,color:'${colores.accion}',weight:3,fillColor:'rgba(214,45,97,.10)',fillOpacity:1,interactive:false}).addTo(capaTrenes);
    L.circleMarker([t.la,t.lo],{radius:activo?10:7,color:'#fff',weight:2,fillColor:t.c,fillOpacity:1})
      .on('click',function(){enviar({t:'elegir',id:t.id})}).addTo(capaTrenes);
  });
  var e=s.trenes.find(function(t){return t.id===s.seleccion});
  if(!e){centrado='';return}
  if(siguiendo)mapa.panTo([e.la,e.lo],{animate:!reducir,duration:1.2});
  else if(centrado!==e.id){centrado=e.id;centrar(e.la,e.lo,true)}
};
enviar({t:'listo'});
</script></body></html>`;

export function MapaTrenes({ trenes, seleccion, onElegir, espacioInferior = 300, siguiendo = false, onSoltar }: PropsMapa) {
  const web = useRef<WebView>(null);
  const listo = useRef(false);
  const { height: altoPantalla } = useWindowDimensions();
  const reducir = useReducirMovimiento();
  // Los callbacks en un ref: el WebView no se vuelve a montar al cambiar de función.
  const callbacks = useRef({ onElegir, onSoltar, trenes });
  callbacks.current = { onElegir, onSoltar, trenes };

  const estado = useMemo(() => {
    const elegido = trenes.find((t) => t.trenId === seleccion);
    let ruta = null;
    if (elegido) {
      const trazado = puntosDe(elegido);
      const corte = trazado.length > 1 ? partirRuta(trazado, elegido.lat, elegido.lon) : null;
      const paradas = elegido.paradas.filter(dibujable);
      const { salida, llegada } = extremos(paradas);
      const esExtremo = (p: ParadaRuta) => p.estacionId === salida?.estacionId || p.estacionId === llegada?.estacionId;
      const extremosDibujo =
        salida && llegada && salida.estacionId === llegada.estacionId
          ? [{ p: salida, n: `Parada ${salida.nombre}` }]
          : [
              ...(salida ? [{ p: salida, n: `Sale de ${salida.nombre}` }] : []),
              ...(llegada ? [{ p: llegada, n: `Llega a ${llegada.nombre}` }] : []),
            ];
      ruta = {
        color: colorTipo[elegido.tipo],
        hecho: corte?.hecho ?? [],
        pendiente: corte?.pendiente ?? [],
        paradas: paradas.filter((p) => !esExtremo(p)).map((p) => ({ la: p.lat, lo: p.lon, n: p.nombre, pasada: !!p.pasada })),
        extremos: extremosDibujo.map(({ p, n }) => ({ la: p.lat, lo: p.lon, n })),
      };
    }
    return {
      trenes: trenes.map((t) => ({ id: t.trenId, la: t.lat, lo: t.lon, c: colorTipo[t.tipo] })),
      seleccion: seleccion ?? null,
      siguiendo,
      reducir,
      tapado: Math.min(Math.max(espacioInferior, 0), altoPantalla * 0.55),
      ruta,
    };
  }, [trenes, seleccion, siguiendo, reducir, espacioInferior, altoPantalla]);

  const enviar = (s: typeof estado) => web.current?.injectJavaScript(`window.actualizar(${JSON.stringify(s)});true;`);
  useEffect(() => {
    if (listo.current) enviar(estado);
  }, [estado]);
  const ultimo = useRef(estado);
  ultimo.current = estado;

  const alMensaje = (e: WebViewMessageEvent) => {
    const m = JSON.parse(e.nativeEvent.data) as { t: string; id?: string };
    if (m.t === "listo") {
      listo.current = true;
      web.current?.injectJavaScript(`window.estaciones(${JSON.stringify(ESTACIONES_MAPA)});true;`);
      enviar(ultimo.current);
    } else if (m.t === "elegir") {
      const tren = callbacks.current.trenes.find((t) => t.trenId === m.id);
      if (tren) callbacks.current.onElegir?.(tren);
    } else if (m.t === "soltar") callbacks.current.onSoltar?.();
  };

  return (
    <Web
      ref={web}
      style={[StyleSheet.absoluteFill, { backgroundColor: "#eff3f6" }]}
      // baseUrl con https: OpenStreetMap pide un Referer válido para servir las teselas.
      source={{ html: HTML, baseUrl: "https://renfe-app-beta.vercel.app/" }}
      originWhitelist={["*"]}
      onMessage={alMensaje}
      // Si Android mata el proceso del WebView (poca memoria), se recarga en vez de cerrar la app.
      onRenderProcessGone={() => {
        listo.current = false;
        web.current?.reload();
      }}
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
      accessibilityLabel="Mapa de trenes en directo"
    />
  );
}
