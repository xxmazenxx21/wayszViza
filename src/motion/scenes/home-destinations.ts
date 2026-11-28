/**
 * Home §1.6b — «وجهات نرافقك إليها» (views/home/Destinations.astro). One sticky screen (CSS — not a pin) with a rest per
 * region of brief v3 §1.6b: each unit of scroll the camera of the act `atlas` flies to the next region and RESTS while it
 * glows (bridge.atlas.stop = the region's index: home-atlas hands the act one landmark country per region first, see
 * there), and the region's name and countries light up here (.is-on: opacity only — every name stays in the
 * accessibility tree and is a link that opens the consultation form with the country). A focused link brings its region
 * on screen. css tier: the same rests over the still globe. Fully reversible.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { lenis } from '../smooth-scroll';
import { atlas } from '../stage/bridge';

const clamp01 = gsap.utils.clamp(0, 1);
const MOVE = [0.04, 0.5];                                    // the flight inside a unit, then the rest
const TAIL = 0.5;                                            // the last region rests before the section lets go

const scene: Scene = (root) => {
  const rests = root.querySelector<HTMLElement>('.hdest__rests')!;
  const regions = gsap.utils.toArray<HTMLElement>('.hdest__region', root);
  const marks = [...gsap.utils.toArray<HTMLElement>('.hdest__index li', root), ...gsap.utils.toArray<HTMLElement>('.hdest__ticks span', root)];
  const n = regions.length, total = n + TAIL;

  const words = SplitText.create(root.querySelector('.hdest__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: root, start: 'top 75%', once: true } });

  let current = -1;
  const show = (k: number) => {
    if (k === current) return;
    current = k;
    regions.forEach((r, i) => r.classList.toggle('is-on', i === k));
    marks.forEach((m, i) => m.classList.toggle('is-on', i % n === k));
  };
  const st = ScrollTrigger.create({
    trigger: rests, start: 'top top', end: 'bottom bottom', scrub: true,
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

  // keyboard: a focused country brings its region on screen
  regions.forEach((r, k) => {
    r.addEventListener('focusin', () => {
      if (current === k && st.isActive) return;
      const y = st.start + ((k + 0.75) / total) * (st.end - st.start);
      if (lenis) lenis.scrollTo(y, { duration: 0.8 }); else window.scrollTo(0, y);
    });
  });
};
export default scene;
