/**
 * Visa Service Details — «كيف نساعد؟» (views/visa-detail/Help.astro): the help items ARE a sequence, so they are a short
 * numbered route. No pin, no sticky (the heading column sticks with CSS on wide screens).
 * The route line fills with the scroll (clip-path, scrubbed) and a point of light rides its head; each step lights
 * (.is-on) when the light reaches its number. The heading rises by words once. No JS: the whole route is lit.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';

const scene: Scene = (root) => {
  const route = root.querySelector<HTMLElement>('.ahelp__route')!;
  const fill = root.querySelector<HTMLElement>('.ahelp__fill')!;
  const line = root.querySelector<HTMLElement>('.ahelp__line')!;
  const head = root.querySelector<HTMLElement>('.ahelp__spark')!;
  const steps = gsap.utils.toArray<HTMLElement>('.ahelp__step', root);
  const nums = steps.map((s) => s.querySelector<HTMLElement>('.ahelp__num')!);
  root.classList.add('is-scrub');

  const words = SplitText.create(root.querySelector('.ahelp__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: root, start: 'top 70%', once: true } });
  gsap.fromTo(steps, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, scrollTrigger: { trigger: route, start: 'top 80%', once: true } });

  // where each number sits along the line (0…1), measured on every refresh (a step's offsetParent is the route)
  let at: number[] = [];
  let length = 1;
  const measure = () => {
    length = Math.max(line.offsetHeight, 1);
    at = nums.map((el) => (el.offsetTop + el.offsetHeight / 2 + (el.offsetParent as HTMLElement).offsetTop - line.offsetTop) / length);
  };
  const setHead = gsap.quickSetter(head, 'y', 'px');
  ScrollTrigger.create({
    trigger: line, start: 'top 62%', end: 'bottom 62%', scrub: 0.4,
    onRefresh: measure,
    onUpdate: (self) => {
      const p = self.progress;
      fill.style.clipPath = `inset(0 0 ${((1 - p) * 100).toFixed(2)}% 0)`;
      setHead(p * length);
      head.classList.toggle('is-on', p > 0.002 && p < 0.998);
      steps.forEach((s, i) => s.classList.toggle('is-on', p >= (at[i] ?? 1) - 0.01));
    },
  });
  measure();
};
export default scene;
