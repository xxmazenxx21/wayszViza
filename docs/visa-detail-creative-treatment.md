# Visa Service Details — creative treatment: «خريطة الرحلة» / "The Route Map"

## The idea

Every visa is a route: from where you are to where you want to be. So the one template behind the 18 visa pages is a
map of that route, drawn in light on the night Earth. The globe of Home §1.5 / the explore act turns slowly in the
dark; the page's own destination countries glow in the Visa blue (`--color-accent`) and light routes rise one after
another from Egypt (the client's home market) to each of them, with small lights travelling along them. Scrolling to
«وجهات نعمل عليها» turns the page into a flight: the camera flies from country to country in the list's order and
rests on each one while its name lights up in the list beside it — the destinations are the hero of the page. Service
pages (which have no destinations of their own) live in the same world in a calmer «network» mode: soft routes to every
destination of brief §1.6b, travelling lights, no country singled out — so all 18 pages share one Earth. Each group of
categories has its own mood through the scene's parameters only (visit: a calm dusk · study: dawn light from above ·
work: the night shift, bright cities and busy routes · residence: a long settled dusk, high slow routes). At the end the
Earth becomes a horizon: a plane of light climbs from the Nile delta along a high route over the limb toward the page's
first destination while the call rises — the take-off. Calm, precise, premium; nothing cartoonish, no words in 3D, no
"approved" imagery (the only seal is «ملف جاهز», on the documents: we prepare files, the embassy decides).

## Rules this template keeps

- The content is the JSON of `src/content/visas/<slug>.json` exactly as it is, in the order of brief v3 §6: hero
  (name + description) → 2b types → 2c destinations → 2d benefits → «لمن تناسب؟» → «كيف نساعد؟» → documents + note →
  FAQ → the call. Optional blocks do not render when a page has no data (no empty gaps; the 3D camera simply skips their
  poses — the thread hands the act the NAMES of the sections that exist).
