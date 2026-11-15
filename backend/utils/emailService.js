const nodemailer = require('nodemailer');

const isSmtpConfigured = () => {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_HOST !== 'smtp.example.com' &&
    process.env.SMTP_USER &&
    process.env.SMTP_USER.trim() !== '' &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS.trim() !== ''
  );
};

const createTransporter = () => {
  if (!isSmtpConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send an email using Nodemailer or log in development if SMTP is unconfigured.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const configured = isSmtpConfigured();

  if (!configured) {
    console.warn(`[EmailService] SMTP credentials are not configured in .env. Email to "${to}" with subject "${subject}" was not dispatched via real SMTP.`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[EmailService:DEV_LOG] Intended Recipient: ${to}`);
      console.log(`[EmailService:DEV_LOG] Subject: ${subject}`);
      // If it contains a reset URL, print it clearly to dev terminal so developer can test easily!
      const resetUrlMatch = html && html.match(/href="([^"]*reset-password[^"]*)"/i);
      if (resetUrlMatch) {
        console.log(`\n======================================================`);
        console.log(`[DEV ONLY - PASSWORD RESET LINK]: ${resetUrlMatch[1]}`);
        console.log(`======================================================\n`);
      }
    }
    return { success: false, reason: 'SMTP_NOT_CONFIGURED', devLogged: true };
  }

  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || `Book Heaven <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, '')
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  isSmtpConfigured
};
