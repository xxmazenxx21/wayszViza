/**
 * Visa Service Details — the thread of «خريطة الرحلة» (views/VisaDetailPage.astro). Lives on the ONE stage host of
 * hero → «لمن تناسب؟», which CSS keeps on screen. It only measures: which journey section the middle of the screen is
 * in and how far through it (bridge.atlas.shots + shot → the camera of acts/atlas.ts). The sections are optional per
 * page (types · destinations · benefits), so it hands the act their NAMES (`data-shot="hero"`…). The section scenes write
 * the rest (atlas-hero → push · atlas-destinations → stop). A pure function of the scroll position, so it reverses.
 * It also writes the mouse (a breath of the globe). css tier (no WebGL): nothing to draw — the stills show.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Scene } from '../index';
import { atlas, readAtlasConfig, type AtlasShot } from '../stage/bridge';
import { addAct } from '../stage';

const clamp01 = gsap.utils.clamp(0, 1);

const scene: Scene = (host, env) => {
  const root = host.closest<HTMLElement>('.atlas')!;
  const sections = gsap.utils.toArray<HTMLElement>('[data-shot]', root);
  atlas.shots = sections.map((s) => s.dataset.shot as AtlasShot);
  atlas.side = env.dir;
  gsap.matchMedia().add({ wide: '(min-width: 1024px)', small: '(max-width: 1023px)' }, (ctx) => {
    atlas.compact = !ctx.conditions!.wide;
  });
  if (env.tier === 'css') return;

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    atlas.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    atlas.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
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
    atlas.shot = i + Math.min(clamp01((line - tops[i]) / heights[i]), 0.999);
  };
  ScrollTrigger.create({
    trigger: root, start: 'top bottom', end: 'bottom top',
    onUpdate: update, onRefresh: () => { measure(); update(); },
  });

  if (import.meta.env.DEV && new URLSearchParams(location.search).get('atlas') === 'hero') {
    document.documentElement.classList.add('is-poster');    // stills for the css tier: scripts/render-atlas-still.mjs
    atlas.poster = 'hero';
  }
  const config = readAtlasConfig(host);
  void addAct(env, async () => {
    // one step per frame (three, the borders, the world): no long frame while the visitor reads the hero
    const { loadBorders } = await import('../../lib/borders');
    const borders = await loadBorders();
    const { createAtlasAct } = await import('../stage/acts/atlas');
    return createAtlasAct(host, borders, config, 'journey');
  });
};
export default scene;
