# Visa Services — creative treatment: «مطار الضوء» / "Terminal of Light"

## The idea

A visa is a door you pass through, so the Visa Services page is a walk through a dreamlike airport. It floats
above a sea of clouds at night and is drawn entirely in LIGHT: glowing edge lines, frosted-glass panels, soft fog
and drifting dust. The Visa blue (`--color-accent`) is the main light, navy (`--color-bg` in `.theme-dark`) is the
night, and a touch of warm white (`--color-ink` warmed by `--color-area-travel`) marks the human places (a desk
lamp, a waiting seat, the dawn behind the last gate). The camera moves like a crane and a dolly: slow, eased, calm.
You arrive outside while runway lights pulse toward the glass doors, glide in, and walk the concourse. The four
**counters** are the services: each one wakes as you reach it. Then a sideways dolly along five **gate arches**:
the categories, each opening onto a small glimpse of the world behind it. An **information desk** with a softly
glowing "i" helps the unsure. At the end of the terminal, through the last window, a plane made of light takes off
from the lit runway: the call to request a consultation. Nothing cartoonish, no real airport, no airline, no
livery, no words in 3D, no visa stamp and no "approved" imagery: we prepare files, the embassy decides.

## Rules this page keeps

- The client's text is used 100%, in the brief's order (part 04 §2: title + intro · §2.1 four services · §2.2/2.3
  five categories with «تناسب:» · «لست متأكدًا…» · §2.4). The FAQ (4 questions) is an addition in our own words.
- Every word is DOM over a scrim (names in Arabic + the brief's English names, like bilingual airport signs; gate
  numbers live in the DOM cards). 3D never carries text; the "i" is a pictogram, drawn by a shader.
- Same scene for every visitor (quality policy). Phones get a portrait framing (wider lens, subject in the upper
  part of the screen), not less.
- css tier (no WebGL2 / context lost) and no JS: our own stills of the terminal (`scripts/render-terminal-still.mjs`);
  every GSAP scene still runs; the page is complete without the canvas.
- RTL: the layout and the walk mirror (the concourse runs the other way, `x × side`, the dolly × `env.dir`); the
  plane, the "i" and the mark never mirror (the plane is built facing the runway, sprites are never flipped).

## Storyboard

Hosts: ONE sticky stage host (`.term__stage`) behind hero → §2.1 → §2.2 → «لست متأكدًا…» (the paper-thread
pattern: `scenes/terminal-thread.ts` measures the `[data-shot]` sections → `bridge.terminal.shot`). The FAQ has no
canvas (the host has scrolled away: the stage stops drawing). §2.4 has its own host (`.tcta__stage`) for the finale;
the stage hands the one canvas to whichever host is most visible.

