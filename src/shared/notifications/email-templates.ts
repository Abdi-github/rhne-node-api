import { sendEmail } from "@config/mail";
import { logger } from "@shared/utils/logger";

interface BookingConfirmationData {
  patientEmail: string;
  patientName: string;
  bookingReference: string;
  appointmentType: string;
  preferredDate: string;
  preferredTimeSlot: string;
  siteName: string;
  reason: string;
}

interface StaffNotificationData {
  staffEmail: string;
  patientName: string;
  bookingReference: string;
  appointmentType: string;
  preferredDate: string;
  preferredTimeSlot: string;
  siteName: string;
  reason: string;
  symptoms: string[];
}

export const sendBookingConfirmation = async (
  data: BookingConfirmationData
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1565c0; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px; margin: 15px 0; }
        .info-row { display: flex; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
        .info-label { font-weight: 600; color: #555; min-width: 160px; }
        .ref-code { background: #e3f2fd; padding: 12px 20px; border-radius: 6px; font-size: 18px; font-weight: 700; text-align: center; color: #1565c0; letter-spacing: 2px; margin: 15px 0; }
        .footer { font-size: 12px; color: #999; margin-top: 20px; text-align: center; }
        .warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 12px 16px; margin: 15px 0; border-radius: 0 6px 6px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0">RHNe</h1>
          <p style="margin:5px 0 0">Réseau hospitalier neuchâtelois</p>
        </div>
        <div class="content">
          <h2>Confirmation de rendez-vous</h2>
          <p>Bonjour ${data.patientName},</p>
          <p>Votre demande de rendez-vous a bien été enregistrée. Voici le récapitulatif :</p>
          
          <div class="ref-code">${data.bookingReference}</div>
          
          <div class="info-box">
            <table style="width:100%; border-collapse:collapse;">
              <tr><td style="padding:6px 0; font-weight:600; color:#555;">Type</td><td style="padding:6px 0;">${data.appointmentType}</td></tr>
              <tr><td style="padding:6px 0; font-weight:600; color:#555;">Date souhaitée</td><td style="padding:6px 0;">${data.preferredDate}</td></tr>
              <tr><td style="padding:6px 0; font-weight:600; color:#555;">Créneau</td><td style="padding:6px 0;">${data.preferredTimeSlot}</td></tr>
              <tr><td style="padding:6px 0; font-weight:600; color:#555;">Site</td><td style="padding:6px 0;">${data.siteName}</td></tr>
              <tr><td style="padding:6px 0; font-weight:600; color:#555;">Motif</td><td style="padding:6px 0;">${data.reason}</td></tr>
            </table>
          </div>

          <div class="warning">
            <strong>Important :</strong> Présentez-vous <strong>15 minutes avant</strong> l'heure prévue pour les formalités administratives et le triage.
          </div>

          <p>Un membre de notre équipe confirmera votre rendez-vous sous peu. Vous recevrez un email de confirmation définitive.</p>
          
          <p>Pour toute annulation, veuillez appeler le <strong>+41 32 713 30 00</strong>.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} RHNe Clone — Cet email a été envoyé automatiquement.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Bonjour ${data.patientName},

Votre demande de rendez-vous a bien été enregistrée.

Référence : ${data.bookingReference}
Type : ${data.appointmentType}
Date souhaitée : ${data.preferredDate}
Créneau : ${data.preferredTimeSlot}
Site : ${data.siteName}
Motif : ${data.reason}

Important : Présentez-vous 15 minutes avant l'heure prévue.

Pour toute annulation : +41 32 713 30 00

— RHNe Clone
  `.trim();

  return sendEmail({
    to: data.patientEmail,
    subject: `RHNe — Confirmation de rendez-vous ${data.bookingReference}`,
    html,
    text,
  });
};

export const sendStaffNotification = async (
  data: StaffNotificationData
): Promise<boolean> => {
  const symptomsList =
    data.symptoms.length > 0
      ? data.symptoms.map((s) => `<li>${s}</li>`).join("")
      : "<li>Non spécifié</li>";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px; margin: 15px 0; }
        .ref-code { background: #ffebee; padding: 12px 20px; border-radius: 6px; font-size: 18px; font-weight: 700; text-align: center; color: #d32f2f; letter-spacing: 2px; margin: 15px 0; }
        .footer { font-size: 12px; color: #999; margin-top: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0">Nouveau rendez-vous</h1>
          <p style="margin:5px 0 0">Notification interne — RHNe Admin</p>
        </div>
        <div class="content">
          <p>Un nouveau rendez-vous a été réservé et nécessite votre attention.</p>
          
          <div class="ref-code">${data.bookingReference}</div>
          
          <div class="info-box">
            <table style="width:100%; border-collapse:collapse;">
              <tr><td style="padding:6px 0; font-weight:600; color:#555;">Patient</td><td style="padding:6px 0;">${data.patientName}</td></tr>
              <tr><td style="padding:6px 0; font-weight:600; color:#555;">Type</td><td style="padding:6px 0;">${data.appointmentType}</td></tr>
              <tr><td style="padding:6px 0; font-weight:600; color:#555;">Date souhaitée</td><td style="padding:6px 0;">${data.preferredDate}</td></tr>
              <tr><td style="padding:6px 0; font-weight:600; color:#555;">Créneau</td><td style="padding:6px 0;">${data.preferredTimeSlot}</td></tr>
              <tr><td style="padding:6px 0; font-weight:600; color:#555;">Site</td><td style="padding:6px 0;">${data.siteName}</td></tr>
              <tr><td style="padding:6px 0; font-weight:600; color:#555;">Motif</td><td style="padding:6px 0;">${data.reason}</td></tr>
            </table>
          </div>

          <h3>Symptômes / Conditions</h3>
          <ul>${symptomsList}</ul>
          
          <p>Veuillez confirmer ou rejeter ce rendez-vous depuis le panneau d'administration.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} RHNe Clone — Notification interne</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Nouveau rendez-vous — ${data.bookingReference}

Patient : ${data.patientName}
Type : ${data.appointmentType}
Date : ${data.preferredDate}
Créneau : ${data.preferredTimeSlot}
Site : ${data.siteName}
Motif : ${data.reason}
Symptômes : ${data.symptoms.join(", ") || "Non spécifié"}

Veuillez confirmer depuis le panneau d'administration.

— RHNe Clone
  `.trim();

  return sendEmail({
    to: data.staffEmail,
    subject: `[RHNe] Nouveau rendez-vous ${data.bookingReference} — ${data.appointmentType}`,
    html,
    text,
  });
};
