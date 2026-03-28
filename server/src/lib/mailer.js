const nodemailer = require("nodemailer");
const { format } = require("date-fns");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || process.env.SMTP_HOST === "smtp.example.com") {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

async function sendMail(to, subject, text) {
  const t = getTransporter();
  if (!t) {
    process.stdout.write("SMTP not configured, skipping email send\n");
    return;
  }
  await t.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
  });
}

function formatMeetingTime(meeting) {
  const start = new Date(meeting.startTime);
  const end = new Date(meeting.endTime);
  return `${format(start, "EEEE, MMMM d, yyyy")} from ${format(start, "h:mm a")} to ${format(end, "h:mm a")} (UTC)`;
}

async function sendBookingConfirmation(meeting, eventType) {
  const timeStr = formatMeetingTime(meeting);
  const text = [
    `Hi ${meeting.inviteeName},`,
    "",
    `Your ${eventType.name} (${eventType.duration} min) has been booked.`,
    "",
    `When: ${timeStr}`,
    "",
    `View your booking: ${process.env.BASE_URL}/book/${eventType.slug}/confirmed?meetingId=${meeting.id}`,
    "",
    "If you need to cancel or reschedule, please use the link above.",
  ].join("\n");

  await sendMail(meeting.inviteeEmail, `Booking Confirmed: ${eventType.name}`, text);
}

async function sendCancellationNotification(meeting, eventType) {
  const timeStr = formatMeetingTime(meeting);
  const text = [
    `Hi ${meeting.inviteeName},`,
    "",
    `Your ${eventType.name} has been cancelled.`,
    "",
    `Original time: ${timeStr}`,
    "",
    "The meeting was cancelled by the organizer. If you believe this was a mistake, please reach out to reschedule.",
  ].join("\n");

  await sendMail(meeting.inviteeEmail, `Meeting Cancelled: ${eventType.name}`, text);
}

async function sendRescheduleConfirmation(meeting, eventType) {
  const timeStr = formatMeetingTime(meeting);
  const text = [
    `Hi ${meeting.inviteeName},`,
    "",
    `Your ${eventType.name} has been rescheduled.`,
    "",
    `New time: ${timeStr}`,
    "",
    `View your updated booking: ${process.env.BASE_URL}/book/${eventType.slug}/confirmed?meetingId=${meeting.id}`,
  ].join("\n");

  await sendMail(meeting.inviteeEmail, `Meeting Rescheduled: ${eventType.name}`, text);
}

module.exports = {
  sendBookingConfirmation,
  sendCancellationNotification,
  sendRescheduleConfirmation,
};