| § | Section | DOM | 3D (act `terminal`) | Motion | css tier / no JS |
| --- | --- | --- | --- | --- | --- |
| 2 | Hero: «خدمات التأشيرات» + intro | h1 words rise (data-intro on the h1 only); the intro is the LCP and is never hidden | outside the floating terminal: a long glass hall drawn in light over the cloud sea, roof canopy, approach lights pulsing toward the doors in perspective, light dust; scrolling, the doors slide open and the camera glides in through them and turns down the concourse | `terminal-hero` (sticky 200lvh, scrubbed) → `terminal.light` | `terminal-hero.webp` (wide) / `terminal-hero-m.webp` (tall, full screen behind the text) |
| 2.1 | «خدماتنا»: four services, name (AR + EN) + the brief's short description + link to the detail page, one at a time | panels stacked, opacity only (focus scrolls to its rest); ticks | one sticky screen, four rests along the concourse; each counter lights up as the camera reaches it and plays its own motion during the rest — Consultation (a desk and two stools of light, a warm glow breathing between them) · Document Readiness (sheets glide through an arch of light on a belt, turn blue and get a check: "checked", not security) · Application Guidance (a floating kiosk screen whose fields light one by one) · Appointment Preparation (a clock tower whose hands turn, a board of light rows, a waiting seat) | `terminal-counters` (sticky 480lvh, 4 plateaus + tail) → `terminal.counter`, `terminal.counterAct` | four stills `terminal-s1…s4.webp`, cross-faded with the panels |
| 2.2–2.3 | «فئات التأشيرات»: five gates, gate number + name AR + EN + description + «تناسب:» + link | panels stacked, opacity only; ticks | a second sticky screen: the camera dollies sideways (× `env.dir`) along five gate arches in the glass back wall; through each arch (a true portal: the world behind is bright only where seen through its opening) a glimpse that wakes when the camera arrives — Student (floating book pages before a library arch) · Business (a stage, rows of chairs, a lectern light) · Immigration & Residence (a city grid of lit windows) · Family (two small houses joined by a ribbon of light that draws itself) · Tourist (a horizon at dawn with rising balloons) | `terminal-gates` (sticky 580lvh, 5 plateaus + tail) → `terminal.gate`, `terminal.gateAct` | five stills `terminal-g1…g5.webp` |
| 2.2 | «لست متأكدًا من نوع تأشيرتك؟» + text + «اطلب استشارة ←» → /consultation/ | a card | the information desk at the end of the concourse: a round desk of light, the "i" pictogram glowing softly above it | `terminal-info` (heading by words, the card settles) | `terminal-info.webp` |
| + | FAQ (4 questions: choosing the visa type, a consultation) | accordion | — (canvas gone) | `accordion` + `terminal-faq` (closed answers `inert`, rows arrive once) | all answers open |
| 2.4 | «جاهز لتحديد طريقك؟» + text + «اطلب استشارة» (magnetic) | text | the end window: a stylized plane of light (simple shapes in code, no model, no livery, no logo) rolls down the lit runway, rotates and lifts off into the high clouds; the runway lights then chase toward the far end; the CTA rises as the plane leaves the ground | `terminal-cta` (scrubbed `terminal.takeoff`, heading by words) | `terminal-finale.webp` |
| — | Footer | | | `footer-landing` | |

Pins: none. Every held screen is CSS sticky + a scrubbed ScrollTrigger (hero, §2.1, §2.2).

## The act `terminal` (one act, two hosts)

- `createTerminalAct(host, 'journey' | 'finale')` in `src/motion/stage/acts/terminal.ts`, shaders in
  `shaders/terminal.glsl.ts`. Scenes talk to it only through `bridge.terminal`; they never import three.
- Everything is LIGHT, so everything blends ADDITIVELY: order-independent, which suits the shared canvas without a
  depth buffer (no sorting, no render targets). Only the sky (opaque, first) and the finish (last) are not additive.
- Geometry built in code, merged per kind: ONE glowing-line mesh for the whole world (screen-space ribbons with a
  core + halo profile, clipped at the near plane), ONE frosted-panel mesh, ONE instanced sprite mesh (runway lights,
  downlights, windows, glows, the "i"), ONE instanced dust mesh. Per-vertex attributes carry a light group (counters
  and gates wake from `uGroup[]`), a motion (spin · travel · appear · float · chase, driven by `uSlot[]`) and a
  portal index (the gate glimpses).
- The sky is one full-screen ray pass: navy gradient, stars, a warm moon halo, the cloud sea (fbm on the plane under
  the terminal, lit from above, a blue glow under the terminal, horizon haze) and a high cloud layer for the finale.
- No textures at all: the sprites (glow, flare, ring, the "i") are SDFs in the sprite shader.
- Finish: one full-screen overlay quad (grain + vignette) blended on top — no render target.

## Budgets (measured in the PR report)

| Item | Budget |
| --- | --- |
| draw calls per frame | ≤ 40 (design: 6 journey · 9 finale) |
| act chunk (terminal.ts + shaders, gzip, three excluded) | ≤ 40 KB |
| textures | none (one canvas atlas ≤ 1024² allowed, not needed) |
| models / HDRI / image downloads for 3D | none |
| shadow maps · extra render targets · bloom | none |
| shaders | 5 programs (sky · lines · panels · sprites · finish), compiled with `compileAsync` when the act registers; the finale act is built in idle time |
| dust | ≤ 400 specks |
| initial page weight | ≤ 4 MB desktop · ≤ 2 MB mobile; stills below the fold load lazily |
| Lighthouse mobile | Performance ≥ 75 · Accessibility ≥ 95 · SEO ≥ 95 · LCP ≤ 2.5 s |
