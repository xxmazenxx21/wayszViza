/**
 * «اعرف تأشيرتك» — the rules of the assessment tool (brief v3 §11). Pure functions, no DOM: used by the tool
 * (motion/scenes/paper-assess.ts) and by the consultation form (it reads the answers back from the URL).
 * The copy of every question and choice lives in src/data/assessment.ts. Nothing is ever sent from the tool: its only
 * output is the link to /consultation/ with the answers as URL parameters.
 *
 * URL parameters the tool writes (all optional; the form ignores unknown values):
 *   from=assessment · type=<category slug> · destination=<ISO> · service=<slug>,<slug>… · purpose=<Purpose>
 *   cbi=<Cbi> · support=<Support> · refused=yes|no · when=<When> · party=<Party> · travelers=1 (only when alone)
 */

export const purposes = ['tourism', 'family', 'business', 'study', 'job', 'jobsearch', 'settle', 'invest', 'cbi'] as const;
export const cbiChoices = ['residency', 'citizenship', 'unsure'] as const;
export const supportChoices = ['yes', 'notyet', 'unsure'] as const;
export const refusedChoices = ['yes', 'no'] as const;
export const whenChoices = ['month', 'quarter', 'later', 'undecided'] as const;
export const partyChoices = ['alone', 'family', 'team'] as const;

export type Purpose = (typeof purposes)[number];
export type Cbi = (typeof cbiChoices)[number];
export type Support = (typeof supportChoices)[number];
export type Refused = (typeof refusedChoices)[number];
export type When = (typeof whenChoices)[number];
export type Party = (typeof partyChoices)[number];

/** Q1 → the suggested category (brief v3 §2 slugs). */
export const categoryOf: Record<Purpose, string> = {
  tourism: 'tourist-visa',
  family: 'family-visa',
  business: 'business-visa',
  study: 'student-visa',
  job: 'work-visa',
  jobsearch: 'job-seeker-visa',
  settle: 'immigration-residence-visa',
  invest: 'investor-visa',
  cbi: 'investment-residency-citizenship',
};

/**
 * Q1b → which destination legs of investment-residency-citizenship.json Q1c offers (the JSON lists the citizenship
 * leg first, the residency leg second — brief v3 §7b). «لست متأكدًا» shows both.
 */
export const cbiLegs: Record<Cbi, number[]> = { citizenship: [0], residency: [1], unsure: [0, 1] };

export type StepId = 'purpose' | 'cbi' | 'destination' | 'support' | 'refused' | 'when' | 'party';

export interface Answers {
  purpose?: Purpose;
  cbi?: Cbi;
  destination?: string;   // ISO code, or 'none' («ليس بعد»)
  support?: Support;
  refused?: Refused;
  when?: When;
  party?: Party;
}

/** The questions in order for these answers: Q1 → Q1b (investment only) → Q1c → Q2 → Q3 → Q4 → Q5. */
export const stepsFor = (a: Answers): StepId[] =>
  ['purpose', ...(a.purpose === 'cbi' ? (['cbi'] as const) : []), 'destination', 'support', 'refused', 'when', 'party'];

/** The suggested services (brief v3 §11 rules). The consultation always comes first. */
export function suggestedServices(a: Answers): string[] {
  const out = ['visa-consultation'];
  if (a.refused === 'yes') out.push('refusal-review');
  if (a.when === 'month') out.push('appointment-booking');
  if (a.party === 'team') out.push('corporate-visas');
  return out;
}

/** «ليس بعد» to Q2 with a job offer → the job-seeker visa as an alternative (brief v3 §11). */
export const alternativeOf = (a: Answers): string | undefined =>
  a.purpose === 'job' && a.support === 'notyet' ? 'job-seeker-visa' : undefined;

/** The answers → the query string of the prefilled consultation form. */
export function consultQuery(a: Answers): string {
  const q = new URLSearchParams({ from: 'assessment' });
  if (a.purpose) q.set('type', categoryOf[a.purpose]);
  if (a.destination && a.destination !== 'none') q.set('destination', a.destination);
  q.set('service', suggestedServices(a).join(','));
  if (a.purpose) q.set('purpose', a.purpose);
  if (a.cbi) q.set('cbi', a.cbi);
  if (a.support) q.set('support', a.support);
  if (a.refused) q.set('refused', a.refused);
  if (a.when) q.set('when', a.when);
  if (a.party) q.set('party', a.party);
  if (a.party === 'alone') q.set('travelers', '1');
  return q.toString().replace(/%2C/g, ',');
}

/** The URL → the tool's answers (unknown values dropped). Used by the consultation form. */
export function answersFrom(params: URLSearchParams): Answers {
  const pick = <T extends string>(key: string, list: readonly T[]) => {
    const v = params.get(key);
    return v && (list as readonly string[]).includes(v) ? (v as T) : undefined;
  };
  return {
    purpose: pick('purpose', purposes),
    cbi: pick('cbi', cbiChoices),
    support: pick('support', supportChoices),
    refused: pick('refused', refusedChoices),
    when: pick('when', whenChoices),
    party: pick('party', partyChoices),
  };
}
