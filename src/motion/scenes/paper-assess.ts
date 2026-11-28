/**
 * «اعرف تأشيرتك» (/assessment/, brief v3 §11) — the tool itself (views/AssessmentPage.astro). The same paper world as the
 * Home finder (paper-finder.ts): a deck of paper question cards. The cover card waits with «ابدأ»; each answer fills with
 * the accent and gets its tick, the card turns over its top edge and leaves, the next one rises from the stack. Going
 * back plays it the other way: the card sinks into the stack and the previous one turns back down. At the end the
 * suggestion settles on top with a small lift, its route draws and the plane lands on it.
 *
 * Cards are built here from `data-assess` (the copy of the page's language, the categories, the services) with DOM
 * APIs (textContent only). Rules and the consultation link: src/lib/assessment.ts. Nothing is sent anywhere.
 * Accessibility: answers are real <button aria-pressed> inside a labelled group; «السؤال السابق» / «ابدأ من جديد» are
 * buttons; focus moves to the heading of each new card (its hidden prefix says «السؤال n من m»), so every step is
 * announced; the leaving card is `inert` at once. Keyboard: Tab + Enter / Space. The new card takes input at once (a turn still running is finished instantly). Arrows point the reading way (.icon-dir).
 * DOM + GSAP only (transforms, opacity), no WebGL.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { lenis } from '../smooth-scroll';
import {
  alternativeOf, cbiChoices, cbiLegs, categoryOf, consultQuery, partyChoices, purposes, refusedChoices, stepsFor,
  suggestedServices, supportChoices, whenChoices, type Answers, type StepId,
} from '../../lib/assessment';
import type { AssessmentCopy } from '../../data/assessment';
import type { Scene } from '../index';

type Country = { code: string; name: string };
type Category = { name: string; group: string; text: string; fit?: string; href: string; legs: { label?: string; countries: Country[] }[] };
type Service = { name: string; short: string; href: string };
type Data = {
  ui: Record<string, string>;
  copy: AssessmentCopy;
  consult: string;
  categories: Record<string, Category>;
  services: Record<string, Service>;
};
type Option = { value: string; label: string; leg?: string; none?: boolean };

const CHECK = 'M5 12.5l4.2 4L19 7';
const BACK = 'M19 12H5m6-6-6 6 6 6';
const RESTART = 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5';
const SVGNS = 'http://www.w3.org/2000/svg';

/** A small element helper: h('p', { class: 'x' }, 'text', child) — text goes in as textContent. */
function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...kids: (Node | string | false | undefined)[]) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (const kid of kids) if (kid) el.append(kid);
  return el;
}
function icon(d: string, cls = '', size = 20) {
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('aria-hidden', 'true');
  if (cls) svg.setAttribute('class', cls);
  const path = document.createElementNS(SVGNS, 'path');
  path.setAttribute('d', d);
  svg.append(path);
  return svg;
}

