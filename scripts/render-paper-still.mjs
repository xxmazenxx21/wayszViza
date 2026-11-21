/**
 * Re-renders the stills of «رحلة الورق» (Home) — what the page shows on the css tier (no WebGL) and without JS.
 * Each is a screenshot of our own WebGL scene (act `paper`) in a poster state (dev URL `?paper=…`): no pointer, no
 * sway, the camera centred. Run it again whenever the palette, the drawings or the act change:
 *   npm run dev      then      node scripts/render-paper-still.mjs [base]      (needs ffmpeg for the WebP)
 *   (no Google Chrome? QA_CHROME=<path to Playwright chromium> node scripts/render-paper-still.mjs)
 */
import { launch } from './qa-browser.mjs';
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4321';
const stills = [
  // file, poster, width, height, quality, stage host
  ['paper-hero', 'hero', 1100, 1100, 74, '.paper__stage'],         // wide: soft-edged beside the hero text
  ['paper-hero-m', 'hero', 780, 1688, 62, '.paper__stage'],        // tall: fills a phone screen behind the text
  ['paper-help', 'help', 1400, 1000, 70, '.paper__stage'],
  ['paper-s1', 's1', 1200, 900, 70, '.paper__stage'],
  ['paper-s2', 's2', 1200, 900, 70, '.paper__stage'],
  ['paper-s3', 's3', 1200, 900, 70, '.paper__stage'],
  ['paper-s4', 's4', 1200, 900, 70, '.paper__stage'],
  ['paper-finale', 'finale', 1100, 1100, 72, '.pcta__stage'],
];
const browser = await launch();
for (const [file, poster, width, height, quality, host] of stills) {
  const png = `public/media/img/${file}.png`, webp = `public/media/img/${file}.webp`;
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  await context.addInitScript(() => { try { sessionStorage.setItem('waysz-intro', '1'); } catch {} });
  const page = await context.newPage();
  await page.goto(`${base}/en/?tier=full&paper=${poster}`, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.mouse.move(200, 200); await page.mouse.move(240, 230);        // first interaction → the stage loads
  await page.addStyleTag({ content: '.site-header, .cursor, .flight-rail, .wa-float, .stage-host ~ * { visibility: hidden !important }' });
  if (poster === 'finale') await page.locator('.pcta').scrollIntoViewIfNeeded();
  await page.waitForSelector(`${host}.is-drawing`, { timeout: 30000 });
  await page.mouse.move(width / 2, height / 2);                            // pointer in the middle: no tilt
  await page.waitForTimeout(3000);
  await page.locator(host).screenshot({ path: png });
  await context.close();
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-c:v', 'libwebp', '-quality', String(quality), webp]);
  rmSync(png);
  console.log(`wrote ${webp}`);
}
await browser.close();
