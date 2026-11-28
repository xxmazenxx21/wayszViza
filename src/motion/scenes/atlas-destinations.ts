/**
 * Visa Service Details — «وجهات نعمل عليها» (views/visa-detail/Destinations.astro), the signature of «خريطة الرحلة».
 * One sticky screen (CSS — not a pin) with a rest per country, in the list's order: each unit of scroll the camera
 * flies to the next country and RESTS while it glows (bridge.atlas.stop → acts/atlas.ts). The country names in the DOM
 * light up as the camera arrives (.is-on, colour + weight only: every name stays readable and is a link that opens the
 * consultation form with the category and the country). Pages with two labelled lists fly them as two legs, the label
 * of the current leg lights too. A focused link brings its country on screen. css tier: the same names light up over
 * the still globe. Fully reversible.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { lenis } from '../smooth-scroll';
import { atlas } from '../stage/bridge';

const clamp01 = gsap.utils.clamp(0, 1);
const MOVE = [0.04, 0.5];                                    // the flight inside a unit, then the rest
const TAIL = 0.5;                                            // the last country rests before the section lets go

const scene: Scene = (root) => {
  const stops = gsap.utils.toArray<HTMLElement>('.adest__stop', root);
  const names = gsap.utils.toArray<HTMLElement>('.adest__now span', root);
  const legs = gsap.utils.toArray<HTMLElement>('.adest__leg', root);
  const legOf = stops.map((s) => legs.indexOf(s.closest<HTMLElement>('.adest__leg')!));
  const n = stops.length, total = n + TAIL;
  root.classList.add('is-scrub');

  const words = SplitText.create(root.querySelector('.adest__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: root, start: 'top 75%', once: true } });

  let current = -1;
  const show = (k: number) => {
    if (k === current) return;
    current = k;
    stops.forEach((s, i) => s.classList.toggle('is-on', i === k));
    names.forEach((s, i) => s.classList.toggle('is-on', i === k));
    legs.forEach((l, i) => l.classList.toggle('is-on', i === legOf[k]));
  };
  const st = ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (self) => {
      const u = self.progress * total;
      const k = Math.min(Math.floor(u), n - 1), f = u - k;
      const t = clamp01((f - MOVE[0]) / (MOVE[1] - MOVE[0]));
      const pos = k === 0 ? 0 : k - 1 + t * t * (3 - 2 * t);
      atlas.stop = pos;
      show(Math.round(pos));
    },
    onLeaveBack: () => { atlas.stop = 0; show(0); },
  });
  show(0);

  // keyboard: a focused country brings its stop on screen
  stops.forEach((s, k) => {
    s.querySelector('a')?.addEventListener('focus', () => {
      if (current === k && st.isActive) return;
      const y = st.start + ((k + 0.75) / total) * (st.end - st.start);
      if (lenis) lenis.scrollTo(y, { duration: 0.8 }); else window.scrollTo(0, y);
    });
  });
};
export default scene;
