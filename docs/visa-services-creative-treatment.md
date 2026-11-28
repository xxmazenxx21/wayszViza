# Visa Services — creative treatment: «رحلة في المطار» / "Through the Terminal"

## The idea

The page IS a walk through a real airport. A drone glides in over a modern terminal at dusk, the glass doors slide
open and we are inside; the nine services settle one after another as we walk the long travelator corridor lit in
blue; a band of Visa-blue light carries us into the bright glass concourse, where the moving walkway takes us past
four gate zones — A زيارة · B دراسة · C عمل · D إقامة واستثمار — and the nine categories wait at their gates. The film
then fades to the page's navy for a calm FAQ, and the walk ends at a big terminal window at sunset where a plane rolls
down the runway and lifts off while the call «جاهز لتحديد طريقك؟» rises.

Real footage at FULL quality (client decision, follow-up of 28 Nov 2026): sharp, natural, cinematic — four free
2560×1440 clips (Pexels), shown as they were shot. The grade only matches the clips to each other (white balance,
exposure, a gentle contrast curve) plus a very light vignette; no tint, no crushed blacks, grain at the edge of
visibility. The Visa navy + blue identity lives in the UI: opaque cards, local scrims behind the text only, the gate
signs, the frosted door panels with lit edges and the light wipe between chapters, the window frame of the finale.
Logos, ad screens and readable signs are blurred ONLY in their small area (tracked per frame), never the whole frame.

## Rules this page keeps

- Copy and order (brief v3 §5): title + intro (v2, word for word) → §2.1 the nine services (§3 order: the four core
  ones first, then the five new) → §2.2 + §2.3 the nine categories in their four groups (§2 order, §16 group labels),
  each with its §7 short line and «تناسب:» line, then the card «لست متأكدًا من نوع تأشيرتك؟» → /assessment/ → FAQ
  (§19.2: questions 1–3 as they were, Q4 new answer, Q5 new) → §2.4 «جاهز لتحديد طريقك؟» (v2).
- Names, category lines and «تناسب:» come from `src/content/visas/*.json` (`name`, `summary`); the services' short
  lines live in the same files (`short`: §5/v2 lines for the four core services, §4 1.5b lines for the five new). Group
  labels: `t.nav.groups`. Nothing is written twice on this page.
- Same experience for every visitor (quality policy). Phones get portrait crops of the same clips at the right size —
  never fewer effects. No `prefers-reduced-motion`, no tiers; the stage's dynamic render scale is the only adaptation.
- css tier (no WebGL2 / context lost): the same videos drawn by a 2D canvas at the device pixel ratio (cross-fades
  instead of the shader cuts); every GSAP scene runs. No JS: each chapter's poster behind its section, every card in
  plain flow, all FAQ answers open.
- Pins: none. CSS `position: sticky` + scrubbed ScrollTriggers only.
- RTL: words / lines only (SplitText `words`), logical CSS, horizontal motion × `env.dir`; the light wipe sweeps in the
  reading direction; footage never mirrors.

## Storyboard

| # | Section (brief) | Footage (chapter, technique) | DOM / motion |
|---|---|---|---|
| 0 | Hero — «خدمات التأشيرات» + intro (§5, v2) | **approach** (video) — a drone glides in over a modern terminal at dusk; at the end we reach the doors: frosted glass panels fill the screen, the corridor appears behind them and the two panels slide apart (shader **door cut**). | Title words rise from a mask after the intro; the intro is the LCP and is never hidden. Sticky 240lvh. |
| 1 | §2.1 «خدماتنا» — nine services | **corridor** (video) — the long travelator corridor lit in blue, travellers walking ahead. Ends with a sweep of Visa-blue light (shader **light cut**, × reading direction). | One sticky screen; each opaque service card (name, its name in the other language, short line, «التفاصيل») slides in and settles, rests, then hands over. Nine ticks. |
| 2 | §2.2 + §2.3 «أنواع التأشيرات» — nine categories + «لست متأكدًا…» | **gates** (video) — the moving walkway through the bright glass concourse. The film fades into the page navy at the end. | A DOM gate sign (zone letter + group) changes per zone; each card carries its gate code (A1…D3), §7 line, «تناسب:» and a link; the last card goes to the assessment tool. |
| 3 | FAQ (§19.2) | none — calm navy | `accordion` + rows arrive once. |
| 4 | §2.4 «جاهز لتحديد طريقك؟» | **takeoff** (video) — beyond the mullions of a big terminal window (drawn by the shader), a plane rolls down the runway at sunset and lifts off as you scroll. | Words rise as the plane leaves the ground (or on keyboard focus); magnetic button → /consultation/. |

**Why video for every chapter:** all four are long, continuous camera moves. H.264 at 20 fps with a keyframe every 12
frames seeks frame-accurately in a few milliseconds, uploads to WebGL on the browser's GPU path, and keeps 1080p / 1440p
sharp at a fraction of the weight of an image sequence of the same resolution. No chapter needs a short, frame-exact
scrub that only a sequence could give.

## The act `airport` (one act, two hosts)

- `src/motion/stage/acts/airport.ts` + `shaders/airport.glsl.ts`. One full-screen quad, two plate textures (A and B)
  whose image is the chapter's `<video>`: uploaded only when a new frame is presented, linear filtering, no mipmaps, 1
  draw call, no render target. Instance `journey` on the sticky host behind hero → §2.2; instance `finale` on the host
  of §2.4 (window mullions on). The act declares `ratio: { max: 2, min: 1 }`: the footage is drawn at the device pixel
  ratio (cap 2) and the stage's render scale never takes it below 1.
- Shader: cover-fit at 1:1 (no zoom, warp or parallax on the footage), the per-chapter match, a very light vignette,
  faint grain; the cuts (door: frosted panels slide apart with lit sky-blue edges · light: a band of Visa sky light) and
  the exit to navy; FINALE: the window frame in UI navy with a thin sky lip and its own pointer parallax.
- Scenes own scroll and talk to the act through `bridge.airport` (`journey` / `finale` plates: videos + frame ids,
  chapters, mix, wipe, exit; pointer, side). Scenes never import three.
- Videos: `public/media/video/airport-{approach,corridor,gates,takeoff}.mp4` (1920×1080) · `-hd.mp4` (2560×1440, for
  screens that draw more than ~2200 px wide) · `-m.mp4` (816×1440 portrait crops for phones) · `-poster(-hd|-m).webp`.
  One shared loader (`src/motion/reel.ts`): each chapter is fetched whole as a Blob (seeking never waits for the
  network); one seek in flight, the newest target wins; frames announced by requestVideoFrameCallback. Loading: nothing
  but the hero poster before the first interaction; then the hero and the corridor; then one chapter ahead.

## Budgets (measured in the PR report)

- Initial load ≤ 4 MB desktop / ≤ 2 MB phone (the hero poster only — no video before the first interaction).
- Full scroll ≤ 35 MB desktop / ≤ 15 MB phone (all four videos, fetched one chapter ahead).
- Desktop video 1920×1080 (2560×1440 on large / HiDPI screens), phones 816×1440; quality chosen so no compression
  artefact shows on a 1920 screen (CRF 25, checked 1:1 against the masters).
- Scrubbing: no dropped frames with CPU 4×; the act draws one quad.
- LCP ≤ 2.5 s (the intro text; the poster is a full-screen background behind it).
