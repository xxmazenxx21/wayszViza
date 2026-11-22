/**
 * Re-renders the stills of «مطار الضوء» (Visa Services) — what the page shows on the css tier (no WebGL) and without
 * JS. Each is a screenshot of our own WebGL scene (act `terminal`) in a poster state (dev URL `?terminal=…`): no pointer,
 * the camera centred. Run it again whenever the palette or the act change:
 *   npm run dev      then      node scripts/render-terminal-still.mjs [base] [--only=hero,s1]   (needs ffmpeg for the WebP)
 *   (no Google Chrome? QA_CHROME=<path to Playwright chromium> node scripts/render-terminal-still.mjs)
 */
import { launch } from './qa-browser.mjs';
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith('--')) ?? 'http://localhost:4321';
const only = args.find((a) => a.startsWith('--only='))?.slice(7).split(',');
const square = (poster) => [`terminal-${poster}`, poster, 1000, 1000, 64, '.term__stage'];
const stills = [
  // file, poster, width, height, quality, stage host
  ['terminal-hero', 'hero', 1600, 1000, 62, '.term__stage'],        // wide: full screen behind the hero text
  ['terminal-hero-m', 'hero', 780, 1688, 56, '.term__stage'],       // tall: fills a phone screen behind the text
  ...['s1', 's2', 's3', 's4', 'g1', 'g2', 'g3', 'g4', 'g5', 'info'].map(square),
  ['terminal-finale', 'finale', 1000, 1000, 64, '.tcta__stage'],
].filter(([file, poster]) => !only || only.includes(poster) || only.includes(file));

const browser = await launch();
for (const [file, poster, width, height, quality, host] of stills) {
  const png = `public/media/img/${file}.png`, webp = `public/media/img/${file}.webp`;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  await context.addInitScript(() => { try { sessionStorage.setItem('waysz-intro', '1'); } catch {} });
  const page = await context.newPage();
  await page.goto(`${base}/en/visa-services/?tier=full&terminal=${poster}`, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.mouse.move(200, 200); await page.mouse.move(240, 230);        // first interaction → the stage loads
  await page.addStyleTag({ content: '.site-header, .cursor, .flight-rail, .wa-float, .stage-host ~ * { visibility: hidden !important }' });
  if (poster === 'finale') await page.locator('.tcta').scrollIntoViewIfNeeded();
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
