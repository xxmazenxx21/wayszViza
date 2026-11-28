/**
 * Home §1.6c — «من تجارب عملائنا» (views/home/Testimonials.astro). The heading rises by words once; each postcard lands
 * as it scrolls in — a lift and a small turn that settle into its own slight tilt (scrubbed, reversible).
 * Transforms and opacity only; turns × env.dir.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';

const TILT = [-1.6, 1.2, -0.8];

const scene: Scene = (root, env) => {
  const words = SplitText.create(root.querySelector('.ptest__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: root, start: 'top 72%', once: true } });

  gsap.utils.toArray<HTMLElement>('.ptest__slot', root).forEach((slot, i) => {
    const tilt = (TILT[i % TILT.length]) * env.dir;
    gsap.fromTo(slot, { opacity: 0, y: 90, rotation: tilt * 5 }, {
      opacity: 1, y: 0, rotation: tilt, ease: 'none',
      scrollTrigger: { trigger: slot, start: 'top 98%', end: 'top 66%', scrub: 0.5 },
    });
  });
};
export default scene;
