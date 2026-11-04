// Antes de cobrar: primero se confirma el importe y luego la cara del titular de la cuenta.
// Con la cara ya registrada se verifica contra /auth/cara/verificar; si aún no la tiene, se registra
// aquí mismo (registrarla ya demuestra que es él quien está delante de la cámara).
import { useEffect, useRef, useState } from "react";
import { registrarCara, verificarCara } from "@renfe/shared/api/cliente";
import { euros } from "@renfe/shared/formato/formato";
import { useSesion } from "../../estado/sesion";
import { CamaraFacial } from "../cuenta/CamaraFacial";

interface Props {
  total: number;
  alConfirmar: () => void; // cara comprobada: el padre lanza la compra
  alCerrar: () => void;
}

export function ConfirmarPago({ total, alConfirmar, alCerrar }: Props) {
  const { sesion, entrar, actualizarUsuario } = useSesion();
  const dialogo = useRef<HTMLDialogElement>(null);
  const [paso, setPaso] = useState<"confirmar" | "cara">("confirmar");
  const conCara = Boolean(sesion?.usuario.caraRegistrada);

  useEffect(() => {
    const d = dialogo.current;
    d?.showModal();
    return () => d?.close();
  }, []);

  return (
    <dialog ref={dialogo} className="confirmar-pago cristal" aria-labelledby="confirmar-titulo" onCancel={alCerrar}>
      {paso === "confirmar" ? (
        <>
          <h2 id="confirmar-titulo">¿Confirmas el pago?</h2>
          <p>
            Vas a pagar <strong>{euros(total)}</strong> (simulado). Para terminar, {conCara ? "comprobaremos" : "registraremos"} tu
            cara con la cámara: solo viaja una huella numérica, nunca la imagen.
          </p>
          <div className="reserva__acciones">
            <button type="button" className="boton boton--secundario" onClick={alCerrar}>
              Cancelar
            </button>
            <button type="button" className="boton" onClick={() => setPaso("cara")} autoFocus>
              Confirmar y verificar mi cara
            </button>
          </div>
        </>
      ) : (
        <CamaraFacial
          titulo={conCara ? "Mira a la cámara para pagar" : "Registra tu cara para pagar"}
          textoExito="Cara comprobada. Procesando el pago…"
          textoCancelar="Cancelar el pago"
          alCapturar={async (embedding) => {
            // Sin sesión solo se llega en modo simulado (sin API): basta con haber captado la cara.
            if (!sesion) {
              /* nada que comprobar */
            } else if (conCara) entrar(await verificarCara({ email: sesion.usuario.email, embedding }));
            else {
              await registrarCara(embedding);
              actualizarUsuario({ caraRegistrada: true });
            }
            setTimeout(alConfirmar, 700); // deja ver el aviso de éxito
          }}
          alCancelar={alCerrar}
        />
      )}
    </dialog>
  );
}
