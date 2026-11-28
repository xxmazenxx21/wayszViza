# WaysZ Visa — Project Rules for Claude Code

## What we are building

The website of **WaysZ Visa** at **waysz-visa.com** — the visa and immigration consultancy platform of WaysZ: visa
consultation, file preparation, applications, appointments, refusal reviews, travel bookings, translation, corporate
visas, and residency / citizenship by investment (the client is an authorized agent), for anyone traveling to visit,
study, work, settle or invest abroad. The client's customers are high-end ("class A").

Pages: Home · Visa Services · Visa Service Details (ONE template → 18 pages: 9 visa categories + 9 services) ·
Find your visa (assessment tool) · Consultation (the request form) · About · Contact · Privacy · Terms · 404.
Arabic AND English.

This repo is the sister of **WaysZ** (waysz.org, its own repo): same framework, skills, plugins, logo, logo intro,
motion system and 3D stage. The main site is `site.mainSite`; here it is only a link.

## Source of truth

1. **`docs/brief/WaysZ-Visa-Brief-v3.md`** — the current brief: structure, every page, the full copy (AR + EN) and
   the open client questions. Sections are numbered (e.g. "§9.1", "1.5d"); use the same numbers in comments, TODOs
   and commits.
2. `docs/brief/WaysZ-Website-Brief-v2.pdf` — the original brief (parts 01 · 04 · 05). Use it only for what v3 marks ✅
   (unchanged) or does not mention.
3. The creative treatments (`docs/home-creative-treatment.md`, `docs/visa-services-creative-treatment.md`) and the
   skills for look and motion.

## Content stage (client decision)

- Everything is built and shown on the **staging host first** (Vercel preview). The client reviews every page with
  his own eyes and edits the content before the final upload to the domain.
- So write freely: confident, persuasive, premium copy that sells the service. Take ideas and wording freely from
  the client's old site (mg-visa.com, his own) and from the reference sites in the brief.
- **Country names are welcome** everywhere: destination lists, category pages, form options, the assessment tool.
- Anything the client still has to send (contact data, testimonials, stats, partner logos, licenses, legal texts)
  goes in as a realistic placeholder marked `TODO(client)` in the code, so it is easy to find and replace.
- When the brief and a page disagree, follow the brief. When the brief is silent, decide like a senior and list the
  decision in the report.

## Quality policy (client decision — final)

**Every visitor gets the same full experience at the highest quality, on every device. No exceptions.**

- Any browser with WebGL2 gets the full scene on every page: all acts, all effects, the same materials, shaders,
  geometry, particle counts and post-processing. No capability tiers: never branch on cores, memory, GPU name,
  screen size / "mobile", `navigator.connection.saveData` or battery.
- No `prefers-reduced-motion` branches anywhere (scenes, globals, media toolkit, boot script, CSS) and **no
  visitor-facing motion / quality toggle**. Videos autoplay, sequences scrub, Lottie plays, Lenis and the cursor
  run for everyone.
- The **css fallback** (posters / stills instead of the canvas) exists ONLY when WebGL2 is unavailable or the
  context is lost. Even then every GSAP / ScrollTrigger animation, Lenis, the cursor and all scroll scenes run.
- Smoothness is protected ONLY by the stage's **dynamic render scale** (`src/motion/stage/stage.ts`: canvas pixel
  ratio between `min(devicePixelRatio, 1.5)` and 0.75, lowered only when that measurably speeds frames up).
  Never by drawing less, never by falling back to css.
- Allowed differences are input and size, not quality: pointer-only effects (cursor, depth, magnetic, spotlight)
  need a mouse; responsive image / video / sequence sizes per screen width are the same look at the right size.
- The no-JS version stays (content readable without JavaScript).
- **Every new page, scene, 3D act and effect must be built this way.** Do not add an `env.reduce`, a tier, a
  `setQuality`, or a "lite" path.

## Visual direction (most important)

**Cinematic, Apple-product-page level.** The pages are built from REAL footage and photos plus
scroll-driven motion and a real-time WebGL layer.
**The goal on every page is a jaw-dropping, Awwwards-level experience.**

