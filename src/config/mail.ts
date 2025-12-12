import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "@config/env";
import { logger } from "@shared/utils/logger";

let transporter: Transporter;

/**
 * Get or create the Nodemailer transporter.
 * In development, this sends to Mailpit (localhost:1025, UI at :8025).
 */
export const getMailTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: false, // Mailpit doesn't use TLS
      auth:
        env.MAIL_USER && env.MAIL_PASS
          ? { user: env.MAIL_USER, pass: env.MAIL_PASS }
          : undefined,
    });
  }
  return transporter;
};

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email using Nodemailer.
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transport = getMailTransporter();

    const info = await transport.sendMail({
      from: env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info(`Email sent to ${options.to}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}:`, error);
    return false;
  }
};

/**
 * Send a password reset email.
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  firstName: string
): Promise<boolean> => {
  // In production, this would be a frontend URL
  const resetUrl = `${env.CORS_ORIGIN.split(",")[0]}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { font-size: 12px; color: #999; margin-top: 20px; text-align: center; }
        .token { background: #eee; padding: 10px; border-radius: 4px; font-family: monospace; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>RHNe</h1>
          <p>Réseau hospitalier neuchâtelois</p>
        </div>
        <div class="content">
          <h2>Réinitialisation de mot de passe</h2>
          <p>Bonjour ${firstName},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button" style="color: white;">Réinitialiser le mot de passe</a>
          </p>
          <p>Ou copiez ce lien dans votre navigateur :</p>
          <p class="token">${resetUrl}</p>
          <p>Ce lien expire dans <strong>1 heure</strong>.</p>
          <p>Si vous n'avez pas fait cette demande, ignorez simplement cet email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} RHNe Clone — Cet email a été envoyé automatiquement.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Bonjour ${firstName},

Vous avez demandé la réinitialisation de votre mot de passe.

Cliquez sur ce lien pour créer un nouveau mot de passe :
${resetUrl}

Ce lien expire dans 1 heure.

Si vous n'avez pas fait cette demande, ignorez simplement cet email.

— RHNe Clone
  `.trim();

  return sendEmail({
    to,
    subject: "RHNe — Réinitialisation de mot de passe",
    html,
    text,
  });
};
