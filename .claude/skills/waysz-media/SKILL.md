---
name: waysz-media
description: How WaysZ Visa (same pipeline as WaysZ) finds, licenses, optimizes and ships photos, videos, image sequences and Lottie files — approved free sources, license rules, the shot list per section, ffmpeg recipes, file naming, size budgets, and the credits log. Use whenever adding, replacing, downloading, converting or compressing ANY image, video, frame sequence or Lottie animation.
---

# WaysZ Media Pipeline (WaysZ Visa)

**Creative freedom:** source your own photos, videos, 3D models, textures and animations whenever they make the
site more impressive (goal: a jaw-dropping, Awwwards-level experience on every page) — no need to ask first, and
the shot list in §4 is a starting point, not a limit. Only rule: the file comes from a source below (clear free
license) and gets a row in `docs/media-credits.md`.

## 1 · Approved sources (free, commercial use OK)

| Source                                                                                                     | Use for                               | Rules                                                                                                      |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| pexels.com (photos + videos)                                                                               | hero/background video, area photos    | no attribution needed; no identifiable people shown badly; no implied endorsement; not in logos/trademarks |
| mixkit.co (videos)                                                                                         | cinematic clips                       | ONLY clips marked "Free License" — never "Restricted License"                                              |
| pixabay.com (photos, PNGs, videos)                                                                         | transparent cloud PNGs, extra footage | free commercial use; same people/endorsement rules                                                         |
| lottiefiles.com (free animations)                                                                          | icons & small moments                 | free animations only (Lottie Simple License); download as "Lottie JSON"                                    |
| unsplash.com (photos)                                                                                      | area photos, wide shots               | Unsplash License; download the ORIGINAL or ≥ 2400px (the page preview is a small AVIF — not enough)        |
| polyhaven.com (HDRIs, textures, models)                                                                    | 3D lighting and materials             | CC0                                                                                                        |
| kenney.nl (models, UI)                                                                                     | simple 3D props                       | CC0                                                                                                        |
| NASA imagery (visibleearth.nasa.gov, images.nasa.gov)                                                      | Earth day / night "Black Marble" maps | public domain; no NASA logo, no implied endorsement                                                        |
| sketchfab.com (3D models)                                                                                  | aircraft or props                     | ONLY CC0 or CC-BY (credit CC-BY in the credits log); needs a login to download — ask the team lead         |
| Never: Google Images, Pinterest, YouTube rips, AI images of real people, anything without a clear license. |

## 2 · Content rules

- No airline liveries or logos on planes, no visible brands/logos on products or screens.
- No identifiable faces in hero roles or in a way that suggests they endorse WaysZ / WaysZ Visa (prefer hands, backs,
  silhouettes, wide shots).
- No recognizable national passport (seal, cover text, country), flags or country names: use generic travel
  shots (airplane window, terminal, a blank boarding pass, documents seen from far with no readable text).
  On WaysZ Visa this matters most: never a real passport, visa sticker, embassy building, flag or readable
  personal data, and nothing that suggests a link to an embassy or government body.
- Check EVERY file frame by frame before optimizing (contact sheet:
  `ffmpeg -i in.mp4 -vf "fps=1,scale=640:-2,tile=3x3" -frames:v 1 sheet.jpg`). Real airports mean real liveries.
  A problem file is cropped, graded, blurred or skipped — and the decision is written in the credits log.
- **Lottie quality rule:** ship a Lottie only if it matches the premium, cinematic look (thin, restrained, no
  cartoon fills, no text or place names inside it). Render it first and look at it; recolor to our tokens if that
  is enough, otherwise build the moment as inline SVG + GSAP (the WaysZ Home §1.3–1.7 does this for every icon and the stamp).
- Calm, premium, consistent grade: dusk / blue hour, deep navy, cool sky-blue highlights (matches the Visa palette:
  navy + sky accent — no amber cast).
- Footage must loop cleanly (or be trimmed to a clean loop) for background use.

## 3 · Folders & naming

```
media-inbox/                      raw downloads (gitignored) — keep original names + note the URL
public/media/video/<name>.mp4     + <name>.webm + <name>-poster.webp   (+ <name>-m.* mobile variant)
public/media/seq/<name>/frame_0001.webp …      (+ <name>-m/ lighter set for small screens)
public/media/img/<name>.webp      images that only JS loads (e.g. cloud layers of the css tier)
public/media/lottie/<name>.json
src/assets/media/<area>-<subject>.jpg   (Astro <Image> converts to webp/avif)
```

Names: lowercase, hyphens, English: `hero-sky`, `visa-consultation`, `visa-documents`, `visa-student`.

