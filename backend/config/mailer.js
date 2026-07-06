import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOtpEmail({ to, name, otp, expiresInMinutes }) {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@amarsheba.local';
  const subject = 'AmarSheba Email Verification OTP';
  const text = [
    `Hello ${name || 'Citizen'},`,
    '',
    `Your AmarSheba verification code is: ${otp}`,
    `This code will expire in ${expiresInMinutes} minutes.`,
    '',
    'If you did not request this code, you can ignore this email.',
  ].join('\n');

  if (!transporter) {
    console.warn(`[OTP email fallback] SMTP is not configured. OTP for ${to}: ${otp}`);
    return { delivered: false, fallback: true };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
  });

  return { delivered: true, fallback: false };
}
