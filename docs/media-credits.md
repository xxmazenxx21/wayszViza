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

Astro generates the responsive WebP files of `src/assets/media/*` at build time (`dist/_astro/`).

The files above are the ones the kept WaysZ toolkit uses (Motion Lab Lottie, the globe / explore acts, the HDR light
of the 3D acts); rows copied from the WaysZ credits log.
