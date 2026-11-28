/**
 * «اعرف تأشيرتك» — the copy of every question and choice (brief v3 §11, word for word where the brief gives it).
 * Q2's wording follows Q1 (the brief: «يتغير حسب السؤال 1: قبول دراسي، عرض عمل، دعوة…») — written in our own words
 * from each category page. The ids and rules are in src/lib/assessment.ts. Used at build time only (the pages embed
 * the copy of their language as JSON for the browser).
 */
import type { Lang } from '../i18n';
import type { Cbi, Party, Purpose, Refused, StepId, Support, When } from '../lib/assessment';

type L = Record<Lang, string>;

export const questions: Record<Exclude<StepId, 'support'>, L> = {
  purpose: { ar: 'ما الغرض الأساسي من سفرك؟', en: 'What is the main purpose of your trip?' },
  cbi: { ar: 'ما الذي تبحث عنه؟', en: 'What are you looking for?' },
  destination: { ar: 'هل لديك وجهة مفضلة؟', en: 'Do you have a preferred destination?' },
  refused: { ar: 'هل سبق رفض طلب تأشيرة لك؟', en: 'Have you ever been refused a visa?' },
  when: { ar: 'متى تخطط للسفر؟', en: 'When are you planning to travel?' },
  party: { ar: 'هل تسافر وحدك؟', en: 'Are you traveling alone?' },
};

export const purposeLabels: Record<Purpose, L> = {
  tourism: { ar: 'سياحة أو زيارة قصيرة', en: 'Tourism or a short visit' },
  family: { ar: 'زيارة الأسرة أو الالتحاق بها', en: 'Visiting or joining family' },
  business: { ar: 'عمل أو مؤتمر أو معرض', en: 'Business, conference or exhibition' },
  study: { ar: 'الدراسة', en: 'Study' },
  job: { ar: 'وظيفة لديّ عرض بها', en: 'A job I have an offer for' },
  jobsearch: { ar: 'البحث عن عمل', en: 'Looking for work' },
  settle: { ar: 'الاستقرار أو الإقامة الدائمة', en: 'Settling or permanent residence' },
  invest: { ar: 'الاستثمار أو تأسيس مشروع', en: 'Investing or starting a business' },
  cbi: { ar: 'إقامة أو جنسية عن طريق الاستثمار', en: 'Residency or citizenship by investment' },
};

/** Q2 — «هل لديك ما يدعم غرضك؟», asked about the thing that supports each purpose. */
export const supportQuestions: Record<Purpose, L> = {
  tourism: { ar: 'هل لديك ما يدعم رحلتك، مثل كشف حساب وخطاب من جهة عملك؟', en: 'Do you have what supports your trip, such as a bank statement and a letter from your employer?' },
  family: { ar: 'هل لديك دعوة من قريبك المقيم بالخارج؟', en: 'Do you have an invitation from your relative abroad?' },
  business: { ar: 'هل لديك دعوة من شركة أو من الجهة المنظِّمة للمؤتمر أو المعرض؟', en: 'Do you have an invitation from a company or from the conference or exhibition organizer?' },
  study: { ar: 'هل لديك قبول دراسي من جامعة أو معهد؟', en: 'Do you have an admission from a university or institute?' },
  job: { ar: 'هل لديك عرض عمل أو عقد مكتوب من صاحب العمل؟', en: 'Do you have a written job offer or contract from the employer?' },
  jobsearch: { ar: 'هل لديك مؤهل وخبرة في مجالك يمكن إثباتهما؟', en: 'Do you have qualifications and experience in your field that you can prove?' },
  settle: { ar: 'هل لديك ما يدعم طلبك، مثل مؤهلات أو خبرة أو عرض عمل؟', en: 'Do you have something that supports your application, such as qualifications, experience or a job offer?' },
  invest: { ar: 'هل لديك خطة عمل وأموال جاهزة للاستثمار؟', en: 'Do you have a business plan and funds ready to invest?' },
  cbi: { ar: 'هل لديك مبلغ الاستثمار جاهزًا مع ما يثبت مصدره؟', en: 'Do you have the investment amount ready, with proof of where it comes from?' },
};

export const cbiLabels: Record<Cbi, L> = {
  residency: { ar: 'إقامة', en: 'Residency' },
  citizenship: { ar: 'جنسية ثانية', en: 'Second citizenship' },
  unsure: { ar: 'لست متأكدًا', en: 'I’m not sure' },
};

export const supportLabels: Record<Support, L> = {
  yes: { ar: 'نعم', en: 'Yes' },
  notyet: { ar: 'ليس بعد', en: 'Not yet' },
  unsure: { ar: 'لست متأكدًا', en: 'I’m not sure' },
};

export const refusedLabels: Record<Refused, L> = {
  yes: { ar: 'نعم', en: 'Yes' },
  no: { ar: 'لا', en: 'No' },
};

export const whenLabels: Record<When, L> = {
  month: { ar: 'خلال شهر', en: 'Within a month' },
  quarter: { ar: 'خلال 1–3 أشهر', en: 'In 1–3 months' },
  later: { ar: 'بعد أكثر من 3 أشهر', en: 'In more than 3 months' },
  undecided: { ar: 'لم أحدد بعد', en: 'Not decided yet' },
};

export const partyLabels: Record<Party, L> = {
  alone: { ar: 'وحدي', en: 'Alone' },
  family: { ar: 'مع أسرتي', en: 'With my family' },
  team: { ar: 'ضمن فريق عمل أو وفد', en: 'With a work team or delegation' },
};

/** Q1c's last choice. */
export const noDestination: L = { ar: 'ليس بعد', en: 'Not yet' };

const pick = <K extends string>(rec: Record<K, L>, lang: Lang) =>
  Object.fromEntries(Object.entries<L>(rec).map(([k, v]) => [k, v[lang]])) as Record<K, string>;

/** Every label of the tool in one language — embedded as JSON by the tool and by the consultation form. */
export const assessmentCopy = (lang: Lang) => ({
  questions: pick(questions, lang),
  support: pick(supportQuestions, lang),
  choices: {
    purpose: pick(purposeLabels, lang),
    cbi: pick(cbiLabels, lang),
    support: pick(supportLabels, lang),
    refused: pick(refusedLabels, lang),
    when: pick(whenLabels, lang),
    party: pick(partyLabels, lang),
  },
  noDestination: noDestination[lang],
});
export type AssessmentCopy = ReturnType<typeof assessmentCopy>;
