/**
 * Home §1.8 (views/home/Cta.astro). No pin.
 * The booklet returns closed in this section's own stage host (act `paper`, mode finale; the stage hands the one
 * canvas over from the journey host). Scroll slides the ribbon bookmark out (bridge.paper.ribbon, scrubbed); then the
 * «ملف جاهز» seal lands ONCE with a small impact (like the WaysZ stamp) and the booklet bounces (bridge.paper.seal).
 * The heading rises by words; the button is magnetic (global data-magnetic).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { paper } from '../stage/bridge';
import { addAct, getStage } from '../stage';

const scene: Scene = (root, env) => {
  const q = gsap.utils.selector(root);
  const host = root.querySelector<HTMLElement>('.pcta__stage')!;
  const words = SplitText.create(root.querySelector('.pcta__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;

  gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 62%', once: true } })
    .fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07 })
    .fromTo(q('.pcta__lead, .pcta__btn'), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.25);

  ScrollTrigger.create({
    trigger: root, start: 'top 85%', end: 'top 25%', scrub: true,
    onUpdate: (self) => { paper.ribbon = self.progress; },
  });

  gsap.set(q('.pcta__seal'), { autoAlpha: 0 });
  gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 30%', once: true } })
    .fromTo(q('.pcta__seal'), { autoAlpha: 0, scale: 2.2, rotation: -34, transformOrigin: '50% 50%' },
      { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.34, ease: 'power4.in', onComplete: () => { paper.seal++; } })
    .fromTo(q('.pcta__seal-box'), { y: 0 }, { y: 4, duration: 0.07, repeat: 1, yoyo: true, ease: 'power1.out' }, '>')
    .fromTo(q('.pcta__seal-check'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'power2.out' }, '<');

  if (import.meta.env.DEV && new URLSearchParams(location.search).get('paper') === 'finale') {
    document.documentElement.classList.add('is-poster');    // scripts/render-paper-still.mjs
    paper.poster = 'finale';
  }
  // the act is built in idle time right after the stage boots (its programs and the atlas are shared with the journey
  // act, already compiled), so nothing is built or compiled while the visitor scrolls through the scrubbed sections
  const idle = () => new Promise<void>((resolve) => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => resolve(), { timeout: 2500 }); else setTimeout(resolve, 900);
  });
  void getStage(env).then(async (stage) => {
    if (!stage) return;
    await idle(); await idle();
    void addAct(env, async () => (await import('../stage/acts/paper')).createPaperAct(host, 'finale'));
  });
};
export default scene;
