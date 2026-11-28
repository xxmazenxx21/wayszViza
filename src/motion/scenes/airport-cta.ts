/**
 * Visa Services §2.4 (views/visa-services/Cta.astro). Sticky + scrubbed, not a pin.
 * The end of the walk: a big terminal window at sunset; scrolling, a plane rolls down the runway and lifts off (the
 * takeoff video of motion/reel.ts, drawn by the act `airport` in this section's own stage host — mode finale, with the
 * window mullions — or by our 2D canvas behind CSS mullions on the css tier / until the stage draws). The call rises as
 * the plane leaves the ground (or at once if its link gets keyboard focus). Magnetic button (global). Reversible except
 * the one-time entrance of the text.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { airport } from '../stage/bridge';
import { addAct, getStage } from '../stage';
import { getAirportReel, paintCover } from '../reel';

const TAKEOFF = 3;                                           // the chapter (AIRPORT_CHAPTERS)
const clamp01 = gsap.utils.clamp(0, 1);

const scene: Scene = (root, env) => {
  const q = gsap.utils.selector(root);
  const host = root.querySelector<HTMLElement>('.tcta__stage')!;
  const view = root.querySelector<HTMLElement>('.tcta__sticky')!;
  const canvas = root.querySelector<HTMLCanvasElement>('.tcta__canvas')!;
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const reel = getAirportReel();
  const F = airport.finale;
  F.aChapter = TAKEOFF;
  root.classList.add('is-scrub');

  // ---------- the call ----------
  const words = SplitText.create(root.querySelector('.tcta__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.set(words, { yPercent: 118 });
  gsap.set(q('.tcta__lead, .tcta__btn'), { opacity: 0, y: 26 });
  const reveal = gsap.timeline({ paused: true })
    .to(words, { yPercent: 0, duration: 1.1, stagger: 0.07 })
    .to(q('.tcta__lead, .tcta__btn'), { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.25);
  const show = () => { if (!reveal.isActive() && reveal.progress() === 0) reveal.play(); };
  root.addEventListener('focusin', show);
  ScrollTrigger.create({ trigger: root, start: 'top 15%', once: true, onEnter: show });   // short screens: never wait too long

  // ---------- the takeoff ----------
  ScrollTrigger.create({ trigger: root, start: 'top 300%', once: true, onEnter: () => reel.load(TAKEOFF) });
  let p = 0, painted = '';
  const paint = () => {
    const a = reel.get(TAKEOFF);
    F.a = a?.video ?? null; F.aId = a ? a.id : -1; F.push = p;
    if (host.classList.contains('is-drawing') || !a) return;
    const key = `${F.aId}|${canvas.width}`;
    if (key === painted) return;                               // nothing changed: no redraw
    painted = key;
    paintCover(ctx, a.video);
    root.classList.add('is-painted');
  };
  reel.onFrame(paint);
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);     // the footage at the device pixel ratio (cap 2)
    canvas.width = Math.round(view.clientWidth * dpr);
    canvas.height = Math.round(view.clientHeight * dpr);
    painted = '';
    paint();
  };
  new ResizeObserver(resize).observe(view);
  ScrollTrigger.create({
    trigger: root, start: 'top 80%', end: 'bottom bottom',
    onUpdate: (self) => {
      p = self.progress;
      reel.seek(TAKEOFF, clamp01((p - 0.06) / 0.88));
      paint();
      if (p > 0.42) show();
    },
  });

  // the finale act is built in idle time after the stage boots, so nothing compiles while the visitor scrolls the journey
  const idle = () => new Promise<void>((resolve) => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => resolve(), { timeout: 2500 }); else setTimeout(resolve, 900);
  });
  void getStage(env).then(async (stage) => {
    if (!stage) return;
    await idle(); await idle();
    void addAct(env, async () => (await import('../stage/acts/airport')).createAirportAct(host, 'finale', env.desktop));
  });
};
export default scene;
