/**
 * Visa Service Details — hero (views/visa-detail/Hero.astro). Sticky + scrubbed, not a pin.
 * Entrance: the name's WORDS rise from a mask (never characters — Arabic); the description and the buttons are the LCP
 * and are never hidden. Meanwhile the act draws the page's routes from Egypt, one after another.
 * Scroll: the text leaves and the camera leans in (bridge.atlas.push). css tier: the still drifts closer. Reversible.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { introDone } from '../config';
import { atlas } from '../stage/bridge';

const scene: Scene = async (root) => {
  const q = gsap.utils.selector(root);
  const title = root.querySelector<HTMLElement>('.ahero__title')!;
  const split = SplitText.create(title, { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' });
  gsap.set(split.words, { yPercent: 118 });
  gsap.set(title, { autoAlpha: 1 });
  root.classList.add('is-scrub');

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.5,
      onUpdate: (self) => { atlas.push = self.progress; },
    },
  })
    .to(q('.ahero__content'), { y: -90, opacity: 0, duration: 0.34 }, 0.12)
    .to(q('.ahero__scrim'), { opacity: 0.4, duration: 0.4 }, 0.15)
    .to(q('.ahero__still img'), { scale: 1.1, duration: 1 }, 0)
    .set({}, {}, 1);

  await introDone();
  gsap.to(split.words, { yPercent: 0, duration: 1.3, stagger: 0.07, delay: 0.1 });
};
export default scene;
