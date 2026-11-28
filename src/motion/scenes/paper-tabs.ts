/**
 * Home §1.5c — «ما غرض رحلتك؟» (views/home/Types.astro): the four groups become the index tabs of a paper folder.
 * ARIA tabs (WAI-ARIA Authoring Practices, automatic activation): arrows move along the tabs in the reading direction,
 * Home / End jump. Choosing a group deals its cards onto the folder one after another — each lands like a sheet laid
 * on a desk (a short drop, a small turn that settles). The first deal plays once when the section comes into view.
 * Without JS (or if this scene fails) the page keeps every group in turn with its heading.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';

const scene: Scene = (root, env) => {
  const list = root.querySelector<HTMLElement>('[role="tablist"]')!;
  const tabs = gsap.utils.toArray<HTMLButtonElement>('[role="tab"]', root);
  const panels = gsap.utils.toArray<HTMLElement>('.ptypes__panel', root);
  let current = 0;

  panels.forEach((p, i) => {
    p.setAttribute('role', 'tabpanel');
    p.setAttribute('aria-labelledby', tabs[i].id);
    p.tabIndex = 0;
    p.hidden = i !== current;
  });
  list.hidden = false;
  root.classList.add('is-tabs');

  const deal = (panel: HTMLElement) => {
    const cards = panel.querySelectorAll<HTMLElement>('.ptype');
    gsap.fromTo(cards, { opacity: 0, y: 46, rotation: (i: number) => (i % 2 ? 2.4 : -2.4) * env.dir },
      { opacity: 1, y: 0, rotation: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', overwrite: true });
  };

  let refresh = 0;
  const select = (i: number, focus: boolean) => {
    if (i === current) { if (focus) tabs[i].focus(); return; }
    tabs.forEach((tab, k) => { tab.setAttribute('aria-selected', String(k === i)); tab.tabIndex = k === i ? 0 : -1; });
    panels[current].hidden = true;
    panels[i].hidden = false;
    current = i;
    if (focus) tabs[i].focus();
    deal(panels[i]);
    // the folder's height changed: the sections below must measure again (once the deal has started)
    window.clearTimeout(refresh);
    refresh = window.setTimeout(() => ScrollTrigger.refresh(), 120);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, false));
    tab.addEventListener('keydown', (e) => {
      const n = tabs.length;
      const step = e.key === 'ArrowRight' ? env.dir : e.key === 'ArrowLeft' ? -env.dir : 0;
      let to = -1;
      if (step) to = (current + step + n) % n;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = n - 1;
      if (to < 0) return;
      e.preventDefault();
      select(to, true);
    });
  });

  // once in view: the heading rises by words, the tabs come up, the first group is dealt
  const words = SplitText.create(root.querySelector('.ptypes__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  const first = panels[current].querySelectorAll<HTMLElement>('.ptype');
  gsap.set(first, { opacity: 0 });
  gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 70%', once: true } })
    .fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07 })
    .fromTo(tabs, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06 }, 0.15)
    .add(() => { if (panels[current].querySelector('.ptype') === first[0]) deal(panels[current]); else gsap.set(first, { opacity: 1 }); }, 0.35);
};
export default scene;
