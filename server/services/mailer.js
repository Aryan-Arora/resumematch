import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Resend's shared onboarding domain works with no DNS setup, but it only
// delivers to the account owner's own verified address until a custom domain
// is verified — fine for testing, a blocker for real candidates. Swapping in
// a verified domain later only means changing MAIL_FROM.
const FROM = process.env.MAIL_FROM || "ResumeMatch <onboarding@resend.dev>";

export async function sendShortlistEmail({ to, candidateName, jobTitle, orgName }) {
  if (!resend) {
    throw Object.assign(new Error("Email is not configured (RESEND_API_KEY unset)"), { status: 503 });
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `You've been shortlisted for the physical round — ${jobTitle}`,
    html: `
      <p>Hi ${candidateName},</p>
      <p>Good news — you've been shortlisted for the physical round of the <strong>${jobTitle}</strong> position${orgName ? ` at ${orgName}` : ""}.</p>
      <p>We'll be in touch shortly with the next steps.</p>
      <p>Congratulations, and thank you for your patience throughout the screening process.</p>
    `,
  });

  if (error) {
    throw Object.assign(new Error(error.message || "Failed to send email"), { status: 502 });
  }
}
