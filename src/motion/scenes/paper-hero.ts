/**
 * Home — hero (views/home/Hero.astro). Sticky + scrubbed, not a pin.
 * Entrance (after the intro): the headline WORDS rise from a mask (never characters — Arabic); the lead and the
 * buttons are never hidden (LCP) and only settle a few px on a first visit.
 * Scroll: the text leaves, the cover opens (acts/paper.ts reads bridge.paper.shot from paper-thread), and the
 * alternative title takes the middle of the screen while the booklet lies down, then gives way to §1.1.
 * css tier: the still of the closed booklet drifts back a little. Fully reversible.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { introDone } from '../config';

const scene: Scene = async (root) => {
  const q = gsap.utils.selector(root);
  const title = root.querySelector<HTMLElement>('.phero__title')!;
  const firstVisit = !!document.querySelector('[data-scene~="preloader"]') && !document.documentElement.classList.contains('intro-seen');
  const split = SplitText.create(title, { type: 'words', mask: 'words', wordsClass: 'phero__word', aria: 'auto' });
  const followers = q('.phero__lead, .phero__actions > *');
  gsap.set(split.words, { yPercent: 118 });
  if (firstVisit) gsap.set(followers, { y: 26 });
  gsap.set(title, { autoAlpha: 1 });
  root.classList.add('is-scrub');

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
  })
    .to(q('.phero__content'), { y: -100, opacity: 0, duration: 0.28 }, 0.08)
    .to(q('.phero__scrim'), { opacity: 0, duration: 0.3 }, 0.12)
    .to(q('.phero__still img'), { scale: 0.9, yPercent: -6, duration: 1 }, 0)
    .fromTo(q('.phero__alt'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power1.out' }, 0.34)
    .to(q('.phero__alt'), { opacity: 0, y: -40, duration: 0.16, ease: 'power1.in' }, 0.84)
    .set({}, {}, 1);

  await introDone();
  const tl = gsap.timeline({ delay: 0.12 }).to(split.words, { yPercent: 0, duration: 1.3, stagger: 0.07 });
  if (firstVisit) tl.to(followers, { y: 0, duration: 0.9, stagger: 0.08 }, 0.3);
};
export default scene;
