/**
 * Content collections. One JSON file per visa service / category in src/content/visas/<slug>.json.
 * The file name is the slug: student-visa.json → /visa-services/student-visa/ and /en/visa-services/student-visa/
 * Shape = the Visa Service Details Template (brief part 04 §3, nine elements) in BOTH languages:
 *   1 name · 2 description · 3 audience «لمن تناسب؟» · 4 help «كيف نساعد؟»
 *   5 documents «المستندات والمعلومات المطلوبة مبدئيًا» + documentsNote · 6 notGuaranteed «ما لا نضمنه»
 *   7 faq · 8 cta (start-consultation band)
 *   9 the legal notice is FIXED text for every visa page: i18n `legal` — never per file.
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
  notGuaranteed: z.array(z.string()),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
  cta: z.object({ title: z.string(), text: z.string(), button: z.string() }),
});

const visas = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/visas' }),
  schema: z.object({
    order: z.number(),        // order of the categories on the Visa Services page (brief part 04 §2.2)
    ar: localized,
    en: localized,
  }),
});

export const collections = { visas };
