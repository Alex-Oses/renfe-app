// Recorrido de un tren repartido en lo que ya ha hecho y lo que le queda. Lo usan la web
// (react-leaflet) y la app (react-native-maps) para pintar el tramo hecho más apagado.
export type PuntoRuta = [number, number]; // [lat, lon]

export interface RutaPartida {
  hecho: PuntoRuta[]; // desde el origen hasta el punto más cercano al tren
  pendiente: PuntoRuta[]; // desde ese punto hasta el destino
}

// Corta la ruta en el punto más cercano al tren: lo anterior es lo recorrido.
// La distancia se mide en grados con la longitud corregida por el coseno de la latitud, que basta
// para comparar distancias relativas sin pasar a metros.
export function partirRuta(ruta: PuntoRuta[], lat: number, lon: number): RutaPartida {
  if (ruta.length < 2) return { hecho: [], pendiente: ruta };
  const k = Math.cos((lat * Math.PI) / 180); // escala de la longitud
  let mejor = { i: 0, d: Infinity, q: ruta[0]! };
  for (let i = 0; i < ruta.length - 1; i++) {
    const a = ruta[i]!;
    const b = ruta[i + 1]!;
    const dx = (b[1] - a[1]) * k;
    const dy = b[0] - a[0];
    const l2 = dx * dx + dy * dy || 1e-12;
    // Proyección del tren sobre el segmento, limitada a sus extremos (0..1).
    const f = Math.max(0, Math.min(1, ((lon - a[1]) * k * dx + (lat - a[0]) * dy) / l2));
    const q: PuntoRuta = [a[0] + dy * f, a[1] + (b[1] - a[1]) * f];
    const d = ((q[1] - lon) * k) ** 2 + (q[0] - lat) ** 2;
    if (d < mejor.d) mejor = { i, d, q };
  }
  return { hecho: [...ruta.slice(0, mejor.i + 1), mejor.q], pendiente: [mejor.q, ...ruta.slice(mejor.i + 1)] };
}
