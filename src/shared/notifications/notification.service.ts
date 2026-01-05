import { createWorker, notificationQueue } from "@shared/queue/queue";
import {
  sendBookingConfirmation,
  sendStaffNotification,
} from "./email-templates";
import { logger } from "@shared/utils/logger";

// ── Job Types ──
export const JobNames = {
  BOOKING_CONFIRMATION: "booking-confirmation",
  STAFF_NOTIFICATION: "staff-notification",
} as const;

// ── Enqueue jobs ──
export const enqueueBookingConfirmation = async (data: {
  patientEmail: string;
  patientName: string;
  bookingReference: string;
  appointmentType: string;
  preferredDate: string;
  preferredTimeSlot: string;
  siteName: string;
  reason: string;
}) => {
  await notificationQueue.add(JobNames.BOOKING_CONFIRMATION, data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  });
};

export const enqueueStaffNotification = async (data: {
  staffEmail: string;
  patientName: string;
  bookingReference: string;
  appointmentType: string;
  preferredDate: string;
  preferredTimeSlot: string;
  siteName: string;
  reason: string;
  symptoms: string[];
}) => {
  await notificationQueue.add(JobNames.STAFF_NOTIFICATION, data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  });
};

// ── Start the notification worker ──
export const startNotificationWorker = () => {
  const worker = createWorker("notifications", async (job) => {
    switch (job.name) {
      case JobNames.BOOKING_CONFIRMATION:
        await sendBookingConfirmation(job.data);
        break;
      case JobNames.STAFF_NOTIFICATION:
        await sendStaffNotification(job.data);
        break;
      default:
        logger.warn(`Unknown job type: ${job.name}`);
    }
  });

  logger.info("Notification worker started");
  return worker;
};
