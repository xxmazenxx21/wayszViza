/**
 * Home §1.5d — «محتار تبدأ منين؟» (views/home/Finder.astro). A short sample of the assessment tool on a stack of paper
 * question cards: on each card an answer is picked (it fills with the accent and gets its tick), the card flips up and
 * away over its top edge, the next one rises from the stack; at the end the suggestion settles on top with a small lift.
 * Plays when the section comes into view and again whenever it comes back (never while it is off screen). The heading
 * rises by words once. DOM only (transforms, opacity, a class per picked answer).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';

const scene: Scene = (root) => {
  const cards = gsap.utils.toArray<HTMLElement>('.pfind__card', root);
  const picks = cards.map((c) => c.querySelector<HTMLElement>('.is-pick'));
  const result = cards[cards.length - 1];
  root.classList.add('is-live');

  const words = SplitText.create(root.querySelector('.pfind__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: root, start: 'top 72%', once: true } });

  const reset = () => {
    picks.forEach((p) => p?.classList.remove('is-picked'));
    gsap.set(cards, { opacity: 0, y: 26, rotationX: 0, scale: 0.97, transformPerspective: 900 });
    gsap.set(cards[0], { opacity: 1, y: 0, scale: 1 });
  };
  reset();

  const tl = gsap.timeline({ paused: true, onStart: reset });
  cards.slice(0, -1).forEach((card, k) => {
    const next = cards[k + 1];
    tl.call(() => picks[k]?.classList.add('is-picked'), undefined, '+=0.9')
      .to(card, { rotationX: -72, y: -36, opacity: 0, duration: 0.7, ease: 'power3.in' }, '+=0.75')
      .to(next, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' }, '-=0.25');
  });
  tl.to(result, { scale: 1.035, duration: 0.3, ease: 'power2.out' }, '-=0.1')
    .to(result, { scale: 1, duration: 0.6, ease: 'expo.out' });

  ScrollTrigger.create({
    trigger: root, start: 'top 60%', end: 'bottom 30%',
    onEnter: () => tl.restart(), onEnterBack: () => tl.restart(),
    onLeave: () => tl.pause(), onLeaveBack: () => tl.pause(),
  });
};
export default scene;
