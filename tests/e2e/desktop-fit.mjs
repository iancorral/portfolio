// Monitor sizes: every portfolio folder must fit one screen with no scrolling, overflow or text bleeding out.
import { chromium } from 'playwright';
import path from 'node:path';

const base = process.env.BASE_URL ?? 'http://localhost:4322/';
const out = process.env.TEST_OUTPUT ?? 'tests/.output';
const ids = ['home', 'projects', 'experience', 'services', 'about', 'contact'];
const sizes = [[1280, 593], [1366, 625], [1366, 768], [1440, 780], [1440, 900], [1536, 730], [1680, 920], [1920, 950], [1920, 1080], [2560, 1300], [3440, 1300], [1024, 700], [1200, 900], [1080, 1700]];
let failed = 0;
const browser = await chromium.launch({ headless: true });

for (const [width, height] of sizes) {
  const c = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  const page = await c.newPage();
  page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 200)));
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(200);
  const problems = [];
  let rem = 0;
  for (const id of ids) {
    await page.evaluate((v) => document.querySelector(`[data-ear="${v}"]`).click(), id);
    await page.waitForTimeout(40);
    const tabs = await page.locator(`#${id} [data-file-tab]`).count();
    for (let t = 0; t < Math.max(tabs, 1); t++) {
      if (tabs) {
        await page.locator(`#${id} [data-file-tab]`).nth(t).click();
        await page.waitForTimeout(30);
      }
      const r = await page.evaluate((folder) => {
        const panel = document.getElementById(folder);
        const paper = panel.querySelector('.paper.is-current');
        const content = panel.querySelector('[data-content]');
        const inner = paper || content;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const fontPx = parseFloat(getComputedStyle(document.body).fontSize);
        const bleeding = [...panel.querySelectorAll('h2, h3, .ear__label, .card, .file-tab__title')]
          .filter((e) => e.offsetParent !== null && e.scrollWidth > e.clientWidth + 2)
          .map((e) => e.textContent.trim().slice(0, 18));
        const side = panel.querySelector('.folder__side');
        return {
          fit: matchMedia('(min-width: 1000px) and (min-height: 540px)').matches,
          pageScroll: document.documentElement.scrollHeight - innerHeight,
          paperOver: paper ? paper.scrollHeight - paper.clientHeight : 0,
          sideOver: side ? side.scrollHeight - side.clientHeight : 0,
          contentOver: !paper ? content.scrollHeight - content.clientHeight : 0,
          hOver: document.documentElement.scrollWidth - innerWidth,
          bleeding,
          rem, fontPx,
        };
      }, id);
      rem = r.rem;
      const label = tabs ? `${id}#${t}` : id;
      if (r.fit && (r.pageScroll > 1 || r.paperOver > 1 || r.sideOver > 1 || r.contentOver > 1)) problems.push(`${label}: page ${r.pageScroll} paper ${r.paperOver} side ${r.sideOver} content ${r.contentOver}`);
      if (r.hOver > 0) problems.push(`${label}: h-overflow ${r.hOver}`);
      if (r.bleeding.length) problems.push(`${label}: bleed ${r.bleeding.join('|')}`);
      if (r.fit !== undefined && !r.fit && t === 0 && id === 'home') problems.push('(scroll mode)');
      if ((width === 1440 && height === 900) || (width === 1366 && height === 625) || (width === 2560 && height === 1300)) {
        await page.screenshot({ path: path.join(out, `f-${width}x${height}-${label.replace('#', '-')}.png`) });
      }
    }
  }
  if (problems.length) failed++;
  console.log(`${problems.length ? 'FAIL' : 'PASS'}  ${width}x${height}  rem=${rem.toFixed(1)}  ${problems.join(' ; ')}`);
  await c.close();
}
await browser.close();
console.log(`\n${sizes.length - failed}/${sizes.length} sizes fit`);
process.exitCode = failed ? 1 : 0;
