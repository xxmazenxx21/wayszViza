/**
 * Home §1.5b — the booklet's back pocket (views/home/Extras.astro). DOM + GSAP only.
 * Wide screens: one sticky screen (CSS — not a pin). The five slips start inside the pocket (their tops showing above
 * its front face, slightly fanned) and leave it one after another with the scroll: each rises straight out, then
 * swings to its place in an arc above the pocket. Scrubbed, fully reversible. A focused slip brings the fan on screen.
 * Small screens: the slips come out one by one as they scroll in (a lift and a small turn that settles).
 * Only transforms + opacity; horizontal values × env.dir (the fan mirrors with the reading order).
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';
import { lenis } from '../smooth-scroll';

const scene: Scene = (root, env) => {
  const slips = gsap.utils.toArray<HTMLElement>('.pxtra__slip', root);
  const front = root.querySelector<HTMLElement>('.pxtra__pocket--front')!;
  const n = slips.length, mid = (n - 1) / 2;

  const words = SplitText.create(root.querySelector('.pxtra__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: root, start: 'top 72%', once: true } });

  gsap.matchMedia().add({ wide: '(min-width: 1024px)', small: '(max-width: 1023px)' }, (ctx) => {
    if (!ctx.conditions!.wide) {
      slips.forEach((slip, i) => {
        gsap.fromTo(slip, { y: 70, rotation: (i % 2 ? 5 : -5) * env.dir, opacity: 0 }, {
          y: 0, rotation: 0, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: slip, start: 'top 96%', end: 'top 68%', scrub: 0.4 },
        });
      });
      return;
    }

    root.classList.add('is-scrub');
    // where each slip waits: inside the pocket, its top a little above the front face, slightly fanned
    const home = slips.map(() => ({ x: 0, y: 0, out: 0 }));
    const measure = () => {
      gsap.set(slips, { clearProps: 'transform' });
      const f = front.getBoundingClientRect();
      slips.forEach((slip, i) => {
        const r = slip.getBoundingClientRect();
        const cx = f.left + f.width / 2 + (i - mid) * 16 * env.dir;
        home[i].x = cx - (r.left + r.width / 2);
        home[i].y = f.top - 70 + Math.abs(i - mid) * 10 - r.top;
        home[i].out = home[i].y - r.height * 0.55;               // straight up, clear of the pocket
      });
    };
    measure();

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true, onRefreshInit: measure },
    });
    slips.forEach((slip, i) => {
      const at = 0.1 + i * 0.13;
      const turn = (i - mid) * 4 * env.dir;                     // the fan: edges turned out, mirrored in RTL
      tl.fromTo(slip, { x: () => home[i].x, y: () => home[i].y, rotation: (i - mid) * 1.6 * env.dir, scale: 0.92 },
        { y: () => home[i].out, rotation: turn * 0.4, duration: 0.14, ease: 'power2.out' }, at)
        .to(slip, { x: 0, y: Math.abs(i - mid) * 16, rotation: turn, scale: 1, duration: 0.2, ease: 'power2.inOut' }, at + 0.12);
    });
    tl.to({}, { duration: 0.12 });                              // the fan rests before the section lets go

    // keyboard: a focused slip brings the open fan on screen
    const onFocus = () => {
      const st = tl.scrollTrigger!;
      if (st.progress > 0.86) return;
      const y = st.start + 0.92 * (st.end - st.start);
      if (lenis) lenis.scrollTo(y, { duration: 0.8 }); else window.scrollTo(0, y);
    };
    slips.forEach((s) => s.querySelector('a')?.addEventListener('focus', onFocus));
    return () => {
      root.classList.remove('is-scrub');
      slips.forEach((s) => s.querySelector('a')?.removeEventListener('focus', onFocus));
    };
  });
};
export default scene;
