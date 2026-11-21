# Home — creative treatment: «رحلة الورق» / "The Paper Journey"

## The idea

A visa journey is made of paper: documents, forms, a file. So the whole Home page is one paper world, a
pop-up book that comes alive in the night. A closed travel booklet floats in a navy void among drifting paper
flakes. Scrolling opens it like a book you are given: the cover swings on its hinge, the booklet lies down,
and the camera rises over it like a crane. Every spread is a pop-up: pieces rise from flat to standing as the
page opens, and the problems that sink an application (a missing document, a wrong field, an unclear purpose)
are fixed in front of you. Each of the four services is a page turn onto its own diorama. Later the booklet
returns, closed and complete: a sky-blue ribbon bookmark slides out and the only seal on the page lands:
«ملف جاهز» / "File ready". Never an "approved" stamp: we prepare files, the embassy decides.
Tone: calm, precise, magical. Premium paper, soft light, slow eased moves. The Visa blue (`--color-accent`) is
the light; navy (`--color-bg` in `.theme-dark`) is the night. Nothing cartoonish.

## Rules this page keeps

- The client's text is used 100%, in the brief's order (part 04, Home). Additions (visa types, FAQ) are built on
  the brief and written in our own words.
- 3D never carries text. Every word is DOM over a scrim. The booklet carries only the WaysZ mark (never mirrored).
- §1.7 «تنبيه مهم» is never animated, never hidden: a plain static card.
- Same scene for every visitor (quality policy). Phones get a portrait framing, not less.
- css tier (no WebGL2 / context lost) and no JS: our own stills of the paper world (`scripts/render-paper-still.mjs`);
  every GSAP scene still runs and the page is complete without the canvas.

## Storyboard

Hosts: ONE sticky stage host (`.paper__stage`) behind hero → §1.1 → §1.2–1.5 (the legal-thread pattern:
`scenes/paper-thread.ts` measures the sections → `bridge.paper.shot`). A second host in §1.8 (`.pcta__stage`)
for the reprise; the stage hands the one canvas to whichever host is most visible. Between them the canvas is
gone (visa types, steps, FAQ, the notice): the stage stops drawing.

