/**
 * Visa Service Details — «المستندات والمعلومات المطلوبة مبدئيًا» (views/visa-detail/Documents.astro). No pin.
 * The list is a checklist on a light sheet that ticks itself off with the scroll (.is-done → the check draws, CSS),
 * reversible; when the last item is ticked the only seal of the page lands ONCE — «ملف جاهز» / "File ready" (never an
 * "approved" stamp: we prepare files, the embassy decides) — with a small impact: the sheet gives under it.
 * No JS: every item ticked, the seal shown.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';

const scene: Scene = (root) => {
  const q = gsap.utils.selector(root);
  const items = gsap.utils.toArray<HTMLElement>('.adoc', root);
  const list = root.querySelector<HTMLElement>('.adocs__list')!;
  root.classList.add('is-scrub');

  const words = SplitText.create(root.querySelector('.adocs__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: root, start: 'top 70%', once: true } });
  gsap.fromTo(q('.adocs__sheet'), { opacity: 0, y: 60, rotation: -1.5 * (document.documentElement.dir === 'rtl' ? -1 : 1) },
    { opacity: 1, y: 0, rotation: 0, duration: 1.2, scrollTrigger: { trigger: root, start: 'top 72%', once: true } });

  gsap.set(q('.adocs__seal'), { autoAlpha: 0 });
  const seal = gsap.timeline({ paused: true })
    .fromTo(q('.adocs__seal'), { autoAlpha: 0, scale: 2.3, rotation: -32, transformOrigin: '50% 50%' },
      { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.34, ease: 'power4.in' })
    .fromTo(q('.adocs__sheet-in'), { y: 0 }, { y: 5, duration: 0.07, repeat: 1, yoyo: true, ease: 'power1.out' }, '>')
    .fromTo(q('.adocs__seal-check'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'power2.out' }, '<');

  ScrollTrigger.create({
    trigger: list, start: 'top 72%', end: 'bottom 52%', scrub: true,
    onUpdate: (self) => {
      const done = Math.floor(self.progress * (items.length + 0.4));
      items.forEach((it, i) => it.classList.toggle('is-done', i < done));
      if (done >= items.length && seal.progress() === 0 && !seal.isActive()) seal.play();
    },
  });
};
export default scene;
