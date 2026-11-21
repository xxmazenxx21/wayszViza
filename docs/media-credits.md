# Media credits

One row per media file we ship. Raw downloads stay in `media-inbox/` (not in git).
Rules and recipes: `.claude/skills/waysz-media/SKILL.md`.

Authors marked "see source page" could not be read automatically (the source site blocks scripted
requests) — open the link once and replace the note with the contributor's name.

## Shipped

| File                                                        | Source URL                                                                           | Author                | License                | Downloaded | What we changed                                                                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------- | ---------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| public/media/lottie/plane.json                              | https://lottiefiles.com/free-animation/airplane-flying-RzvHIAffjc                    | see source page       | Lottie Simple License  | 2026-11-12 | none (Motion Lab example only — not used on a public page yet)                                      |
| public/media/img/earth-night.webp                          | https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/ — Black Marble 2016, 0.1° map | NASA Earth Observatory | Public domain          | 2026-11-13 | resized to 2048×1024, WebP: globe texture of §1.5 and the Immigration explore globe (every device). No NASA logo, no endorsement implied |
| public/media/geo/world-egy.topo.json · src/data/countries.json | https://www.naturalearthdata.com/downloads/10m-cultural-vectors/ — Admin 0 Countries, point of view: Egypt (`ne_10m_admin_0_countries_egy`, v5.1.1) | Natural Earth | Public domain | 2026-11-19 | merged by ISO code, Bir Tawil merged into Sudan, Israel merged into Palestine (client decision), areas without an ISO code dropped, simplified to 10%, islands under 900 km² dropped (each country keeps its two largest parts), TopoJSON — `scripts/build-borders.mjs` |
| public/media/img/dusk-env.hdr                               | https://polyhaven.com/a/belfast_sunset_puresky                                       | Dimitrios Savva (photography), Jarod Guest (sky edits), Greg Zaal (processing) | CC0 | 2026-11-17 | Legal page: the light of the 3D scales. 1k HDR download scaled to 256×128 (68 KB); the act turns it so its sun stands where the scene's sun does. Pure sky: no place, building or text in it |
| src/assets/media/visa-student.jpg                           | https://www.pexels.com/photo/empty-room-1370291/                                     | see source page       | Pexels License         | 2026-11-21 | Home «أنواع التأشيرات» (student): an empty grand reading room, no people; cropped to 2400×1800 → 2133×1600 (4:3). Book spines not readable at card size |
| src/assets/media/visa-business.jpg                          | https://www.pexels.com/photo/empty-conference-room-16859956/                         | see source page       | Pexels License         | 2026-11-21 | Home (business): an empty conference hall, no people, signs or brands; centre crop 2133×1600 |
| src/assets/media/visa-immigration.jpg                       | https://www.pexels.com/photo/apartment-building-at-night-10562341/                   | see source page       | Pexels License         | 2026-11-21 | Home (immigration & residence): lit windows of an apartment block at night, nothing identifiable; centre crop 2133×1600 |
| src/assets/media/visa-family.jpg                            | https://www.pexels.com/photo/a-silhouette-of-a-family-walking-while-holding-hands-9207532/ | Mikhail Nilov    | Pexels License         | 2026-11-21 | Home (family): a family in silhouette at sunset, no faces; crop 2133×1600 around the family |
| src/assets/media/visa-tourist.jpg                           | https://www.pexels.com/photo/photo-of-airplane-wing-above-the-clouds-1831265/        | Madison Inouye        | Pexels License         | 2026-11-21 | Home (tourist): a plain white wing above the clouds, no livery, logo or registration visible; crop 2133×1600 |
| src/assets/media/visa-gate.jpg                              | https://unsplash.com/photos/ltCNpYiJPRg                                              | Alex Alvarez          | Unsplash License       | 2026-11-13 | copied as is from the WaysZ repo (already checked and cropped there: a readable shop sign removed); Home §1.9 boarding pass background |
| public/media/img/paper-hero.webp · paper-hero-m.webp        | our own render of the closed booklet (act `paper`, `scripts/render-paper-still.mjs`, `?paper=hero`) | WaysZ Visa | — | 2026-11-21 | css tier / no JS of the Home hero: 1100×1100 beside the text on wide screens (14 KB), 780×1688 full screen on phones (8 KB) |
| public/media/img/paper-help.webp                            | our own render of the §1.1 spread, the three problems fixed (`?paper=help`)          | WaysZ Visa            | —                      | 2026-11-21 | css tier / no JS of Home §1.1: 1400×1000 (34 KB) |
| public/media/img/paper-s1 · s2 · s3 · s4 (.webp)            | our own renders of the four service dioramas (`?paper=s1…s4`)                        | WaysZ Visa            | —                      | 2026-11-21 | css tier / no JS of Home §1.2–1.5: 1200×900 each (26–29 KB), loaded lazily |
| public/media/img/paper-finale.webp                          | our own render of the closed booklet with its ribbon (`?paper=finale`)               | WaysZ Visa            | —                      | 2026-11-21 | css tier / no JS of Home §1.8: 1100×1100 (16 KB), loaded lazily |

Astro generates the responsive WebP files of `src/assets/media/*` at build time (`dist/_astro/`).

The first four rows are files the kept WaysZ toolkit uses (rows copied from the WaysZ credits log). The paper world of
the Home page (act `paper`) is drawn at runtime from our own vector drawings: it ships no image, model or texture file.
Unsplash now answers scripted downloads with a browser check, so new photos came from Pexels (direct CDN files).