**Creative freedom:** you are free to source your own photos, videos, 3D models, textures and animations, and
to create your own animations, shaders and 3D, whenever it makes the site more impressive — no need to ask
first. External files come from a source with a clear free license (the list in "Media") and get a row in
`docs/media-credits.md`.
The pages' motion storyboard lives in the waysz-motion skill (`reference.md`, one row per section). The Home concept
(«رحلة الورق», a pop-up book of paper) is in `docs/home-creative-treatment.md`; the Visa Services concept («مطار الضوء»,
an airport drawn in light) is in `docs/visa-services-creative-treatment.md`.

- full-screen background video, scroll-scrubbed image sequences (video → frames on a canvas),
  media that expands to full screen, sticky full-bleed media cards, huge staged typography,
- small moments (icons, stamps, route planes): our own inline SVG animated with GSAP, or a Lottie (sourced or
  our own) when it matches the premium, cinematic look (recolored to our tokens if needed),
- background layers that move with the mouse (depth), and a plane-shaped cursor on desktop,
- a 3D layer (three.js + custom GLSL) that puts the footage inside one WebGL stage: shader clouds the camera
  flies through, sun glow / god rays, grain, vignette. Every visitor with WebGL gets it in full (Quality policy);
  every scene also works without WebGL (the css fallback).
- The logo "Take-off" intro (preloader) stays as it is.
  Reuse what exists when it is good enough; source or create something new when that is more impressive.
  Motion never hides content or slows reading: people come here to understand their visa path.

## Stack (do not change without asking)

- **Astro 7**, static output, `.astro` components only (no React/Vue/Svelte/Tailwind).
- **Vanilla TypeScript**. **GSAP 3** + **Lenis**. All GSAP plugins are allowed (ScrollTrigger, SplitText, Flip,
  MotionPath, DrawSVG, MorphSVG, Observer, InertiaPlugin, CustomEase, ScrambleText). ScrambleText on Latin
  text only — never on Arabic. Register only the plugins a page really uses.
- **three.js** for 3D, with its addons from `three/examples/jsm` (GLTFLoader, DRACOLoader, EffectComposer,
  passes) and custom GLSL where it looks better than stock materials. Always through the shared stage in
  `src/motion/stage/` (one renderer per page, lazy-loaded, dynamic render scale) — never a second renderer.
- **lottie-web** for Lottie animations (lazy-loaded only on pages that use it).
- **Plain CSS** with tokens from `src/styles/tokens.css`.
- Font: **Almarai** (Arabic + Latin), self-hosted via `@fontsource/almarai`. Weights 400 / 700 / 800 only —
  use the `--weight-*` tokens, never 500 or 600.
- **Node ≥ 22.23.4**. Approved dependencies: astro, gsap, lenis, three, lottie-web, @fontsource/almarai,
  @astrojs/sitemap. Dev only: playwright (visual QA scripts in `scripts/`), @types/three (types for three).
  Ask before adding ANY other dependency, with a one-line reason (no AOS, anime.js, Barba, Swiper…).
- The site is static: no backend, database, login, payment or upload for now (brief v3 §17 lists them as later
  phases). Interactive features (the assessment tool, form prefill) run in the browser.

## Commands

```bash
npm install        # once after cloning
npm run dev        # http://localhost:4321  ·  Motion Lab: /dev/motion-lab/  ·  English: /en/dev/motion-lab/
npm run check      # TypeScript + Astro diagnostics — must be 0 errors before every PR
npm run build      # → dist/  (what we upload to the hosting)
npm run preview    # serve dist/ locally to test the production build

# Visual QA (Playwright, uses your installed Chrome). Dev only: force WebGL on/off with ?tier=full|css
node scripts/qa-shots.mjs <outDir>     # screenshots while scrolling: AR/EN · desktop/phone/360 · WebGL + css fallback · OS reduce-motion ON (must change nothing) · no JS
node scripts/qa-policy.mjs             # quality policy on the production preview: reduce-motion + saveData + CPU 4× + 30 fps cap → full scene everywhere
node scripts/qa-weight.mjs             # page weight of the production preview (run `npm run preview -- --port 4322` first)
node scripts/qa-fps.mjs <url> 4        # scroll frame times with CPU throttling 4x (whole page)
# No Google Chrome on the machine (e.g. Linux)? Point the scripts at any Chromium:
#   QA_CHROME=~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome node scripts/qa-shots.mjs out/
```

