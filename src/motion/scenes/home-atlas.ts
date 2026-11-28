/**
 * Home — the thread of the globe behind §1.6b «وجهات نرافقك إليها» → §1.6c «من تجارب عملائنا» (views/HomePage.astro).
 * Reuses the visa template's act `atlas` through its contract only (bridge.atlas + readAtlasConfig + createAtlasAct):
 * its own stage host `.hatlas__stage` (CSS sticky), the «network» world of every destination of brief v3 §1.6b, and two
 * shots — 'destinations' (the camera rests on each region: home-destinations writes `stop`) and 'audience' (the Earth
 * steps back behind the postcards and fades to plain night before its host leaves the screen, so no edge ever shows).
 * The host's `data-dest` lists one landmark country per region FIRST (in the regions' order), then the rest — so stop k
 * = region k, and every country still gets its outline and its route from Egypt.
 * The act, the borders and the map load on the visitor's first scroll pause (or when the section is near) — never in the
 * initial load, never in the middle of a scroll. css tier: the still.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Scene } from '../index';
import { atlas, readAtlasConfig } from '../stage/bridge';
import { addAct } from '../stage';

const clamp = gsap.utils.clamp(0, 0.999);

const scene: Scene = (host, env) => {
  const root = host.closest<HTMLElement>('.hatlas')!;
  const tail = root.querySelector<HTMLElement>('[data-shot="audience"]')!;
  atlas.shots = ['destinations', 'audience'];
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

  // a pure function of the scroll position (reversible). In the tail the shot runs 0 → 0.9 exactly while the middle of
  // the screen goes from the tail's top to where the host starts to leave (the act's own exit fade ends at 0.9).
  let tailTop = 0, leave = 1;
  const measure = () => {
    const y = window.scrollY, vh = window.innerHeight;
    tailTop = tail.getBoundingClientRect().top + y;
    const bottom = root.getBoundingClientRect().bottom + y;
    leave = Math.max(bottom - vh / 2 - tailTop, 1);
  };
  const update = () => {
    const line = window.scrollY + window.innerHeight / 2;
    atlas.shot = line < tailTop ? 0.5 : 1 + clamp(((line - tailTop) / leave) * 0.9);
  };
  ScrollTrigger.create({
    trigger: root, start: 'top bottom', end: 'bottom top',
    onUpdate: update, onRefresh: () => { measure(); update(); },
  });

  // The act's one-time build (borders, land mask, routes, shaders: a few tasks of 70–150 ms under CPU 4×) runs on a
  // READING PAUSE, never mid-scroll: the first time scrolling stops once the visitor is using the page — and at the
  // latest when the section is near. Nothing of it is in the initial load (addAct waits for the first interaction).
  const config = readAtlasConfig(host);
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    ScrollTrigger.removeEventListener('scrollEnd', onPause);
    void addAct(env, async () => {
      const { loadBorders } = await import('../../lib/borders');
      const borders = await loadBorders();
      const { createAtlasAct } = await import('../stage/acts/atlas');
      return createAtlasAct(host, borders, config, 'journey');
    });
  };
  const onPause = () => { if (window.scrollY > 0) start(); };
  ScrollTrigger.addEventListener('scrollEnd', onPause);
  ScrollTrigger.create({ trigger: root, start: 'top 160%', once: true, onEnter: start });
};
export default scene;
