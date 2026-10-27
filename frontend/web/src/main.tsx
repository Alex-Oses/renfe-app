import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { usaDatosSimulados } from "./api/cliente";
import { Cabecera } from "./componentes/Cabecera";
import { ProveedorSesion } from "./estado/sesion";
import { Inicio } from "./paginas/Inicio";
import { Resultados } from "./paginas/Resultados";
import "./estilos/base.css";
import "./estilos/cristal-liquido.css";

// Las páginas pesadas (mapa, cámara, QR) se cargan solo al entrar en ellas.
const Reserva = lazy(() => import("./paginas/reserva/Reserva"));
const MisBilletes = lazy(() => import("./paginas/MisBilletes"));
const Billete = lazy(() => import("./paginas/Billete"));
const Acceder = lazy(() => import("./paginas/Acceder"));
const Cuenta = lazy(() => import("./paginas/Cuenta"));
const Mapa = lazy(() => import("./paginas/Mapa"));

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
            <Route
              path="*"
              element={
                <p className="contenedor seccion">
                  Esta página no existe. <Link to="/">Vuelve al inicio</Link>.
                </p>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <footer className="pie">
        <div className="contenedor">
          Proyecto académico (ASIX 2), sin relación con Renfe. Horarios basados en datos abiertos GTFS de Renfe (CC BY 4.0).
          {usaDatosSimulados && " Ahora mismo los trenes, precios, pagos y posiciones son simulados."}
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ProveedorSesion>
        <App />
      </ProveedorSesion>
    </BrowserRouter>
  </StrictMode>,
);
