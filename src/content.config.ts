/**
 * Content collections. One JSON file per visa category OR service in src/content/visas/<slug>.json
 * (brief part 04 §3: «قالب واحد لكل خدمة أو فئة تأشيرة»). `kind` says which group it belongs to (header submenu,
 * Visa Services page): 'category' = the five visa types of §2.2 · 'service' = the four services of §1.2–1.5 / §2.1.
 * The file name is the slug: student-visa.json → /visa-services/student-visa/ and /en/visa-services/student-visa/
 * Shape = the Visa Service Details Template (brief v3 §6, seven elements) in BOTH languages:
 *   1 name · 2 description · 3 audience «لمن تناسب؟» · 4 help «كيف نساعد؟»
 *   5 documents «المستندات والمعلومات المطلوبة مبدئيًا» + documentsNote · 6 faq · 7 cta (start-consultation band)
 * No legal notice on visa pages (removed by the client, brief v3 §6).
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localized = z.object({
  name: z.string(),
  description: z.string(),
  audience: z.array(z.string()),
  help: z.array(z.string()),
  documents: z.array(z.string()),
  documentsNote: z.string(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
  cta: z.object({ title: z.string(), text: z.string(), button: z.string() }),
});

const visas = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/visas' }),
  schema: z.object({
    kind: z.enum(['category', 'service']),
    order: z.number(),        // order inside its kind, as in the brief (§2.2 categories · §2.1 services)
    ar: localized,
    en: localized,
  }),
});

export const collections = { visas };
