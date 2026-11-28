# WaysZ Motion — Scene Contracts & Page Storyboard (WaysZ Visa)

Scenes: `src/motion/scenes/<name>.ts`, opted in with `data-scene="<name>"`.
Home is built directly in `HomePage.astro`; other pages copy patterns from the Motion Lab.
The contracts below were written for the WaysZ pages: the scenes, acts and shaders are all here (our toolkit), the
`views/...` files they mention are in the WaysZ repo — open them there as working examples.
Media files and search terms: skill **waysz-media** (shot list).

---

## Scene contracts

### preloader — logo "Take-off" (home only, first visit per session) — KEEP AS IS

Rendered by `BaseLayout` when the page passes `preloader`. Dispatches `waysz:intro-done`.

### hero-takeoff — Home §1.2 "In the sky"

```html
<div class="flight theme-dark" data-flight>
  <div class="flight__stage" aria-hidden="true"></div>   <!-- WebGL canvas host: sticky for the whole flight -->
  <section class="hero" data-scene="hero-takeoff" data-depth-scene data-waypoint>
    <div class="hero__sticky">
      <div class="hero__media" aria-hidden="true">
        <div class="hero__plate"><BgVideo name="hero-clouds" mobile="hero-clouds-m" eager /></div>
        <img class="hero__cloud hero__cloud--far"  data-depth="0.3" data-src="/media/img/cloud-2.webp" alt="" />
        <img class="hero__cloud hero__cloud--near" data-depth="0.8" data-src="/media/img/cloud-1.webp" alt="" />
        <div class="hero__veil"></div>
      </div>
      <div class="hero__scrim" aria-hidden="true"></div>
      <div class="hero__content container"><div class="hero__text">
        <h1 class="hero__title" data-intro><span class="hero__line">…</span><span class="hero__line">…</span></h1>
        <p class="hero__lead">…</p>
        <div class="hero__actions">…</div>
      </div></div>
    </div>
  </section>
  <ImageSequence … veil />   <!-- overlaps the hero's last screen (margin-block-start: -100lvh) -->
</div>
```

- Entrance (after the intro): headline WORDS rise from a mask; lead + buttons are never hidden (LCP) and
  only settle 28px on a first visit. Then `startFlightStage(env)`.
- Scroll: the hero is 190lvh tall with a sticky 100lvh inner (no pin). Progress 0→1 = the camera pushes
  into the clouds and ends in a white-out exactly when the journey pins.
- `full` (WebGL): video + clouds + rays are drawn by the stage (`.is-live` hides `.hero__media`).
  `css`: the video, the two cloud photos (`data-src`, fetched after the entrance) and `.hero__veil` do it.
- The logo mark is NOT in the hero — the intro already showed it. (Motion Lab keeps the old logo hero
  as `hero-logo`.)

### image-sequence — Home §1.2b "The Journey"

```html
<ImageSequence id="journey" name="takeoff" frames={140} mobile="takeoff-m" mobileFrames={70} label="…" veil>
  <p class="seq__caption" data-at="0.14">…</p>
  <p class="seq__caption" data-at="0.4">…</p>
  <p class="seq__caption" data-at="0.64">… <a class="seq__more" href="/about/">…</a></p>
</ImageSequence>
```

Pinned (pin 1 of 3); scrolling plays the take-off frame by frame; the three captions are the brief's §1.2
intro paragraph cut at its own punctuation. With `veil` the first 10% clears the cloud white-out and the
last 12% climbs back into it, ending in the page background colour.

### areas — Home §1.3 (`views/home/Areas.astro`)

```html
<section class="areas" data-scene="areas" data-waypoint>
  <div class="areas__view" data-depth-scene>
    <div class="areas__stage stage-host"></div>            <!-- WebGL act "wipe" -->
    <header class="areas__intro"><h2 class="areas__title">…</h2></header>
    <article class="area theme-dark" data-side="left|right" style="--hue; --justify; --focus">
      <div class="area__media"><div class="area__photo" data-depth="0.35"><Image data-focus /></div></div>
      <div class="area__scrim"></div>
      <div class="area__body"><div class="area__text"><svg class="area__icon"/><h3 class="area__name"/><p class="area__copy"/><a class="area__link"/></div></div>
    </article> ×4
    <div class="areas__ticks"><span/>×4</div>
  </div>
</section>
```

One sticky screen, 4.4 "units" of scroll: title on the page colour (we are still in the cloud) → each area in
turn, resting between transitions. With WebGL: cloud wipe · liquid displacement · light sweep · iris
(`wipe.glsl.ts`); css tier: clip-path wipes of the same `<img>`s. Photos never mirror — `data-side` says where
the text goes. No JS: stacked full-screen cards.

### media-reveal — Home §1.4 (`views/home/Why.astro`) · About §4.1

`.why__track > .why__view (.reveal__media > .reveal__inner, .why__shade, .reveal__text) + .why__list > .reason[data-icon]`.
The media opens from a cabin-window shape to full screen; the heading travels from the middle of the window
to its place; then the `.reason` items arrive, each icon with its own movement (`iconTimeline`). Wide + tall
screens: all inside one sticky screen, scrubbed. Small screens: reveal scrubbed, items enter while scrolling
over the held photo.

