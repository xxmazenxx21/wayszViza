# WaysZ Visa — waiting for the client

ONE list of everything the client still has to send or confirm before the site moves from the staging preview to
waysz-visa.com (brief v3 §18). Every item points to the ONE place to change. Until then each value is a realistic
placeholder marked `TODO(client)` in the code (search for it), so the staging site looks finished.
Line numbers are as of 28 November 2026.

## 1 · Contact data of the new entity (brief v3 §14, §19.4 — §18.1)
All contact data lives ONLY in `src/lib/site.ts`; Header, Footer, Contact, WhatsApp button and the legal pages read it.
An empty value is simply not shown.

| What | File : line | Now (placeholder) |
| --- | --- | --- |
| Public email (also the privacy / terms contact) | `src/lib/site.ts:14` | `info@waysz-visa.com` |
| Phone | `src/lib/site.ts:15` | `+20 2 0000 0000` |
| Hotline (only if there is one) | `src/lib/site.ts:16` | empty → hidden |
| WhatsApp (digits with country code) | `src/lib/site.ts:17` | `201000000000` |
| Address (AR + EN) | `src/lib/site.ts:18` | Cairo, Egypt |
| Working hours (AR + EN) | `src/lib/site.ts:19` | Saturday to Thursday, 10 am – 6 pm |

## 2 · Branches (§14 ❓, §12 ❓)
- [ ] The real branches: name, address, Google Maps link, hours (AR + EN) — `src/lib/site.ts:22` (`branches`, one sample now).
- [ ] When the list exists: add the «الفرع المفضل» field to the consultation form — `src/views/ConsultationPage.astro:15`.

## 3 · Social media (§14 ❓)
- [ ] Real links for Facebook · Instagram · LinkedIn · YouTube · TikTok — `src/lib/site.ts:39–45` (`'#'` now).
      Remove a network by deleting its line; the order there is the display order.

## 4 · Testimonials (Home §1.6c ❓ — §18.7)
- [ ] Real testimonials (first name + initial, city, visa type, one line, AR + EN) — `src/data/testimonials.ts:16`
      (three placeholders now: Sara M. · Ahmed A. · Karim S.).
- [ ] Or hide the section: `showTestimonials = false` — `src/data/testimonials.ts:7` (now `true`).

## 5 · Numbers, certificates and licenses (About «الأرقام والشهادات» — §13 ❓, §18.7)
- [ ] Years of experience — `src/data/about.ts:17` (now 12+).
- [ ] Files guided — `src/data/about.ts:18` (now 3,500+).
- [ ] Certificates / licenses — `src/data/about.ts:22–35`: the authorized-agent programs and license numbers (line 24),
      ISO 9001 only if the new entity holds it (line 28), commercial / tax registration numbers (line 32).
- [ ] Or hide the block: `showStats = false` — `src/data/about.ts:13` (now `true`).
- The two other counters are real and need nothing: 27 destinations (§1.6b) and 9 visa types.
- [ ] Partner logos (if any) — not on the site yet; send them and we add a row.

## 6 · Destinations review (§1.6b, §7b — §18.2)
- [ ] Home «وجهات نرافقك إليها» + the consultation form's first group — `src/data/destinations.ts:11` (`regions`).
- [ ] Each visa type's destinations — `"destinations"` in `src/content/visas/<slug>.json` (AR + EN blocks), e.g.
      `src/content/visas/business-visa.json:9` and `:47` (business destinations were OUR suggestion — §7b ❓).
- Countries from the old site that could be added easily: Ukraine, Russia, Poland, Slovakia, Lithuania, Norway.

## 7 · New services to confirm (§3 ❓ — §18.3, §18.5)
- [ ] Which of these you really offer: appointment booking (`src/content/visas/appointment-booking.json`) ·
      flight / hotel / insurance bookings — with which partners? (`travel-bookings.json`) · certified translation &
      attestation — through the WaysZ team? which languages? (`translation-attestation.json`) · corporate & delegation
      visas (`corporate-visas.json`) · refusal review (`refusal-review.json`) · university admission support
      (`student-visa.json`). A service you don't offer: delete its JSON file — every list and link follows.
- [ ] Optional services to add? CV & job search abroad · language test preparation · premium / concierge service ·
      pre-departure orientation (brief v3 §3, suggested — not built).
- [ ] Is the first consultation free or paid? (button wording, §18.6 — today the buttons say «اطلب استشارة» /
      «ابدأ استشارتك» without a price.)

## 8 · Investment programs (§9.4 — §18.4)
- [ ] The exact programs you are licensed for (+ license numbers) — `src/content/visas/investment-residency-citizenship.json`
      (AR: types line 9, destinations line 14 · EN: types line 63, destinations line 68) and `src/data/about.ts:24`.
- [ ] Program brochures (PDF) if you want a download button — not built yet.

## 9 · Legal texts (§15, §19.6, §19.7 ❓ — §18.8)
The two pages are DRAFTS for your lawyer. Their placeholders come from `src/lib/site.ts`:
- [ ] [اسم الكيان] legal name of the new entity — `src/lib/site.ts:33` (now «شركة WaysZ للخدمات الاستشارية»).
- [ ] [التاريخ] date of the approved texts — `src/lib/site.ts:34` (now 2026-11-28).
- [ ] [الدولة] governing law — `src/lib/site.ts:35` (now Egypt).
- [ ] [البريد] = the public email above (`src/lib/site.ts:14`).
- [ ] The approved wording itself — `src/views/PrivacyPage.astro` (§19.6) and `src/views/TermsPage.astro` (§19.7).

## 10 · Form destination (§18.1)
- [ ] The mailbox that receives consultation requests, and the team's choice of a sending service. Then set
      `PUBLIC_FORM_ENDPOINT` in the hosting environment — `src/lib/forms.ts:36` (`TODO(endpoint)`, line 40).
      Until then the form is SIMULATED: it shows the success state but sends nothing.

## 11 · Logo and colours (§18.9)
- [ ] Final logo → replace `src/assets/logo/waysz-mark.svg` (keep the class names `.mark-wing-left`, `.mark-wing-right`,
      `.mark-plane`, `.mark-road`), then re-measure `LOGO` in `src/motion/config.ts:7`. Same edit in the WaysZ repo.
- [ ] Final colours → change LAYER 1 only in `src/styles/tokens.css:13` (identical file in the WaysZ repo); the Visa
      look is the `[data-site="visa"]` block in the same file.
- [ ] Social preview image `public/og-image.jpg` uses the temporary logo — re-render it with the final one.
- [ ] Review of the English terms used across the site (pending from v2).
