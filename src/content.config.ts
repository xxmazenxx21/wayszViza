/**
 * Content collections. One JSON file per visa category OR service in src/content/visas/<slug>.json
 * (brief v3 §2, §3, §6: «قالب واحد لكل خدمة أو فئة تأشيرة»). `kind` says which group it belongs to (header submenu,
 * footer, Visa Services page): 'category' = the nine visa types of §2 · 'service' = the nine services of §3.
 * `order` = order inside its kind (§2: 1–9 · §3: 1–9). Categories also carry `group` (the four groups of §2).
 * The file name is the slug: student-visa.json → /visa-services/student-visa/ and /en/visa-services/student-visa/
 * Shape = the Visa Service Details Template (brief v3 §6) in BOTH languages:
 *   1 name · 2 description · 3 audience «لمن تناسب؟» · 4 help «كيف نساعد؟»
 *   5 documents «المستندات والمعلومات المطلوبة مبدئيًا» + documentsNote · 6 faq · 7 cta (start-consultation band)
 *   optional: 2b types «أنواع شائعة» · 2c destinations «وجهات نعمل عليها» · 2d benefits «مزايا شائعة»
 *   summary (categories): the short line of brief v3 §7 + its «تناسب:» line — the category cards (Home §1.5c, Visa Services)
 *   short (services): the one-line card text — v2 for the four core services, brief v3 §4 1.5b for the five new ones
 * Destinations are ISO 3166-1 alpha-2 codes ("DE"); names come from src/lib/countries.ts (Intl), never stored.
 * No legal notice on visa pages (removed by the client, brief v3 §6).
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const iso = z.string().regex(/^[A-Z]{2}$/, 'ISO 3166-1 alpha-2 code, e.g. "DE"');

const localized = z.object({
  name: z.string(),
  description: z.string(),
  summary: z.object({ text: z.string(), fit: z.string() }).optional(),                              // §7 short line (category cards)
  short: z.string().optional(),                                                                     // services: the card line (§5 v2 · §4 1.5b) — Visa Services cards
  types: z.array(z.object({ title: z.string().optional(), text: z.string() })).optional(),          // 2b
  destinations: z.array(z.object({ label: z.string().optional(), countries: z.array(iso).min(1) })).optional(), // 2c
  benefits: z.array(z.object({ title: z.string(), text: z.string() })).optional(),                  // 2d
  audience: z.array(z.string()),
  help: z.array(z.string()),
  documents: z.array(z.string()),
  documentsNote: z.string(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
  cta: z.object({ title: z.string(), text: z.string(), button: z.string() }),
});

export const visaGroups = ['visit', 'study', 'work', 'residence'] as const;
export type VisaGroup = (typeof visaGroups)[number];

const base = { order: z.number(), ar: localized, en: localized };

const visas = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/visas' }),
  schema: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('category'), group: z.enum(visaGroups), ...base }).strict(),
    z.object({ kind: z.literal('service'), ...base }).strict(),
  ]),
});

export const collections = { visas };
