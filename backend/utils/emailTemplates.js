// ============================================================
// SKILLSPHERE — PROFESSIONAL EMAIL TEMPLATES
// Email-safe inline CSS (Gmail/Outlook compatible)
// ============================================================

const COLORS = {
  primary: "#2563eb",
  gradient: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
  dark: "#1e293b",
  gray: "#64748b",
  light: "#f8fafc",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
};

// ---------- MASTER BASE TEMPLATE ----------
export const baseTemplate = ({
  emoji = "🔔",
  heading,
  subheading = "",
  bodyHtml,
  ctaText,
  ctaLink,
  accentColor = COLORS.primary,
  footerNote = "You received this email because you have a SkillSphere account.",
}) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background-color:#eef2ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2ff;padding:32px 12px;">
    <tr><td align="center">

      <table role="presentation" width="560" cellpadding="0" cellspacing="0" 
        style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;
        box-shadow:0 10px 40px rgba(37,99,235,0.12);">

        <!-- ===== HEADER (gradient) ===== -->
        <tr>
          <td style="background:${COLORS.gradient};background-color:${COLORS.primary};padding:32px 40px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" align="center">
              <tr>
                <td style="background:rgba(255,255,255,0.2);border-radius:14px;width:48px;height:48px;
                  text-align:center;vertical-align:middle;font-size:22px;font-weight:800;color:#ffffff;">S</td>
                <td style="padding-left:10px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:0.3px;">
                  Skill<span style="opacity:0.85;">Sphere</span>
                </td>
              </tr>
            </table>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:12px;letter-spacing:1px;text-transform:uppercase;">
              Intelligent Hyperlocal Freelance Ecosystem
            </p>
          </td>
        </tr>

        <!-- ===== EMOJI BADGE ===== -->
        <tr>
          <td align="center" style="padding:28px 40px 0;">
            <div style="width:64px;height:64px;background:${COLORS.light};border-radius:50%;
              line-height:64px;text-align:center;font-size:30px;border:2px solid #e0e7ff;">${emoji}</div>
          </td>
        </tr>

        <!-- ===== HEADING ===== -->
        <tr>
          <td align="center" style="padding:16px 40px 0;">
            <h1 style="margin:0;font-size:22px;color:${COLORS.dark};font-weight:800;">${heading}</h1>
            ${subheading ? `<p style="margin:6px 0 0;color:${COLORS.gray};font-size:14px;">${subheading}</p>` : ""}
          </td>
        </tr>

        <!-- ===== BODY ===== -->
        <tr>
          <td style="padding:20px 40px 8px;color:#334155;font-size:14px;line-height:1.7;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- ===== CTA BUTTON ===== -->
        ${ctaText && ctaLink ? `
        <tr>
          <td align="center" style="padding:20px 40px 8px;">
            <a href="${ctaLink}" target="_blank"
              style="display:inline-block;background:${COLORS.gradient};background-color:${accentColor};
              color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;
              padding:14px 36px;border-radius:12px;box-shadow:0 6px 20px rgba(37,99,235,0.35);">
              ${ctaText} →
            </a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:10px 40px 0;">
            <p style="margin:0;font-size:11px;color:#94a3b8;">
              Button not working? Copy this link:<br>
              <a href="${ctaLink}" style="color:${COLORS.primary};word-break:break-all;">${ctaLink}</a>
            </p>
          </td>
        </tr>` : ""}

        <!-- ===== DIVIDER ===== -->
        <tr><td style="padding:24px 40px 0;"><hr style="border:none;border-top:1px solid #f1f5f9;margin:0;"></td></tr>

        <!-- ===== FOOTER ===== -->
        <tr>
          <td style="padding:18px 40px 28px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
              ${footerNote}<br>
              © ${new Date().getFullYear()} SkillSphere · Made with 💙 in India<br>
              <span style="color:#cbd5e1;">This is an automated email — please do not reply.</span>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ---------- Reusable info-box row ----------
export const infoBox = (rows) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" 
    style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin:8px 0;">
    ${rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 16px;font-size:12px;color:#64748b;border-bottom:1px solid #f1f5f9;">${label}</td>
      <td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:700;text-align:right;border-bottom:1px solid #f1f5f9;">${value}</td>
    </tr>`).join("")}
  </table>`;

// ============================================================
// SPECIFIC TEMPLATES
// ============================================================

// 1️⃣ EMAIL VERIFICATION
export const verifyEmailTemplate = (name, url) =>
  baseTemplate({
    emoji: "✉️",
    heading: `Welcome aboard, ${name}! 🎉`,
    subheading: "You're one click away from joining SkillSphere",
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi <b>${name}</b>,</p>
      <p style="margin:0 0 12px;">Thanks for signing up on <b>SkillSphere</b> — India's smartest hyperlocal freelance platform. 
      Please verify your email address to unlock:</p>
      <p style="margin:0;padding-left:8px;">
        🤖 &nbsp;AI-powered gig matching<br>
        🔒 &nbsp;Secure escrow payments<br>
        💬 &nbsp;Real-time chat & collaboration
      </p>`,
    ctaText: "Verify My Email",
    ctaLink: url,
    footerNote: "If you didn't create this account, you can safely ignore this email.",
  });

// 2️⃣ PASSWORD RESET
export const resetPasswordTemplate = (name, url) =>
  baseTemplate({
    emoji: "🔑",
    heading: "Reset Your Password",
    subheading: "This link is valid for 30 minutes only",
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi <b>${name}</b>,</p>
      <p style="margin:0 0 12px;">We received a request to reset your SkillSphere password. 
      Click the button below to set a new one.</p>
      <p style="margin:0;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;
        padding:10px 14px;font-size:12px;color:#92400e;">
        ⚠️ For security, this link expires in <b>30 minutes</b>.
      </p>`,
    ctaText: "Reset Password",
    ctaLink: url,
    footerNote: "Didn't request this? Ignore this email — your password will stay unchanged.",
  });

// 3️⃣ GENERIC NOTIFICATION (notify.js ke saare 10 types isse use karenge)
const typeConfig = {
  "new-gig":            { emoji: "💼", cta: "View Gig" },
  "proposal-received":  { emoji: "📬", cta: "Review Proposal" },
  "proposal-accepted":  { emoji: "🎉", cta: "Start Working" },
  "payment":            { emoji: "💰", cta: "View Transactions" },
  "review":             { emoji: "⭐", cta: "View Review" },
  "message":            { emoji: "💬", cta: "Open Chat" },
  "dispute":            { emoji: "⚖️", cta: "View Dispute" },
  "system":             { emoji: "🔔", cta: "Open SkillSphere" },
};

export const notificationTemplate = ({ name, type = "system", title, body, link }) => {
  const cfg = typeConfig[type] || typeConfig.system;
  return baseTemplate({
    emoji: cfg.emoji,
    heading: title,
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi <b>${name}</b>,</p>
      <div style="background:#f8fafc;border-left:4px solid #2563eb;border-radius:0 12px 12px 0;
        padding:14px 18px;margin:0 0 12px;">
        <p style="margin:0;color:#334155;font-size:14px;">${body}</p>
      </div>
      <p style="margin:0;color:#64748b;font-size:13px;">
        Log in to your dashboard to take action.</p>`,
    ctaText: cfg.cta,
    ctaLink: link ? `${process.env.CLIENT_URL}${link}` : process.env.CLIENT_URL,
  });
};