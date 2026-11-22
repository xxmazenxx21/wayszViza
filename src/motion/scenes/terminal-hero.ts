/**
 * Visa Services — hero (views/visa-services/Hero.astro). Sticky + scrubbed, not a pin.
 * Entrance: the title WORDS rise from a mask (never characters — Arabic); the intro is the LCP and is never hidden.
 * Scroll: the text leaves, the glass doors slide open and the camera glides in (bridge.terminal.light; the walk itself
 * comes from terminal-thread). css tier: the still of the terminal drifts closer. Fully reversible.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { introDone } from '../config';
import { terminal } from '../stage/bridge';

const scene: Scene = async (root) => {
  const q = gsap.utils.selector(root);
  const title = root.querySelector<HTMLElement>('.thero__title')!;
  const split = SplitText.create(title, { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' });
  gsap.set(split.words, { yPercent: 118 });
  gsap.set(title, { autoAlpha: 1 });
  root.classList.add('is-scrub');

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.5,
      onUpdate: (self) => { terminal.light = self.progress; },
    },
  })
    .to(q('.thero__content'), { y: -90, opacity: 0, duration: 0.3 }, 0.1)
    .to(q('.thero__scrim'), { opacity: 0.35, duration: 0.4 }, 0.15)
    .to(q('.thero__still img'), { scale: 1.12, duration: 1 }, 0)
    .set({}, {}, 1);

  await introDone();
  gsap.to(split.words, { yPercent: 0, duration: 1.3, stagger: 0.08, delay: 0.1 });
};
export default scene;
