// import nodemailer from "nodemailer";

// const sendEmail = async ({ to, subject, html }) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,                // Secure port for Gmail
//     secure: true,              // Must be true for port 465
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS, // 16-digit Gmail App Password hona chahiye
//     },
//     family: 4,                 // 👈 Ye line IPv6 ko disable karke error aane se rokegi
//     connectionTimeout: 10000,  // Server hang hone se bachayega
//   });

//   await transporter.sendMail({
//     from: `"SkillSphere" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   });
// };npm install resend

// export default sendEmail;
import { Resend } from "resend";

const sendEmail = async ({ to, subject, html, text }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "SkillSphere <onboarding@resend.dev>",
    to,
    subject,
    html,
    text,
  });

  if (error) throw error;

  return data;
};

export default sendEmail;