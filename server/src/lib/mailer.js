const nodemailer = require("nodemailer");
const { format } = require("date-fns");

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || process.env.SMTP_HOST === "smtp.example.com") {
    console.log("SMTP not configured, creating testing Ethereal account...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    return transporter;
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
  const t = await getTransporter();
  const info = await t.sendMail({
    from: process.env.SMTP_FROM || '"Calendly Clone" <no-reply@example.com>',
    to,
    subject,
    text,
  });
  
  // If we are using Ethereal, log the preview URL
  if (!process.env.SMTP_HOST || process.env.SMTP_HOST === "smtp.example.com") {
    console.log("Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
}

function formatMeetingTime(meeting) {
  const start = new Date(meeting.startTime);
  const end = new Date(meeting.endTime);
  return `${format(start, "EEEE, MMMM d, yyyy")} from ${format(start, "h:mm a")} to ${format(end, "h:mm a")} (UTC)`;
}

async function sendBookingConfirmation(meeting, eventType) {
  const timeStr = formatMeetingTime(meeting);
  
  // To invitee
  const inviteeText = [
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

  await sendMail(meeting.inviteeEmail, `Booking Confirmed: ${eventType.name}`, inviteeText);

  // To host
  if (eventType.user && eventType.user.email) {
    const hostText = [
      `Hi ${eventType.user.name},`,
      "",
      `A new meeting has been booked.`,
      "",
      `Event: ${eventType.name}`,
      `Invitee: ${meeting.inviteeName} (${meeting.inviteeEmail})`,
      `When: ${timeStr}`,
    ].join("\n");
    await sendMail(eventType.user.email, `New Booking: ${eventType.name}`, hostText);
  }
}

async function sendCancellationNotification(meeting, eventType) {
  const timeStr = formatMeetingTime(meeting);
  
  // To invitee
  const inviteeText = [
    `Hi ${meeting.inviteeName},`,
    "",
    `Your ${eventType.name} has been cancelled.`,
    "",
    `Original time: ${timeStr}`,
    "",
    "The meeting was cancelled by the organizer. If you believe this was a mistake, please reach out to reschedule.",
  ].join("\n");

  await sendMail(meeting.inviteeEmail, `Meeting Cancelled: ${eventType.name}`, inviteeText);

  // To host
  if (eventType.user && eventType.user.email) {
    const hostText = [
      `Hi ${eventType.user.name},`,
      "",
      `A meeting has been cancelled.`,
      "",
      `Event: ${eventType.name}`,
      `Invitee: ${meeting.inviteeName} (${meeting.inviteeEmail})`,
      `Time: ${timeStr}`,
    ].join("\n");
    await sendMail(eventType.user.email, `Meeting Cancelled: ${eventType.name}`, hostText);
  }
}

async function sendRescheduleConfirmation(meeting, eventType) {
  const timeStr = formatMeetingTime(meeting);
  
  // To invitee
  const inviteeText = [
    `Hi ${meeting.inviteeName},`,
    "",
    `Your ${eventType.name} has been rescheduled.`,
    "",
    `New time: ${timeStr}`,
    "",
    `View your updated booking: ${process.env.BASE_URL}/book/${eventType.slug}/confirmed?meetingId=${meeting.id}`,
  ].join("\n");

  await sendMail(meeting.inviteeEmail, `Meeting Rescheduled: ${eventType.name}`, inviteeText);

  // To host
  if (eventType.user && eventType.user.email) {
    const hostText = [
      `Hi ${eventType.user.name},`,
      "",
      `A meeting has been rescheduled.`,
      "",
      `Event: ${eventType.name}`,
      `Invitee: ${meeting.inviteeName} (${meeting.inviteeEmail})`,
      `New time: ${timeStr}`,
    ].join("\n");
    await sendMail(eventType.user.email, `Meeting Rescheduled: ${eventType.name}`, hostText);
  }
}

module.exports = {
  sendBookingConfirmation,
  sendCancellationNotification,
  sendRescheduleConfirmation,
};