## Structure

```
wayszViza/
├─ CLAUDE.md · README.md · astro.config.mjs · package.json
├─ .claude/skills/waysz-motion/   SKILL.md (motion rules + API) · reference.md (scenes + page storyboard)
├─ .claude/skills/waysz-media/    SKILL.md (sources, licenses, ffmpeg recipes, budgets, credits)
├─ docs/brief/                    WaysZ-Visa-Brief-v3.md (CURRENT brief) · WaysZ-Website-Brief-v2.pdf (original)
├─ docs/visa-services-creative-treatment.md  Visa Services concept «مطار الضوء» + storyboard + budgets
├─ docs/home-creative-treatment.md  Home concept «رحلة الورق» + storyboard + budgets
├─ docs/visa-detail-creative-treatment.md  Visa detail template «خريطة الرحلة» + storyboard + budgets
├─ scripts/                       Playwright QA: qa-shots · qa-policy · qa-weight · qa-fps (+ qa-browser: shared launch)
│                                 data build: build-borders (globe borders of the explore / atlas acts) · render-paper-still (Home stills) · render-terminal-still (Visa Services stills) · render-atlas-still (visa detail stills)
├─ docs/media-credits.md          one row per media file we ship (source, author, license)
├─ media-inbox/                   RAW downloads before optimizing — gitignored, never shipped
├─ public/
│  ├─ media/video/                optimized background videos (mp4 + webm + poster)
│  ├─ media/seq/<name>/           image sequences (frame_0001.webp …)
│  ├─ media/lottie/               Lottie JSON files
│  ├─ media/img/                  images loaded by JS only (globe texture, HDR light of the 3D acts)
│  ├─ media/geo/                  country borders of the globe (TopoJSON, built by scripts/build-borders.mjs)
│  └─ .htaccess · favicon.svg · robots.txt
└─ src/
   ├─ assets/media/               photos (optimized by Astro <Image>)
   ├─ assets/logo/waysz-mark.svg  TEMP logo, the same mark as WaysZ (parts are classes — see "Logo")
   ├─ components/                 Header · Footer · Logo · Preloader · FlightRail · WhatsAppFloat · TodoSection
   │                              + BgVideo · ImageSequence · Lottie · CursorPlane (media toolkit)
   ├─ content/visas/*.json        one file per visa category (kind 'category', 9) or service (kind 'service', 9) — AR + EN
   ├─ content.config.ts           schema of a visa page (brief v3 §6)
   ├─ data/countries.json         countries of the globe (built with the borders) — also the country lists of the forms
   ├─ i18n/                       ar.json · en.json (same keys) · index.ts helpers
   ├─ layouts/BaseLayout.astro    <html lang dir data-site="visa">, SEO, boot script, header/footer, cursor, motion init
   ├─ lib/                        forms.ts · site.ts (client data, mainSite) · borders.ts (decodes the borders, country at a point)
   ├─ motion/                     index.ts · config.ts · smooth-scroll.ts · globals/ · scenes/ (the whole WaysZ toolkit:
   │  │                           unused scenes are lazy chunks and cost nothing)
   │  ├─ code-glyphs.ts           decorative code blocks: split into characters, measure where each one sits
   │  └─ stage/                   3D layer: stage.ts (renderer + render scale) · tier.ts (WebGL or css) · bridge.ts · acts/ (paper — the Visa Home · terminal — Visa Services · atlas — the visa detail template · flight · wipe · globe · explore · glyphs · justice · gala · sky) · shaders/
   ├─ pages/                      THIN wrappers only (AR at /, EN under /en/)
   ├─ styles/                     tokens.css (identical to WaysZ's) · base.css
   └─ views/                      real page content: HomePage · VisaServicesPage · VisaDetailPage · AssessmentPage ·
                                  ConsultationPage · AboutPage · ContactPage · PrivacyPage · TermsPage · NotFoundPage ·
                                  MotionLab · home/ (one file per Home section) · visa-services/ (one file per Visa Services section) ·
                                  visa-detail/ (one file per section of the visa detail template)
```

