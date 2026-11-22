/**
 * Visa Services — the thread of «مطار الضوء» (views/VisaServicesPage.astro). Lives on the ONE stage host of hero →
 * «لست متأكدًا…», which CSS keeps on screen. It only measures: which section the middle of the screen is in and how far
 * through it (bridge.terminal.shot → the camera walk of acts/terminal.ts). The section scenes write the rest
 * (terminal-hero → light, terminal-rests → counter / counterAct · gate / gateAct). A pure function of the scroll
 * position, so scrolling back walks back out through the doors. It also writes the mouse (a breath of the camera).
 * css tier (no WebGL): nothing to draw — the stills show.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Scene } from '../index';
import { terminal, type TerminalPoster } from '../stage/bridge';
import { addAct } from '../stage';

const clamp01 = gsap.utils.clamp(0, 1);

const scene: Scene = (host, env) => {
  const root = host.closest<HTMLElement>('.term')!;
  const sections = gsap.utils.toArray<HTMLElement>('[data-shot]', root);
  terminal.side = env.dir;
  gsap.matchMedia().add({ wide: '(min-width: 1024px)', small: '(max-width: 1023px)' }, (ctx) => {
    terminal.compact = !ctx.conditions!.wide;
  });
  if (env.tier === 'css') return;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    terminal.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    terminal.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

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
    terminal.shot = i + Math.min(clamp01((line - tops[i]) / heights[i]), 0.999);
  };
  ScrollTrigger.create({
    trigger: root, start: 'top bottom', end: 'bottom top',
    onUpdate: update, onRefresh: () => { measure(); update(); },
  });

  if (import.meta.env.DEV) {                                 // stills for the css tier: scripts/render-terminal-still.mjs
    const still = new URLSearchParams(location.search).get('terminal') as TerminalPoster | null;
    if (still && still !== 'finale') { document.documentElement.classList.add('is-poster'); terminal.poster = still; }
  }
  void addAct(env, async () => (await import('../stage/acts/terminal')).createTerminalAct(host, 'journey'));
};
export default scene;
