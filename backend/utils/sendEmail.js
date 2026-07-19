import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  // ✅ Render pe env vars check karo
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL_USER or EMAIL_PASS not set in environment!");
    throw new Error("Email credentials missing");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    family: 4,
    connectionTimeout: 10000,
    tls: {
      rejectUnauthorized: false, // ✅ Render pe SSL issue fix
    },
  });

  // ✅ Verify connection before sending
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified");
  } catch (err) {
    console.error("❌ SMTP verification failed:", err.message);
    throw err;
  }

  const info = await transporter.sendMail({
    from: `"SkillSphere" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("✅ Email sent:", info.messageId);
  return info;
};

export default sendEmail;