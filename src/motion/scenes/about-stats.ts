/**
 * About «الأرقام والشهادات» (brief v3 §13) — each counter counts up from zero once, when the row comes into view
 * (Latin digits, thousands separators). The real value is in the HTML (no JS = the final numbers).
 */
import { gsap } from 'gsap';
import type { Scene } from '../index';

const scene: Scene = (root) => {
  const fmt = new Intl.NumberFormat('en-US');
  const values = gsap.utils.toArray<HTMLElement>('.stat__value', root);
  values.forEach((el) => {
    const target = Number(el.dataset.value) || 0;
    const n = { v: 0 };
    el.textContent = fmt.format(0);
    gsap.to(n, {
      v: target, duration: 1.8, ease: 'power3.out',
      onUpdate: () => { el.textContent = fmt.format(Math.round(n.v)); },
      scrollTrigger: { trigger: root, start: 'top 82%', once: true },
    });
  });
  gsap.fromTo(gsap.utils.toArray<HTMLElement>(':scope > li', root), { y: 24, opacity: 0 }, {
    y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: 'expo.out',
    scrollTrigger: { trigger: root, start: 'top 82%', once: true },
  });
};
export default scene;