const scene: Scene = (root) => {
  const data = JSON.parse(root.dataset.assess || '{}') as Data;
  const deck = root.querySelector<HTMLElement>('.afind__deck');
  const cover = deck?.querySelector<HTMLElement>('.afind__card--cover');
  if (!deck || !cover || !data.copy) return;
  const { ui, copy } = data;
  root.classList.add('is-live');

  // the heading rises by words, the cover is laid on the stack
  const words = SplitText.create(root.querySelector('.afind__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, delay: 0.1 });
  gsap.fromTo(cover, { y: 40, rotationX: 10, transformPerspective: 1400 }, { y: 0, rotationX: 0, duration: 1.3, ease: 'expo.out', delay: 0.2 });

  let answers: Answers = {};
  let index = -1;          // -1 = the cover · steps.length = the result
  let card = cover;
  let busy = false;        // only during the short pause after a pick (the visitor sees the answer fill)
  let turn: gsap.core.Timeline | undefined;   // the card turn in progress
  let uid = 0;

  const fill = (s: string, n: number, total: number) => s.replace('{n}', String(n)).replace('{total}', String(total));
  const dots = (on: number, total: number) =>
    h('p', { class: 'afind__dots', 'aria-hidden': 'true' }, ...Array.from({ length: total }, (_, k) => h('span', k < on ? { class: 'is-on' } : {})));

  // ---- the questions --------------------------------------------------------------------------------------------
  function optionsOf(step: StepId): { question: string; options: Option[]; layout?: string } {
    const c = copy.choices;
    const list = <T extends string>(ids: readonly T[], labels: Record<T, string>) => ids.map((value) => ({ value, label: labels[value] }));
    switch (step) {
      case 'purpose': return { question: copy.questions.purpose, options: list(purposes, c.purpose), layout: 'grid' };
      case 'cbi': return { question: copy.questions.cbi, options: list(cbiChoices, c.cbi) };
      case 'destination': {
        const cat = data.categories[categoryOf[answers.purpose!]];
        const legs = answers.purpose === 'cbi' ? cbiLegs[answers.cbi ?? 'unsure'].map((i) => cat.legs[i]).filter(Boolean) : cat.legs;
        const options: Option[] = legs.flatMap((leg) =>
          leg.countries.map((co, k) => ({ value: co.code, label: co.name, leg: k === 0 && legs.length > 1 ? leg.label : undefined })));
        options.push({ value: 'none', label: copy.noDestination, none: true });
        return { question: copy.questions.destination, options, layout: 'chips' };
      }
      case 'support': return { question: copy.support[answers.purpose!], options: list(supportChoices, c.support) };
      case 'refused': return { question: copy.questions.refused, options: list(refusedChoices, c.refused) };
      case 'when': return { question: copy.questions.when, options: list(whenChoices, c.when) };
      case 'party': return { question: copy.questions.party, options: list(partyChoices, c.party) };
    }
  }

  function nav(withBack: boolean) {
    const row = h('div', { class: 'afind__nav' });
    if (withBack) {
      const back = h('button', { type: 'button', class: 'afind__navbtn' }, icon(BACK, 'icon-dir', 18), ui.prev);
      back.addEventListener('click', () => { if (!busy) go(index - 1); });
      row.append(back);
    }
    const again = h('button', { type: 'button', class: 'afind__navbtn afind__navbtn--restart' }, icon(RESTART, '', 18), ui.restart);
    again.addEventListener('click', () => { if (busy) return; answers = {}; go(0); });
    row.append(again);
    return row;
  }

  function questionCard(i: number): HTMLElement {
    const steps = stepsFor(answers);
    const step = steps[i];
    const { question, options, layout } = optionsOf(step);
    const id = `afind-q-${++uid}`;
    const count = fill(ui.step, i + 1, steps.length);
    const chosen = answers[step];

    const group = h('div', { class: `afind__opts${layout ? ` afind__opts--${layout}` : ''}`, role: 'group', 'aria-labelledby': id });
    for (const o of options) {
      if (o.leg) group.append(h('p', { class: 'afind__leg', 'aria-hidden': 'true' }, o.leg));
      const btn = h('button', {
        type: 'button', class: `afind__opt${o.none ? ' afind__opt--none' : ''}`, 'aria-pressed': String(chosen === o.value),
      }, icon(CHECK), h('span', {}, o.label));
      btn.addEventListener('click', () => pick(step, o.value, btn));
      group.append(btn);
    }

    return h('article', { class: 'afind__card theme-light', 'data-step': step },
      h('div', { class: 'afind__top' }, dots(i + 1, steps.length), h('p', { class: 'afind__count', 'aria-hidden': 'true' }, count)),
      h('h2', { class: 'afind__q', id, tabindex: '-1' }, h('span', { class: 'visually-hidden' }, `${count}: `), question),
      group,
      i > 0 ? nav(true) : nav(false),
    );
  }

  function pick(step: StepId, value: string, btn: HTMLButtonElement) {
    if (busy) return;
    const before = answers[step];
    // a new purpose (or investment branch) changes the questions after it: forget those answers
    if (step === 'purpose' && before !== value) answers = {};
    if (step === 'cbi' && before !== value) { delete answers.destination; }
    (answers as Record<string, string>)[step] = value;
    btn.parentElement?.querySelectorAll('.afind__opt').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    busy = true;
    gsap.delayedCall(0.35, () => { busy = false; go(index + 1); });
  }

  // ---- the result -----------------------------------------------------------------------------------------------
  function resultCard(): HTMLElement {
    const steps = stepsFor(answers);
    const slug = categoryOf[answers.purpose!];
    const cat = data.categories[slug];
    const id = `afind-q-${++uid}`;
    const link = (a: Answers) => `${data.consult}?${consultQuery(a)}`;

    const about = (c: Category) =>
      h('a', { class: 'link-arrow', href: c.href }, `${ui.about} ${c.name}`, icon('M5 12h14m-6-6 6 6-6 6', 'icon-dir', 18));

    // destinations: the category's (investment: the legs of Q1b), the one chosen in Q1c marked
    const legs = answers.purpose === 'cbi' ? cbiLegs[answers.cbi ?? 'unsure'].map((i) => cat.legs[i]).filter(Boolean) : cat.legs;
    const destBlock = h('div', { class: 'afind__block' }, h('h3', {}, ui.destinations));
    for (const leg of legs) {
      // two legs (investment, «لست متأكدًا»): each list under its own label (citizenship · residency)
      if (legs.length > 1 && leg.label) destBlock.append(h('p', { class: 'afind__leg' }, leg.label));
      const dest = h('ul', { class: 'afind__dest', role: 'list' });
      for (const co of leg.countries) {
        const on = answers.destination === co.code;
        dest.append(h('li', {}, h('a', { href: link({ ...answers, destination: co.code }), class: on ? 'is-chosen' : '', ...(on ? { 'aria-current': 'true' } : {}) },
          co.name, on && h('span', { class: 'visually-hidden' }, ` (${ui.chosen})`))));
      }
      destBlock.append(dest);
    }

    const svcs = h('ul', { class: 'afind__svcs', role: 'list' });
    for (const s of suggestedServices(answers)) {
      const svc = data.services[s];
      if (svc) svcs.append(h('li', {}, h('a', { href: svc.href }, h('strong', {}, svc.name), svc.short && h('span', {}, svc.short))));
    }

    const altSlug = alternativeOf(answers);
    const alt = altSlug && data.categories[altSlug];

    const route = document.createElementNS(SVGNS, 'svg');
    route.setAttribute('class', 'afind__route');
    route.setAttribute('viewBox', '0 0 220 40');
    route.setAttribute('aria-hidden', 'true');
    route.innerHTML = '<path class="afind__path" d="M6 30 C 60 30, 120 26, 196 10" /><path class="afind__plane" d="M210 7 194 15l3-6-5-5 18 3Z" />';

    const cta = h('a', { class: 'btn btn--accent afind__go', href: link(answers) }, ui.continue, icon('M5 12h14m-6-6 6 6-6 6', 'icon-dir', 20));

    return h('article', { class: 'afind__card afind__card--result theme-light', 'data-step': 'result' },
      dots(steps.length, steps.length),
      h('h2', { class: 'afind__rtitle', id, tabindex: '-1' }, h('span', { class: 'afind__rlabel' }, ui.result), ' ', h('span', { class: 'afind__rname' }, cat.name)),
      h('p', { class: 'afind__group' }, cat.group),
      h('p', { class: 'afind__rtext' }, cat.text),
      cat.fit && h('p', { class: 'afind__fit' }, h('strong', {}, ui.suits), ' ', cat.fit),
      about(cat),
      alt && h('div', { class: 'afind__alt' },
        h('p', { class: 'afind__alt-label' }, ui.alternative),
        h('p', { class: 'afind__alt-name' }, alt.name),
        h('p', { class: 'afind__fit' }, alt.text),
        about(alt)),
      legs.length > 0 && destBlock,
      h('div', { class: 'afind__block' }, h('h3', {}, ui.services), svcs),
      route,
      h('p', { class: 'afind__line' }, ui.line),
      cta,
      nav(true),
    );
  }

  // ---- moving between cards -------------------------------------------------------------------------------------
  function go(next: number) {
    // a new step while a card is still turning: finish that turn at once (never drop the visitor's input)
    turn?.progress(1);
    const steps = stepsFor(answers);
    next = Math.max(0, Math.min(next, steps.length));
    const forward = next > index;

    const old = card;
    const fresh = next === steps.length ? resultCard() : questionCard(next);
    old.inert = true;
    deck!.append(fresh);
    card = fresh;
    index = next;

    // focus the new heading (announced: «السؤال n من m: …» or the result), keep the card in view
    const heading = fresh.querySelector<HTMLElement>('h2')!;
    heading.focus({ preventScroll: true });
    const top = deck!.getBoundingClientRect().top;
    if (top < 80 || top > innerHeight * 0.45) {
      if (lenis) lenis.scrollTo(deck!, { offset: -110, duration: 0.9 });
      else deck!.scrollIntoView({ block: 'start' });
    }

    const tl = (turn = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        old.remove();
        if (turn === tl) turn = undefined;
        ScrollTrigger.refresh();
      },
    }));
    if (forward) {
      tl.to(old, { rotationX: -72, y: -36, opacity: 0, duration: 0.6, ease: 'power3.in', transformPerspective: 1400 })
        .fromTo(fresh, { opacity: 0, y: 26, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' }, '-=0.25');
    } else {
      tl.to(old, { opacity: 0, y: 26, scale: 0.97, duration: 0.45, ease: 'power2.in' })
        .fromTo(fresh, { opacity: 0, y: -36, rotationX: -72, transformPerspective: 1400 },
          { opacity: 1, y: 0, rotationX: 0, duration: 0.85, ease: 'expo.out' }, '-=0.2');
    }

    if (fresh.dataset.step === 'result') {
      // the suggestion settles with a small lift, its blocks follow, the route draws and the plane lands on it
      const parts = fresh.querySelectorAll('.afind__group, .afind__rtext, .afind__fit, .link-arrow, .afind__alt, .afind__block, .afind__line, .afind__go');
      tl.to(fresh, { scale: 1.03, duration: 0.3, ease: 'power2.out' }, '-=0.35')
        .to(fresh, { scale: 1, duration: 0.6, ease: 'expo.out' })
        .fromTo(parts, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out' }, '<-0.5')
        .fromTo(fresh.querySelector('.afind__path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, ease: 'power2.inOut' }, '<0.1')
        .fromTo(fresh.querySelector('.afind__plane'), { opacity: 0, x: -14, y: 8 }, { opacity: 1, x: 0, y: 0, duration: 0.6, ease: 'expo.out' }, '>-0.3');
    }
  }

  cover.querySelector<HTMLButtonElement>('[data-start]')?.addEventListener('click', () => go(0));
};
export default scene;
