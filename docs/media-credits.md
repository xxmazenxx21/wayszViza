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
| src/assets/media/visa-work.jpg                              | https://www.pexels.com/photo/illuminated-windows-of-an-office-building-in-city-14711250/ | see source page       | Pexels License         | 2026-11-28 | Home §1.5c (work visa): lit office windows at night, no people, signs or brands; crop 2400×1800 → 2133×1600 (4:3), slight darkening |
| src/assets/media/visa-job-seeker.jpg                        | https://www.pexels.com/photo/faceless-businessman-crossing-street-in-city-5647226/   | see source page       | Pexels License         | 2026-11-28 | Home §1.5c (job seeker visa): a man with a bag crossing a zebra crossing, cropped at the shoulders (no face), no readable signs; crop 2133×1600, graded toward the night look, desaturated |
| src/assets/media/visa-investor.jpg                          | https://www.pexels.com/photo/a-view-of-tall-buildings-from-the-ground-28035054/      | ST0KES                | Pexels License         | 2026-11-28 | Home §1.5c (investor visa): glass towers seen from the ground against a clear sky, no logos or signs; centre crop 2133×1600, graded. (Rejected: two skylines with bank logos, a street with readable signs) |
| src/assets/media/visa-investment.jpg                        | https://www.pexels.com/photo/aerial-photography-of-a-beautiful-villa-near-blue-water-of-the-sea-9482140/ | see source page | Pexels License | 2026-11-28 | Home §1.5c (residency & citizenship by investment): an aerial view of a sea villa with a pool, no people identifiable, no brands; crop 2133×1600, graded |
| src/assets/media/visa-gate.jpg                              | https://unsplash.com/photos/ltCNpYiJPRg                                              | Alex Alvarez          | Unsplash License       | 2026-11-13 | copied as is from the WaysZ repo (already checked and cropped there: a readable shop sign removed); Home §1.9 boarding pass background |
| public/media/img/paper-hero.webp · paper-hero-m.webp        | our own render of the closed booklet (act `paper`, `scripts/render-paper-still.mjs`, `?paper=hero`) | WaysZ Visa | — | 2026-11-21 | css tier / no JS of the Home hero: 1100×1100 beside the text on wide screens (14 KB), 780×1688 full screen on phones (8 KB) |
| public/media/img/paper-help.webp                            | our own render of the §1.1 spread, the three problems fixed (`?paper=help`)          | WaysZ Visa            | —                      | 2026-11-21 | css tier / no JS of Home §1.1: 1400×1000 (34 KB) |
| public/media/img/paper-s1 · s2 · s3 · s4 (.webp)            | our own renders of the four service dioramas (`?paper=s1…s4`)                        | WaysZ Visa            | —                      | 2026-11-21 | css tier / no JS of Home §1.2–1.5: 1200×900 each (26–29 KB), loaded lazily |
| public/media/video/airport-approach.mp4 · -hd.mp4 · -m.mp4 · -poster(-hd/-m).webp | https://www.pexels.com/video/aerial-view-of-modern-airport-terminal-at-dusk-33185166/ | K (@kelly) | Pexels License | 2026-11-28 | Visa Services hero «رحلة في المطار»: a drone approach over a terminal at dusk, 2560×1440 source. First 10 s, 20 fps; a light contrast / saturation match only, no crop on desktop; phones: an 816×1440 portrait crop at native resolution. Checked 1:1: no readable logo, word or face (aircraft and vehicles too small to read). |
| public/media/video/airport-corridor.mp4 · -hd.mp4 · -m.mp4 · -poster(-hd/-m).webp | https://www.pexels.com/video/heathrow-14-27584208/ | Martyn Day | Pexels License | 2026-11-28 | Visa Services §2.1: a travelator corridor lit in blue, 2560×1440 source. 0.3–10.8 s, 20 fps, a very light temporal denoise (low-light sensor noise), no blur, no tint. Travellers are passers-by seen mostly from behind or at a distance (no hero roles); no ads or logos in frame. Phones: portrait crop on the vanishing point. |
| public/media/video/airport-gates.mp4 · -hd.mp4 · -m.mp4 · -poster(-hd/-m).webp | https://www.pexels.com/video/modern-interior-of-bangkok-suvarnabhumi-airport-34758164/ | Emrul Kausar Emon | Pexels License | 2026-11-28 | Visa Services §2.2: the moving walkway through a glass concourse, 2560×1440 source. Starts at 2.5 s (skips a close face). LOCAL blurs only, tracked per frame: the gate sign with the airport operator's logo, four advertising screens, two small brand / direction signs and a safety sticker on the glass; the rest of the frame is untouched. A slight exposure match. |
| public/media/video/airport-takeoff.mp4 · -hd.mp4 · -m.mp4 · -poster(-hd/-m).webp | https://www.pexels.com/video/airplane-takeoff-at-sunset-from-busy-airport-41195794/ | Rafael Minguet Delgado | Pexels License | 2026-11-28 | Visa Services §2.4: a plane rolls and lifts off at sunset, 2560×1440 source. 21.4–31.4 s. LOCAL blur only, tracked per frame: a parked / taxiing plane whose airline name is readable. The departing plane is head-on and backlit (no livery readable). Natural colours (a 4 % saturation match). The window mullions are drawn by our shader / CSS. |
| public/media/img/paper-finale.webp                          | our own render of the closed booklet with its ribbon (`?paper=finale`)               | WaysZ Visa            | —                      | 2026-11-21 | css tier / no JS of Home §1.8: 1100×1100 (16 KB), loaded lazily |
| public/media/img/atlas-<slug>.webp · atlas-<slug>-m.webp (9 categories) | our own renders of the night globe with each category's destinations and routes (act `atlas`, `scripts/render-atlas-still.mjs`, `?atlas=hero`) | WaysZ Visa | — | 2026-11-28 | css tier / no JS of the visa detail hero (and behind the destinations list): 2400×1000 panorama (globe in the middle) + 780×1688 phone |
| public/media/img/atlas-network.webp · atlas-network-m.webp | our own render of the «network» globe of the service pages (`?atlas=hero` on a service page) | WaysZ Visa | — | 2026-11-28 | css tier / no JS of the nine service pages |
| public/media/img/atlas-finale.webp                          | our own render of the horizon and the take-off (`?atlas=finale`)                       | WaysZ Visa            | —                      | 2026-11-28 | css tier / no JS of the call on every visa detail page: 1600×1000 |

