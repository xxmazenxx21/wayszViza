# WaysZ Visa — waysz-visa.com

Bilingual (Arabic/English) website of WaysZ Visa, the visa-consultation platform of WaysZ (sister site: waysz.org,
separate repo — same framework, rules, skills, logo and motion system). Astro 7 + GSAP + Lenis + three.js.
Static output for Namecheap hosting.
Rules for Claude Code: `CLAUDE.md` · Animation system: `.claude/skills/waysz-motion/`.

## 1 · One-time setup (every developer)
1. Install **Node.js 22.23.4 or newer** (LTS from nodejs.org), **Git**, **VS Code**, **Claude Code**.
2. Clone and install:
   ```bash
   git clone https://github.com/xxmazenxx21/wayszViza wayszViza
   cd wayszViza
   npm install
   ```
3. Install the Claude Code plugins for this project (run in the normal terminal, inside the `wayszViza` folder):
   ```bash
   claude plugin marketplace add anthropics/claude-plugins-official
   claude plugin marketplace add greensock/gsap-skills
   claude plugin install gsap-skills@gsap-skills --scope project
   claude plugin install frontend-design@claude-plugins-official --scope project
   claude plugin list
   ```
   The first person commits the `.claude/settings.json` these commands create. Everyone else still runs
   the same commands once on their own machine.
4. Start Claude Code with `claude` in the folder and accept the "trust this folder" prompt
   (needed for the project skills `waysz-motion` and `waysz-media`).

## 2 · Run
```bash
npm run dev       # http://localhost:4321
                  # Motion Lab (every animation, working): http://localhost:4321/dev/motion-lab/
npm run check     # must show 0 errors before a PR
npm run build     # production files in dist/
npm run preview   # test dist/ locally
```

## 3 · Daily workflow
1. `git pull` on `main`, then a branch: `git checkout -b feat/home-hero`.
2. Open Claude Code (`claude`) and give it the task (template below). It reads `CLAUDE.md` and the
   waysz-motion skill by itself.
3. Review in the browser: Arabic + `/en/`, mobile size, the no-WebGL fallback (`?tier=css` in dev).
4. `npm run check` → commit → push → Pull Request → one teammate reviews → merge.

Task template for Claude Code:
```
Build brief section §1.6 "Help steps" on the Home page (src/views/HomePage.astro), Arabic and English.
Replace its <TodoSection>. Content: brief part 04 §1.6. Motion: fill reference.md row 1.6 and copy the
pattern from the Motion Lab. Follow CLAUDE.md. Finish with npm run check = 0 errors.
```

## 4 · Deploy (Namecheap — Stellar Plus)
1. `npm run build`
2. cPanel → File Manager → `public_html/` → upload the **contents** of `dist/` (not the folder itself).
3. First time only: cPanel → SSL/TLS Status → run AutoSSL for waysz-visa.com.
`public/.htaccess` (HTTPS redirect, 404 page, caching) is included in every build.

## 5 · Still open
- Form destination (email) → `src/lib/forms.ts` `TODO(endpoint)`.
- Which visa categories get a detail page (only `student-visa` so far) → `src/content/visas/`.
- Real email / phone / WhatsApp / address / hours of WaysZ Visa → `src/lib/site.ts` `TODO(client)`.
- Final logo (SVG, plane as a separate layer) and brand colors → replace LAYER 1 in `src/styles/tokens.css` (same edit in the WaysZ repo;
  the Visa look is the `[data-site="visa"]` block).