## 4 · Shot list (search terms) — download into media-inbox/

Generic travel and paperwork shots only (rules in §2: no passports, visa stickers, flags, embassy buildings or country /
city names; no readable personal data; faces never in hero roles). Slots follow the brief (part 04 of WaysZ Visa).

| Slot               | Type         | Search terms (Pexels / Mixkit / Unsplash)                                                      | Target           |
| ------------------ | ------------ | ---------------------------------------------------------------------------------------------- | ---------------- |
| hero-sky           | video 10–20s | "airplane window clouds blue sky", "flying above clouds morning", "airplane wing blue hour"     | 1080p, no livery |
| visa-consultation  | photo        | "consultation desk hands", "advisor meeting laptop hands", "notebook pen desk"                 | no faces         |
| visa-documents     | photo        | "documents folder desk", "paperwork checklist hands", "organized files binder"                 | no readable text |
| visa-application   | photo        | "filling form pen hands", "typing laptop form hands"                                           | no brand on screen |
| visa-appointment   | photo/video  | "modern waiting area", "calendar planning desk", "clock wall office"                           | wide             |
| visa-steps         | photo        | "road at dusk aerial", "runway lights dusk", "path to horizon"                                 | wide             |
| visa-student       | photo        | "university campus from behind", "library study tables", "students walking backs"              | no logos / crests |
| visa-business      | photo        | "conference hall empty", "business traveler airport from behind", "meeting room city view"     | no brands        |
| visa-immigration   | photo        | "city skyline blue hour", "apartment keys boxes", "residential street dusk"                    | no city landmarks |
| visa-family        | photo        | "family airport arrival silhouettes", "hug airport from behind"                                | silhouettes      |
| visa-tourist       | photo        | "suitcase by window", "travel backpack terminal", "departures board blurred"                   | nothing readable |
| main-site link     | photo        | "airport terminal window plane dusk"                                                           |                  |
| Lottie             | JSON         | "airplane", "paper plane", "document check", "calendar", "check mark"                          | small, simple    |

## 5 · Optimizing (ffmpeg — install once on Windows: `winget install Gyan.FFmpeg`)

```bash
# Background video (desktop) — no audio, 1920 wide, small, starts fast
ffmpeg -i media-inbox/in.mp4 -an -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/video/NAME.mp4
ffmpeg -i media-inbox/in.mp4 -an -vf "scale=1920:-2,fps=30" -c:v libvpx-vp9 -crf 36 -b:v 0 public/media/video/NAME.webm
# Mobile variant — 960 wide
ffmpeg -i media-inbox/in.mp4 -an -vf "scale=960:-2,fps=30" -c:v libx264 -crf 29 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/video/NAME-m.mp4
# Poster (first frame)
ffmpeg -i public/media/video/NAME.mp4 -frames:v 1 -vf "scale=1920:-2" -q:v 80 public/media/video/NAME-poster.webp
# Trim a clip (start at 3s, keep 12s)
ffmpeg -ss 3 -i media-inbox/in.mp4 -t 12 -c copy media-inbox/in-trim.mp4
# Image sequence: N frames spread over the whole clip (fps = N / duration), 1280 wide WebP
mkdir public/media/seq/NAME
ffmpeg -i media-inbox/in.mp4 -an -vf "fps=140/27,scale=1280:720" -frames:v 140 -c:v libwebp -quality 62 public/media/seq/NAME/frame_%04d.webp
# Mobile sequence set: half the frames, portrait crop around the focal point (phones show a narrow slice)
ffmpeg -i media-inbox/in.mp4 -an -vf "fps=70/27,scale=1600:900,crop=720:900:546:0" -frames:v 70 -c:v libwebp -quality 58 public/media/seq/NAME-m/frame_%04d.webp
# Slow a short clip to half speed with motion interpolation (hero: 7.8s → 15.6s)
ffmpeg -i in.mp4 -an -vf "minterpolate=fps=48:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,setpts=2*PTS,fps=24" -c:v libx264 -crf 12 slow.mp4
# Seamless loop: cross-fade the first 1.5s over the end (OFF = duration - 3)
ffmpeg -i slow.mp4 -filter_complex "[0]split[a][b];[a]trim=0:1.5,setpts=PTS-STARTPTS[head];[b]trim=1.5,setpts=PTS-STARTPTS[body];[body][head]xfade=transition=fade:duration=1.5:offset=OFF" -c:v libx264 -crf 12 loop.mp4
# Stabilize handheld footage (two passes), then crop in
ffmpeg -i in.mp4 -vf "vidstabdetect=shakiness=8:accuracy=12:result=tr.trf" -f null -
ffmpeg -i in.mp4 -vf "vidstabtransform=input=tr.trf:smoothing=40:zoom=22:optzoom=0,unsharp=5:5:0.5" -c:v libx264 -crf 14 stab.mp4
# Dusk grade (navy shadows, warm highlights) — tune per clip, then check a contact sheet
#   colorbalance=rs=-0.10:bs=0.16:rm=0.12:gm=-0.05:rh=0.30:bh=-0.26 , hue=h=-11:s=0.92 , curves=all='0/0 0.5/0.47 1/0.9'
# Cloud photo → transparent WebP layer (alpha from whiteness, feathered edges)
ffmpeg -i clouds.jpg -vf "scale=1100:-2,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)*0.95':a='255*clip((1-(b(X,Y)-r(X,Y))/55),0,1)*clip((r(X,Y)-120)/90,0,1)*clip(sin(PI*X/W)*2.2,0,1)*clip(sin(PI*Y/H)*2.2,0,1)'" -c:v libwebp -quality 40 public/media/img/cloud-1.webp
```

