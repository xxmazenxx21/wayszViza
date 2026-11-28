/**
 * Visa Service Details — the calm sections of «خريطة الرحلة» (types · benefits · «لمن تناسب؟» · FAQ · «تابع رحلتك»).
 * Once in view the heading `[data-rise-title]` rises by words (never characters — Arabic) and the items
 * `[data-rise-item]` arrive one after another; their drawn icons (`[data-icon] path`) draw with them.
 * `data-rise="stage"` (the types): large cards come out of depth with the scroll, each one a little later than the one
 * before (scrubbed, reversible) — staged, then aligned. FAQ: closed answers are made `inert` (with JS only: without it
 * every answer is open; the `accordion` scene opens and closes them). Opacity only: nothing leaves the a11y tree.
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';

const scene: Scene = (root) => {
  root.querySelectorAll('.faq__panel').forEach((panel) => panel.setAttribute('inert', ''));
  const title = root.querySelector<HTMLElement>('[data-rise-title]');
  const items = gsap.utils.toArray<HTMLElement>('[data-rise-item]', root);
  const icons = gsap.utils.toArray<SVGPathElement>('[data-icon] path', root);
  const words = title ? SplitText.create(title, { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words : [];

  if (root.dataset.rise === 'stage') {
    gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: root, start: 'top 72%', once: true } });
    gsap.matchMedia().add({ wide: '(min-width: 1024px)', small: '(max-width: 1023px)' }, (ctx) => {
      const wide = ctx.conditions!.wide;
      items.forEach((it, i) => {
        gsap.fromTo(it,
          { opacity: 0, y: wide ? 140 + i * 70 : 90, rotationX: 28, scale: 0.92, transformPerspective: 1100, transformOrigin: '50% 100%' },
          {
            opacity: 1, y: 0, rotationX: 0, scale: 1, ease: 'none',
            scrollTrigger: { trigger: wide ? root : it, start: wide ? `top ${88 - i * 4}%` : 'top 96%', end: wide ? `top ${30 - i * 7}%` : 'top 60%', scrub: 0.6 },
          });
      });
    });
    return;
  }

  if (icons.length) gsap.set(icons, { drawSVG: '0%' });
  const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 68%', once: true } })
    .fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07 });
  if (items.length) tl.fromTo(items, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.2);
  if (icons.length) tl.to(icons, { drawSVG: '100%', duration: 1.2, stagger: 0.05, ease: 'power2.inOut' }, 0.35);
};
export default scene;
