/**
 * Visa Services §2.1 (counters) and §2.2 (gates) — one sticky screen each, with rests (views/visa-services/Rests.astro,
 * `data-rests="counter" | "gate"`). CSS does the sticking — not a pin.
 * Each unit of scroll: the camera walks (counters) or dollies sideways (gates) to the next stop, then RESTS while that
 * counter / glimpse plays its own motion (bridge.terminal.counter + counterAct · gate + gateAct). The horizontal
 * direction lives in the act (× side). The panels and the css-tier stills follow with .is-active (opacity only — screen
 * readers and keyboard reach every panel; a focused link scrolls its rest into view). Fully reversible.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { lenis } from '../smooth-scroll';
import { terminal } from '../stage/bridge';

const clamp01 = gsap.utils.clamp(0, 1);
const MOVE = [0.02, 0.4];                                    // the walk inside a unit
const TAIL = 0.4;                                            // the last stop rests before the section lets go

const scene: Scene = (root) => {
  const kind = root.dataset.rests === 'gate' ? 'gate' : 'counter';
  const items = gsap.utils.toArray<HTMLElement>('.rest', root);
  const ticks = gsap.utils.toArray<HTMLElement>('.rests__ticks span', root);
  const n = items.length, total = n + TAIL;
  root.classList.add('is-scrub');
  ScrollTrigger.create({ trigger: root, start: 'top 150%', once: true, onEnter: () => root.classList.add('is-near') });   // css-tier stills load only now

  const words = SplitText.create(root.querySelector('.rests__label'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: root, start: 'top 75%', once: true } });

  const write = (pos: number, act: number) => {
    if (kind === 'gate') { terminal.gate = pos; terminal.gateAct = act; } else { terminal.counter = pos; terminal.counterAct = act; }
  };
  const st = ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (self) => {
      const u = self.progress * total;
      const k = Math.min(Math.floor(u), n - 1), f = u - k;
      const t = clamp01((f - MOVE[0]) / (MOVE[1] - MOVE[0]));
      const pos = k === 0 ? 0 : k - 1 + t * t * (3 - 2 * t);
      write(pos, clamp01((f - MOVE[1] - 0.04) / (1 - MOVE[1] - 0.16)));
      const active = Math.round(pos);
      items.forEach((it, i) => it.classList.toggle('is-active', i === active));
      ticks.forEach((tk, i) => tk.classList.toggle('is-on', i === active));
    },
    onLeaveBack: () => { write(0, 0); items.forEach((it, i) => it.classList.toggle('is-active', i === 0)); },
  });
  items[0]?.classList.add('is-active');

  // keyboard: a focused link brings its stop on screen
  items.forEach((it, k) => {
    it.querySelector('a')?.addEventListener('focus', () => {
      if (it.classList.contains('is-active')) return;
      const y = st.start + ((k + 0.7) / total) * (st.end - st.start);
      if (lenis) lenis.scrollTo(y, { duration: 0.8 }); else window.scrollTo(0, y);
    });
  });
};
export default scene;
