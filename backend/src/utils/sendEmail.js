const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP configs are missing, simulate sending
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n======================================');
    console.log('📧   EMAIL NOTIFICATION SIMULATION');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    if (options.message) {
      console.log(`Message: ${options.message}`);
    }
    console.log('======================================\n');
    return { success: true, message: 'Email sending simulated successfully' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'MedBook Healthcare'} <${process.env.EMAIL_FROM || 'noreply@medbook.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
  return info;
};

module.exports = sendEmail;