## Pages & languages

- Arabic is the default (RTL) at `/`, English (LTR) at `/en/`. Configured in `astro.config.mjs`.
- A page is written ONCE in `src/views/XPage.astro` with a `lang` prop. Two thin wrappers render it:
  `src/pages/consultation.astro` → `<ConsultationPage lang="ar" />` and `src/pages/en/consultation.astro` →
  `<ConsultationPage lang="en" />`.
- **No hard-coded UI text in components.** UI strings: `src/i18n/ar.json` + `en.json` (identical keys).
  Use `const t = useTranslations(lang)`. Page-specific long copy may live in the view as `{ ar, en }`.
- The brief gives the English copy. Where it doesn't, write a faithful, natural translation of the Arabic and list
  doubtful terms in the PR description.
- Links: `localizePath('/visa-services/', lang)`. Language switch: `switchLangPath(Astro.url.pathname, to)`.
- URLs end with `/` (`trailingSlash: 'always'`). Slugs are English for both languages.

## Content model — one template, many pages

- `src/content/visas/<slug>.json` — the file name is the slug. `kind`: `category` (the nine visa types, brief v3 §2)
  or `service` (the nine services, §3); `order` = order inside its kind. Categories also carry a `group`:
  `visit` · `study` · `work` · `residence` (the four groups of §2).
- Shape in `src/content.config.ts` (brief v3 §6), in both languages:
  - required: name · description · audience «لمن تناسب؟» · help «كيف نساعد؟» · documents + documentsNote · faq · cta
  - optional: types «أنواع شائعة» · destinations «وجهات نعمل عليها» (country names) · benefits «مزايا شائعة»
- `src/pages/visa-services/[slug].astro` and `src/pages/en/visa-services/[slug].astro` generate every visa page
  through `src/views/VisaDetailPage.astro`. NEVER hand-write a page per visa.
- The Visa Services page (`/visa-services/`, static, wins over `[slug]`) and the header submenu «خدمات التأشيرات» list
  both groups from the collection («أنواع التأشيرات» by group · «خدماتنا»), each linking to its page.
- Destinations: the lists are in brief v3 §1.6b and §7b. A country name links to the consultation form with the
  country (and the category) prefilled. Separate pages per country are a later phase (§17).

## Media (real footage, photos, Lottie)

- Read the **waysz-media** skill before adding ANY image, video, sequence or Lottie file.
- Source freely (photos, videos, 3D models, textures, animations) — from clearly free-licensed sources: Pexels, Unsplash, Pixabay, Mixkit (Free License clips only), LottieFiles
  (free animations), Poly Haven (CC0 HDRIs/textures/models), Kenney (CC0), NASA imagery (public domain),
  Sketchfab models only if CC0 or CC-BY (credit CC-BY). Download into `media-inbox/` first, then optimize.
  Every shipped file gets a row in `docs/media-credits.md`.
- Never ship raw downloads: optimize first (recipes in waysz-media). Raw files stay in `media-inbox/`.
- Destination imagery (cities, landmarks, landscapes of the countries we serve) is welcome. Avoid third-party logos
  and brand marks (airlines, companies) in hero media.
- Every video has a poster image; every image has width/height and meaningful `alt` (empty `alt=""` if decorative).

## RTL rules (critical)

