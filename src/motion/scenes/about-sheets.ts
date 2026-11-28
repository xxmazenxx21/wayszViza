/**
 * About «قيمنا» (brief v3 §13, views/AboutPage.astro) — the five values are paper sheets laid on the desk: when the list
 * comes into view they drop in one after another from a loose, tilted pile (slightly above, turned, tipped back) and
 * settle flat, each keeping a hair of tilt like real paper. Once. Transforms + opacity only; no JS = the flat sheets.
 */
import { gsap } from 'gsap';
import type { Scene } from '../index';

const scene: Scene = (root, env) => {
  const sheets = gsap.utils.toArray<HTMLElement>(':scope > li', root);
  if (!sheets.length) return;
  const rest = [-1.2, 0.8, -0.6, 1, -0.9];   // the tilt each sheet keeps (degrees)
  gsap.set(sheets, { opacity: 0, y: -40, rotation: (i) => (6 - i * 3) * env.dir, rotationX: 18, transformPerspective: 1200, transformOrigin: '50% 0%' });
  gsap.to(sheets, {
    opacity: 1, y: 0, rotationX: 0, rotation: (i) => rest[i % rest.length] * env.dir,
    duration: 1.1, ease: 'expo.out', stagger: 0.12,
    scrollTrigger: { trigger: root, start: 'top 80%', once: true },
  });
};
export default scene;
