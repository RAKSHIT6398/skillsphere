import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Direct host likh do variables ki jagah
    port: 465,             // Secure Port 465 use karo
    secure: true,          // 465 ke liye hamesha true
    auth: { 
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS 
    },
    // IPv4 force karne ke liye (ENETUNREACH fix)
    connectionTimeout: 10000, 
  });

  await transporter.sendMail({ 
    from: `"SkillSphere" <${process.env.EMAIL_USER}>`, 
    to, 
    subject, 
    html 
  });
};

export default sendEmail;