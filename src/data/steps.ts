/**
 * The four help steps «خطوات المساعدة» (brief part 04 §1.6) — ONE list, used by Home §1.6 (views/home/Steps.astro) and
 * About «كيف نعمل» (brief v3 §13: «نفس خطوات المساعدة الأربع في الرئيسية»). [title, text] in order.
 */
import type { Lang } from '../i18n';

export const helpSteps: Record<Lang, readonly (readonly [string, string])[]> = {
  ar: [
    ['أرسل طلبك', 'الدولة ونوع التأشيرة وموعد سفرك المتوقع.'],
    ['جلسة الاستشارة', 'نناقش وضعك ونحدد المسار والمتطلبات.'],
    ['قائمة مستنداتك', 'قائمة مخصصة بالمستندات والمعلومات المطلوبة.'],
    ['مراجعة وإرشاد', 'نراجع ملفك ونرشدك في الطلب والموعد.'],
  ],
  en: [
    ['Send your request', 'The country, the visa type and your expected travel date.'],
    ['The consultation session', 'We discuss your situation and set the path and the requirements.'],
    ['Your document checklist', 'A tailored list of the documents and information required.'],
    ['Review and guidance', 'We review your file and guide you through your application and appointment.'],
  ],
};
