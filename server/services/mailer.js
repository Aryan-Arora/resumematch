import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Resend's shared onboarding domain works with no DNS setup, but it only
// delivers to the account owner's own verified address until a custom domain
// is verified — fine for testing, a blocker for real candidates. Swapping in
// a verified domain later only means changing MAIL_FROM.
const FROM = process.env.MAIL_FROM || "ResumeMatch <onboarding@resend.dev>";

export async function sendShortlistEmail({ to, candidateName, jobTitle, orgName }) {
  return sendCandidateEmail({ to, candidateName, jobTitle, orgName, type: "shortlist" });
}

const DEFAULT_TEMPLATES = {
  shortlist: "Hi {{candidateName}},\n\nGood news — you've been shortlisted for {{jobTitle}} at {{orgName}}. We'll be in touch shortly with next steps.",
  rejection: "Hi {{candidateName}},\n\nThank you for your interest in {{jobTitle}}. We won't be moving forward at this time, but we appreciate your time.",
  interview: "Hi {{candidateName}},\n\nWe'd like to invite you to interview for {{jobTitle}} at {{orgName}}. Schedule a time here: {{interviewUrl}}",
};

export async function sendCandidateEmail({ to, candidateName, jobTitle, orgName, type, template, interviewUrl }) {
  if (!resend) {
    throw Object.assign(new Error("Email is not configured (RESEND_API_KEY unset)"), { status: 503 });
  }

  const values = { candidateName, jobTitle, orgName: orgName || "our team", interviewUrl: interviewUrl || "" };
  const body = (template || DEFAULT_TEMPLATES[type] || DEFAULT_TEMPLATES.shortlist).replace(/\{\{(candidateName|jobTitle|orgName|interviewUrl)\}\}/g, (_, key) => values[key] || "");
  const subject = type === "interview" ? `Interview invitation — ${jobTitle}` : type === "rejection" ? `Your application — ${jobTitle}` : `You've been shortlisted — ${jobTitle}`;
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    text: body,
  });

  if (error) {
    throw Object.assign(new Error(error.message || "Failed to send email"), { status: 502 });
  }
}
