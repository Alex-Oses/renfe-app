import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface Correo {
  para: string;
  asunto: string;
  html: string;
  texto: string;
}

const REMITENTE = 'Renfe (demo)';

const escapar = (t: string) =>
  t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Cuerpo HTML sencillo a partir de líneas de texto ya sin escapar. */
export function htmlDeCorreo(titulo: string, lineas: string[]): string {
  const cuerpo = lineas.map((l) => `<p style="margin:4px 0">${escapar(l)}</p>`).join('');
  return `<div style="font-family:Arial,sans-serif;color:#222"><h2 style="color:#81005E">${escapar(titulo)}</h2>${cuerpo}<p style="color:#777;font-size:12px">Proyecto de clase: billete y pago simulados.</p></div>`;
}

/**
 * Envía con Resend si hay RESEND_API_KEY; si no, a Mailpit (bandeja local de Supabase) si hay MAILPIT_URL.
 * Nunca lanza: un correo que falla no debe tumbar una compra ya hecha.
 */
@Injectable()
export class CorreoService {
  private readonly logger = new Logger(CorreoService.name);

  constructor(private readonly config: ConfigService) {}

  async enviar(correo: Correo): Promise<void> {
    const claveResend = this.config.get<string>('RESEND_API_KEY');
    const mailpit = this.config.get<string>('MAILPIT_URL');
    const desde = this.config.get<string>('CORREO_REMITENTE') || 'onboarding@resend.dev';
    try {
      const respuesta = claveResend
        ? await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${claveResend}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: `${REMITENTE} <${desde}>`,
              to: [correo.para],
              subject: correo.asunto,
              html: correo.html,
              text: correo.texto,
            }),
            signal: AbortSignal.timeout(8000),
          })
        : mailpit
          ? await fetch(`${mailpit}/api/v1/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                From: { Email: desde, Name: REMITENTE },
                To: [{ Email: correo.para }],
                Subject: correo.asunto,
                HTML: correo.html,
                Text: correo.texto,
              }),
              signal: AbortSignal.timeout(8000),
            })
          : null;
      if (!respuesta) {
        this.logger.warn(`Correo sin enviar (sin RESEND_API_KEY ni MAILPIT_URL): ${correo.asunto}`);
      } else if (!respuesta.ok) {
        this.logger.error(`El proveedor rechazó el correo: HTTP ${respuesta.status}`);
      }
    } catch (error) {
      this.logger.error(`No se pudo enviar el correo: ${(error as Error).message}`);
    }
  }
}
