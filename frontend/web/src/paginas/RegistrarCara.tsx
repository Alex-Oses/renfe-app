// Paso obligatorio tras crear la cuenta: sin la cara registrada no se puede pagar ningún billete,
// porque el pago se confirma mirando a la cámara. La única salida es cerrar la sesión.
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { registrarCara } from "@renfe/shared/api/cliente";
import { useSesion } from "../estado/sesion";
import { CamaraFacial } from "./cuenta/CamaraFacial";
import "./cuenta/cuenta.css";

export default function RegistrarCara() {
  const { sesion, salir, actualizarUsuario } = useSesion();
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const volverA = params.get("volver") ?? "";
  // Solo rutas internas: evita redirecciones abiertas a otros dominios.
  const destino = /^\/(?![/\\])/.test(volverA) ? volverA : "/cuenta";

  if (!sesion) return <Navigate to="/acceder" replace />;
  if (sesion.usuario.caraRegistrada) return <Navigate to={destino} replace />;

  return (
    <div className="contenedor seccion cuenta">
      <h1>Un último paso: registra tu cara</h1>
      <p>
        Cada pago se confirma mirando a la cámara, así nadie puede comprar con tu cuenta. Solo guardamos una huella
        numérica de tu cara, nunca fotos.
      </p>
      <CamaraFacial
        titulo="Registra tu cara"
        textoExito="Cara registrada. Ya puedes comprar billetes."
        textoCancelar="Cerrar sesión"
        alCapturar={async (embedding) => {
          await registrarCara(embedding);
          setTimeout(() => {
            actualizarUsuario({ caraRegistrada: true });
            navegar(destino, { replace: true });
          }, 1200);
        }}
        alCancelar={() => {
          salir();
          navegar("/", { replace: true });
        }}
      />
    </div>
  );
}
