/**
 * Home §1.5e — «أكثر من تجهيز أوراق» (views/home/Why.astro): the five points are rows of one perforated sheet.
 * As each row crosses the lower part of the screen its perforation runs across from the reading side (scrubbed,
 * reversible), its icon draws itself and the text settles. The heading rises by words once (it stays beside the sheet
 * on wide screens: CSS sticky). Transforms, opacity and SVG strokes only.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';

const scene: Scene = (root) => {
  const words = SplitText.create(root.querySelector('.pwhy__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: root, start: 'top 72%', once: true } });

  gsap.utils.toArray<HTMLElement>('.pwhy__row', root).forEach((row) => {
    const perf = row.querySelector('.pwhy__perf');
    const icon = row.querySelector('.pwhy__icon path');
    const body = row.querySelector('.pwhy__body');
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: row, start: 'top 92%', end: 'top 58%', scrub: 0.5 } });
    if (perf) tl.fromTo(perf, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
    tl.fromTo(icon, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9 }, 0.1)
      .fromTo(body, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, 0.15);
  });
};
export default scene;
