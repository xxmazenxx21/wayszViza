/**
 * Home — the thread of «رحلة الورق» (views/HomePage.astro). Lives on the ONE stage host of hero → §1.5, which CSS
 * keeps on screen. It only measures: which section the middle of the screen is in and how far through it
 * (bridge.paper.shot → the camera, the cover, the lay-down and the first pop-up of acts/paper.ts). The section scenes
 * write the rest (paper-hero, paper-help → fix, paper-services → turn / act). A pure function of the scroll
 * position, so scrolling back closes the booklet again. css tier (no WebGL): nothing to draw — the stills show.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Scene } from '../index';
import { paper, type PaperPoster } from '../stage/bridge';
import { addAct } from '../stage';

const clamp01 = gsap.utils.clamp(0, 1);

const scene: Scene = (host, env) => {
  const root = host.closest<HTMLElement>('.paper')!;
  const sections = gsap.utils.toArray<HTMLElement>('[data-shot]', root);
  paper.side = env.dir;
  gsap.matchMedia().add({ wide: '(min-width: 1024px)', small: '(max-width: 1023px)' }, (ctx) => {
    paper.compact = !ctx.conditions!.wide;
  });
  if (env.tier === 'css') return;

  let tops: number[] = [], heights: number[] = [];
  const measure = () => {
    const y = window.scrollY;
    tops = sections.map((s) => s.getBoundingClientRect().top + y);
    heights = sections.map((s) => Math.max(s.offsetHeight, 1));
  };
  const update = () => {
    if (!tops.length) measure();
    const vh = window.innerHeight, y = window.scrollY;
    const line = y + Math.min(y, vh * 0.5);                  // the top of the page, then the middle of the screen
    let i = 0;
    tops.forEach((top, k) => { if (line >= top) i = k; });
    paper.shot = i + Math.min(clamp01((line - tops[i]) / heights[i]), 0.999);
  };
  ScrollTrigger.create({
    trigger: root, start: 'top bottom', end: 'bottom top',
    onUpdate: update, onRefresh: () => { measure(); update(); },
  });

  if (import.meta.env.DEV) {                                 // stills for the css tier: scripts/render-paper-still.mjs
    const still = new URLSearchParams(location.search).get('paper') as PaperPoster | null;
    if (still && still !== 'finale') { document.documentElement.classList.add('is-poster'); paper.poster = still; }
  }
  void addAct(env, async () => (await import('../stage/acts/paper')).createPaperAct(host, 'journey'));
};
export default scene;