```bash
# Unsplash photo at 2400px (official download endpoint; the page preview is too small)
curl -L -o media-inbox/NAME/unsplash-<ID>-2400.jpg "https://unsplash.com/photos/<ID>/download?force=true&w=2400"
# Photo → src/assets/media: crop out problems, then grade toward the night look (tune per photo, check the result)
ffmpeg -i in.jpg -vf "crop=W:H:X:Y,curves=all='0/0 0.5/0.44 1/0.92',colorbalance=bs=0.06:rh=0.08:bh=-0.08" -q:v 3 src/assets/media/NAME.jpg
# Shift a coloured studio background to navy without touching warm subjects (legal-justice.jpg)
#   huesaturation=hue=28:saturation=0.1:intensity=-0.35:colors=c+b+g , curves=… , vignette=PI/3.4
# Night-Earth globe texture (NASA Black Marble, public domain) — desktop + lighter phone map
ffmpeg -i BlackMarble_2016_01deg.jpg -vf "scale=2048:1024:flags=lanczos" -c:v libwebp -quality 72 public/media/img/earth-night.webp
```

**Stills of our own 3D acts (css tier / no JS)** — when a page uses a 3D act, its css-tier version is a still of
that act rendered in OUR palette (sky accent on Visa — never reuse a WaysZ still, it is amber). The acts keep their
dev poster switches (`?globe=poster`, `?scales=poster`, `?gala=curtain|hall`, `?sky=…`); WaysZ's render scripts
(`scripts/render-*-still.mjs` in the WaysZ repo) show how to screenshot them. Re-render whenever the palette or the
act changes, convert to WebP (quality 80). The Home paper world has its own: `node scripts/render-paper-still.mjs`
(dev server running; writes `public/media/img/paper-*.webp`).

**Environment light for 3D** — a Poly Haven HDRI (CC0), 1k download, scaled small (reflections on rough metal need
no detail): `ffmpeg -i in_1k.hdr -vf "scale=256:128:flags=area" public/media/img/NAME.hdr` (≈ 70 KB, still HDR).

## 6 · Budgets (hard limits)

| Asset                                                                                       | Limit                                                             |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| background video desktop                                                                    | ≤ 3 MB (mp4) · ≤ 20s                                              |
| background video mobile                                                                     | ≤ 1.2 MB                                                          |
| image sequence                                                                              | ≤ 150 frames · each ≤ 60 KB · total ≤ 7 MB (loaded progressively) |
| image sequence, mobile set                                                                  | ≤ 75 frames · total ≤ 2 MB                                        |
| 3D model (glb, Draco)                                                                       | ≤ 600 KB · textures ≤ 2048px, ≤ 400 KB each                       |
| photo (source in src/assets)                                                                | ≤ 2400px wide; Astro outputs responsive webp/avif                 |
| Lottie JSON                                                                                 | ≤ 150 KB each                                                     |
| initial page load                                                                           | ≤ 4 MB desktop · ≤ 2 MB mobile (measure: `node scripts/qa-weight.mjs`) |
| If over budget: lower resolution/CRF/quality, shorten, or use fewer frames — in that order. |

## 7 · Credits log — `docs/media-credits.md`

Every shipped file gets one row (create the file if missing):

```markdown
| File                               | Source URL                     | Author | License        | Downloaded |
| ---------------------------------- | ------------------------------ | ------ | -------------- | ---------- |
| public/media/video/hero-clouds.mp4 | https://www.pexels.com/video/… | Name   | Pexels License | 2026-11-08 |
```
