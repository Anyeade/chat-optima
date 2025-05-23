import { createTransport } from 'nodemailer';

export async function sendResetPasswordEmail(email: string, token: string) {
  const transporter = createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Password Reset" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    text: `Click the link to reset your password: ${resetLink}`,
    html: `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
}
