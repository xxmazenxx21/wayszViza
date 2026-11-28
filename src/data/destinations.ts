/**
 * Destinations we work with, by region — brief v3 §1.6b (Home «وجهات نرافقك إليها»).
 * ISO 3166-1 alpha-2 codes; names come from src/lib/countries.ts. Each country links to the consultation form with
 * `?destination=<code>`. TODO(client): the client reviews this list (brief v3 §18.2).
 */
export interface Region { id: string; label: { ar: string; en: string }; countries: readonly string[] }

/** The Schengen countries named in §1.6b — reused by the category destinations of §7b. */
export const schengen = ['DE', 'FR', 'ES', 'IT', 'PT', 'NL', 'BE', 'AT', 'SE', 'CH', 'GR', 'MT', 'HU'] as const;

export const regions: readonly Region[] = [
  { id: 'schengen', label: { ar: 'أوروبا ومنطقة شنغن', en: 'Europe & Schengen' }, countries: schengen },
  { id: 'europe', label: { ar: 'أوروبا (خارج شنغن)', en: 'Europe (non-Schengen)' }, countries: ['GB', 'CY', 'TR'] },
  { id: 'north-america', label: { ar: 'أمريكا الشمالية', en: 'North America' }, countries: ['US', 'CA'] },
  { id: 'oceania', label: { ar: 'أستراليا ونيوزيلندا', en: 'Australia & New Zealand' }, countries: ['AU', 'NZ'] },
  { id: 'asia', label: { ar: 'آسيا', en: 'Asia' }, countries: ['MY'] },
  { id: 'cbi', label: { ar: 'الكاريبي والمحيط الهادئ (الجنسية عن طريق الاستثمار)', en: 'Caribbean & Pacific (citizenship by investment)' },
    countries: ['AG', 'DM', 'GD', 'KN', 'LC', 'NR'] },
];
