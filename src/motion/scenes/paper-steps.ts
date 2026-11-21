/**
 * Home §1.6 (views/home/Steps.astro). No pin, no sticky.
 * The booklet's stitching becomes a sky-blue thread: drawn over the dashed stitch line with the scroll (DrawSVG,
 * scrubbed); each step lights (.is-on) when the thread reaches it. The heading rises by words once.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';

const scene: Scene = (root) => {
  const steps = gsap.utils.toArray<HTMLElement>('.pstep', root);
  const words = SplitText.create(root.querySelector('.psteps__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: root, start: 'top 70%', once: true } });

  gsap.fromTo(root.querySelectorAll('.psteps__thread'), { drawSVG: '0%' }, {
    drawSVG: '100%', ease: 'none',
    scrollTrigger: {
      trigger: root.querySelector('.psteps__route'), start: 'top 72%', end: 'bottom 55%', scrub: 0.6,
      onUpdate: (self) => steps.forEach((s, i) => s.classList.toggle('is-on', self.progress >= (i / (steps.length - 1)) * 0.94 + 0.02)),
    },
  });
  gsap.fromTo(steps, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, scrollTrigger: { trigger: root, start: 'top 62%', once: true } });
};
export default scene;
