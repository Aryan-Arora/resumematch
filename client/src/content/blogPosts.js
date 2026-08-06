// Blog post content, structured as simple content blocks so BlogPost.jsx can
// render without pulling in a markdown dependency. Keep posts grounded in
// what the product actually does — no invented stats, no fabricated case
// studies, no "customers report" claims.

export const BLOG_POSTS = [
  {
    slug: "signs-your-resume-screening-is-losing-candidates",
    title: "5 Signs Your Resume Screening Process Is Losing Good Candidates",
    description:
      "Keyword filters and gut-feel skims both quietly drop qualified people. Here's what that actually looks like, and what to check for.",
    date: "2026-08-06",
    readTime: "5 min read",
    excerpt:
      "Keyword filters and gut-feel skims both quietly drop qualified people — often without anyone noticing. Here's what that looks like in practice.",
    content: [
      {
        type: "p",
        text: "Most resume screening problems are invisible. A qualified candidate gets filtered out, nobody sees the rejection, and the role stays open a few weeks longer than it should. Here are five patterns that usually mean it's happening to you.",
      },
      { type: "h2", text: "1. Your keyword filter is doing the actual deciding" },
      {
        type: "p",
        text: "If your process is \"does the resume contain the word 'Python'\", you're rejecting the candidate who wrote \"built the backend in Django\" and never spelled out the language underneath it. Keyword matching rewards resume-writing skill, not job skill.",
      },
      { type: "h2", text: "2. Nobody can explain why a candidate was rejected" },
      {
        type: "p",
        text: "Ask the recruiter who screened last week's batch why candidate #14 didn't make the cut. If the answer is \"didn't feel like a strong fit,\" that's not a decision you can defend, learn from, or improve. A screening process without a reason attached to every outcome is a process you can't debug.",
      },
      { type: "h2", text: "3. Every shortlist looks the same" },
      {
        type: "p",
        text: "Same schools, same company names, same job titles. That's usually a sign the filter is pattern-matching on résumé prestige signals instead of the actual skills in the job description — and it means you're structurally missing the career-changer, the self-taught candidate, and the person from a non-traditional background who'd be excellent at the job.",
      },
      { type: "h2", text: "4. Screening time scales linearly with applicant volume" },
      {
        type: "p",
        text: "If doubling your applicant pool doubles your screening hours, the bottleneck is manual reading, not decision quality. That's fine at 20 applicants. It's a real cost at 200.",
      },
      { type: "h2", text: "5. Non-tech roles get screened worse than tech roles" },
      {
        type: "p",
        text: "A lot of screening tooling is built and tuned for software engineering resumes — clean skill lists, recognizable tech stacks. The same tooling often falls apart on a CNA's resume, an electrician's certifications, or a warehouse lead's shift-management experience, because the important signals aren't a neat list of keywords.",
      },
      { type: "h2", text: "What actually fixes this" },
      {
        type: "p",
        text: "The fix isn't \"read every resume more carefully\" — that doesn't scale. It's making the screening step show its work: which skills matched, which are missing, which are implied by experience the candidate didn't spell out explicitly, and the actual sentence in the resume that justifies each one. That's the only way a rejection is something you can look at, question, and trust — instead of a black box you have to take on faith.",
      },
    ],
  },
  {
    slug: "ai-match-score-meaningless-without-context",
    title: "Why a 92% AI Match Score Can Be Meaningless Without Context",
    description:
      "A single percentage tells you nothing about why a candidate scored that way. Here's what actually needs to sit behind the number.",
    date: "2026-08-06",
    readTime: "4 min read",
    excerpt:
      "A single percentage tells you nothing about why a candidate scored that way — and that's exactly the problem with most AI screening tools.",
    content: [
      {
        type: "p",
        text: "\"92% match\" sounds precise. It isn't. A percentage on its own answers zero useful questions: matched on what? Missing what? Is the 8% gap a dealbreaker skill or something trivial? Without an answer, the number is a number you have to trust blindly.",
      },
      { type: "h2", text: "The black-box problem" },
      {
        type: "p",
        text: "Most AI resume scoring tools run a resume and a job description through a model and hand back a single value. The model might be doing something reasonable internally — or it might be over-weighting a resume's job titles and under-weighting the actual skill overlap. From the outside, you can't tell the difference, and neither can the candidate you rejected.",
      },
      { type: "h2", text: "It's also a compliance problem, not just a UX one" },
      {
        type: "p",
        text: "Jurisdictions increasingly require employers to be able to explain automated hiring decisions — not just claim they were fair. \"The algorithm said 92%\" is not an explanation a regulator, or a rejected candidate, will accept. If you can't show your work, you can't defend the decision.",
      },
      { type: "h2", text: "What a score should come with" },
      {
        type: "ul",
        items: [
          "Matched skills — explicitly stated in the resume and the job description",
          "Missing skills — required by the job description, absent from the resume",
          "Implied skills — not stated outright, but reasonably inferred from experience (and the evidence sentence that justifies the inference)",
          "The actual sentence from the resume that backs each of the above, not just a label",
        ],
      },
      {
        type: "p",
        text: "With that breakdown, a 63% match on a candidate missing one specific certification is obviously a different situation than a 63% match on a candidate missing half the required skill set — even though the number looks identical. The percentage becomes a summary of something you can inspect, not a verdict you have to accept on faith.",
      },
    ],
  },
  {
    slug: "resume-screening-beyond-tech-roles",
    title: "Resume Screening Beyond Tech: Hiring for Skilled Trades, Healthcare, and Hospitality",
    description:
      "Most AI screening tools are tuned for software engineering resumes. Here's why that approach breaks down for the majority of hiring, and what to look for instead.",
    date: "2026-08-06",
    readTime: "4 min read",
    excerpt:
      "Most AI screening tools are tuned for software engineering resumes. Here's why that approach breaks down for the majority of hiring.",
    content: [
      {
        type: "p",
        text: "A huge amount of resume-screening tooling was built with one shape of candidate in mind: clean, keyword-dense tech resumes with a tidy \"Skills\" section listing recognizable tools. That works fine for software roles. It works badly for most other hiring.",
      },
      { type: "h2", text: "Why non-tech resumes are harder to screen well" },
      {
        type: "p",
        text: "A licensed electrician's resume signals competence through certifications, license numbers, and years on specific job types — not a bulleted skill list. A CNA's resume shows relevant experience through the facilities they've worked in and the patient-care duties they held. A warehouse operations lead demonstrates capability through shift sizes managed and safety records, not tool names. None of that fits a keyword-matching model built for \"React, Node.js, AWS.\"",
      },
      { type: "h2", text: "The cost of getting this wrong" },
      {
        type: "p",
        text: "When your screening tool only works well for tech roles, every other req either gets screened manually (slow, doesn't scale) or gets screened with a tool that quietly under-serves it (bad shortlists, missed candidates, nobody notices until the hire doesn't work out).",
      },
      { type: "h2", text: "What good screening looks like across domains" },
      {
        type: "p",
        text: "The matching logic has to reason about the job description on its own terms, not force every domain into a tech-shaped skills taxonomy. A job description for a beekeeper and a job description for a backend engineer should each get their required skills, certifications, and experience signals extracted from what's actually written — not mapped onto a fixed list built for one industry.",
      },
      {
        type: "p",
        text: "In practice that means the same matching engine needs to work whether the role is skilled trades, healthcare support, hospitality, logistics, sales, or engineering — pulling the relevant signal out of each job description and each resume on its own terms, rather than assuming everyone's résumé looks like a software engineer's.",
      },
    ],
  },
];

export function getPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
