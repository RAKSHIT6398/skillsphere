import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,                // Secure port for Gmail
    secure: true,              // Must be true for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // 16-digit Gmail App Password hona chahiye
    },
    family: 4,                 // 👈 Ye line IPv6 ko disable karke error aane se rokegi
    connectionTimeout: 10000,  // Server hang hone se bachayega
  });

  await transporter.sendMail({
    from: `"SkillSphere" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};




