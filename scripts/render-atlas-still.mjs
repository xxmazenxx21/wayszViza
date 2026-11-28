/**
 * Re-renders the stills of «خريطة الرحلة» (the Visa Service Details template) — what the pages show on the css tier
 * (no WebGL) and without JS. Each is a screenshot of our own WebGL scene (act `atlas`) in a poster state (dev URL
 * `?atlas=hero|finale`): no pointer, no drift, every route drawn, the globe centred.
 *   atlas-<slug>(-m).webp   one per category (its own destinations lit, its group's mood) — wide panorama + tall phone
 *   atlas-network(-m).webp  every service page (the calmer «network» world)
 *   atlas-finale.webp       the call of every page (the horizon and the take-off)
 * Run it again whenever the palette, the act or a page's destinations change:
 *   npm run dev      then      node scripts/render-atlas-still.mjs [base] [--only=work-visa,finale]   (needs ffmpeg)
 *   (no Google Chrome? QA_CHROME=<path to Playwright chromium> node scripts/render-atlas-still.mjs)
 */
import { launch } from './qa-browser.mjs';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync } from 'node:fs';

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith('--')) ?? 'http://localhost:4321';
const only = args.find((a) => a.startsWith('--only='))?.slice(7).split(',');
const categories = readdirSync('src/content/visas')
  .filter((f) => JSON.parse(readFileSync(`src/content/visas/${f}`, 'utf8')).kind === 'category')
  .map((f) => f.replace(/\.json$/, ''));
const NETWORK = 'visa-consultation';                       // any service page: they all share the network world

const stills = [];
for (const [slug, file] of [...categories.map((c) => [c, c]), [NETWORK, 'network']]) {
  // file, page, poster, width, height, quality, stage host
  stills.push([`atlas-${file}`, slug, 'hero', 2400, 1000, 58, '.atlas__stage']);   // wide: a panorama, the globe in the middle
  stills.push([`atlas-${file}-m`, slug, 'hero', 780, 1688, 54, '.atlas__stage']);  // tall: fills a phone screen behind the text
}
stills.push(['atlas-finale', NETWORK, 'finale', 1600, 1000, 60, '.acta__stage']);

const browser = await launch();
for (const [file, slug, poster, width, height, quality, host] of stills) {
  if (only && !only.some((o) => file === `atlas-${o}` || file.startsWith(`atlas-${o}-`) || o === poster)) continue;
  const png = `public/media/img/${file}.png`, webp = `public/media/img/${file}.webp`;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  await context.addInitScript(() => { try { sessionStorage.setItem('waysz-intro', '1'); } catch {} });
  const page = await context.newPage();
  await page.goto(`${base}/en/visa-services/${slug}/?tier=full&atlas=${poster}`, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.mouse.move(200, 200); await page.mouse.move(240, 230);        // first interaction → the stage loads
  await page.addStyleTag({ content: '.site-header, .cursor, .flight-rail, .wa-float, .stage-host ~ * { visibility: hidden !important }' });
  if (poster === 'finale') await page.locator('.acta').scrollIntoViewIfNeeded();
  await page.waitForSelector(`${host}.is-drawing`, { timeout: 30000 });
  await page.mouse.move(width / 2, height / 2);                            // pointer in the middle: no breath
  await page.waitForTimeout(2500);
  await page.locator(host).screenshot({ path: png });
  await context.close();
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-c:v', 'libwebp', '-quality', String(quality), webp]);
  rmSync(png);
  console.log(`wrote ${webp}`);
}
await browser.close();
