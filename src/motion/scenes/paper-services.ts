/**
 * Home §1.2–1.5 — the four services on one sticky screen (views/home/Services.astro). CSS does the sticking.
 * Each unit of scroll: a page turn (bridge.paper.turn k-1 → k, eased) then a rest, during which the diorama plays
 * its own motion (bridge.paper.act 0 → 1: roads split, sheets fly into the folder, fields light, the door opens).
 * The panels and the css-tier stills follow with .is-active (opacity only — screen readers and keyboard reach
 * every panel; a focused link scrolls its rest into view). Fully reversible.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Scene } from '../index';
import { lenis } from '../smooth-scroll';
import { paper } from '../stage/bridge';

const clamp01 = gsap.utils.clamp(0, 1);
const TURN = [0.04, 0.46];                                   // the page turn inside a unit
const TAIL = 0.45;                                           // the last spread rests before the section lets go

const scene: Scene = (root) => {
  const items = gsap.utils.toArray<HTMLElement>('.psvc__item', root);
  const ticks = gsap.utils.toArray<HTMLElement>('.psvc__ticks span', root);
  const n = items.length, total = n + TAIL;
  root.classList.add('is-scrub');

  const st = ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (self) => {
      const u = self.progress * total;
      const k = Math.min(Math.floor(u), n - 1), f = u - k;
      const t = clamp01((f - TURN[0]) / (TURN[1] - TURN[0]));
      paper.turn = k + t * t * (3 - 2 * t);
      paper.act = clamp01((f - TURN[1] - 0.04) / (1 - TURN[1] - 0.12));
      const active = Math.max(paper.turn > k + 0.55 ? k : k - 1, 0);   // the first service shows as its page turns
      items.forEach((it, i) => it.classList.toggle('is-active', i === active));
      ticks.forEach((tk, i) => tk.classList.toggle('is-on', i === active));
    },
    onLeaveBack: () => { paper.turn = 0; paper.act = 0; items.forEach((it) => it.classList.remove('is-active')); },
  });

  // keyboard: a focused link brings its service on screen
  items.forEach((it, k) => {
    it.querySelector('a')?.addEventListener('focus', () => {
      if (it.classList.contains('is-active')) return;
      const y = st.start + ((k + 0.75) / total) * (st.end - st.start);
      if (lenis) lenis.scrollTo(y, { duration: 0.8 }); else window.scrollTo(0, y);
    });
  });
};
export default scene;
