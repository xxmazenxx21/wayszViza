/**
 * Site-wide facts — the ONLY place for contact data, branches and social links (brief v3 §14, §19.4).
 * The client is starting a new entity: every value below is a realistic PLACEHOLDER until he sends the real data.
 * Search `TODO(client)` to replace them. Components render a contact item only when its value is not empty.
 */
type Localized = { ar: string; en: string };
export interface Branch { name: Localized; address: Localized; mapUrl: string; hours: Localized }

export const site = {
  name: 'WaysZ Visa',
  url: 'https://waysz-visa.com',
  mainSite: 'https://waysz.org',          // sister site WaysZ — separate repo/domain; we only link to it

  email: 'info@waysz-visa.com',           // TODO(client): confirm the public email of the new entity
  phone: '+20 2 0000 0000',               // TODO(client): the real phone number
  whatsapp: '201000000000',               // TODO(client): WhatsApp number, digits only with country code
  address: { ar: 'القاهرة، مصر', en: 'Cairo, Egypt' } as Localized,                    // TODO(client)
  hours: { ar: 'السبت إلى الخميس، 10 ص – 6 م', en: 'Saturday to Thursday, 10 am – 6 pm' } as Localized, // TODO(client)

  // TODO(client): the real branches (brief v3 §14 ❓) — one sample branch for now
  branches: [
    {
      name: { ar: 'الفرع الرئيسي', en: 'Main branch' },
      address: { ar: 'القاهرة، مصر', en: 'Cairo, Egypt' },
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Cairo%2C%20Egypt',
      hours: { ar: 'السبت إلى الخميس، 10 ص – 6 م', en: 'Saturday to Thursday, 10 am – 6 pm' },
    },
  ] as Branch[],

  // TODO(client): the real social links ('#' = placeholder). Order = display order.
  social: {
    facebook: '#',
    instagram: '#',
    linkedin: '#',
    youtube: '#',
    tiktok: '#',
  },
} as const;

export type SocialNetwork = keyof typeof site.social;

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
export const waHref = (digits: string, text = '') =>
  `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
