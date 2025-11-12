const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async (to, subject, html, attachmentPath = null) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "gargmohit8302@gmail.com",
        pass: "pamm czos jovj ufgj"
      }
    });

    const mailOptions = {
      from: '"Feed ME Team" <gargmohit8302@gmail.com>',
      to,
      subject,
      html,
      attachments: [],
    };

    if (attachmentPath && fs.existsSync(attachmentPath)) {
      mailOptions.attachments.push({
        filename: path.basename(attachmentPath),
        path: attachmentPath,
      });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

module.exports = sendEmail;