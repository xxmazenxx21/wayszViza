/**
 * About «الأرقام والشهادات» (brief v3 §13 ❓) — the client has not sent his numbers, certificates or licenses yet.
 * Everything marked TODO(client) is a realistic PLACEHOLDER for the staging review; replace it with the client's data.
 * `showStats: false` hides the whole block (e.g. if the client prefers no numbers at launch).
 * Two counters are real and computed by the page: the destinations of brief v3 §1.6b (src/data/destinations.ts) and the
 * nine visa types (src/content/visas).
 */
import type { Lang } from '../i18n';

type L = Record<Lang, string>;

/** Show «الأرقام والشهادات» on /about/ — default true for the staging review. TODO(client): confirm. */
export const showStats = true;

/** Counters written by hand. `value` is a number (it counts up), `suffix` follows it ("+"). */
export const counters: { value: number; suffix?: string; label: L }[] = [
  { value: 12, suffix: '+', label: { ar: 'سنة خبرة في ملفات التأشيرات', en: 'years of visa experience' } },       // TODO(client)
  { value: 3500, suffix: '+', label: { ar: 'ملف رافقنا أصحابه', en: 'files we have guided' } },                   // TODO(client)
];

/** Certificates and licenses: a title and one line each. */
export const certificates: { title: L; text: L }[] = [
  {
    title: { ar: 'وكيل معتمد', en: 'Authorized agent' },   // brief v3: the client is an authorized agent — TODO(client): name the programs / license numbers
    text: { ar: 'لبرامج الإقامة والجنسية عن طريق الاستثمار التي نعرضها.', en: 'For the residency and citizenship by investment programs we list.' },
  },
  {
    title: { ar: 'ISO 9001:2015', en: 'ISO 9001:2015' },   // TODO(client): only if the new entity holds it
    text: { ar: 'نظام إدارة الجودة في خدماتنا الاستشارية.', en: 'Quality management across our consulting services.' },
  },
  {
    title: { ar: 'سجل تجاري وبطاقة ضريبية', en: 'Commercial and tax registration' },   // TODO(client): the registration numbers
    text: { ar: 'كيان مسجل يعمل وفق القوانين المحلية.', en: 'A registered entity working under local law.' },
  },
];
