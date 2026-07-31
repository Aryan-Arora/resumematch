const DOMAIN_LABELS = {
  tech: "Technology",
  service_delivery: "Service Delivery",
  sales: "Sales",
  marketing: "Marketing",
  finance_accounting: "Finance & Accounting",
  hr_recruiting: "HR & Recruiting",
  skilled_trades: "Skilled Trades",
  healthcare_support: "Healthcare Support",
  hospitality_food_service: "Hospitality & Food Service",
  logistics_warehouse: "Logistics & Warehouse",
  general: "General (auto-extracted from this job description)",
};

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

export function generateComplianceNoticeHtml(job, semanticWeight = 60) {
  const skillWeight = 100 - semanticWeight;
  const domainLabel = DOMAIN_LABELS[job.jd_domain] || job.jd_domain;
  const skills = job.jd_skills || [];
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Automated Employment Decision Tool Notice — ${escapeHtml(job.title)}</title>
<style>
  /* Fixed light document, not theme-adaptive — this is a printable formal
     notice, always rendered on a white page regardless of browser theme. */
  @media print {
    body { margin: 0; }
    .no-print { display: none; }
  }
  html {
    background: #ffffff;
    color-scheme: light;
  }
  body {
    background: #ffffff;
    font-family: Georgia, "Times New Roman", serif;
    color: #1a1a1a;
    max-width: 720px;
    margin: 0 auto;
    padding: 48px 32px 80px;
    line-height: 1.6;
    font-size: 15px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 32px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .brand-mark {
    width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  }
  .brand-name {
    font-weight: 700;
    font-size: 15px;
    color: #1a1a1a;
  }
  h1 {
    font-size: 22px;
    line-height: 1.35;
    margin: 0 0 4px;
  }
  .subtitle {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 13px;
    color: #555;
    margin: 0 0 36px;
  }
  h2 {
    font-size: 16px;
    margin: 32px 0 10px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 6px;
  }
  p { margin: 0 0 12px; }
  ul { margin: 0 0 12px; padding-left: 22px; }
  li { margin-bottom: 4px; }
  .meta-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    margin-bottom: 8px;
  }
  .meta-table td {
    padding: 5px 0;
    vertical-align: top;
  }
  .meta-table td:first-child {
    color: #555;
    width: 220px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 12.5px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .skill-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 8px 0 16px;
  }
  .skill-chip {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 12.5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 3px 9px;
  }
  .fill-in {
    border: 1px dashed #999;
    border-radius: 4px;
    padding: 14px 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 13.5px;
    color: #555;
  }
  .disclaimer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #ccc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 12px;
    color: #666;
    line-height: 1.55;
  }
  .print-bar {
    max-width: 720px;
    margin: 0 auto 24px;
    padding: 0 32px;
  }
  .print-bar button {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 13px;
    font-weight: 600;
    background: #1a1a1a;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 9px 16px;
    cursor: pointer;
  }
</style>
</head>
<body>
  <div class="print-bar no-print">
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="brand">
    <svg class="brand-mark" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="12" fill="#050505"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#60A5FA" stroke-width="1.5" opacity="0.35"/>
      <line x1="50" y1="20" x2="50" y2="35" stroke="#60A5FA" stroke-width="2.5"/>
      <line x1="50" y1="65" x2="50" y2="80" stroke="#60A5FA" stroke-width="2.5"/>
      <path d="M20 50 H40 L45 35 L55 65 L60 50 H80" fill="none" stroke="#60A5FA" stroke-width="3.5" stroke-linecap="square" stroke-linejoin="miter"/>
    </svg>
    <span class="brand-name">ResumeMatch</span>
  </div>

  <h1>Automated Employment Decision Tool (AEDT) Disclosure Notice</h1>
  <p class="subtitle">Generated ${escapeHtml(generatedDate)} for the position below. This notice describes the automated tool used to screen candidates for this role.</p>

  <table class="meta-table">
    <tr><td>Position</td><td>${escapeHtml(job.title)}</td></tr>
    <tr><td>Tool used</td><td>ResumeMatch (resume screening &amp; ranking)</td></tr>
    <tr><td>Screening category</td><td>${escapeHtml(domainLabel)}</td></tr>
    <tr><td>Notice date</td><td>${escapeHtml(generatedDate)}</td></tr>
  </table>

  <h2>What this tool does</h2>
  <p>
    ResumeMatch is an automated screening tool that reviews submitted resumes against the qualifications
    for this position and produces a ranked shortlist for a human reviewer. It does not make hiring
    decisions. Every candidate's resume is read by a human as part of the hiring process; this tool is
    used to help prioritize review, not to reject candidates automatically.
  </p>

  <h2>What this tool measures</h2>
  <p>
    For this position, the tool evaluates each resume against ${skills.length} qualification(s) identified from
    the job description:
  </p>
  <div class="skill-list">
    ${skills.map((s) => `<span class="skill-chip">${escapeHtml(s)}</span>`).join("") || "<em>No specific qualifications were extracted for this role.</em>"}
  </div>
  <p>
    A resume is checked for each qualification in two ways: (1) an exact or near-exact mention in the
    resume text, and (2) work described in different words that plausibly demonstrates the same
    qualification (for example, a resume describing relevant responsibilities without using the exact
    term). In the second case, the specific sentence from the resume used as evidence is recorded and
    available for human review alongside the result.
  </p>

  <h2>How the overall score is calculated</h2>
  <p>
    Each resume receives two component scores, combined into a single ranking score:
  </p>
  <ul>
    <li><strong>Semantic similarity (${semanticWeight}% weight)</strong> — how closely the overall content of the resume relates
      to the job description, using a language-similarity model. This does not use keyword matching alone.</li>
    <li><strong>Qualification match (${skillWeight}% weight)</strong> — the proportion of the qualifications listed above
      that the resume demonstrates, directly or through inferred evidence.</li>
  </ul>
  <p>
    This weighting can be adjusted per role by the hiring team; the values above reflect the settings
    used to produce results for this position.
  </p>

  <h2>What this tool does not consider</h2>
  <p>
    The tool processes only the text content of the submitted resume. It does not have access to and
    does not consider a candidate's race, color, religion, sex, national origin, age, disability status,
    genetic information, veteran status, or any other legally protected characteristic. It does not
    consider a candidate's name, photograph, or contact information as part of scoring.
  </p>

  <h2>Human review and candidate rights</h2>
  <div class="fill-in">
    <p style="margin:0 0 8px;"><strong>To be completed by the employer before distribution:</strong></p>
    <p style="margin:0 0 8px;">
      Describe your organization's process for candidates to request an alternative selection process
      or accommodation, and the contact information for that request, as required under applicable
      local law (e.g., NYC Local Law 144 § 20-871).
    </p>
    <p style="margin:0;">Contact: _____________________________</p>
  </div>

  <div class="disclaimer">
    <strong>This document is generated automatically from ResumeMatch's actual scoring configuration for
    this role and is intended as a starting point, not a complete or certified legal notice.</strong>
    Requirements for automated employment decision tool disclosures vary by jurisdiction (e.g., New York
    City Local Law 144, and other state and local laws) and change over time. This notice does not
    constitute legal advice. Have this document reviewed by qualified legal counsel before distributing
    it to candidates or relying on it for compliance purposes.
  </div>
</body>
</html>`;
}
