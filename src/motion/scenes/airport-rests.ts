/**
 * Visa Services §2.1 (the nine services, in the hall) and §2.2 + §2.3 (the nine categories at their gates + «لست
 * متأكدًا…») — views/visa-services/Rests.astro. One sticky screen each (CSS, not a pin), one scrubbed ScrollTrigger.
 * The footage keeps gliding (airport-thread); here each card arrives from the walking direction as its counter / gate
 * comes up, slows down and RESTS, then makes room for the next. In the gate corridor the DOM gate sign (zone letter +
 * group) changes when a new zone begins. Horizontal motion × env.dir. State that scroll hides is faded with opacity
 * only (screen readers and keyboard reach every card; a focused link scrolls its card into place). Fully reversible.
 * Without JS: a plain list (CSS).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { lenis } from '../smooth-scroll';

const TAIL = 0.6;                                            // the last card rests a little longer (Rests.astro sizes the section with the same 0.6)
const clamp01 = gsap.utils.clamp(0, 1);
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

const scene: Scene = (root, env) => {
  const cards = gsap.utils.toArray<HTMLElement>('.ar__card', root);
  const signs = gsap.utils.toArray<HTMLElement>('.ar__sign', root);
  const ticksBox = root.querySelector<HTMLElement>('.ar__ticks')!;
  const ticks = cards.map(() => ticksBox.appendChild(document.createElement('span')));
  const n = cards.length, total = n + TAIL;
  root.classList.add('is-scrub');

  const words = SplitText.create(root.querySelector('.ar__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: root, start: 'top 70%', once: true } });

  const setX = cards.map((c) => gsap.quickSetter(c, 'x', 'px'));
  const setO = cards.map((c) => gsap.quickSetter(c, 'opacity'));
  let active = -1, zone = -1;
  const render = (p: number) => {
    const u = p * total;
    const reach = Math.min(110, window.innerWidth * 0.12) * env.dir;   // the cards come from the walking direction
    let best = 0, top = -1;
    cards.forEach((_, k) => {
      const f = u - k;                                       // −0.08 arriving · 0.14…0.72 resting · 0.72…0.9 leaving
      // the outgoing card is gone before the next one arrives: two texts never overlap
      const enter = smooth(-0.08, 0.16, f), leave = k === n - 1 ? 0 : smooth(0.7, 0.9, f);
      const o = enter * (1 - leave);
      setO[k](o);
      setX[k]((1 - enter) * (1 - enter) * reach - leave * leave * reach * 0.6);
      if (o > top) { top = o; best = k; }
    });
    if (best !== active) {
      active = best;
      cards.forEach((c, k) => c.classList.toggle('is-active', k === best));
      ticks.forEach((t, k) => t.classList.toggle('is-on', k === best));
      const z = Number(cards[best].dataset.zone ?? -1);
      if (z !== zone) { zone = z; signs.forEach((s) => s.classList.toggle('is-active', Number(s.dataset.zone) === z)); }
    }
  };
  const st = ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => render(self.progress),
    onRefresh: (self) => render(self.progress),
  });
  render(0);

  // keyboard: a focused link brings its card to rest on screen
  cards.forEach((card, k) => {
    card.querySelector('a')?.addEventListener('focus', () => {
      if (card.classList.contains('is-active')) return;
      const y = st.start + ((k + 0.35) / total) * (st.end - st.start);
      if (lenis) lenis.scrollTo(y, { duration: 0.8 }); else window.scrollTo(0, y);
    });
  });
};
export default scene;
