/**
 * Visa Services §2.4 (views/visa-services/Cta.astro). Sticky + scrubbed, not a pin.
 * The end window of the terminal in this section's own stage host (act `terminal`, mode finale; the stage hands the one
 * canvas over). Scroll rolls the plane of light down the runway and lifts it off into the clouds (bridge.terminal.takeoff);
 * the call rises as the plane leaves the ground (or at once if its link gets keyboard focus). Magnetic button (global).
 * css tier: the still of the window drifts closer. Fully reversible except the one-time entrance of the text.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { terminal } from '../stage/bridge';
import { addAct, getStage } from '../stage';

const scene: Scene = (root, env) => {
  const q = gsap.utils.selector(root);
  const host = root.querySelector<HTMLElement>('.tcta__stage')!;
  root.classList.add('is-scrub');
  const words = SplitText.create(root.querySelector('.tcta__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.set(words, { yPercent: 118 });
  gsap.set(q('.tcta__lead, .tcta__btn'), { opacity: 0, y: 26 });
  const reveal = gsap.timeline({ paused: true })
    .to(words, { yPercent: 0, duration: 1.1, stagger: 0.07 })
    .to(q('.tcta__lead, .tcta__btn'), { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.25);
  const show = () => { if (!reveal.isActive() && reveal.progress() === 0) reveal.play(); };
  root.addEventListener('focusin', show);

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root, start: 'top 70%', end: 'bottom bottom', scrub: 0.6,
      onUpdate: (self) => { terminal.takeoff = self.progress; if (self.progress > 0.5) show(); },
    },
  }).to(q('.tcta__still img'), { scale: 1.08, duration: 1 }, 0);
  ScrollTrigger.create({ trigger: root, start: 'top 15%', once: true, onEnter: show });   // short screens: never wait too long

  if (import.meta.env.DEV && new URLSearchParams(location.search).get('terminal') === 'finale') {
    document.documentElement.classList.add('is-poster');    // scripts/render-terminal-still.mjs
    terminal.poster = 'finale';
  }
  // the finale act is built in idle time right after the stage boots (its programs are shared with the journey act,
  // already compiled), so nothing is built or compiled while the visitor scrolls through the sticky sections
  const idle = () => new Promise<void>((resolve) => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => resolve(), { timeout: 2500 }); else setTimeout(resolve, 900);
  });
  void getStage(env).then(async (stage) => {
    if (!stage) return;
    await idle(); await idle();
    void addAct(env, async () => (await import('../stage/acts/terminal')).createTerminalAct(host, 'finale'));
  });
};
export default scene;
