// Device sweep for both pages, in Chrome and in WebKit (Safari's engine).
import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.env.BASE_URL ?? 'http://localhost:4322/';
const out = process.env.TEST_OUTPUT ?? 'tests/.output';
const folders = ['home', 'projects', 'experience', 'services', 'about', 'contact'];

const phones = [
  ['iPhone SE', devices['iPhone SE']],
  ['iPhone 15', devices['iPhone 15']],
  ['iPhone 15 Pro Max', devices['iPhone 15 Pro Max']],
  ['Pixel 7', devices['Pixel 7']],
  ['Galaxy S9+', devices['Galaxy S9+']],
  ['Small Android 320', { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ['iPhone 15 landscape', devices['iPhone 15 landscape']],
  ['iPad Mini', devices['iPad Mini']],
  ['iPad Pro 11 landscape', devices['iPad Pro 11 landscape']],
];

let failures = 0;
let total = 0;
const check = (name, ok, extra = '') => {
  total++;
  if (!ok) failures++;
  if (!ok) console.log(`FAIL  ${name}${extra ? '  ' + extra : ''}`);
};

// Text that pokes past the right edge, ignoring things inside an ancestor that deliberately clips.
const audit = () => {
  const vw = document.documentElement.clientWidth;
  const clipped = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const o = getComputedStyle(p);
      if (/(hidden|clip|auto|scroll)/.test(o.overflowX) && p !== document.body && p !== document.documentElement) return true;
    }
    return false;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0;
  };
  const textEls = [...document.querySelectorAll('h1,h2,h3,h4,p,a,button,li,span,strong,dt,dd,label,summary,legend,figcaption')]
    .filter((el) => visible(el) && !el.closest('[aria-hidden="true"]') && el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const sticking = textEls.filter((el) => el.getBoundingClientRect().right > vw + 1 && !clipped(el)).map((el) => el.textContent.trim().slice(0, 28));
  const smallest = textEls.reduce((min, el) => {
    const size = parseFloat(getComputedStyle(el).fontSize);
    return size < min.size ? { size, text: el.textContent.trim().slice(0, 24) } : min;
  }, { size: 99, text: '' });
  return { hOverflow: document.documentElement.scrollWidth - vw, sticking, smallest };
};

const runAxe = async (page) => {
  if (!(await page.evaluate(() => 'axe' in window))) await page.evaluate(axeSource);
  return page.evaluate(async () => {
    const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] });
    return r.violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
  });
};

for (const [engineName, engine, opts] of [
  ['chromium', chromium, {}],
  ['webkit', webkit, {}],
]) {
  const browser = await engine.launch({ headless: true, ...opts });
  for (const [deviceName, device] of phones) {
    const { defaultBrowserType, ...descriptor } = device;
    const tag = `${engineName} · ${deviceName}`;
    const ctx = await browser.newContext({ ...descriptor, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));

    // Portfolio: every folder and every paper
    await page.goto(base, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    for (const id of folders) {
      await page.evaluate((v) => document.querySelector(`[data-ear="${v}"]`).click(), id);
      await page.waitForTimeout(80);
      const tabs = await page.locator(`#${id} [data-file-tab]`).count();
      for (let t = 0; t < Math.max(1, tabs); t++) {
        if (tabs) {
          await page.evaluate(([f, n]) => document.querySelectorAll(`#${f} [data-file-tab]`)[n].click(), [id, t]);
          await page.waitForTimeout(60);
        }
        const a = await page.evaluate(audit);
        const label = `${tag} · ${id}${tabs ? '#' + t : ''}`;
        check(`${label} no sideways scroll`, a.hOverflow <= 0, `${a.hOverflow}px`);
        check(`${label} nothing past the edge`, a.sticking.length === 0, a.sticking.join(' | '));
        check(`${label} text at least 12px`, a.smallest.size >= 12, JSON.stringify(a.smallest));
      }
    }
    const top = await page.evaluate(() => {
      const logo = document.querySelector('.brand__logo').getBoundingClientRect();
      const hangers = [...document.querySelectorAll('.hanger')].map((h) => h.getBoundingClientRect());
      const ears = [...document.querySelectorAll('.ear__label')].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent);
      return { overlap: hangers.some((h) => h.left < logo.right), offscreen: hangers.some((h) => h.right > innerWidth + 1), ears };
    });
    check(`${tag} · top bar fits`, !top.overlap && !top.offscreen, JSON.stringify(top));
    check(`${tag} · folder tabs readable`, top.ears.length === 0, top.ears.join(','));
    const portfolioAxe = await runAxe(page);
    check(`${tag} · portfolio axe (contact)`, portfolioAxe.length === 0, portfolioAxe.join(' ; '));

    // Services
    await page.goto(base + 'servicios', { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const s = await page.evaluate(audit);
    check(`${tag} · servicios no sideways scroll`, s.hOverflow <= 0, `${s.hOverflow}px`);
    check(`${tag} · servicios nothing past the edge`, s.sticking.length === 0, s.sticking.join(' | '));
    check(`${tag} · servicios text at least 12px`, s.smallest.size >= 12, JSON.stringify(s.smallest));
    const servAxe = await runAxe(page);
    check(`${tag} · servicios axe`, servAxe.length === 0, servAxe.join(' ; '));

    // The floating button must hide over the hero and the form, show elsewhere, and never cover the footer link.
    const dockAt = async (selector) => {
      await page.evaluate((sel) => document.querySelector(sel).scrollIntoView({ block: 'center' }), selector);
      await page.waitForTimeout(500);
      return page.evaluate(() => document.querySelector('[data-dock]').classList.contains('is-visible'));
    };
    check(`${tag} · dock hidden over the hero`, (await dockAt('.sv-hero .sv-actions')) === false);
    check(`${tag} · dock shown mid-page`, (await dockAt('.sv-cards')) === true);
    check(`${tag} · dock hidden over the quote form`, (await dockAt('#cotizar .sv-quote .sv-actions')) === false);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);
    const footerFree = await page.evaluate(() => {
      const link = document.querySelector('.sv-foot a');
      const r = link.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return link === hit || link.contains(hit);
    });
    check(`${tag} · dock never covers the footer link`, footerFree);
    const bar = await page.evaluate(() => {
      const top = document.querySelector('[data-top]');
      return { stuck: Math.round(top.getBoundingClientRect().top), blue: top.classList.contains('is-scrolled') };
    });
    check(`${tag} · navbar stays and turns blue below the hero`, bar.stuck === 0 && bar.blue, JSON.stringify(bar));
    const wa = await page.getAttribute('[data-dock]', 'href');
    check(`${tag} · dock opens WhatsApp`, wa.startsWith('https://wa.me/526144731147'), wa);
    check(`${tag} · no script errors`, errors.length === 0, errors.join(' | '));

    if (['iPhone SE', 'Pixel 7', 'iPhone 15 landscape', 'iPad Mini'].includes(deviceName)) {
      const slug = `${engineName}-${deviceName.replace(/\W+/g, '-')}`;
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(out, `${slug}-sv-full.png`), fullPage: true });
      await page.goto(base, { waitUntil: 'load' });
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(out, `${slug}-home.png`) });
      for (const id of ['projects', 'contact']) {
        await page.evaluate((v) => document.querySelector(`[data-ear="${v}"]`).click(), id);
        await page.waitForTimeout(150);
        await page.screenshot({ path: path.join(out, `${slug}-${id}.png`), fullPage: true });
      }
    }
    await ctx.close();
  }
  await browser.close();
}
console.log(`\n${total - failures}/${total} passed`);
process.exitCode = failures ? 1 : 0;
