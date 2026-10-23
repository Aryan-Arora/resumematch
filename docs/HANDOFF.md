# ResumeMatch handoff (2026-10-24)

Live at https://resumematch.co.in. Client on Vercel, API on Fly.io (`resumematch-api`, region `nrt`, 1 machine), Supabase for Postgres and auth. Pushing to `main` deploys both; the API deploy is gated on tests.

## Where things stand

- Engineering is a late-stage beta. `docs/PRODUCT_IMPROVEMENT_PLAN.md` is the roadmap and still lists CSV import, ATS connectors, webhooks/API, calendar scheduling, bulk actions, a calibration report and retention controls as undone.
- Traction is the real gap: 4 signups total (last one Aug 3), no paying users, no pricing or billing. Check signups before building more features.
- Tests: `npm test` (58 server tests) and `npm run smoke` (5 Playwright checks against the live site; set `SMOKE_BASE_URL` to test a preview). The smoke test does not cover the logged-in flow. That needs a dedicated test account, because signing up locally creates a real user in production Supabase.

## Added this stretch

- **Demo tracking:** the public demo logs anonymous `classify` and `match` events (event, domain, resume count; no JD text, resumes or IPs) to `public.demo_events`. The table exists and was verified live. Weekly demo count: `select date_trunc('day', created_at), event, count(*) from demo_events group by 1,2 order by 1 desc;`. Smoke test runs also count.
- **Prerendering (SEO/GEO):** the app is a client-rendered SPA with no router. `npm run build` now runs `client/scripts/prerender.mjs` after `vite build`. It renders each public route to `dist/<route>/index.html` with its own title, canonical, social tags and JSON-LD, and generates `sitemap.xml`, `llms.txt` and `llms-full.txt` from the same route list and `client/src/content/blogPosts.js`. Do not re-add static copies of those files to `client/public`. A new public route must be added to the `routes` array in the script and to the switch in `client/src/main.jsx`, or it will not be prerendered. `useSEO` and `useJsonLd` in `client/src/lib/seo.js` double as the build-time collectors. The current build prerenders 29 public routes, including `/resumematch-vs-ats`.
- **Other SEO:** AI-crawler rules in `robots.txt`, sitewide footer product links, `www` to apex 308 redirect, IndexNow key file in `client/public` (all 29 URLs submitted once; resubmit after adding pages). Organization schema and `llms.txt` now disambiguate this product from unrelated projects using the ResumeMatch name.
- **Database security:** `public.candidate_activity` now has RLS enabled with organization-scoped authenticated read and insert policies. Supabase security advisor no longer reports `rls_disabled_in_public` for the application tables. Leaked-password protection remains unavailable on the current Supabase plan.

## Pending, needs the owner

- Resubmit `sitemap.xml` and request indexing for `/`, `/demo` and `/free-resume-screening-software` in Google Search Console. Only `/terms` was indexed as of Oct 23.
- Finish the Indie Hackers listing (needs their login). SideProjectors listing is submitted.
- Cardboard demo video: the timeline in the "ResumeMatch Demo" project is built and passes `cb verify`, but the free plan's 3 exports are used up and `cb look` does not render here. Needs a plan upgrade or manual export, then embedding on the homepage (`client/public/video/` is git-ignored; the old `resumematch-live-demo.mp4` is unusable: browser chrome and a modal dialog are visible).
- Keep `server/sql/` migration files aligned with production; the candidate activity RLS policy and performance/index migrations have been applied and verified through the Supabase dashboard/API.
- Reddit and LinkedIn posts need the owner's own accounts. Drafts were written in the Claude session; Reddit is blocked in the agent's browser.

## Marketing done

- 13 cold emails sent Oct 2026 to Indian recruiting agencies (SutraHR, HawkHire, Savanna HR, HiringGo, TeamPlus, CLIQHR, Viriksha, Eazyhire, Alp Consulting, Zyoin, Michael Page India, Randstad India, TeamLease). Replies go to the owner's Gmail.
- Next GEO steps: write an honest comparison page and earn external mentions.

## Gotchas

- The Supabase MCP connector in the Claude session only sees the Hostiggo project, not ResumeMatch (`ibbeerdtkbonoaxtxwmy`). Run ResumeMatch SQL in its dashboard SQL editor, and do not apply it through that connector.
- Production data can be inspected through `flyctl ssh console -a resumematch-api -C "node -e ..."`, which has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in its environment. Never print those values.
- The Vercel analytics MCP tool has been unreliable; use the Vercel dashboard for visitor numbers.
- `npm audit` reports 13 vulnerabilities (1 critical), mostly Vite, and they predate the work above.
- The Supabase project also holds tables from other projects (for example `applications` and `interview_sessions`), so check before changing shared objects.