### globe-route — Home §1.5 (`views/home/How.astro`)

`.how__track > .how__view (.how__poster, .how__stage.stage-host, .how__scrim) + .how__content (.how__title, .how__route > .how__line + ol.how__steps > .step)`.
The plane flies three hops across the night globe (act "globe") and each `.step` gets `.is-active` when the
plane reaches its stop; the HTML line + plane under the steps mirrors it (and is the whole route on the css
tier, over the still `earth-poster.webp`). Wide: sticky screen with rests at each stop. Small: the globe holds
the top of the screen, the steps scroll over it. Waiting steps are dimmed to 0.62 (still AA).

### approach — Home §1.6 (`views/home/Cta.astro`) · reuse for Contact §5

Photo settles as the section arrives (scale + y, scrubbed), headline rises by words once, CSS-animated
approach lights (`.cta__lights span`, perspective from `--i`) run only while `.is-live`. Buttons: `data-magnetic`.

### boarding-pass — Home §1.7 (`views/home/Visa.astro`)

`.pass__scroll` (scroll tilt: rotationX 46° → 0) > `.pass__shadow` + `.pass.theme-light[data-site=visa]`
(pointer tilt + `.pass__shine`) with `.stamp` (lands once, small impact). The notches are a CSS mask, so the
shadow is its own layer.

### footer-landing — every page

Runway centre line decelerates with the last stretch of scroll (scrubbed), threshold lights come on, the logo
wings rise and the plane comes down onto its spot.

### page-hero — Immigration hero (`views/immigration/Hero.astro`) · reuse for any group / inner page

`.phero > .phero__sticky (.phero__window > .phero__plate[data-depth] > BgVideo + .phero__scrim) + .phero__content (crumb, h1[data-intro], lead, actions)`.
165lvh section with a sticky screen (no pin): headline by words on load; scrolling closes the footage into a
cabin-window shape that sinks into the night. The next section overlaps the last 34lvh.

### journey-route — Immigration "the journey" (`views/immigration/Journey.astro`)

`.journey__route > svg.journey__sky (path.journey__ghost + path.journey__trail) + .journey__plane + ol.journey__stops > li.stop[style="--x; --y"]`.
No pin, no sticky. The SVG is stretched over the route box (`preserveAspectRatio="none"`), so the plane is an
HTML element placed from the path's own points; stops sit ON the path (keep `STOPS` and `PATH` in sync) and
light up (`.is-active`) when the plane passes; icons draw once. RTL mirrors the SVG. Small screens: vertical line.

### dossier — Immigration services (`views/immigration/Services.astro`)

`.dossier > .dossier__view (.dossier__head + ul.dossier__track > li.sheet.theme-light)`. Wide: CSS sticky screen +
one scrubbed trigger slides the track (× `env.dir`); the section's height is set from the track's width on
every refresh. Sheets tilt and sit low at the edges, settle upright in the middle; a focused link scrolls its
sheet to the middle. Small screens / no JS: a plain grid of sheets.

### explore-globe — Immigration "Explore the world" (`views/immigration/Explore.astro`)

