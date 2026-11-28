/**
 * Country names. We store ISO 3166-1 alpha-2 codes only ("DE", "TR") and name them with Intl at build time, in the
 * page's language (e.g. "Türkiye", «ألمانيا»). Every page that shows a country uses these helpers.
 * OVERRIDES: where Intl's name differs from the brief (v3 §1.6b — the client's list), the brief wins. Only real
 * mismatches are listed (checked against Node's ICU for every country of §1.6b).
 */
import type { Lang } from '../i18n';

const OVERRIDES: Record<Lang, Record<string, string>> = {
  ar: {
    HU: 'المجر',                       // Intl: «هنغاريا»
    AG: 'أنتيغوا وباربودا',            // Intl: «أنتيغوا وبربودا»
  },
  en: {
    AG: 'Antigua and Barbuda',         // Intl: "Antigua & Barbuda"
    KN: 'Saint Kitts and Nevis',       // Intl: "St. Kitts & Nevis"
    LC: 'Saint Lucia',                 // Intl: "St. Lucia"
  },
};

const cache = new Map<Lang, Intl.DisplayNames>();
const namer = (lang: Lang) => {
  let n = cache.get(lang);
  if (!n) cache.set(lang, (n = new Intl.DisplayNames([lang], { type: 'region' })));
  return n;
};

/** 'DE' + 'ar' → «ألمانيا» */
export const countryName = (code: string, lang: Lang): string => OVERRIDES[lang][code] ?? namer(lang).of(code) ?? code;

/** Codes → [{ code, name }] in the given order (pass `sort` to sort by name in the page's language). */
export function countries(codes: readonly string[], lang: Lang, sort = false) {
  const list = codes.map((code) => ({ code, name: countryName(code, lang) }));
  return sort ? list.sort((a, b) => a.name.localeCompare(b.name, lang)) : list;
}
