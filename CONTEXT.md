# CONTEXT HANDOFF — WaysZ Visa website (continue from here)

> Last update: Nov 28, 2026 (step 0 done, step 1 running) · main = 1919c70
> How to use: start a new chat with Claude, attach this file, and say «اقرا CONTEXT.md وكمّل». The brief and CLAUDE.md
> are in the repo.

## Links

- Repo: https://github.com/xxmazenxx21/wayszViza (owner: Mazen; Ahmed is a collaborator)
- Local path (Ahmed, Windows + PowerShell): D:\- ahmed\2- Career\- Work\- waysz\waysz-visa
- Final domain (not deployed yet): waysz-visa.com on Namecheap (Stellar Plus, cPanel)
- Vercel preview: vercel.json is ready (noindex); preview link not confirmed yet → ask Mazen.
- Plan tracker (Claude Sheet): https://claude.ai/artifact/UqnsnhAM5Cu6X4KXWQP7bf — sheets: «الخطة» · «نواقص البريف» · «تغيير الهيكل».
- Sister site: WaysZ (waysz.org) — own repo https://github.com/AhmedAyman5/waysz, preview https://waysz.vercel.app.
  Nothing for waysz.org is built here; it is only a link (`site.mainSite`).

## Who I am and how to talk to me

- Ahmed, Egyptian software engineer, freelancer, lead of the WaysZ projects. Mazen and Mohamed work with me.
- I write in Egyptian Arabic → answer in Egyptian Arabic: friendly, direct, emojis OK.
- Arabic replies are wrapped in <div dir="rtl" align="right">…</div>. Every line, bullet and heading starts with an
  Arabic word. English terms and inline code go mid-sentence, never first. Never two English terms separated only by
  punctuation. Long code goes in its own code block OUTSIDE the div.
- BE DIRECT and SHORT. No over-engineering, no long command lists. Give the correct, standard solution and the exact
  steps. Ask at most one question, only if it truly blocks the work.
- With every Claude Code prompt, say which model / effort to run it on.
- .md files: raw Markdown in fenced blocks (4 backticks if they contain code), or as a file.

## Git rule (decided Nov 28)

- Claude Code NEVER commits or pushes (rule in CLAUDE.md → "Finishing a task"). It leaves the changes in the working
  tree, its final message starts with `FINISHED — changes ready (not committed)` and ends with a suggested commit
  message.
- Ahmed reviews, then pushes himself, plainly:
  `git add .` → `git commit -m "message"` → `git push origin main`
- Before a task: `git checkout main` → `git pull` → `npm ci` → `claude` → paste the prompt.
- Review before pushing: `npm run build` → `npm run preview -- --host` → check AR + EN, desktop + phone.
- Any problem in a Claude Code report gets fixed with a small follow-up prompt BEFORE pushing and before the next step.
- Announce in the group before editing shared files (src/styles, src/motion, src/components, src/i18n, layouts,
  CLAUDE.md, skills).
- Arabic looks reversed in the Claude Code terminal: display only, the files are fine. Always `npm ci` after pulling.

## The project

- Client: WaysZ. WaysZ Visa = its visa & immigration consultancy platform. Customers are high-end ("class A").
- Site: Arabic (default, RTL, at /) + English (at /en/). Static Astro site, no backend (forms: TODO(endpoint)).
- Stack (details in CLAUDE.md): Astro 7, vanilla TS, GSAP 3, Lenis, three.js (one shared WebGL stage), lottie-web,
  plain CSS tokens, Almarai. Quality policy: same full experience for every visitor, no reduced-motion/tier branches.

## Source of truth (NEW)

1. `docs/brief/WaysZ-Visa-Brief-v3.md` — the current brief (structure, full AR + EN copy, open client questions).
2. `docs/brief/WaysZ-Website-Brief-v2.pdf` — original brief; only for what v3 marks ✅ (unchanged).
3. `CLAUDE.md` (rewritten Nov 27–28) + creative treatments + skills.

## What the client asked (Nov 27) and decided

