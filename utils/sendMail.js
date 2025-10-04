const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async (to, subject, html, attachmentPath = null) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.zeptomail.in",
      port: 587,
      secure: false,
      auth: {
        user: "emailapikey",
        pass: "PHtE6r1eEOnqgmR5oUNV5/6xE8OjMt8o/+8yKQBPsd5LXqAHHk0E/tkqwGTiqxp8VfZEQqaYmt9qtO+asLjRIW3sYT5MXWqyqK3sx/VYSPOZsbq6x00ZsVQfckfdVobrctZt0C3Sut/cNA=="
      }
    });

    const mailOptions = {
      from: '"ZERY Team" <noreply@zery.in>',
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
