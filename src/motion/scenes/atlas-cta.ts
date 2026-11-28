/**
 * Visa Service Details — the call (views/visa-detail/Cta.astro). Sticky + scrubbed, not a pin.
 * The limb of the night Earth in this section's own stage host (act `atlas`, mode finale; the stage hands the one canvas
 * over): scrolling, a plane of light climbs from Egypt along a high route over the horizon toward the page's first
 * destination (bridge.atlas.takeoff). The call rises as the plane leaves the ground (or at once if its link gets
 * keyboard focus). Magnetic button (global). css tier: the still drifts closer. Reversible except the text's entrance.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { atlas, readAtlasConfig } from '../stage/bridge';
import { addAct, getStage } from '../stage';

const scene: Scene = (root, env) => {
  const q = gsap.utils.selector(root);
  const host = root.querySelector<HTMLElement>('.acta__stage')!;
  root.classList.add('is-scrub');
  const words = SplitText.create(root.querySelector('.acta__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.set(words, { yPercent: 118 });
  gsap.set(q('.acta__lead, .acta__btn'), { opacity: 0, y: 26 });
  const reveal = gsap.timeline({ paused: true })
    .to(words, { yPercent: 0, duration: 1.1, stagger: 0.07 })
    .to(q('.acta__lead, .acta__btn'), { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.25);
  const show = () => { if (!reveal.isActive() && reveal.progress() === 0) reveal.play(); };
  root.addEventListener('focusin', show);

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root, start: 'top 70%', end: 'bottom bottom', scrub: 0.6,
      onUpdate: (self) => { atlas.takeoff = self.progress; if (self.progress > 0.42) show(); },
    },
  }).to(q('.acta__still img'), { scale: 1.08, duration: 1 }, 0);
  ScrollTrigger.create({ trigger: root, start: 'top 15%', once: true, onEnter: show });   // short screens: never wait too long

  if (import.meta.env.DEV && new URLSearchParams(location.search).get('atlas') === 'finale') {
    document.documentElement.classList.add('is-poster');    // scripts/render-atlas-still.mjs
    atlas.poster = 'finale';
  }
  // the finale act is built in idle time right after the stage boots (it shares the journey act's world: the map, the
  // land mask, every geometry, and the same programs, already compiled) — nothing is built while the visitor scrolls
  const idle = () => new Promise<void>((resolve) => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => resolve(), { timeout: 2500 }); else setTimeout(resolve, 900);
  });
  const config = readAtlasConfig(host);
  void getStage(env).then(async (stage) => {
    if (!stage) return;
    await idle(); await idle();
    void addAct(env, async () => {
      const { loadBorders } = await import('../../lib/borders');
      const borders = await loadBorders();
      const { createAtlasAct } = await import('../stage/acts/atlas');
      return createAtlasAct(host, borders, config, 'finale');
    });
  });
};
export default scene;
