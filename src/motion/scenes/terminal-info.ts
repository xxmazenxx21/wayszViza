/**
 * Visa Services — «لست متأكدًا من نوع تأشيرتك؟» (views/visa-services/Info.astro): the information desk. No pin.
 * The camera rests at the desk (terminal-thread → shot); here, once in view, the heading rises by words and the card
 * settles. The text and the link are never hidden for long (a short entrance, opacity only).
 */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Scene } from '../index';

const scene: Scene = (root) => {
  const words = SplitText.create(root.querySelector('.tinfo__title'), { type: 'words', mask: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 60%', once: true } })
    .fromTo(words, { yPercent: 118 }, { yPercent: 0, duration: 1.1, stagger: 0.07 })
    .fromTo(root.querySelectorAll('.tinfo__text, .tinfo__link'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.2);
};
export default scene;
