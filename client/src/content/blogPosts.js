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
  {
    slug: "resume-screening-scorecard-template",
    title: "Resume Screening Scorecard Template for Recruiters",
    description:
      "Use this practical resume screening scorecard to define must-have skills, compare candidates consistently, and document shortlist decisions.",
    date: "2026-09-10",
    readTime: "6 min read",
    excerpt:
      "A simple scorecard helps recruiters compare candidates consistently without reducing the hiring decision to one unexplained number.",
    content: [
      { type: "p", text: "A resume screening scorecard turns a vague first impression into a repeatable review. It gives every reviewer the same questions to answer and leaves a short record of why a candidate moved forward or stopped." },
      { type: "h2", text: "The scorecard template" },
      { type: "ul", items: [
        "Must-have requirement: Is it present, absent, or unclear?",
        "Relevant experience: What responsibility or outcome demonstrates it?",
        "Useful additional signal: Does the candidate bring a skill that improves the fit?",
        "Evidence: Which sentence or section of the resume supports the assessment?",
        "Next step: Phone screen, hiring-manager review, hold for clarification, or decline",
      ] },
      { type: "h2", text: "Step 1: Turn the job description into criteria" },
      { type: "p", text: "Before opening resumes, list the requirements that are genuinely necessary. Include licenses, certifications, schedule, location, language, and domain experience where they matter. Keep preferred requirements separate so they do not accidentally become rejection criteria." },
      { type: "h2", text: "Step 2: Define what acceptable evidence looks like" },
      { type: "p", text: "For each must-have, write one example of acceptable evidence. A warehouse lead might show responsibility for shift planning and safety procedures; a recruiter might show ownership of a hiring pipeline and measurable time-to-fill improvements. This keeps titles from doing too much of the work." },
      { type: "h2", text: "Step 3: Use three evidence labels" },
      { type: "p", text: "Mark each requirement as matched when it is directly supported, missing when the resume provides no support, or implied when related experience suggests it but a follow-up is needed. The implied category prevents a promising candidate from being discarded just because they used different wording." },
      { type: "h2", text: "Step 4: Add a decision threshold" },
      { type: "p", text: "Choose the next step before reviewing the pool. Candidates with all must-haves can move to a closer review; candidates with one unclear requirement can go to a phone screen; candidates missing a true dealbreaker can be documented and declined. The threshold should be consistent across the batch." },
      { type: "h2", text: "Step 5: Review the scorecard with a person" },
      { type: "p", text: "A scorecard organizes evidence; it does not make the hiring decision. A recruiter or hiring manager should check the underlying resume, resolve ambiguous requirements, and consider context that a screening tool cannot see." },
      { type: "h2", text: "Use the scorecard with ResumeMatch" },
      { type: "p", text: "ResumeMatch can provide the first-pass comparison by showing matched, missing, and implied skills with supporting resume evidence. You can use that breakdown to fill the scorecard faster, then keep the human review as the final step." },
    ],
  },
  {
    slug: "explainable-ai-resume-screening",
    title: "What Is Explainable AI in Hiring? A Recruiter's Guide",
    description:
      "Explainable AI in hiring means every match comes with a reason you can check, not just a score. Here's what that actually looks like in practice.",
    date: "2026-09-22",
    readTime: "5 min read",
    excerpt:
      "Explainable AI in hiring means every match comes with a reason you can check — here's what that looks like in practice, not just as a buzzword.",
    content: [
      {
        type: "p",
        text: "\"Explainable AI\" gets used loosely enough in hiring software marketing that it's worth pinning down what it actually means, and what a tool has to do to earn the label rather than just claim it.",
      },
      { type: "h2", text: "The plain definition" },
      {
        type: "p",
        text: "An explainable AI system produces an output a person can inspect and verify, not just trust. For resume screening specifically, that means a reviewer can see exactly which parts of a candidate's resume led to a given score — not just the score itself.",
      },
      { type: "h2", text: "What it looks like when done properly" },
      {
        type: "ul",
        items: [
          "Which required skills were matched, and where in the resume they appear",
          "Which required skills are missing entirely",
          "Which skills are inferred from related experience the candidate never explicitly listed, with the sentence that justifies the inference",
          "A breakdown by requirement, not a single blended number",
        ],
      },
      { type: "h2", text: "What it's not" },
      {
        type: "p",
        text: "A confidence percentage next to a score isn't explainability — it's just a second number. Neither is a generic \"our AI considers 50+ factors\" marketing line. If you can't point at the specific resume text that produced a specific part of the result, the system isn't explainable yet, whatever the marketing says.",
      },
      { type: "h2", text: "Why it matters beyond trust" },
      {
        type: "p",
        text: "Explainability is also what makes a hiring decision defensible. Jurisdictions are increasingly requiring employers to be able to explain automated hiring outcomes, not just assert they were fair. \"The algorithm scored them lower\" is not an explanation a regulator, or a rejected candidate, has to accept.",
      },
      { type: "h2", text: "How to check if a tool actually does this" },
      {
        type: "p",
        text: "Ask for the breakdown behind a single score on a real resume. A tool with genuine explainability shows you the evidence immediately. One without it will either show you nothing more specific, or take noticeably longer to produce an answer because it's generating a plausible-sounding explanation after the fact rather than reporting what it actually checked.",
      },
    ],
  },
  {
    slug: "ats-vs-ai-resume-screening",
    title: "ATS vs. AI Resume Screening: What's Actually Different",
    description:
      "An ATS tracks candidates through a pipeline. AI resume screening ranks and explains matches. Most teams need both, and conflating them causes real confusion.",
    date: "2026-09-24",
    readTime: "5 min read",
    excerpt:
      "An ATS and an AI resume screener solve different problems — conflating them is why a lot of hiring software ends up disappointing people.",
    content: [
      {
        type: "p",
        text: "\"We need an ATS\" and \"we need AI resume screening\" get used interchangeably in a lot of conversations, but they're solving different problems. Knowing which one you actually need (often both) saves a lot of wasted evaluation time.",
      },
      { type: "h2", text: "What an ATS actually does" },
      {
        type: "p",
        text: "An applicant tracking system is a pipeline tool: it stores applications, tracks which stage each candidate is in, manages interview scheduling, stores offer letters, and keeps a hiring record. Its job is organization and compliance record-keeping, not judgment.",
      },
      { type: "h2", text: "What AI resume screening actually does" },
      {
        type: "p",
        text: "A screening tool's job is narrower and more specific: given a job description and a pile of resumes, rank them and explain why. It doesn't manage your pipeline or store your offer letters — it answers one question, who should you look at first.",
      },
      { type: "h2", text: "Where the confusion comes from" },
      {
        type: "p",
        text: "Most large ATS platforms have bolted on some form of AI matching as a feature, which is where the lines blur. The matching feature inside a big ATS is often a secondary capability, not the core product, and the quality varies widely — some are genuinely useful, some are a basic keyword filter with an AI label on top.",
      },
      { type: "h2", text: "How to decide what you need" },
      {
        type: "ul",
        items: [
          "If your problem is \"we lose track of candidates and interview feedback\" — that's an ATS problem",
          "If your problem is \"we get 200 applicants and can't tell who's actually qualified\" — that's a screening problem",
          "If it's both, you likely want a dedicated ATS plus a screening tool that's good at the one thing it does, rather than expecting one platform to excel at both",
        ],
      },
      {
        type: "p",
        text: "ResumeMatch is deliberately the second kind of tool — it doesn't try to replace your ATS or manage your pipeline. It does the screening step: rank candidates against a job description with an explainable breakdown, and hand that off to whatever you already use to manage the rest of the process.",
      },
    ],
  },
  {
    slug: "job-description-tips-for-better-candidates",
    title: "How to Write a Job Description That Attracts Qualified Candidates",
    description:
      "A vague job description produces a vague applicant pool. Specific, honest requirements attract candidates who actually fit — and make screening far easier.",
    date: "2026-09-25",
    readTime: "5 min read",
    excerpt:
      "A vague job description produces a vague applicant pool. Here's what actually changes the quality of who applies.",
    content: [
      {
        type: "p",
        text: "A lot of energy goes into screening tools and processes, and not enough into the document that determines who applies in the first place. A sharper job description does more to improve candidate quality than almost anything downstream of it.",
      },
      { type: "h2", text: "Separate must-haves from nice-to-haves, honestly" },
      {
        type: "p",
        text: "A job description that lists 15 requirements as all equally required either scares off qualified people who are missing one, or trains applicants to ignore the list entirely. Be honest about which 3-4 things actually disqualify a candidate versus which are a bonus.",
      },
      { type: "h2", text: "Describe the work, not just the qualifications" },
      {
        type: "p",
        text: "\"5+ years of experience in X\" tells a candidate what box to check. \"You'll own the on-call rotation for our payments system and work directly with the two senior engineers who built it\" tells them what the job actually is. The second version attracts people who want that specific job, not just any job with a matching title.",
      },
      { type: "h2", text: "Avoid requirement inflation" },
      {
        type: "p",
        text: "A junior role listed with senior-level requirements doesn't get you a senior candidate for junior pay — it gets you fewer qualified applicants and more overqualified ones who'll leave quickly. Match the requirements to the actual seniority and budget of the role.",
      },
      { type: "h2", text: "Name the tools and specifics, not just categories" },
      {
        type: "p",
        text: "\"Experience with cloud infrastructure\" is vague enough that it can't be screened well by a human or a tool. \"Experience with AWS, specifically EC2 and S3\" is something a candidate can honestly self-assess against, and something a screening tool can actually extract and match.",
      },
      { type: "h2", text: "Why this also makes screening better" },
      {
        type: "p",
        text: "Every resume-screening approach, including ours, works from what's actually in the job description. A specific, well-structured JD gives the matching engine real signal to work with; a vague one forces it to guess at what you actually meant, the same problem a human reviewer would have.",
      },
    ],
  },
  {
    slug: "cost-of-manual-resume-screening",
    title: "The Hidden Cost of Manual Resume Screening",
    description:
      "Manual resume screening doesn't show up as a line item, but the hours add up fast — and the cost isn't just time, it's the good candidates who get missed.",
    date: "2026-09-27",
    readTime: "4 min read",
    excerpt:
      "Manual resume screening doesn't show up as a line item on a budget, but the hours — and the missed candidates — add up fast.",
    content: [
      {
        type: "p",
        text: "Manual resume review rarely gets costed out directly, because it's absorbed into a recruiter's or hiring manager's existing time rather than billed as its own thing. That makes it easy to underestimate how much it's actually costing.",
      },
      { type: "h2", text: "The time cost, roughly" },
      {
        type: "p",
        text: "A careful read of one resume against a job description — actually reading it, not skimming for keywords — takes a few minutes. At 150 applicants for a single role, that's several hours of a recruiter's or hiring manager's time spent before a single interview happens, repeated for every open role.",
      },
      { type: "h2", text: "The quality cost is the bigger one" },
      {
        type: "p",
        text: "Time pressure changes how reviews actually get done. A recruiter with 150 resumes and twenty minutes doesn't read carefully — they skim for familiar titles and keywords, which is exactly the pattern that misses a career-changer or a candidate who described their experience differently than the job posting did.",
      },
      { type: "h2", text: "The inconsistency cost" },
      {
        type: "p",
        text: "Manual review quality isn't constant across a batch. The first twenty resumes usually get more attention than the last twenty, and reviews done at the end of a long day look different from ones done fresh in the morning. That inconsistency is invisible until you compare notes with a second reviewer on the same pool and get different shortlists.",
      },
      { type: "h2", text: "What this doesn't mean" },
      {
        type: "p",
        text: "It doesn't mean human judgment should be removed from hiring — it should be spent on the decisions that actually need it: interview conversations, reference checks, culture fit, final decisions. The case for automating the first-pass screen is about moving the limited supply of careful human attention to the step where it matters most, not eliminating it.",
      },
    ],
  },
  {
    slug: "skills-based-hiring-guide",
    title: "Skills-Based Hiring: What It Means and How to Actually Do It",
    description:
      "Skills-based hiring means screening for what a candidate can actually do, not degrees or job titles. Here's what that looks like in a real process, not just a mission statement.",
    date: "2026-09-29",
    readTime: "5 min read",
    excerpt:
      "Skills-based hiring means screening for what a candidate can actually do — here's what that looks like in a real process, not a mission statement.",
    content: [
      {
        type: "p",
        text: "Skills-based hiring shows up in a lot of company values pages, and a lot less in the actual screening steps teams use day to day. The gap between the stated intent and the real process is usually where it breaks down.",
      },
      { type: "h2", text: "What it means, concretely" },
      {
        type: "p",
        text: "Skills-based hiring means a candidate's fit is assessed against the specific skills the role requires, rather than proxies for skill like a degree, a job title, or years at a recognizable company. A self-taught developer with three strong projects and a candidate with a CS degree and no shipped code are evaluated on the same axis: can they actually do the work.",
      },
      { type: "h2", text: "Why titles and degrees are weak proxies" },
      {
        type: "p",
        text: "A job title means different things at different companies — a \"Senior Engineer\" at one company might be doing work that's junior-level elsewhere. A degree indicates exposure to material at some point, not current, applied skill. Both are easier to screen for than actual skill, which is exactly why screening defaults to them under time pressure." ,
      },
      { type: "h2", text: "What actually changes in the process" },
      {
        type: "ul",
        items: [
          "The job description lists specific required skills and experience, not just a target title or degree",
          "Screening looks for evidence of the skill in the resume's actual content, including skills described differently than the posting's exact wording",
          "Candidates without the \"expected\" background but with demonstrated relevant skill are not auto-filtered out",
          "Interviews test the actual skill (a work sample, a practical scenario) rather than relying on credentials as a stand-in",
        ],
      },
      { type: "h2", text: "Where this breaks down in practice" },
      {
        type: "p",
        text: "It breaks down when the screening step still works by literal keyword or title matching, because that silently reintroduces the credential bias the process was supposed to remove — a candidate who did the work but called it something else still gets filtered out, just via a different mechanism than a degree requirement." ,
      },
    ],
  },
  {
    slug: "reduce-bias-in-resume-screening",
    title: "How to Reduce Bias in Resume Screening",
    description:
      "Reducing bias in resume screening is about process design, not intentions. Here are the concrete changes that actually move the needle.",
    date: "2026-09-30",
    readTime: "5 min read",
    excerpt:
      "Reducing bias in resume screening is about process design, not good intentions — here are the concrete changes that actually matter.",
    content: [
      {
        type: "p",
        text: "Bias in resume screening is usually a process design problem, not a question of individual intent. Good-faith recruiters using a biased process still get biased outcomes. The fixes are concrete, not aspirational.",
      },
      { type: "h2", text: "Standardize what gets reviewed first" },
      {
        type: "p",
        text: "If reviewers see names, photos, addresses, or graduation years before assessing qualifications, those details shape the read even unintentionally. Where possible, review the qualifications-relevant content before — or separately from — identifying details." ,
      },
      { type: "h2", text: "Use the same criteria for every resume in a batch" },
      {
        type: "p",
        text: "A reviewer's bar quietly shifts over a long review session — more lenient when behind on time, stricter after seeing several strong resumes in a row. A documented, consistent set of must-have criteria applied the same way to resume 1 and resume 150 removes that drift." ,
      },
      { type: "h2", text: "Don't let pedigree substitute for evidence" },
      {
        type: "p",
        text: "A recognizable school or employer name is a weak, bias-prone proxy for skill, and it correlates with factors that have nothing to do with job performance. Screening against specific, demonstrated skills and experience — not where someone went to school — removes a large and well-documented source of bias." ,
      },
      { type: "h2", text: "Know your legal obligations, not just best practices" },
      {
        type: "p",
        text: "Several jurisdictions now have specific requirements around automated employment decision tools, including bias audits and candidate notification (New York City's Local Law 144 is the most cited example). If you use any automated screening, check what applies in your jurisdiction — this isn't optional compliance.",
      },
      { type: "h2", text: "Make the reasoning visible" },
      {
        type: "p",
        text: "A process where every rejection has a documented, specific reason tied to the job's actual requirements is far easier to audit for bias than one that relies on an unrecorded gut read. This is the same reasoning behind explainable screening in general: if you can't see why a decision was made, you can't check it for bias either.",
      },
    ],
  },
  {
    slug: "time-to-hire-metrics-explained",
    title: "Time-to-Hire: What It Actually Measures and How to Improve It",
    description:
      "Time-to-hire is one of the most quoted recruiting metrics and one of the most misused. Here's what it actually measures, and where screening speed fits in.",
    date: "2026-10-01",
    readTime: "4 min read",
    excerpt:
      "Time-to-hire is one of the most quoted recruiting metrics and one of the most misused — here's what it actually measures.",
    content: [
      {
        type: "p",
        text: "Time-to-hire gets cited constantly as a recruiting health metric, but it's often measured inconsistently and optimized in ways that trade off against hire quality. Worth being precise about what it actually counts.",
      },
      { type: "h2", text: "The actual definition" },
      {
        type: "p",
        text: "Time-to-hire measures the days between a candidate applying (or being sourced) and accepting an offer. It's distinct from time-to-fill, which measures from when the requisition opened — a role that sat unposted for three weeks before the first application has a very different time-to-fill than time-to-hire story." ,
      },
      { type: "h2", text: "Where the time actually goes" },
      {
        type: "p",
        text: "For most roles, the stages break down roughly into: initial screening of applications, interview scheduling and rounds, decision-making among finalists, and offer negotiation. Screening is often not the largest time sink by stage count, but it's the stage most likely to create a backlog that delays everything after it — a pile of unscreened resumes blocks the interview pipeline from starting at all." ,
      },
      { type: "h2", text: "Why faster screening doesn't mean worse screening" },
      {
        type: "p",
        text: "The common tradeoff people assume is speed versus quality — screen faster, miss more good candidates. That tradeoff is real for rushed manual review, but it's not inherent to screening itself. A tool that processes a batch of resumes against explicit criteria in minutes isn't skipping steps a careful human would take; it's doing the same comparison faster and more consistently." ,
      },
      { type: "h2", text: "What to actually track" },
      {
        type: "ul",
        items: [
          "Time from application to first screening decision — this is the stage most likely to silently stall",
          "Percentage of applicants who get any response within a week — a proxy for candidate experience, not just internal speed",
          "Time-to-hire by source or channel — a slow stage for one channel may point to a specific process gap, not a general problem",
        ],
      },
      {
        type: "p",
        text: "Time-to-hire is a useful diagnostic for where a process is stalling, but it's a means to an end — the actual goal is getting good candidates to an offer before they accept somewhere else, not minimizing the number on a dashboard." ,
      },
    ],
  },
  {
    slug: "how-resume-parsing-works",
    title: "How Resume Parsing Works (And Why It Breaks on Some Resumes)",
    description:
      "Resume parsing turns a PDF or DOCX into text a computer can work with. Here's what that process actually involves, and why visually fancy resumes often parse badly.",
    date: "2026-10-01",
    readTime: "5 min read",
    excerpt:
      "Resume parsing turns a document into text a computer can reason about — and it's also where a lot of screening quality quietly breaks down.",
    content: [
      {
        type: "p",
        text: "Parsing is the first, least glamorous step in any resume screening pipeline, and it's also where a surprising amount of screening quality gets lost before the actual matching even starts.",
      },
      { type: "h2", text: "What parsing actually does" },
      {
        type: "p",
        text: "A resume file — PDF or DOCX — is a layout format, not plain text. Parsing extracts the words from that layout in a sensible reading order: name, contact details, work history, skills, education. The output is just text, which is what every downstream step (matching, scoring) actually works with." ,
      },
      { type: "h2", text: "Why a visually clean resume can parse badly" },
      {
        type: "p",
        text: "A resume laid out in two columns (a common modern template choice) looks fine to a human eye, but a parser reading left-to-right across the whole page can interleave the left and right columns into nonsense — a job title from column one next to a bullet point from column two. The resume looks great to a person; the extracted text can be scrambled." ,
      },
      { type: "h2", text: "Other common failure points" },
      {
        type: "ul",
        items: [
          "Text embedded in images (a designed header, a scanned resume) often isn't extractable as text at all without OCR",
          "Tables used for layout (not just data) can extract in a scrambled or duplicated order",
          "Unusual fonts or heavy use of icons/symbols as section markers can confuse word-boundary detection",
          "A resume saved as a flattened image-only PDF has no extractable text layer whatsoever",
        ],
      },
      { type: "h2", text: "What this means practically" },
      {
        type: "p",
        text: "If a resume is scoring surprisingly low or showing as unparseable, a layout issue is a more likely explanation than the candidate genuinely lacking the required skills — worth a quick manual check before ruling someone out. A single-column, standard-section resume (the boring, traditional format) is still the safest choice for parsing reliably, however unfashionable that advice is." ,
      },
      {
        type: "p",
        text: "This is also why ResumeMatch flags resumes it can't parse (unparseable: true) rather than silently guessing and scoring a candidate based on empty or scrambled content — a wrong score is worse than an honest \"we couldn't read this one.\"",
      },
    ],
  },
];

export function getPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