Astro generates the responsive WebP files of `src/assets/media/*` at build time (`dist/_astro/`).

The first four rows are files the kept WaysZ toolkit uses (rows copied from the WaysZ credits log). The paper world of
the Home page (act `paper`) is drawn at runtime from our own vector drawings: it ships no image, model or texture file. The route map of the visa detail
template (act `atlas`) reuses the two files of the first rows (the night Earth and the Natural Earth borders): no new
download.
Unsplash now answers scripted downloads with a browser check, so new photos came from Pexels (direct CDN files).

## Checked and NOT shipped (Visa Services «رحلة في المطار», 2026-11-28)

Every clip was checked on a contact sheet before use (waysz-media §2). Skipped:

| Source | Why |
| ------ | --- |
| https://mixkit.co/free-stock-video/people-walking-down-an-airport-corridor-in-fast-motion-4008/ (Free License) | readable direction signs (gate letter, "Pont Aeri"), heavy posterised filter in the source |
| https://mixkit.co/free-stock-video/airplane-arriving-at-air-terminal-4095/ (Free License) | a bank logo on the jet bridge and an airline livery |
| https://mixkit.co/free-stock-video/plane-arriving-to-an-airport-terminal-4367/ (Free License) | an all-over airline livery, flat daylight |
| https://mixkit.co/free-stock-video/airplane-taking-off-2626/ · …/airplane-in-flight-seen-near-a-road-2631/ (Free License) | no usable airport in frame |
| Most other Mixkit airport clips | "Restricted License" — not allowed; Mixkit then answered scripted page reads with a browser check, so no more pages were read |
| https://www.pexels.com/video/modern-airport-terminal-with-busy-travelers-40793649/ | readable gate signs, advertising screens, faces |
| https://www.pexels.com/video/video-of-people-going-inside-the-airport-4241615/ | an airport brand on the doors and readable "Airline check in" signs |
| https://www.pexels.com/video/spacious-suvarnabhumi-airport-interior-4k-34758162/ | a bank logo and gate signs, static camera |
| https://www.pexels.com/video/a-sunset-view-of-an-airport-terminal-with-an-airplane-16590077/ | an airline tail logo |
| https://www.pexels.com/video/a-view-of-an-airport-from-inside-a-glass-building-27683669/ | fine, but daylight and not needed (the finale window is drawn by the shader) |
| https://www.pexels.com/video/night-traffic-outside-modern-airport-terminal-41172602/ (shipped in the first version) | replaced: at full resolution, readable number plates, car badges and a lit hotel-name tower in the lower third — too many to blur locally |
| https://www.pexels.com/video/modern-airport-check-in-area-with-travelers-41128393/ (shipped in the first version) | replaced: airline, ground-handler and shop logos all over the frame (the first version blurred the whole frame — no longer allowed) |
| https://mixkit.co/free-stock-video/rolling-corridor-at-an-airport-4642/ (shipped in the first version) | replaced: soft (shot out of focus) and 1080p only |
| https://www.pexels.com/video/airplane-takeoff-at-sunset-with-scenic-mountains-32487761/ (shipped in the first version) | replaced: portrait 1440 wide (a desktop crop would be upscaled) and an airline tail logo in its first seconds |
| https://www.pexels.com/video/commercial-airplane-taking-off-at-sunset-36275653/ | readable airline tail logo |
| https://www.pexels.com/video/walking-in-corridor-of-airport-terminal-13949726/ | advertising everywhere on the travelator walls and screens |
| https://www.pexels.com/video/manchester-airport-terminal-sunrise-view-31256081/ · …-31256900/ · …/cork-airport-entrance-scenic-view-in-daylight-31255514/ · …/passengers-with-luggage-at-airport-terminal-entrance-30040092/ | airport names / a giant ad screen / readable shop and terminal branding |
| https://www.pexels.com/video/aiport-terminal-at-night-11271114/ | a readable airline livery |
| https://www.pexels.com/video/suvarnabhumi-airport-terminal-interior-view-34758151/ | fine, but a static window view: not needed |

Pexels and Pixabay pages answer scripted requests with HTTP 403; the Pexels pages were read with a normal page reader and
the files downloaded from the Pexels file CDN links printed on those pages.