- Every word is DOM over a scrim. Country names come from `src/lib/countries.ts` (Intl + the brief's overrides). Each
  country is a link: `/consultation/?type=<slug>&destination=<ISO>`; every call: `?type=<slug>` (services: `?service=`).
- Same scene for every visitor (quality policy). Phones get a portrait framing (the globe in the upper part, a wider
  view), never less.
- css tier (no WebGL2 / context lost) and no JS: our own stills of the globe (`scripts/render-atlas-still.mjs`): one per
  category (its countries lit, its mood), one for the services, one for the finale. Every GSAP scene still runs.
- RTL: the layout mirrors (the globe sits on the free side, `x × side` in the framing, the finale's route leans away
  from the text); the map itself NEVER mirrors (the wide stills are panoramas with the globe in the middle;
  `object-position` puts it on the free side in both directions).

## Storyboard

Hosts: ONE sticky stage host (`.atlas__stage`) behind hero → types → destinations → benefits → «لمن تناسب؟» (the
paper / terminal pattern: `scenes/atlas-thread.ts` measures the `[data-shot]` sections → `bridge.atlas.shots` + `shot`).
The help route, the documents, the FAQ and «تابع رحلتك» have no canvas (the host has scrolled away: the stage stops
drawing; the globe fades to plain night before its host leaves, so no edge shows). The call has its own host
(`.acta__stage`); the stage hands the one canvas to whichever host is most visible.

| § | Section | DOM | 3D (act `atlas`) | Motion | css tier / no JS |
| --- | --- | --- | --- | --- | --- |
| 1–2 | Hero: breadcrumb → /visa-services/, group, name, description, «ابدأ استشارتك» + a link to the page's signature block, «16 وجهة» | h1 words rise (data-intro on the h1 only); the description is the LCP, never hidden | the night globe turns slowly on the free side; the routes are drawn from Egypt one after another (0.085 s apart, 1.6 s each), each country lights when its route lands; then two lights travel each route | `atlas-hero` (sticky 200lvh: text leaves, the camera leans in → `atlas.push`) | `atlas-<slug>.webp` (panorama, full screen) / `-m.webp` (tall, full screen behind the text) |
| 2b | «أنواع شائعة» (optional): large frosted cards | cards; titles where the JSON has them; no numbers (not a sequence) | the planet rises behind the cards like a horizon, veiled for reading | `atlas-rise` `data-rise="stage"`: each card comes out of depth a little later than the one before (scrubbed, reversible) | same cards |
| 2c | «وجهات نعمل عليها» (optional) — THE signature | the list (one or two labelled legs) as links; the visited name large above it (aria-hidden) | the camera flies country to country in the list's order (slerp of the facing, a step back on long hops and between legs, closer for small countries) and rests; the visited country's fill, outline, mark and route brighten | `atlas-destinations` (sticky, (n + 0.5) × 30lvh (24lvh on phones) → `atlas.stop`; names `.is-on`; a focused link scrolls to its rest) | the page's still behind; the names still light in turn |
| 2d | «مزايا شائعة» (optional) | a calm grid, our own drawn icons (inline SVG) | the whole map, every destination lit, veiled behind the grid | `atlas-rise` (heading words, items, icons draw with DrawSVG) | same |
| 3 | «لمن تناسب؟» | three large lines, each marked like a point on the map | the map steps back on the free side; it fades to plain night as the host leaves | `atlas-rise` | same |
| 4 | «كيف نساعد؟» — they ARE a sequence | a numbered route (ol) | — | `atlas-steps`: the line fills with the scroll (clip-path), a point of light rides its head, each number lights when it arrives; the heading stays beside it (CSS sticky) | whole route lit |
| 5 | Documents + the note | a checklist on a light sheet (theme-light island) | — | `atlas-docs`: items tick themselves off with the scroll (reversible); when the list ends the «ملف جاهز» seal lands ONCE and the sheet gives under it | every item ticked, seal shown |
| 6 | FAQ (the page's own) | accordion | — | `accordion` + `atlas-rise` (closed answers `inert`) | all answers open |
| 7 | The call (the page's own title, text and button) | text + magnetic button | the limb of the Earth as a horizon; Egypt on the near cap, the page's routes arcing over the limb; a plane of light climbs from the Nile delta along a high route toward the first destination and fades over the horizon | `atlas-cta` (sticky 230lvh → `atlas.takeoff`; the call rises as the plane leaves the ground) | `atlas-finale.webp` |
| + | «تابع رحلتك» | category pages: 3 related services of the group; every page: previous / next inside its kind (cyclic; categories show their group) | — | `atlas-rise` | same |
| — | Footer | | | `footer-landing` | |

Pins: none. Every held screen is CSS sticky + a scrubbed ScrollTrigger (hero, destinations, the call).

Related services per group (VisaDetailPage.astro): visit → travel bookings · appointment booking · refusal review ·
study → document readiness · translation & attestation · appointment & interview preparation · work → translation &
attestation · application & cover letter guidance · appointment & interview preparation · residence → visa consultation
& file assessment · translation & attestation · document readiness.

## The act `atlas` (one act, two hosts)

- `createAtlasAct(host, borders, config, 'journey' | 'finale')` in `src/motion/stage/acts/atlas.ts`, shaders in
  `shaders/atlas.glsl.ts` (+ the explore border lines and the globe trail shaders, reused). The page's world comes from
  the hosts' data attributes (`data-dest`, `data-legs`, `data-mood`, read by `readAtlasConfig` in `bridge.ts`). Scenes
  talk to it only through `bridge.atlas`; they never import three.
- The WORLD is built once per page and shared by both hosts (reference-counted): the earth map (NASA Black Marble, the
  same file as Home §1.5), the land mask painted from the Natural Earth borders (Egypt's point of view — the client's
  rule on Palestine holds, see reference.md «explore-globe»), every border line, the page's country fills + outlines
  (one merged geometry each, `aIndex` per vertex), every route (tubes merged into one core + one glow geometry, `aArc`
  per vertex), and ONE instanced sprite geometry (marks, Egypt's ripple, the travelling lights). Built in steps
  (a `setTimeout(0)` between them) so no frame runs long; the finale act is added in idle time.
- The routes are analytic (slerp + a lift): the sprite shader places the travelling lights on exactly the same curve and
  at exactly the head of the route's own light pulse (shared `runOf()` in the shader chunk).
- No depth buffer on the shared canvas: draw order is `renderOrder`; everything over the sphere fades by itself behind
  the horizon (routes, marks, lights, the finale's plane).
- Moods (scene parameters only, never a colour outside the tokens): sun side and strength (dusk on the limb), city
  lights, atmosphere gain, route height and speed, pulse strength, idle drift, stars.
- Camera: one pose per journey section (facing lon / lat, zoom, framing offset, veil), eased toward the goal (a crane,
  never a cut). The framing uses the camera's view offset: the globe on the free side of wide screens (× side), in the
  upper part of tall ones.
- Finish: one full-screen overlay quad (grain + vignette), faded with the exit so the host leaves on plain night.

## Budgets (measured in the PR report)

| Item | Budget |
| --- | --- |
| draw calls per frame | ≤ 40 (design: 10 journey · 9 network · 13 finale) |
| act chunk (atlas.ts + its shaders, gzip, three excluded) | ≤ 40 KB |
| textures | the shared earth map (2048 × 1024 WebP, 63 KB) + one runtime land-mask canvas, both mipmapped (minified onto a disc of a few hundred px: without mipmaps the desktop frame doubled under CPU 4×); no other download |
| geo data | the borders TopoJSON (`world-egy.topo.json`, 108 KB gzip), loaded after the first interaction with the act |
| models / HDRI / render targets / bloom | none |
| shaders | 8 programs (earth · halo · borders · country fill · country line · routes · sprites · finish) + the trail / plane in the finale; compiled with `compileAsync` when the act registers |
| stars | 800 points |
| initial page weight | ≤ 4 MB desktop · ≤ 2 MB mobile (the act, three.js, the map and the borders load only after the first interaction) |
| Lighthouse mobile | Performance ≥ 75 · Accessibility ≥ 95 · SEO ≥ 95 · LCP ≤ 2.5 s |