- Logical CSS only: `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `text-align: start`,
  `border-inline-*`. Never `left/right` for layout.
- Directional icons get `class="icon-dir"` (flips in RTL). **Logos never flip.** Photos/videos never flip
  (text or signs inside them would mirror).
- JS: horizontal motion × `env.dir` (see waysz-motion).
- **Never split Arabic text into characters** (breaks letter joining). Words or lines only.
- Decorative code (Motion Lab toolkit) is always LTR: `dir="ltr"`, never mirrored, horizontal motion NOT × `env.dir`,
  `aria-hidden`, system monospace stack, and our own text (no copied code, product names, URLs or secrets).
  Splitting Latin code into characters is fine.
- Emails, phones, Latin names inside Arabic text: `<bdi>`. Phone/email inputs: `dir="ltr"`.

## Design rules

- Components use **semantic tokens only** (`var(--color-brand)`, `var(--color-accent)`, …). Never raw hex,
  never primitives (`--midnight-800`). The palette is TEMPORARY; the real one replaces LAYER 1 only.
- **Colors come only from `src/styles/tokens.css`**, which stays IDENTICAL to WaysZ's (a brand swap is the same edit in
  both repos). The Visa look is the `[data-site="visa"]` block (navy family, sky-blue accent; `data-site="visa"` is on
  `<html>` in BaseLayout): any Visa-only color change goes in that block and nowhere else. Scenes and 3D acts read
  colors through the semantic tokens (`acts/util.ts token()`), never hard-wired values.
- Text over video/photos always sits on a dark gradient overlay so it passes contrast (AA).
- Dark sections: `class="theme-dark"`; a light island inside one (e.g. the boarding pass): `class="theme-light"`.
  One font family (Almarai); hierarchy via size and weight.
- Avoid template tells: accenting one word of a headline in another color, ALL-CAPS eyebrow labels,
  numbered markers on content that is not a sequence, "→" appended to every link, identical cards everywhere.
- Mobile-first. Breakpoints 640 / 1024 / 1440. Always test at 360px.
- Component CSS in the component `<style>` (scoped). Global CSS only in `src/styles`.

## Logo

- `src/assets/logo/waysz-mark.svg` is TEMPORARY (traced) — the same mark as WaysZ; the plane takes `--color-accent`
  (sky blue on Visa). Wherever the site name appears as text or aria-label: "WaysZ Visa" (`site.name`). Parts are classes: `.mark-wing-left`,
  `.mark-wing-right`, `.mark-plane`, and the invisible motion guide `.mark-road`.
- Always render it with `<Logo />`. Colors: `--logo-mark`, `--logo-plane`.
- When the final logo arrives: keep the same class names and re-measure `LOGO` in `src/motion/config.ts`.

## Animation — read before ANY motion work

- Use the project skill **waysz-motion** (+ **waysz-media** for media) and the installed **gsap-skills**.
- Working examples of the basic scenes and attributes live in the Motion Lab (`src/views/MotionLab.astro`).
  The Home page is built directly in `src/views/HomePage.astro` (the Motion Lab is not required for it);
  for other pages, add a new technique to the Motion Lab first. The WaysZ scenes and acts (`src/motion/scenes`,
  `src/motion/stage/acts`) are our toolkit: reuse them (re-skinned by the tokens) or build new ones. New scenes, shaders and 3D acts of your own
  are welcome whenever they make the page more impressive (see "Creative freedom").
- Home may use up to **3 pinned scenes** (other pages: 2), as long as scrolling stays smooth. Prefer CSS
  `position: sticky` + a scrubbed ScrollTrigger whenever a scene only needs to hold the screen.
- Content that a scroll state hides (stacked cards, waiting steps) is faded with `opacity`, never
  `visibility`/`autoAlpha`, so screen readers and keyboard focus still reach it; dimmed text stays ≥ AA contrast.
- 3D follows the **Quality policy**: two states only — `full` (WebGL2: the full scene, every device) and `css`
  (no WebGL2 or context lost: plain video + CSS layers / posters, all GSAP scenes still run). The only runtime
  adaptation is the stage's dynamic render scale. The HTML underneath is always complete (LCP, no-JS, no-WebGL).
- The shared renderer has no depth buffer. Solid 3D models (e.g. the scales of the `justice` act) are drawn by their act into
  its own render target in `prerender` and finished by one full-screen pass — never a second renderer.
- LCP: a still that does not fill the screen is a foreground image and becomes the LCP (slow). Phones get a
  full-screen still behind the text (like the video posters), so the text is the largest paint.
- No `<ClientRouter />`: page transitions are native CSS view transitions (already in base.css).

## Forms

- Contract in `src/lib/forms.ts`. Fields and copy: brief v3 §12 (consultation) and part 05 (messages, `t.form`).
  Show `t.form.consent` under every form.
- The consultation form reads `?type=`, `?service=` and `?destination=` to prefill itself (links from visa pages,
  destinations and the assessment tool).
- The assessment tool (`/assessment/`, brief v3 §11) runs fully in the browser and sends nothing; its result opens
  the consultation form prefilled.
- Destination NOT decided. `TODO(endpoint)` — do not choose a provider without the team.

## Client data

- Phone, WhatsApp, address, branches, hours, emails, social links live ONLY in `src/lib/site.ts`. The client is
  starting a new entity: use the data he sends; until then, clear placeholders marked `TODO(client)`. The old
  site's contact data is not used.

## Deploy

- Now: preview builds on Vercel (`vercel.json`, every page `noindex`) for the client's review.
- Final (after the client's approval): Namecheap — Stellar Plus, cPanel. `npm run build` → upload the CONTENTS of
  `dist/` into `public_html/` of waysz-visa.com. `.htaccess` is included.

## Definition of Done (every page / section)

- `npm run check` → 0 errors. No console errors.
- Works in Arabic AND English, desktop AND 360px mobile, with JS OFF, and in the no-WebGL fallback (`?tier=css`).
- Quality policy holds: `node scripts/qa-policy.mjs` passes (OS reduce-motion, saveData, CPU 4×, 30 fps cap →
  tier `full`, the canvas draws, every scene runs; only the render scale may drop).
- Media: initial page weight ≤ 4 MB on desktop / ≤ 2 MB on mobile; nothing below the fold loads early.
- Lighthouse mobile: Performance ≥ 75 · Accessibility ≥ 95 · SEO ≥ 95. LCP ≤ 2.5s (hard rule).
- Smooth: no dropped frames while scrolling with DevTools CPU throttling 4× on the scrubbed sections.

## Astro 7 gotchas

- Whitespace is stripped JSX-style: write `{" "}` where a space between inline elements matters.
- `<script>` in `.astro` is bundled and runs once per page load. `is:inline` only for the boot script.
- Typing DOM lookups in TS: `root.querySelector<SVGPathElement>('.x')!`.
- CSS is inlined into every page (`build.inlineStylesheets: 'always'` in astro.config.mjs): no render-blocking CSS
  request, which keeps mobile LCP under 2.5 s. Keep component CSS lean.

## Team workflow

- One branch per task: `feat/home-hero`, `feat/visa-services-page`, … Small PRs, one review, then merge.
- Shared files (`src/styles`, `src/motion`, `src/components`, `src/i18n`, layouts, `CLAUDE.md`, skills)
  have one owner at a time — announce in the group before editing.
- Before building a section: read its section in brief v3, its storyboard row in waysz-motion `reference.md`,
  and the matching Motion Lab example. Replace the section's `<TodoSection>`.

## Finishing a task (every session)

- Never end your turn while a background job, shell or agent you started is still running: wait for it.
- **Never run `git commit` or `git push`.** The developer reviews, commits and pushes himself. Leave all changes
  in the working tree (you may run `git status` / `git diff` to check them).
- End a task ONLY when everything is done: all checks run and every change saved.
- Start the final message with the line `FINISHED — changes ready (not committed)`, then the report, and end the
  report with one suggested commit message.
- If something cannot be finished, start the final message with `NOT FINISHED —` and say exactly what is left.
- Time-box polishing: if a performance or visual target is still not met after two honest attempts, stop, keep what works, report it in one line and finish. Never ask the developer questions mid-task; decide sensibly and list decisions in the report.

## Working style (Ahmed's rule — always)

- Work like a senior developer who owns the task: pick the standard, simplest solution that fully meets the goal
  and get it done. Never stop to ask the developer; decide sensibly and list the decisions in the report.
- Stay inside the task's scope: no refactors, extra features, new abstractions, new tooling or "while I'm here"
  changes that the prompt did not ask for.
- QA in proportion to the change. A small fix: npm run check + npm run build + a quick look at the affected pages
  only. The full Playwright suites (qa-shots, qa-policy, the page QA scripts) only for new pages, new scenes or
  changes to shared motion / stage code.
- Never write measuring scripts or extra tooling to prove a trivial change.
