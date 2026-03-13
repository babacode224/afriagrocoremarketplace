/**
 * Email service for AfriAgroCore.
 * Sends transactional emails via SMTP (Nodemailer).
 *
 * Required env vars (optional — if not set, emails are logged to console):
 *   SMTP_HOST     e.g. smtp.sendgrid.net
 *   SMTP_PORT     e.g. 587
 *   SMTP_USER     e.g. apikey (SendGrid) or your email address
 *   SMTP_PASS     e.g. your SMTP password or API key
 *   SMTP_FROM     e.g. "AfriAgroCore <noreply@afriagrocore.com>"
 */

import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Return a test/preview transporter that logs to console
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM = process.env.SMTP_FROM ?? "AfriAgroCore <noreply@afriagrocore.com>";

export async function sendVerificationEmail(
  toEmail: string,
  toName: string,
  verifyUrl: string
): Promise<{ sent: boolean; previewUrl?: string }> {
  const transporter = getTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:sans-serif;background:#f5f5f5;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
    <div style="background:#E85D04;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;">AfriAgroCore</h1>
      <p style="color:rgba(255,255,255,.85);margin:4px 0 0;font-size:13px;">Africa's Agricultural Marketplace</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1a1a1a;margin:0 0 12px;">Verify your email address</h2>
      <p style="color:#555;line-height:1.6;">Hi ${toName},</p>
      <p style="color:#555;line-height:1.6;">
        Thank you for joining AfriAgroCore! Please verify your email address by clicking the button below.
        This link expires in <strong>24 hours</strong>.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${verifyUrl}" style="background:#E85D04;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color:#888;font-size:12px;line-height:1.6;">
        If you did not create an account, you can safely ignore this email.<br/>
        Or copy and paste this URL into your browser:<br/>
        <a href="${verifyUrl}" style="color:#E85D04;word-break:break-all;">${verifyUrl}</a>
      </p>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eee;">
      <p style="color:#aaa;font-size:11px;margin:0;">© 2024 AfriAgroCore. Connecting Africa's Agricultural Community.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${toName},\n\nVerify your AfriAgroCore email address by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours.\n\n— AfriAgroCore Team`;

  if (!transporter) {
    // No SMTP configured — log to console so developers can test the flow
    console.log(`\n[EMAIL] Verification email for ${toEmail}:\n  URL: ${verifyUrl}\n`);
    return { sent: false, previewUrl: verifyUrl };
  }

  try {
    await transporter.sendMail({ from: FROM, to: toEmail, subject: "Verify your AfriAgroCore email", html, text });
    return { sent: true };
  } catch (err) {
    console.error("[EMAIL] Failed to send verification email:", err);
    return { sent: false, previewUrl: verifyUrl };
  }
}

export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetUrl: string
): Promise<{ sent: boolean; previewUrl?: string }> {
  const transporter = getTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:sans-serif;background:#f5f5f5;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
    <div style="background:#16a34a;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;">AfriAgroCore</h1>
      <p style="color:rgba(255,255,255,.85);margin:4px 0 0;font-size:13px;">Africa's Agricultural Marketplace</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1a1a1a;margin:0 0 12px;">Reset your password</h2>
      <p style="color:#555;line-height:1.6;">Hi ${toName},</p>
      <p style="color:#555;line-height:1.6;">
        We received a request to reset your AfriAgroCore password. Click the button below to choose a new password.
        This link expires in <strong>1 hour</strong>.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${resetUrl}" style="background:#16a34a;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color:#888;font-size:12px;line-height:1.6;">
        If you did not request a password reset, you can safely ignore this email. Your password will not change.<br/>
        Or copy and paste this URL into your browser:<br/>
        <a href="${resetUrl}" style="color:#16a34a;word-break:break-all;">${resetUrl}</a>
      </p>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eee;">
      <p style="color:#aaa;font-size:11px;margin:0;">© ${new Date().getFullYear()} AfriAgroCore. Connecting Africa's Agricultural Community.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${toName},\n\nReset your AfriAgroCore password by visiting:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.\n\n— AfriAgroCore Team`;

  if (!transporter) {
    console.log(`\n[EMAIL] Password reset email for ${toEmail}:\n  URL: ${resetUrl}\n`);
    return { sent: false, previewUrl: resetUrl };
  }

  try {
    await transporter.sendMail({ from: FROM, to: toEmail, subject: "Reset your AfriAgroCore password", html, text });
    return { sent: true };
  } catch (err) {
    console.error("[EMAIL] Failed to send password reset email:", err);
    return { sent: false, previewUrl: resetUrl };
  }
}
