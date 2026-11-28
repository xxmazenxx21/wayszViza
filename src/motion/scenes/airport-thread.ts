/**
 * Visa Services — the journey of «رحلة في المطار» (views/VisaServicesPage.astro). Lives on the ONE stage host of
 * hero → §2.2, inside the film layer that CSS keeps on screen (sticky, not a pin). A pure function of the scroll:
 *   hero (approach)  the drone glides in to the terminal over the first 66 %, then the door cut into the corridor
 *   §2.1 (corridor)  the walk along the travelators over 90 %, then the light cut into the gates
 *   §2.2 (gates)     the moving walkway through the concourse over 92 %, then the film fades into the page navy
 * It scrubs the chapter videos (motion/reel.ts) and writes the videos to show into bridge.airport.journey (the act
 * draws them); until the WebGL stage draws — and on the css tier (no WebGL2 / context lost) — it paints them on its own
 * 2D canvas at the device pixel ratio (cross-fades instead of the shader cuts).
 * Loading: before any interaction only the poster (no video); the first interaction loads the hero and the corridor,
 * then one chapter ahead of the visitor. Scrolling back walks back out through the doors.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Scene } from '../index';
import { AIRPORT_WIPE, airport } from '../stage/bridge';
import { addAct } from '../stage';
import { getAirportReel, paintCover } from '../reel';

const clamp01 = gsap.utils.clamp(0, 1);
const EVENTS = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll'] as const;

const scene: Scene = (host, env) => {
  const root = host.closest<HTMLElement>('.tt')!;
  const film = root.querySelector<HTMLElement>('.tt__film')!;
  const canvas = film.querySelector<HTMLCanvasElement>('.tt__canvas')!;
  const ctx = canvas.getContext('2d', { alpha: false })!;
  const sections = gsap.utils.toArray<HTMLElement>('[data-shot]', root);
  const reel = getAirportReel();
  const J = airport.journey;
  airport.side = env.dir;
  root.classList.add('is-film');

  let A = 0, pa = 0, B = -1, mix = 0, wipe: number = AIRPORT_WIPE.door, push = 0, exit = 0, chapter = -1;

  // ---------- loading: nothing before the first interaction (initial weight), then one chapter ahead ----------
  let awake = false;
  const wake = () => { EVENTS.forEach((e) => window.removeEventListener(e, wake)); awake = true; chapter = -1; update(); };
  if (window.scrollY > 0) queueMicrotask(wake); else EVENTS.forEach((e) => window.addEventListener(e, wake, { passive: true }));

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    airport.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    airport.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  // ---------- scroll → film ----------
  let tops: number[] = [], spans: number[] = [];
  const measure = () => {
    const y = window.scrollY, vh = window.innerHeight;
    tops = sections.map((s) => s.getBoundingClientRect().top + y);
    spans = sections.map((s) => Math.max(s.offsetHeight - vh, 1));
  };

  function update() {
    if (!tops.length) measure();
    const y = window.scrollY;
    const local = (k: number) => clamp01((y - tops[k]) / spans[k]);
    if (y < tops[1]) {
      const h = local(0);
      A = 0; pa = clamp01(h / 0.66); B = 1; mix = clamp01((h - 0.64) / 0.36); wipe = AIRPORT_WIPE.door; push = h; exit = 0;
    } else if (y < tops[2]) {
      const s = local(1);
      A = 1; pa = clamp01(s / 0.9); B = 2; mix = clamp01((s - 0.9) / 0.1); wipe = AIRPORT_WIPE.light; push = s; exit = 0;
    } else {
      const g = local(2);
      A = 2; pa = clamp01(g / 0.92); B = -1; mix = 0; push = g; exit = clamp01((g - 0.9) / 0.1);
    }
    if (awake && A !== chapter) { chapter = A; reel.load(A); reel.load(A + 1); }
    reel.seek(A, pa);
    if (B >= 0 && mix > 0) reel.seek(B, 0);
    paint();
  }

  // ---------- videos → act / 2D canvas ----------
  let bg = '', painted = '';
  const paint = () => {
    const a = reel.get(A);
    const b = B >= 0 && mix > 0 ? reel.get(B) : null;
    J.a = a?.video ?? null; J.aId = a ? a.id * 4 + A : -1;
    J.b = b?.video ?? null; J.bId = b ? b.id * 4 + B : -1;
    J.aChapter = A; J.bChapter = Math.max(B, 0); J.mix = b ? mix : 0; J.wipe = wipe; J.push = push; J.exit = exit;
    if (host.classList.contains('is-drawing') || !a) return;   // the WebGL stage draws the film
    const key = `${J.aId}|${J.bId}|${J.mix.toFixed(3)}|${exit.toFixed(3)}|${canvas.width}`;
    if (key === painted) return;                               // nothing changed: no redraw
    painted = key;
    paintCover(ctx, a.video);
    if (b) paintCover(ctx, b.video, wipe === AIRPORT_WIPE.door ? clamp01((mix - 0.3) / 0.5) : clamp01((mix - 0.2) / 0.6));
    if (exit > 0) { ctx.globalAlpha = exit; ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.globalAlpha = 1; }
    film.classList.add('is-painted');                          // the poster steps aside (CSS)
  };
  reel.onFrame(paint);

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);     // the footage at the device pixel ratio (cap 2)
    canvas.width = Math.round(film.clientWidth * dpr);
    canvas.height = Math.round(film.clientHeight * dpr);
    bg = getComputedStyle(film).backgroundColor;
    painted = '';
    paint();
  };
  new ResizeObserver(resize).observe(film);

  ScrollTrigger.create({
    trigger: root, start: 'top bottom', end: 'bottom top',
    onUpdate: update, onRefresh: () => { measure(); update(); },
  });
  update();

  void addAct(env, async () => (await import('../stage/acts/airport')).createAirportAct(host, 'journey', env.desktop));
};
export default scene;