- Take all content/services from his old site mg-visa.com (his own; copying allowed) — but he is starting a NEW
  entity: new contact data, branches, phones → he will send them (old site's data is not used).
- Take ideas from reachimmigration.com and add what competitors offer.
- Residency & citizenship by investment: he IS an authorized agent → content taken from gicg.net.
- Country names are allowed everywhere.
- No strict rules: everything goes to the staging host first; the client reviews with his own eyes and edits before
  the final upload. So: no «ما لا نضمنه» element, no fixed legal notice, no Home §1.7 card, no fee/guarantee bans.
  Missing client data = realistic placeholders marked `TODO(client)`.

## Brief v3 in one screen

- Pages: Home · Visa Services · Visa detail template (18 pages) · Find your visa `/assessment/` (new) ·
  Consultation · About · Contact · Privacy (new) · Terms (new) · 404.
- 9 visa categories in 4 groups — Visit: tourist-visa, family-visa, business-visa · Study: student-visa ·
  Work: work-visa (new), job-seeker-visa (new) · Residence & investment: immigration-residence-visa, investor-visa (new),
  investment-residency-citizenship (new).
- 9 services — visa-consultation, document-readiness, application-guidance, appointment-preparation, refusal-review
  (new), appointment-booking (new), travel-bookings (new), translation-attestation (new), corporate-visas (new).
- Visa template = 7 elements (name · description · audience · help · documents + note · faq · cta) + optional
  types / destinations / benefits.
- Home adds: 1.5b extra services · 1.5c categories in 4 groups · 1.5d assessment teaser · 1.5e why WaysZ Visa ·
  1.6b destinations (country names) · 1.6c testimonials. §1.7 removed.
- Consultation form adds: country of residence, services needed, previous refusal, number of travelers; prefill via
  `?type=` `?service=` `?destination=`.

## Status (Nov 28, 2026) — main = 1919c70

DONE:
- Scaffold, header/footer, preloader, 9 visa JSON files (old content model), About/Contact/Consultation skeletons.
- Home «رحلة الورق» (act `paper`) and Visa Services «مطار الضوء» (act `terminal`) — built on the OLD brief
  (4 services / 5 categories), need updating.
- 165b5a8 — brief v3 + new CLAUDE.md.
- 7c9d5b6 — cleanup: removed notGuaranteed (schema + 9 JSON), legal notice (VisaDetailPage, Footer, i18n `legal`),
  Home §1.7 Notice.astro, About «صراحة فيما لا نضمنه», skills/docs updated (country names & destination imagery
  allowed in waysz-media).
- 1919c70 — CLAUDE.md: Claude Code never commits/pushes.

- Step 0 (chat): brief v3 §19 added — final Home FAQ (8 Q, the guarantee question replaced) + Visa Services FAQ edits ·
  SEO titles/descriptions · Contact + 404 copy · Privacy + Terms drafts. The updated brief goes into the repo with step 1.

IN PROGRESS: step 1 (content layer) — prompt given to Ahmed (Opus · High).

## The plan (step by step until launch)

| # | Step | Model |
|---|---|---|
| 0 | Finish the brief → §19 (FAQs, SEO, Contact, 404, Privacy, Terms) | Claude (chat) — DONE |
| 1 | **IN PROGRESS** — Content layer: new schema (group, types, destinations, benefits) · 9 new JSON + edit the 7 old · i18n · header submenu by groups · footer columns · destinations data · `site.ts` placeholders — no design | Opus · High |
| 2 | Visa detail template design (18 pages) | Opus · Extra |
| 3 | Update «مطار الضوء»: 9 counters + 9 gates in 4 groups (terminal act) | Opus · Extra |
| 4 | Update Home: the 5 new sections + 9 categories | Opus · Extra |
| 5 | Find your visa page | Opus · High |
| 6 | Consultation page (design + new fields + prefill) | Opus · High |
| 7 | About page | Opus · High |
| 8 | Contact page | Opus · Medium |
| 9 | Privacy + Terms + 404 | Opus · Medium |
| 10 | Global QA (AR/EN, desktop/phone, performance) | Opus · High |
| 11 | Deploy to Vercel preview → send link to client | Ahmed |
| 12 | Client review round: answers to ❓ + real data + edits | small prompts |
| 13 | Final upload to Namecheap after approval | Ahmed |

Why this order: every page reads the same data (categories, services, destinations), so step 1 first; the template
before Home/Visa Services because both link to its pages.

## Waiting on the client (brief v3 §18)

1. New entity data: phone, WhatsApp, email, addresses/branches, hours, social links, form destination email.
2. Review the destination country lists (§1.6b, §7b).
3. Confirm the new services (appointment booking, travel bookings + partners, translation via WaysZ? languages,
   corporate, refusal review, university admission support).
4. Exact licensed investment programs (+ license numbers, PDF brochures).
5. Optional services: CV & job search, language tests, premium/concierge, pre-departure orientation.
6. First consultation free or paid (button wording only).
7. Testimonials, stats, partner logos, certificates/licenses.
8. Privacy policy + terms (from their lawyer, or our draft).
9. Final logo + brand colors + review of English terms.

## Log (update after every change)

- Nov 27 — Read CONTEXT + CLAUDE.md + brief v2. Researched mg-visa.com, reachimmigration.com, competitors → brief v3.
- Nov 27 — Client answers: old site is his, new entity data; country names allowed; authorized agent (gicg.net).
- Nov 27 — Client wants no strict rules → removed fixed rules, exclusions, «ما لا نضمنه», legal notice, §1.7 from the brief;
  CLAUDE.md rewritten.
- Nov 27 — Ahmed pushed brief v3 + CLAUDE.md (165b5a8).
- Nov 28 — Cleanup prompt (Opus Medium) on main → 7c9d5b6 pushed.
- Nov 28 — Rule: Claude Code never commits/pushes → CLAUDE.md updated (1919c70).
- Nov 28 — Full plan agreed; plan tracker Sheet created. NEXT: step 0 (finish the brief), then the step 1 prompt.
- Nov 28 — Step 0 done: brief v3 §19. Step 1 prompt (content layer) given to Ahmed; the new brief goes into the repo with it.
