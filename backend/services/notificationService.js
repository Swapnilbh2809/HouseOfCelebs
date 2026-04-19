let transporterPromise;

const getTransporter = async () => {
  if (transporterPromise) {
    return transporterPromise;
  }

  transporterPromise = (async () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      return null;
    }

    const nodemailer = require('nodemailer');

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  })();

  return transporterPromise;
};

const formatBookingSummary = (booking) => {
  const bookingDate = booking.date instanceof Date
    ? booking.date.toISOString().split('T')[0]
    : booking.date;

  return [
    `Guest: ${booking.customerName}`,
    `Phone: ${booking.phone}`,
    booking.email ? `Email: ${booking.email}` : null,
    `Package: ${booking.roomType}`,
    `Date: ${bookingDate}`,
    `Time: ${booking.startTime} - ${booking.endTime}`,
    `Amount: INR ${booking.totalAmount}`,
    booking.specialRequests ? `Special requests: ${booking.specialRequests}` : null
  ].filter(Boolean).join('\n');
};

const sendBookingNotification = async ({ subject, booking, includeCustomer = false }) => {
  const adminEmail = process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
  const recipients = [adminEmail];

  if (includeCustomer && booking.email) {
    recipients.push(booking.email);
  }

  const filteredRecipients = recipients.filter(Boolean);
  if (!filteredRecipients.length) {
    return { sent: false, reason: 'No notification recipients configured' };
  }

  const transporter = await getTransporter();
  const summary = formatBookingSummary(booking);

  if (!transporter) {
    console.log(`[notification skipped] ${subject}\n${summary}`);
    return { sent: false, reason: 'SMTP credentials not configured' };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: filteredRecipients.join(', '),
    subject,
    text: summary
  });

  return { sent: true };
};

module.exports = {
  sendBookingNotification
};
