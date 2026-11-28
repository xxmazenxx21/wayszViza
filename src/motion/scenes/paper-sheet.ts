/**
 * Consultation (brief v3 §12) — the application sheet of the paper world (views/ConsultationPage.astro). On load the
 * heading rises by words (never characters: Arabic), and the sheet is laid on the desk: it slides up from a slight
 * tilt and settles flat over the two blank sheets under it. Transforms only — the sheet and its text are never hidden
 * (LCP), so the form is readable at once. The parts of the sheet («بياناتك · رحلتك · …») draw their rule once as they
 * come into view. DOM + GSAP, no WebGL. Success / error feedback: the form-flight scene on the same root.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';

const scene: Scene = (root, env) => {
  const title = root.querySelector<HTMLElement>('.consult__title');
  const sheet = root.querySelector<HTMLElement>('.sheet');
  if (!title || !sheet) return;

  const words = SplitText.create(title, { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, delay: 0.1 });

  gsap.fromTo(sheet,
    { y: 70, rotation: 1.6 * env.dir, transformPerspective: 1200, rotationX: 8, transformOrigin: '50% 0%' },
    { y: 0, rotation: 0, rotationX: 0, duration: 1.4, ease: 'expo.out', delay: 0.15, clearProps: 'transform' });

  // each part's rule draws from the reading side as the part comes into view
  gsap.utils.toArray<HTMLElement>('.part__title', root).forEach((h) => {
    gsap.fromTo(h, { '--rule': 0 }, {
      '--rule': 1, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: h, start: 'top 88%', once: true },
    });
  });
};
export default scene;
