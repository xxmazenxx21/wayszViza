/**
 * Home §1.6c «آراء العملاء» — «من تجارب عملائنا» (brief v3 §4 1.6c ❓).
 * TODO(client): these three are PLACEHOLDERS for the staging review — replace them with real testimonials the client
 * sends (first name + initial, city, visa type, one line), or set `showTestimonials` to false to hide the whole section.
 * `visa` is a category slug of src/content/visas/ (its name is read from the JSON). No numbers or stats here, ever.
 */
export const showTestimonials = true;

export interface Testimonial {
  name: { ar: string; en: string };
  city: { ar: string; en: string };
  visa: string;
  quote: { ar: string; en: string };
}

export const testimonials: readonly Testimonial[] = [
  {
    name: { ar: 'سارة م.', en: 'Sara M.' },
    city: { ar: 'القاهرة', en: 'Cairo' },
    visa: 'student-visa',
    quote: {
      ar: 'رتّبوا معي مستندات القبول والتمويل خطوة بخطوة، ودخلت موعدي وأنا أعرف تمامًا ما سأقوله.',
      en: 'They organized my admission and funding documents with me step by step, and I walked into my appointment knowing exactly what to say.',
    },
  },
  {
    name: { ar: 'أحمد ع.', en: 'Ahmed A.' },
    city: { ar: 'الإسكندرية', en: 'Alexandria' },
    visa: 'tourist-visa',
    quote: {
      ar: 'بعد رفض سابق فهمت أخيرًا أين كانت المشكلة، وتقدّمت هذه المرة بملف أوضح بكثير.',
      en: 'After an earlier refusal I finally understood where the problem was, and this time I applied with a far clearer file.',
    },
  },
  {
    name: { ar: 'كريم س.', en: 'Karim S.' },
    city: { ar: 'الجيزة', en: 'Giza' },
    visa: 'investment-residency-citizenship',
    quote: {
      ar: 'شرحوا لي الفرق بين البرامج بهدوء ووضوح، وكانت كل خطوة وكل تكلفة واضحة من البداية.',
      en: 'They explained the differences between the programs calmly and clearly, and every step and every cost was clear from the start.',
    },
  },
];
