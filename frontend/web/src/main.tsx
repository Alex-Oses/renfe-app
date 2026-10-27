import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Cabecera } from "./componentes/Cabecera";
import { Pie } from "./componentes/Pie";
import { ProveedorAvisos } from "./estado/avisos";
import { ProveedorSesion } from "./estado/sesion";
import { Inicio } from "./paginas/Inicio";
import { Resultados } from "./paginas/Resultados";
import "./estilos/base.css";

// Las páginas pesadas (mapa, cámara, QR) se cargan solo al entrar en ellas.
const Reserva = lazy(() => import("./paginas/reserva/Reserva"));
const MisBilletes = lazy(() => import("./paginas/MisBilletes"));
const Billete = lazy(() => import("./paginas/Billete"));
const Acceder = lazy(() => import("./paginas/Acceder"));
const Cuenta = lazy(() => import("./paginas/Cuenta"));
const Mapa = lazy(() => import("./paginas/Mapa"));
const MisLineas = lazy(() => import("./paginas/MisLineas"));
// Cualquier otra ruta: página de contenido (o 404 si no existe).
const PaginaContenido = lazy(() => import("./paginas/PaginaContenido"));

function App() {
  return (
    <>
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <Cabecera />
      <main id="contenido">
        <Suspense fallback={<p className="contenedor seccion cargando">Cargando…</p>}>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/trenes" element={<Resultados />} />
            <Route path="/reserva/:trenId" element={<Reserva />} />
            <Route path="/billetes" element={<MisBilletes />} />
            <Route path="/billetes/:id" element={<Billete />} />
            <Route path="/acceder" element={<Acceder />} />
            <Route path="/cuenta" element={<Cuenta />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/lineas" element={<MisLineas />} />
            <Route path="*" element={<PaginaContenido />} />
          </Routes>
        </Suspense>
      </main>
      <Pie />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ProveedorSesion>
        <ProveedorAvisos>
          <App />
        </ProveedorAvisos>
      </ProveedorSesion>
    </BrowserRouter>
  </StrictMode>,
);
