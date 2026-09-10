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
  {
    slug: "how-does-ai-resume-screening-work",
    title: "How Does AI Resume Screening Actually Work? A Plain-English Breakdown",
    description:
      "No jargon. Here's what actually happens between uploading a resume and getting a ranked shortlist — and where most tools cut corners.",
    date: "2026-08-22",
    readTime: "6 min read",
    excerpt:
      "No jargon, no marketing language — here's what actually happens between uploading a resume and getting a ranked shortlist.",
    content: [
      {
        type: "p",
        text: "\"AI resume screening\" gets used as a catch-all term for anything from a simple keyword filter to a genuine language model doing semantic comparison. They produce wildly different quality results, and the label doesn't tell you which one you're getting. Here's what's actually happening under the hood, step by step.",
      },
      { type: "h2", text: "Step 1: Parsing — turning a PDF into text a computer can reason about" },
      {
        type: "p",
        text: "A resume PDF or DOCX is, to a computer, just a layout of text boxes. Parsing extracts the actual words in a sensible reading order — name, work history, dates, skills — and normalizes formatting quirks (tables, columns, headers) that would otherwise scramble the content. Bad parsing is invisible to you but devastating to results: if the parser reads a two-column resume left-to-right instead of column-by-column, every sentence downstream is nonsense.",
      },
      { type: "h2", text: "Step 2: Embeddings — turning words into something comparable" },
      {
        type: "p",
        text: "This is the actual \"AI\" part. An embedding model converts a chunk of text into a vector — a list of numbers that captures its meaning, not just its exact wording. This is what lets \"led a team of engineers\" and \"managed an engineering team\" register as similar even though they don't share many words. Keyword search can't do this; it only matches literal strings.",
      },
      { type: "h2", text: "Step 3: Comparison — scoring the resume against the job description" },
      {
        type: "p",
        text: "The job description goes through the same embedding process, broken into its individual requirements. Each requirement is compared against the resume's content to find the closest matching evidence. This is where the real design decision sits: a black-box tool stops here and outputs one number. A transparent one keeps the per-requirement breakdown — which is what actually lets you see why a candidate scored the way they did.",
      },
      { type: "h2", text: "Step 4: Inference — catching what wasn't explicitly said" },
      {
        type: "p",
        text: "A candidate who managed a five-person on-call rotation has incident-response experience, even if they never typed the phrase \"incident response.\" Reasonable inference from stated experience — not literal keyword presence — is what separates a resume screener that finds only obvious matches from one that surfaces qualified people who described their work differently than your job posting does.",
      },
      { type: "h2", text: "Where tools cut corners" },
      {
        type: "ul",
        items: [
          "Skipping local embeddings and routing every resume through a paid third-party AI API — expensive at volume, and it means candidate data leaves your infrastructure",
          "Collapsing the whole comparison into a single score with no per-requirement breakdown",
          "Training or tuning primarily on software-engineering resumes, so accuracy quietly drops for every other job domain",
        ],
      },
      {
        type: "p",
        text: "None of this requires trusting a vendor's marketing claims — ask what the score is actually made of. If the answer is \"a proprietary algorithm,\" that's not an answer.",
      },
    ],
  },
  {
    slug: "free-resume-screening-software",
    title: "Free Resume Screening Software: What \"Free\" Actually Means",
    description:
      "Free tools usually make money somewhere. Here's how to spot the tradeoffs before you commit candidate data to one.",
    date: "2026-08-22",
    readTime: "4 min read",
    excerpt:
      "Free tools usually make money somewhere — here's how to spot the tradeoffs before you commit candidate data to one.",
    content: [
      {
        type: "p",
        text: "\"Free resume screening software\" is a real, common search — and a reasonable thing to want, especially for a small team or agency that can't justify an enterprise ATS contract. But \"free\" hides a few different business models, and they come with different tradeoffs worth knowing before you upload real candidate data anywhere.",
      },
      { type: "h2", text: "Free trial that becomes a paywall" },
      {
        type: "p",
        text: "The most common pattern: full access for 14-30 days, then a hard paywall. Fine if you're evaluating, less fine if you didn't realize the trial clock started the moment you signed up rather than when you actually started using it.",
      },
      { type: "h2", text: "Free tier with a volume cap" },
      {
        type: "p",
        text: "Free up to some number of resumes or jobs per month, then usage-based billing kicks in. Reasonable model, but worth checking exactly where the line is before you're mid-hiring-cycle and hit it.",
      },
      { type: "h2", text: "Free because your data is the product" },
      {
        type: "p",
        text: "The tradeoff that matters most and gets disclosed least clearly. If a tool is free with no obvious business model, check the privacy policy for what happens to the resumes and job descriptions you upload — whether they're used to train models, sold, or shared with data brokers. This is worth checking even for paid tools, but it's especially worth checking for free ones.",
      },
      { type: "h2", text: "What to actually check before choosing one" },
      {
        type: "ul",
        items: [
          "Does the free tier require a credit card up front? (A soft signal for how the trial-to-paid conversion is designed to work.)",
          "What happens to candidate data — is it processed locally/on the vendor's own infrastructure, or piped through a third-party AI API you have no visibility into?",
          "Is pricing, if it exists, published anywhere, or only revealed after a sales call?",
        ],
      },
      {
        type: "p",
        text: "ResumeMatch is free during early access, with no credit card required, and matching runs on local embeddings rather than sending resumes to a third-party AI API — not because we think every free tool is bad, but because those are exactly the questions we'd want a straight answer to as a user.",
      },
    ],
  },
  {
    slug: "how-to-screen-100-resumes-quickly",
    title: "How to Screen 100 Resumes Quickly Without Losing the Human Review",
    description: "A practical workflow for turning a large applicant pool into a reviewable shortlist while keeping hiring decisions explainable.",
    date: "2026-09-08",
    readTime: "4 min read",
    excerpt: "A large applicant pool does not require a rushed shortlist. Use the job description as the source of truth, rank candidates, and keep the evidence visible.",
    content: [
      { type: "p", text: "Screening 100 resumes manually from top to bottom makes every decision slower and less consistent. A better workflow uses software for the first pass and keeps people responsible for the final judgment." },
      { type: "h2", text: "Start with a specific job description" },
      { type: "p", text: "Separate must-have requirements from useful signals before reviewing applicants. The shortlist is only as good as the criteria it is measured against." },
      { type: "h2", text: "Rank before you deeply review" },
      { type: "p", text: "Use semantic similarity and skill coverage to bring the most relevant resumes to the top. This reduces reading time without pretending that a score is a hiring decision." },
      { type: "h2", text: "Keep the reason beside the score" },
      { type: "p", text: "For every candidate, review matched skills, missing requirements, implied experience, and the supporting resume evidence. That is where human judgment adds value." },
      { type: "h2", text: "Use a repeatable review threshold" },
      { type: "p", text: "Decide in advance which candidates need a closer look, which are ready for a phone screen, and which are missing a dealbreaker requirement. Apply the same review logic to the whole batch." },
    ],
  },
  {
    slug: "resume-screening-checklist-for-recruiters",
    title: "The Resume Screening Checklist Recruiters Can Reuse for Every Role",
    description:
      "A practical resume screening checklist for recruiters: define must-haves, separate evidence from assumptions, and document every shortlist decision.",
    date: "2026-09-10",
    readTime: "5 min read",
    excerpt:
      "Use the same simple checklist for every req so screening stays consistent when the applicant pool grows.",
    content: [
      { type: "p", text: "A repeatable screening checklist makes hiring decisions easier to compare and easier to explain. It also keeps a strong candidate from being rejected because one reviewer happened to skim more quickly than another." },
      { type: "h2", text: "1. Write the must-have requirements first" },
      { type: "p", text: "Separate requirements that are genuinely necessary on day one from skills that can be learned after hiring. Put certifications, licenses, location, schedule, and work authorization requirements in the same written list as technical or functional skills." },
      { type: "h2", text: "2. Decide what counts as evidence" },
      { type: "p", text: "A job title alone is weak evidence. Look for the project, responsibility, outcome, certification, or sentence that demonstrates the requirement. Record the evidence instead of relying on a feeling that someone is a good fit." },
      { type: "h2", text: "3. Separate missing from unstated" },
      { type: "p", text: "A resume may not mention a skill even when the candidate has related experience. Mark requirements as matched, missing, or possibly implied so a reviewer can decide whether a follow-up question is worthwhile." },
      { type: "h2", text: "4. Apply the same threshold to everyone" },
      { type: "p", text: "Choose a review threshold before you start. For example, move candidates with all must-haves to a closer review, keep candidates with one unclear requirement for a phone screen, and document why candidates below the threshold were not progressed." },
      { type: "h2", text: "5. Keep a short decision record" },
      { type: "p", text: "A one-line reason beside every decision is enough: matched the required license, missing the night-shift requirement, or experience is relevant but needs verification. This makes calibration and handoffs much easier." },
    ],
  },
  {
    slug: "semantic-resume-search-vs-keyword-matching",
    title: "Semantic Resume Search vs. Keyword Matching: What Recruiters Should Know",
    description:
      "Keyword search misses equivalent language in resumes. Learn how semantic resume search works and when recruiters should still review the underlying evidence.",
    date: "2026-09-10",
    readTime: "5 min read",
    excerpt:
      "Exact keywords are useful for some hard requirements, but they are a poor substitute for understanding what a candidate actually did.",
    content: [
      { type: "p", text: "Recruiters often start with keyword search because it is fast and familiar. The problem is that candidates describe the same work in many different ways. A search for one exact phrase can hide relevant experience behind different wording." },
      { type: "h2", text: "What keyword matching does well" },
      { type: "p", text: "Exact matching is useful when a term must appear precisely, such as a license number, a required certification, or a specific compliance designation. It is also easy to audit because the match is visible." },
      { type: "h2", text: "Where keyword matching breaks down" },
      { type: "p", text: "A candidate who writes managed an engineering team may be relevant to a requirement for led software developers, even though the words are different. Synonyms, abbreviations, job-specific language, and transferable experience create gaps that literal search cannot resolve." },
      { type: "h2", text: "How semantic search helps" },
      { type: "p", text: "Semantic matching represents text by meaning, then compares each job requirement with the closest evidence in the resume. It can surface related language while still showing the sentence that drove the match." },
      { type: "h2", text: "Use both signals together" },
      { type: "p", text: "Semantic similarity should help prioritize the review, not replace recruiter judgment. Keep exact checks for dealbreakers, use semantic matching to find equivalent experience, and inspect the evidence before making a decision." },
    ],
  },
  {
    slug: "how-small-recruiting-teams-can-use-ai-screening",
    title: "How Small Recruiting Teams Can Use AI Screening Without Losing Control",
    description:
      "A practical guide to using AI resume screening for small recruiting teams while keeping criteria, evidence, privacy, and human review in control.",
    date: "2026-09-10",
    readTime: "6 min read",
    excerpt:
      "Small teams can save screening time without handing hiring decisions to an opaque model. Start with clear criteria and keep the reasoning visible.",
    content: [
      { type: "p", text: "Small recruiting teams do not need a large ATS implementation to make resume screening more consistent. A focused screening workflow can reduce repetitive reading while leaving the decision with the recruiter or hiring manager." },
      { type: "h2", text: "Begin with the job description you already use" },
      { type: "p", text: "AI screening is only as useful as the criteria it receives. Remove vague phrases, identify must-have requirements, and make the responsibilities specific enough to compare against a resume." },
      { type: "h2", text: "Use ranking for triage, not automatic rejection" },
      { type: "p", text: "A ranked list helps a small team decide where to spend its limited review time. It should not silently reject applicants without a human checking the requirements and evidence behind the ranking." },
      { type: "h2", text: "Require an explanation for every recommendation" },
      { type: "p", text: "The useful output is not just a score. Recruiters should be able to see which skills matched, what appears to be missing, what was inferred, and the resume sentence supporting the result." },
      { type: "h2", text: "Set a privacy boundary before uploading resumes" },
      { type: "p", text: "Check where documents are processed, how long they are retained, whether they are used to train models, and who on your team can access them. This should be a procurement question even when the tool is free." },
      { type: "h2", text: "Review the workflow after every hiring cycle" },
      { type: "p", text: "Compare shortlisted candidates with interview outcomes. If strong candidates are consistently missing, refine the job description, threshold, or review process rather than blindly increasing the model's weight." },
    ],
  },
];

export function getPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
