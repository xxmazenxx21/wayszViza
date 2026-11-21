/**
 * Home §1.1 (views/home/Help.astro). Sticky + scrubbed, not a pin.
 * The first spread of the booklet has popped up (act `paper`); scrolling fixes the three problems in turn:
 * bridge.paper.fix 0 → 3 (the missing piece slides in · the field aligns · the sign becomes a clear arrow).
 * The same three phrases in the paragraph get their accent underline as each one is fixed (.is-fixed).
 * Once in view: the heading rises by words, the paragraph settles. Fully reversible.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { paper } from '../stage/bridge';

const scene: Scene = (root) => {
  const q = gsap.utils.selector(root);
  const phrases = gsap.utils.toArray<HTMLElement>('.phelp__fix', root);
  root.classList.add('is-scrub');

  const words = SplitText.create(root.querySelector('.phelp__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 70%', once: true } })
    .fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07 })
    .fromTo(q('.phelp__text'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, 0.25);

  gsap.timeline({
    scrollTrigger: {
      trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.6,
      onUpdate: (self) => {
        const fix = gsap.utils.clamp(0, 3, ((self.progress - 0.14) / 0.74) * 3);
        paper.fix = fix;
        phrases.forEach((p, i) => p.classList.toggle('is-fixed', fix > i + 0.82));
      },
    },
  }).to(q('.phelp__still img'), { scale: 1.06, ease: 'none', duration: 1 });
};
export default scene;
