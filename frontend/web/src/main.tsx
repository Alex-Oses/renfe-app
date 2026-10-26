import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { usaDatosSimulados } from "./api/cliente";
import { Inicio } from "./paginas/Inicio";
import { Resultados } from "./paginas/Resultados";
import "./estilos.css";

function App() {
  return (
    <>
      <header className="cabecera">
        <div className="contenedor cabecera__fila">
          <Link to="/" className="marca">
            Andén
          </Link>
          <nav aria-label="Principal">
            <Link to="/">Comprar billetes</Link>
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/trenes" element={<Resultados />} />
          <Route path="*" element={<p className="contenedor seccion">Esta página no existe. <Link to="/">Vuelve al inicio</Link>.</p>} />
        </Routes>
      </main>
      <footer className="pie">
        <div className="contenedor">
          Proyecto académico (ASIX 2), sin relación con Renfe. Horarios basados en datos abiertos GTFS de Renfe (CC BY 4.0).
          {usaDatosSimulados && " Ahora mismo los trenes y precios son simulados."}
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
