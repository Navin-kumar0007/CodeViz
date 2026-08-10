const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// One transporter, built from env. If SMTP isn't configured we fall back to
// logging the email (dev-friendly, never crashes).
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const FROM = process.env.EMAIL_FROM || 'CodeViz <no-reply@codeviz.app>';

/** Send an email. Returns true if sent (or logged in dev). Never throws. */
async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    logger.info(`✉️  [dev email — SMTP not configured] to=${to} · ${subject}\n${text || html}`);
    return true;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html, text: text || undefined });
    return true;
  } catch (e) {
    logger.error(`Email send failed to ${to}: ${e.message}`);
    return false;
  }
}

// --- Templates ---

function shell(title, body) {
  return `<div style="font-family:Inter,Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#161826">
    <div style="font-weight:800;font-size:18px;color:#5570ff;margin-bottom:16px">◈ CodeViz</div>
    <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #e4e7f1;margin:24px 0"/>
    <div style="font-size:12px;color:#949bb4">You received this because an action was taken on your CodeViz account.</div>
  </div>`;
}

function passwordReset({ name, resetUrl }) {
  return {
    subject: 'Reset your CodeViz password',
    text: `Hi ${name || 'there'},\n\nReset your password:\n${resetUrl}\n\nThis link expires in 10 minutes. If you didn't request it, ignore this email.`,
    html: shell('Reset your password', `
      <p style="color:#5b627b">Hi ${name || 'there'}, click below to set a new password. This link expires in <b>10 minutes</b>.</p>
      <p><a href="${resetUrl}" style="display:inline-block;background:#5570ff;color:#fff;text-decoration:none;padding:11px 22px;border-radius:10px;font-weight:700">Reset password</a></p>
      <p style="color:#949bb4;font-size:12px">Or paste this link: ${resetUrl}</p>
      <p style="color:#949bb4;font-size:12px">Didn't request this? You can safely ignore this email.</p>`),
  };
}

function welcome({ name }) {
  return {
    subject: 'Welcome to CodeViz 🎉',
    text: `Hi ${name || 'there'}, welcome to CodeViz! Write code, watch it run as an animation, and learn by seeing. Jump in: ${process.env.FRONTEND_URL || ''}`,
    html: shell('Welcome to CodeViz 🎉', `
      <p style="color:#5b627b">Hi ${name || 'there'} — welcome! CodeViz lets you <b>write code and watch it run as an animation</b>, learn from animated lessons, and practice with instant visual feedback.</p>
      <p><a href="${process.env.FRONTEND_URL || '#'}" style="display:inline-block;background:#5570ff;color:#fff;text-decoration:none;padding:11px 22px;border-radius:10px;font-weight:700">Start visualizing</a></p>`),
  };
}

module.exports = { sendEmail, passwordReset, welcome };