`.explore > .explore__head (h2, lead, .combo: input[role=combobox] + ul[role=listbox]) + .explore__globe (.explore__poster, .explore__stage.stage-host, .explore__pad, .explore__tip, .explore__zoom) + .explore__foot > .explore__msg[aria-live] > .explore__card`.
The scene owns the combobox, the pointer on `.explore__pad` (`touch-action: pan-y`: horizontal drag rotates,
vertical drag scrolls the page; tap / click selects; ctrl + wheel or the buttons zoom) and the welcome message
(DOM, words only). The act `explore` draws the globe and is driven through `ExploreControls`
(`pick · hover · drag · release · zoom · flyTo · setAuto · setLayout`). Borders + act load at `top 250%`.
css tier (no WebGL): `earth-borders-poster.webp` + the same list and message, no flight. `.is-live` on the
section = the globe is interactive. Selecting a country also fills `[data-destination-chip]` and adds
`?destination=<ISO>` to `a[data-consult]` anywhere on the page.
Borders (`scripts/build-borders.mjs`, Natural Earth, Egypt's point of view) — **client decision: Israel does not
exist on the globe.** Its territory is merged into Palestine: ONE country «فلسطين» / "Palestine" (ISO `PS`) covering
the whole area (clicking anywhere there → «أهلاً بك في فلسطين» / "Welcome to Palestine"); the Golan Heights stay with
Syria. No `IL` in the data, the list, the name overrides or the copy; the build fails if `IL` reappears or a
contested test point (Tel Aviv, Haifa, Beersheba, Eilat, Gaza, Ramallah, East Jerusalem → `PS`) moves.

### code-hero — Software hero, "Code in flight" (`views/software/Hero.astro`)

`.chero > .chero__sticky (.chero__media > .chero__plate > BgVideo + .chero__scrim, .chero__codebox > pre.code, .chero__stage.stage-host, .chero__content (crumb, h1[data-intro], lead, actions))`.
180lvh section with a sticky screen (no pin). Entrance with or without WebGL: the characters of the code (DOM spans; whole
tokens on small screens) fly in from depth and land, the headline rises by words; lead + buttons are never hidden.
When it has settled (`bridge.code.settled`) the act `glyphs` takes over when WebGL is on: the scene measures every
character (`measureCode`) and the act lands one instanced glyph on each, adds the swarm and the pointer field, and
flies the code away with `bridge.code.leave` (scroll, reversible). css tier: the lines lift off as DOM elements.
The backdrop shader repeats the plate box (`--plate-top`, `--plate-h`) and the three layers of `.chero__scrim` —
change them together. `<Code lines>` renders any decorative code block (LTR, aria-hidden, tokens with `data-col`).

### code-forge — Software services (`views/software/Services.astro`)

`.forge > .forge__view (.forge__head (h2, .forge__ticks) + ul.forge__list > li.svc[data-fx] (.svc__text + .svc__fx > .win (.win__bar, .win__code > .win__run + pre.code, .win__out > .mock)))`.
One paused timeline per service, driven only by scroll: the code assembles from flying characters, a highlight walks
down its lines, and the result builds itself from the parts marked `data-pop · data-grow · data-from="x,y,rot" ·
data-dim · data-hide · data-stroke` (in DOM order, or at `data-t`); `{{bad|good}}` in a code line makes characters
that fly out and get replaced. Wide: CSS sticky screen (`.is-scrub`, height from `--n`), the services take turns
(opacity, never visibility); the first code assembles while the section arrives. Small: each window is scrubbed as
it crosses the screen. The timelines are built only when the section is near (one per frame): nothing at page load.
No JS: a list, every window finished.

### build-steps — Software "how we work" (`views/software/Process.astro`)

`.steps > .steps__media[data-depth] + .steps__scrim + .steps__content (.steps__head, .steps__route > .steps__line > .steps__fill + ol.steps__list > li.bstep (.bstep__node, num, name, text, code.bstep__call))`.
No pin. The line fills with scroll (horizontal on wide screens, growing from the reading side; vertical on small
ones); a step gets `.is-active` when the line reaches it and its decorative call types in once (ScrambleText, Latin).

### ask-box — Software closing box (`views/software/Missing.astro`)

Once in view: the box settles, its line of code types in (ScrambleText, Latin), the heading rises by words.

### legal-thread — Legal page, the 3D scales behind every section (`views/LegalPage.astro`)

`.legal.theme-dark > .legal__stage.stage-host[data-scene=legal-thread] + .legal__body > section[data-shot] × 7`.
The host is `position: sticky` for the whole page (the body starts with `margin-block-start: -100lvh`), so ONE act
(`justice`) draws behind every section. The scene only measures: which `[data-shot]` section the middle of the
screen is in and how far (`bridge.justice.shot` → camera), the dip of light at the cut into the colonnade (`veil`)
and whether the consult section has arrived (`final` → the last weight → perfect balance). All of it is a function
of the scroll position, so it reverses. Section order is fixed: hero · services · colonnade · why · how · faq · consult.
css tier (no WebGL) / no JS: `.scales-still` images (our render: `node scripts/render-scales-still.mjs`);
they fade out while `.legal__stage.is-drawing`. Text always sits on a DOM scrim, never on the bare canvas.

### legal-hero · legal-weights · legal-colonnade · legal-why · legal-how · legal-faq · legal-consult

- **legal-hero** (`views/legal/Hero.astro`): 170lvh, sticky screen. Nothing is hidden on load (the headline is the
  LCP on phones): its two lines settle with a transform; scroll lets the text leave while the camera orbits.
- **legal-weights** (`views/legal/Services.astro`): `.lsvc-sec > .lsvc__view (.lsvc__head (h2 + .lsvc__tray > button.lsvc__tick) + ul.lsvc__list > li.lsvc[data-fx] (.lsvc__fx > svg + .lsvc__text))`.
  Sticky screen on every screen size; the services take turns and `bridge.justice.count` says how many weights are
  on the pan; hover / focus on a tray button sets `justice.focus` (that weight drops early), click scrolls to it.
  Each `data-fx` (beam · gather · warm · sign · status · merge) has one paused timeline built in `moment()`.
  `path[data-engrave]` is also what the act engraves on that service's weight.
- **legal-colonnade** (`views/legal/Help.astro`): sticky screen; `bridge.justice.walk` walks the camera between the
  columns and each `.lhelp__item[data-side]` gets a beat from the side of its column (× `env.dir`).
- **legal-why**: heading by words, four reasons, the sealed file `.file[data-spotlight]` (covers open only inside the
  pointer's light through a CSS mask on `--mx / --my`; a slow CSS sweep on touch). **legal-how**: the `build-steps`
  line without the code calls. **legal-faq**: runs beside `accordion`; makes closed answers `inert` (they hold links).
  **legal-consult**: heading by words; the balance is the thread's work.

### events-thread — Events page, the theatre behind every section (`views/EventsPage.astro`)

`.gala.theme-dark > .gala__stage.stage-host[data-scene=events-thread] (.gala__still--curtain, .gala__still--hall) + .gala__body > section[data-shot] × 11`.
Same pattern as `legal-thread`: the host is sticky for the whole page and ONE act (`gala`) draws behind every section.
The thread writes `gala.shot` (section + progress → camera node), `open` (the hero's sticky progress draws the curtain),
`carpet` (unrolls ahead of the walk: services → expo → arrivals → down the aisle), `flashes`, `led` and `veil` (the dip
that hides the two camera cuts: hero → foyer, foyer → stage). Section order is fixed: hero · services · expo · arrivals ·
register · interpret · types · roof · how · faq · consult. css tier / no JS: two stills of our own render (closed curtain,
the hall: `node scripts/render-gala-still.mjs`), swapped by `.is-hall`, faded while `.is-drawing`.

### events-hero · events-program · events-expo · events-arrivals · events-badge · events-interpret · events-types · events-roof · events-how · events-faq · events-consult

- **events-hero** (`views/events/Hero.astro`): 270lvh sticky; title + lead centred in the follow spot ON the closed
  curtain, painted at once (LCP); the text leaves while the curtain opens; camera: seats → over the hall → to the stage.
- **events-program** (`Services.astro`): the ten cards in two walking columns; per card once: a light sweep, the gold rule,
  the icon draws. The cards themselves never move (the even column has a CSS offset).
- **events-expo** (`Expo.astro`): sticky (the view and the text are two sticky layers on wide screens; the text scrolls over
  the view on small ones). Progress → `gala.plan` then `gala.booths` (0…`GALA_BOOTHS`). Legend link hover / focus →
  `gala.booth`; the act raycasts the four labelled stands and calls `gala.onHover`. css tier: an SVG plan fills in.
- **events-arrivals** (`Arrivals.astro`): split-flap board (decorative). Latin: one tile per character (padded widths);
  Arabic: one tile per WHOLE word. Each flip = four clipped layers (static top / bottom, falling old top, rising new
  bottom). Boots once, then the status column flips by scroll stage (`data-states`); a running cell finishes before a new flip.
- **events-badge** (`Register.astro`): progress → `gala.badge`, `gala.scan`, `gala.seats` (seats stay lit afterwards).
  `.greg__pad` (touch-action: none, only over the badge) → `gala.grab` (host NDC). css tier: HTML badge, elastic swing.
- **events-interpret** (`Interpret.astro`): two beats in one sticky screen (opacity, `.is-active`): sound waves
  (`gala.waves`) + an SVG headset + a sentence that turns AR ↔ EN by whole words (loop only while on screen); then the LED sweep.
- **events-types** (`Types.astro`): staircase progress (a rest on each type) → `gala.turn` (0…7) turns the turntable; the
  DOM type at the front by opacity; `path[data-engrave]` is engraved on its medallion.
- **events-roof** (`Roof.astro`): wide: sticky, four corner labels (links) + `gala.beams` (the four beams meet on the stage);
  css tier: SVG lines draw instead. Small: a grid of labels, beams while the section passes.
- **events-how**: tickets (audiences) once + the `build-steps` line. **events-faq**: like `legal-faq`.
- **events-consult** (`Consult.astro`): sticky progress → `gala.final`: the spots converge, the curtain closes (0.1 → 0.9),
  applause flashes. The act multiplies the curtain's `open` by the finale, so scrolling back opens it again.

### services-sky — Services page, the night sky behind every section (`views/ServicesPage.astro`)

`.sky.theme-dark > .sky__stage.stage-host[data-scene=services-sky] (.sky__still--scatter, .sky__still--all, .sky__tip) + .sky__body (hero · directory · unite · ask) ` then the Home call.
Same pattern as `legal-thread`: the host is sticky for the whole page and ONE act (`sky`) draws behind every section.
The thread writes `sky.focus` (the visible area under the middle of the screen, or -1) and `sky.box` (the screen rect of
that area's `.area__sky` window, of `.unite__sky` in the finale, else the whole screen): the act flies the camera so that
constellation — or the whole sky — fits that box. So the layout decides where the stars go (RTL needs nothing; the
constellations never mirror). It also writes `night`, the pointer over `[data-sky-pad]` (the act reports the star under it:
a label, a click → `sky:pick` → its card), and on desktop adds a short star trail behind the plane cursor.
Stars are numbered like `src/data/services.ts` (`data-star` on the cards). css tier / no JS: `sky-scatter` (hero, the canvas
starts from exactly it), `sky-all` (css tier: behind the hero once the title settles and the finale; plain stars elsewhere) and one `sky-<area>` still per area window (alpha):
`node scripts/render-sky-still.mjs`.

### services-hero · services-directory · services-unite

- **services-hero** (`views/services/Hero.astro`): 165lvh sticky; the huge title and the §2 intro are painted at once (LCP),
  the title settles while the stars gather (the act's `uAssemble`, 3.6 s); scroll → text leaves, `sky.push`.
- **services-directory** (`Directory.astro`): the tab links become an ARIA tab list (roving tabindex, arrows follow the
  reading direction, automatic activation, `?area=` in and out via replaceState). A change is two steps: the leaving areas
  fade, then the layout changes, the page returns to the directory top and the staying cards fly with Flip while the
  arriving ones rise. The beam (`.tabs__beam`) is moved between tabs with Flip: the selected tab, or under «الكل» the area
  being read (scroll spy), whose colour the bar takes (`data-here`). Cards: pointer / focus → `sky.hot`. Legal chips: `--lit`
  in sequence on every entry. Event types: CSS double marquee (a hidden list carries the text for screen readers).
- **services-unite** (`Unite.astro`): 300lvh sticky; progress = `sky.unite`; each part of the sentence gets `.is-on` when
  its arc draws (`UNITE` in bridge.ts), the closing line when the ring closes. Heading by words once.

### paper — WaysZ Visa Home «رحلة الورق» (act `paper`, scenes paper-thread · paper-hero · paper-help · paper-services · paper-steps · paper-faq · paper-cta)

```html
<div class="paper theme-dark">
  <div class="paper__stage stage-host" data-scene="paper-thread" aria-hidden="true"></div>   <!-- ONE sticky host -->
  <div class="paper__body">                                                                  <!-- margin-top: -100lvh -->
    <section data-scene="paper-hero" data-shot>…</section>      <!-- 0 -->
    <section data-scene="paper-help" data-shot>…</section>      <!-- 1 -->
    <section data-scene="paper-services" data-shot>…</section>  <!-- 2 -->
  </div>
</div>
…
<section data-scene="paper-pocket">…</section> <section data-scene="paper-tabs">…</section>                <!-- §1.5b · §1.5c, DOM -->
<section data-scene="paper-finder">…</section> <section data-scene="paper-why">…</section>               <!-- §1.5d · §1.5e, DOM -->
<div class="hatlas theme-dark">                                                                              <!-- §1.6b → §1.6c -->
  <div class="hatlas__stage stage-host" data-scene="home-atlas" data-dest="DE,TR,US,AU,MY,DM,…" data-legs="0" data-mood="network"></div>
  <div class="hatlas__body"><section data-scene="home-destinations" data-shot="destinations">…</section>
    <section data-scene="paper-postcards" data-shot="audience">…</section></div>
</div>
<section class="pcta" data-scene="paper-cta"><div class="pcta__stage stage-host"></div>…</section>   <!-- finale host -->
```

- §1.6b reuses the visa template's act `atlas` through its contract only (`readAtlasConfig` + `createAtlasAct` +
  bridge `atlas`): `data-dest` lists one landmark country per region first (stop k = region k), then the rest; the
  tail shot `audience` runs 0 → 0.9 while the middle of the screen goes from the postcards' top to where the host
  leaves, so the act's own exit fade ends before any edge shows. The act builds on the visitor's first scroll pause
  (fallback: `top 160%` of the section) — never mid-scroll.

- `createPaperAct(host, 'journey' | 'finale')` — one act, two hosts; the stage hands the canvas to the most visible
  host. The finale act is built in idle time right after the stage boots (programs + atlas shared, nothing compiles
  mid-scroll).
- Bridge `paper`: `shot` (section + progress, from paper-thread → camera crane, cover angle, lay-down, first pop-up) ·
  `fix` 0…3 (§1.1) · `turn` 0…4 (0 = §1.1 spread, k = service k; fractions = page turn) · `act` 0…1 (the diorama's
  own motion during a rest) · `ribbon` 0…1 · `seal` (counter: the booklet bounces) · `side` · `compact` · `poster`.
- Budget (kept): planes only; cover hinge, page curl and every pop-up hinge / slide / swing / spin in the vertex
  shader; ONE merged geometry per diorama (shadows included); 480 instanced flakes in two meshes; ONE runtime canvas
  atlas 2048²; fake light; no shadow maps, render targets, MSAA, bloom, models or HDRI; one overlay quad for grain +
  vignette. Measured: 9–13 draw calls per frame, act chunk 16 KB gzip.
- No depth buffer: parts are ordered by `renderOrder` (night −10 · flakes behind −5 · edges 0 · pages / cover lying
  open 1 · turning page 2 · dioramas 3 · cover closed 4 · ribbon 5 · flakes in front 8 · finish 10), pieces inside a
  diorama by merge order (far → near, shadows first).
- A diorama is a list of `Piece`s (acts/paper.ts): drawing, hinge point on the spread, yaw, standing angle, offset
  in its own plane, rise / act windows, motion (`travel` · `swing` · `spin`) and fade (`in` · `out` · `glow`).
  New spread = new list + new drawings in the atlas; no new geometry code.
- RTL: the layout mirrors (hinge on the right, pages turn the other way, `x × side`), drawings never do.
- css tier / no JS: stills from `scripts/render-paper-still.mjs` (`?paper=hero|help|s1…s4|finale`).

### terminal — WaysZ Visa Services «مطار الضوء» (act `terminal`, scenes terminal-thread · terminal-hero · terminal-rests · terminal-info · terminal-faq · terminal-cta)

```html
<div class="term theme-dark">
  <div class="term__stage stage-host" data-scene="terminal-thread" aria-hidden="true"></div>   <!-- ONE sticky host -->
  <div class="term__body">                                                                   <!-- margin-top: -100lvh -->
    <section data-scene="terminal-hero" data-shot>…</section>                        <!-- 0 -->
    <section data-scene="terminal-rests" data-rests="counter" data-shot>…</section>  <!-- 1 §2.1 -->
    <section data-scene="terminal-rests" data-rests="gate" data-shot>…</section>     <!-- 2 §2.2 -->
    <section data-scene="terminal-info" data-shot>…</section>                        <!-- 3 «لست متأكدًا…» -->
  </div>
</div>
<section data-scene="accordion terminal-faq">…</section>                             <!-- no canvas -->
<section class="tcta" data-scene="terminal-cta"><div class="tcta__stage stage-host"></div>…</section>   <!-- finale host -->
```

- `createTerminalAct(host, 'journey' | 'finale')` — one act, two hosts (the paper pattern); the finale act is built in idle
  time right after the stage boots (same five programs, already compiled).
- Bridge `terminal`: `shot` (section + progress, from terminal-thread → the camera walk: outside → doors → counters → gates →
  the "i" desk) · `light` 0…1 (hero: doors open, the hall wakes) · `counter` 0…3 + `counterAct` 0…1 · `gate` 0…4 + `gateAct`
  0…1 (terminal-rests: a walk / sideways dolly then a REST per item, panels `.is-active` by opacity) · `takeoff` 0…1 (finale) ·
  `pointer` (mouse, a breath of the camera) · `side` · `compact` · `poster`.
- World (acts/terminal.ts): a `World` builder merges every line (`line`, `path`, `ring`, `box`, `arch…`), panel (`quad…`) and
  sprite (`dot`) into ONE geometry each. Per vertex: a light group (uGroup: hall, approach, counter k, gate k, world k, info,
  runway, plane — woken by the act from the camera position), a motion (uSlot: spin · travel · appear · flutter · drift ·
  checked-sheet · ribbon · wake · breathe) and a portal (world k is bright only where the camera sees it through arch k).
  A new counter / glimpse = a new builder function; no new geometry or shader code.
- Everything but the sky and the finish is ADDITIVE (order-independent on the depth-less canvas). No textures: sprite shapes
  (glow, flare, the "i", ring, window) are SDFs. Lines: screen-space ribbons, core clamped 1.4–3.4 CSS px + halo, clipped at
  the near plane. Measured: 6 draw calls (journey), 9 (finale), act chunk 14 KB gzip.
- RTL: the world mirrors (`x × side`), the plane is built facing the runway (never mirrored), sprites never flip, clock
  hands always turn clockwise.
- css tier / no JS: stills from `scripts/render-terminal-still.mjs` (`?terminal=hero|s1…s4|g1…g5|info|finale`).

### atlas — WaysZ Visa Service Details «خريطة الرحلة» (act `atlas`, scenes atlas-thread · atlas-hero · atlas-destinations · atlas-rise · atlas-steps · atlas-docs · atlas-cta)

```html
<div class="atlas theme-dark">
  <div class="atlas__stage stage-host" data-scene="atlas-thread" aria-hidden="true"
       data-dest="DE,FR,…" data-legs="0" data-mood="visit|study|work|residence|network"></div>   <!-- ONE sticky host -->
  <div class="atlas__body">                                                        <!-- margin-top: -100lvh -->
    <section data-scene="atlas-hero" data-shot="hero">…</section>
    <section data-scene="atlas-rise" data-rise="stage" data-shot="types">…</section>   <!-- optional -->
    <section data-scene="atlas-destinations" data-shot="destinations">…</section>      <!-- optional -->
    <section data-scene="atlas-rise" data-shot="benefits">…</section>                  <!-- optional -->
    <section data-scene="atlas-rise" data-shot="audience">…</section>
  </div>
</div>
<section data-scene="atlas-steps">…</section> <section data-scene="atlas-docs">…</section>
<section data-scene="accordion atlas-rise">…</section>                                 <!-- no canvas -->
<section class="acta" data-scene="atlas-cta"><div class="acta__stage stage-host" data-dest… ></div>…</section>   <!-- finale host -->
<section data-scene="atlas-rise">…</section>                                            <!-- «تابع رحلتك» -->
```

- `createAtlasAct(host, borders, config, 'journey' | 'finale')` — one act, two hosts. The WORLD (map, land mask, borders,
  the page's fills / outlines / routes / sprites) is built once per page and shared (reference-counted); the finale act is
  added in idle time after the stage boots. Config from the hosts' data attributes (`readAtlasConfig` in bridge.ts);
  services: every destination of brief §1.6b in the `network` mood.
- Bridge `atlas`: `shots` (names of the journey sections this page has — optional blocks skip their poses) · `shot`
  (index + progress, from atlas-thread) · `push` 0…1 (hero) · `stop` (destinations: 0…n−1, fractions = flying) ·
  `takeoff` 0…1 (finale) · `pointer` · `side` · `compact` · `poster` (`?atlas=hero|finale`).
- Camera poses: hero (globe on the free side, slow drift) · types (the planet rises behind the cards, veiled) ·
  destinations (slerp of the facing between countries, a step back on long hops / between legs, closer for small
  countries) · benefits (the whole map behind the grid, veiled) · audience (steps back, then fades to plain night as the
  host leaves). Finale: a frame built so Egypt sits on the near cap and the route to the first destination leaves the
  horizon on a curve away from the text; the horizon line is placed from the globe's projected radius.
- Moods: scene parameters only (sun side / strength, city lights, atmosphere, route height / speed, pulses, drift, stars).
- Measured: 10 draw calls (journey), 9 (network), 13 (finale). The routes are analytic: the sprite shader rides the same
  curve and the head of each route's own pulse. No depth buffer: everything over the sphere fades behind the horizon.
- Destinations DOM: chips are links (consultation prefilled with the category and the country), `.is-on` = the visited
  one (colour only, every name readable); the big name above the list is aria-hidden. A focused chip scrolls to its rest.
- css tier / no JS: stills from `scripts/render-atlas-still.mjs` (`atlas-<slug>(-m)` per category, `atlas-network(-m)`,
  `atlas-finale`). The wide stills are panoramas with the globe in the middle: `object-position` puts it on the free side
  in both directions (a map never mirrors).

### destinations (Motion Lab) — sticky cards that stack

Kept for the Motion Lab; Home uses `areas`.

### route-steps — Service template steps · About §4.4 (Home uses `globe-route`)

Existing contract (route path + `.route__plane` + `.step.is-active`). v2: optional map/photo background
behind the route; the plane may be a `<Lottie mode="loop">` inside `.route__plane`.

### boarding-gate (Motion Lab)

`.pass` + `path.pass__perf` + `.stamp`. Home uses `boarding-pass`.

### text-scrub · services-filter · accordion · form-flight

Unchanged (see Motion Lab).

---

## Page storyboard (waysz-visa.com)

Brief part 01 «ثانيًا: موقع WaysZ Visa» (structure) + part 04 (copy). Every row is TODO: fill Media + Motion when the
section is designed, then mark it BUILT. Reuse the scene contracts above (they were built for WaysZ; the view
paths they name live in the WaysZ repo) or add new scenes.

| Brief § | Section                                   | Media | Motion                                                        |
| ------- | ----------------------------------------- | ----- | ------------------------------------------------------------- |
| —       | Intro                                     | logo  | `preloader` (unchanged) — BUILT (kept from WaysZ)              |
| —       | Header                                    | —     | transparent over the hero, glass after 80px, mobile menu, «خدمات التأشيرات» submenu (two groups) — BUILT |
| 1       | Home · Hero (title, subtitle, 2 buttons + the alternative title) | act `paper`: closed booklet among paper flakes, foil mark · still `paper-hero(-m).webp` | `paper-thread` (one sticky host, hero → §1.5) · `paper-hero` (sticky 210lvh: words rise, text leaves, cover opens, booklet lies down, alternative title on the text side) — BUILT |
| 1.1     | Home · how we help                        | act `paper`: the first spread pops up, three problems fixed · still `paper-help.webp` | `paper-help` (sticky 260lvh → `paper.fix` 0…3, the three phrases underlined in turn) — BUILT |
| 1.2–1.5 | Home · the four services                  | act `paper`: a page turn (curl) per service onto its pop-up diorama · stills `paper-s1…s4.webp` | `paper-services` (sticky 560lvh, 4 rests → `paper.turn` / `paper.act`, panels by opacity) — BUILT |
| 1.5b    | Home · extra services (5 slips)           | — (DOM)                                                       | `paper-pocket`: the booklet's back pocket; wide: sticky 270lvh, the slips rise out and fan into an arc (scrubbed) · small: each slip comes out as it scrolls in — BUILT |
| 1.5c    | Home · «ما غرض رحلتك؟» (9 categories in 4 groups + «لست متأكدًا…» → /assessment/) | Pexels photos (`visa-*.jpg`, 9) | `paper-tabs`: the groups are a folder's index tabs (ARIA tabs), choosing one deals its cards — BUILT |
| 1.5d    | Home · «محتار تبدأ منين؟» (→ /assessment/) | — (DOM)                                                       | `paper-finder`: sample question cards flip through and settle on a suggested visa (plays when in view) — BUILT |
| 1.5e    | Home · «أكثر من تجهيز أوراق» (5 points)    | — (DOM, our own line icons)                                   | `paper-why`: rows of a perforated sheet, perforations run across + icons draw (scrubbed), heading CSS-sticky — BUILT |
| 1.6     | Home · help steps (4)                     | —     | `paper-steps`: the stitching becomes a sky-blue thread (DrawSVG, scrubbed), steps light — BUILT |
| 1.6b    | Home · «وجهات نرافقك إليها» (countries by region → /consultation/?destination=) | act `atlas` reused («network» world) in its own host `.hatlas__stage` · still `atlas-network(-m).webp` | `home-atlas` (thread: shots destinations → audience; built on the first scroll pause) · `home-destinations` (sticky, a rest per region → `atlas.stop`) — BUILT |
| 1.6c    | Home · «من تجارب عملائنا» (placeholders, `showTestimonials`) | act `atlas`: the Earth steps back and fades to night | `paper-postcards`: postcards land with a turn that settles (scrubbed) — BUILT |
| +       | Home · FAQ (8, brief v3 §19.1)            | —     | `accordion` + `paper-faq` — BUILT |
| 1.8     | Home · start-consultation CTA             | act `paper` (finale host): the booklet returns, ribbon slides out · still `paper-finale.webp` | `paper-cta`: the «ملف جاهز» seal (DOM) lands once, the booklet bounces — BUILT |
| 1.9     | Home · «جزء من WaysZ» (link to waysz.org) | WaysZ gate photo | `boarding-pass` reused, reversed (WaysZ Visa → WaysZ), amber via `[data-brand="main"]` — BUILT |
| —       | Footer                                    | logo  | `footer-landing` (runway + touchdown) — BUILT (kept from WaysZ) |
| 2       | Visa Services · intro (title + intro)     | act `terminal`: the floating airport of light, approach lights pulsing to the doors · still `terminal-hero(-m).webp` | `terminal-thread` (one sticky host, hero → «لست متأكدًا…») · `terminal-hero` (sticky 200lvh: words rise, text leaves, doors open, the camera glides in) — BUILT |
| 2.1     | Visa Services · the four services         | act `terminal`: four counters wake in turn (desk + stools · sheets through an arch · kiosk fields · clock + board + seat) · stills `terminal-s1…s4.webp` | `terminal-rests` (`data-rests=counter`, sticky 480lvh, 4 rests → `counter` / `counterAct`, panels by opacity) — BUILT |
| 2.2     | Visa Services · five categories + «لست متأكدًا…» | act `terminal`: sideways dolly along five gate arches, each a portal onto a glimpse (library · stage · city · two houses + ribbon · dawn balloons), then the "i" desk · stills `terminal-g1…g5 · info.webp` | `terminal-rests` (`data-rests=gate`, sticky 580lvh, 5 rests → `gate` / `gateAct`) · `terminal-info` — BUILT |
| +       | Visa Services · FAQ (4)                   | —     | `accordion` + `terminal-faq` (no canvas) — BUILT |
| 2.4     | Visa Services · request-consultation CTA  | act `terminal` (finale host): the end window, a plane of light rolls and lifts off · still `terminal-finale.webp` | `terminal-cta` (sticky 230lvh → `takeoff`; the call rises as the plane lifts; magnetic button) — BUILT |
| 3       | Visa detail template (brief v3 §6: hero · 2b types · 2c destinations · 2d benefits · audience · help · documents · FAQ · call) — 9 categories + 9 services, «خريطة الرحلة» | act `atlas`: the night Earth with the page's countries lit and routes from Egypt (categories: their group's mood · services: the «network» world of §1.6b); the finale horizon with a plane of light · stills `atlas-<slug>(-m)` · `atlas-network(-m)` · `atlas-finale` | `atlas-thread` (one sticky host, hero → audience) · `atlas-hero` (sticky 200lvh) · `atlas-rise` (types staged from depth · benefits icons draw · audience · FAQ · «تابع رحلتك») · `atlas-destinations` (sticky, a rest per country → `atlas.stop`) · `atlas-steps` (numbered route) · `atlas-docs` (checklist ticks + «ملف جاهز» seal) · `atlas-cta` (sticky 230lvh → `takeoff`) — BUILT |
| —       | About · intro · WaysZ & WaysZ Visa · why · how we work · CTA | TODO | TODO                                  |
| —       | Contact · intro · contact items · quick buttons · consultation card | TODO | TODO                            |
| 4       | Consultation · intro + form + §4.8 warning | TODO | TODO (`form-flight` is the toolkit's form scene)               |

Pins: Home may use 3 and uses 0 — the hero, §1.1 and §1.2–1.5 are CSS sticky + scrub. Other pages: max 2 (Visa Services and the
visa detail template use 0).
Home concept and budgets: `docs/home-creative-treatment.md` · Visa Services: `docs/visa-services-creative-treatment.md` · Visa detail
template: `docs/visa-detail-creative-treatment.md`.

## What to reuse on the next pages

| Need                                   | Take                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| Services: header photo per area tab    | the `wipe` act (pass the tab photos; set `bridge.areas.progress` from the tab index)   |
| Service template: steps                | `globe-route`'s HTML line + `.step.is-active` (without the globe) or `route-steps`     |
| About: opening                         | `media-reveal` as is (`.reveal__media`, `.reveal__text`, optional `.reason` items)     |
| About: values / "why" lists            | `iconTimeline` icons from `media-reveal.ts`                                            |
| Contact: header                        | `approach` (photo + words + magnetic buttons)                                          |
| A block of decorative code             | `views/software/Code.astro` + `splitChars` / `measureCode` in `motion/code-glyphs.ts`  |
| A result that builds itself on scroll  | the `data-pop / grow / from / dim / hide / stroke` parts of `code-forge` (`buildTimeline`) |
| A solid 3D model in the stage          | the render-target pattern of `acts/justice.ts` (`prepare` + `prerender`), its spring physics and camera nodes |
| A cloth / curtain in 3D                | `curtainVertex` in `shaders/gala.glsl.ts` (pleats + analytic normal + hem lag) — no CPU physics |
| Bloom without an extra pass            | the `gala` render target: `generateMipmaps` + `LinearMipmapLinearFilter`, `textureLod` taps in the finish shader |
| A grabbable 3D object on a rope        | the badge in `acts/gala.ts`: verlet rope in camera space + a hinged card, a DOM pad that sends the pointer through the bridge |
| A drawn moment that plays with scroll  | `moment()` in `legal-weights.ts` (one paused timeline per `data-fx`)                   |
| Any dark photo section                 | `data-depth-scene` + `data-depth` on the photo wrapper, scrim gradient, `.link-arrow`  |