| § | Section | DOM | 3D (act `paper`) | Motion | css tier / no JS |
| --- | --- | --- | --- | --- | --- |
| — | Intro | logo | — | `preloader` (unchanged) | — |
| Hero | «طريقك إلى التأشيرة يبدأ بخطوة صحيحة» + subtitle + 2 buttons; while the booklet opens the alternative title «ملف مكتمل.. وخطوات واضحة.. واستعداد أفضل لموعدك» takes the screen | h1 words rise (data-intro on the h1 only); lead + buttons are the LCP, never hidden | closed booklet floating among paper flakes, navy cover, WaysZ mark debossed with sky foil; tilts toward the pointer, foil catches the light; scrolling opens the cover on its hinge, the booklet lies down, the camera cranes up | `paper-hero` (sticky 200lvh, scrubbed) | still `paper-hero.webp` (wide, soft-edged on the free side) / `paper-hero-m.webp` (tall, full screen on phones) |
| 1.1 | «كيف نساعدك في رحلة التأشيرة؟» + whole paragraph on a scrim; the three phrases of the problems get underlined in turn | text | first spread pops up: a document with a missing piece, a form with a misaligned field, a blurred signpost; scrolling fixes them in turn (piece slides in, field aligns, sign becomes a clear arrow), a check appears on each | `paper-help` (sticky 260lvh, scrubbed) → `paper.fix` | still `paper-help.webp` (fixed state) |
| 1.2–1.5 | name (AR + the brief's EN name) + text + link to the detail page, one at a time | panels stacked, opacity only (focus scrolls to its panel) | one sticky screen with four rests: each service is a page turn (curl in the vertex shader) onto its own pop-up diorama — consultation (paper table, two chairs, a lamp; paper roads split and one lights up) · document readiness (sheets fly in and stack into a tabbed folder, checks appear) · application guidance (a big form, fields light one by one, a paper pencil glides) · appointment preparation (calendar with a ringed day, a clock, a generic arch whose door opens onto a calm room) | `paper-services` (sticky, 4 plateaus + tail) → `paper.turn`, `paper.act` | four stills `paper-s1…s4.webp`, cross-faded with the panels |
| + | «أنواع التأشيرات»: five category cards (photo + the brief's §2.2 description + «تناسب:» line) → detail pages, + «لست متأكدًا من نوع تأشيرتك؟» → /consultation/ | cards | — (canvas gone) | `data-reveal` | same |
| 1.6 | «خطوات بسيطة نحو ملف جاهز»: four steps | HTML steps | — | the booklet's stitching becomes a sky-blue thread drawn through the steps with the scroll (SVG, DrawSVG); each step lights when the thread reaches it | full thread drawn |
| + | FAQ (5 questions) | accordion | — | `accordion` + rows arrive once | all answers open |
| 1.7 | «تنبيه مهم: …» whole | a calm, static card | — (canvas gone) | **none** | same |
| 1.8 | «جاهز لبدء رحلتك؟» + text + «ابدأ استشارتك» (magnetic) | text, the «ملف جاهز» seal (SVG, DOM) | the booklet returns closed; a sky-blue ribbon bookmark slides out; the seal lands once (small impact: the booklet bounces) | `paper-cta` | still `paper-finale.webp`; seal shown |
| 1.9 | «جزء من WaysZ» + text + «زيارة موقع WaysZ» → site.mainSite | the WaysZ boarding pass reversed: «WaysZ Visa → WaysZ», stamp in WaysZ amber (semantic tokens under `[data-brand="main"]`) | — | `boarding-pass` (reused as is) | same |
| — | Footer | | | `footer-landing` | |

Pins: none. Every held screen is CSS sticky + a scrubbed ScrollTrigger (hero, §1.1, §1.2–1.5).

## The act `paper` (one act, two hosts)

- `createPaperAct(host, 'journey' | 'finale')` in `src/motion/stage/acts/paper.ts`, shaders in
  `shaders/paper.glsl.ts`. Scenes talk to it only through `bridge.paper`; they never import three.
- Geometry = planes only. Flakes: ONE instanced geometry (480 flakes), drawn as two meshes (behind / in front of the
  booklet). Cover and turning page: low-segment planes, hinge and page curl in the vertex shader. Each diorama is
  ONE merged geometry of quads; pop-up hinges, slides, swings, spins and fades are per-vertex attributes animated
  in the vertex shader (one draw call per diorama, its soft shadows included as gradient quads).
- Textures: ONE canvas atlas (2048²) drawn at runtime from our own vector drawings (cover, foil mask, pages, every
  pop-up piece); paper fibre and grain are procedural in the shaders.
- Light: fake, in the shaders (fold angle / normal → shade, a soft rim from the accent light, foil sheen from the
  pointer). No shadow maps, no render targets, no MSAA targets, no bloom. The shared canvas has no depth buffer:
  every piece is transparent and drawn back to front (render order per part + merged geometry in back-to-front order).
- Finish: one full-screen overlay quad (grain + vignette) blended on top — no render target.

## Budgets (measured in the PR report)

| Item | Budget |
| --- | --- |
| draw calls per frame | ≤ 40 (design: ~12) |
| act chunk (paper.ts + shaders, gzip, three excluded) | ≤ 40 KB |
| flakes | ≤ 600 (480) |
| textures | one canvas atlas ≤ 2048², no downloads |
| models / HDRI | none |
| shaders | 5 programs, compiled with `compileAsync` when the act registers (before its section) |
| initial page weight | ≤ 4 MB desktop · ≤ 2 MB mobile; stills below the fold load lazily |
| Lighthouse mobile | Performance ≥ 75 · Accessibility ≥ 95 · SEO ≥ 95 · LCP ≤ 2.5 s |
