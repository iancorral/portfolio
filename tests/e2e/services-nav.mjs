// Services navbar on phones: every section must show up as the current tab, fully visible in the strip.
import { chromium, webkit, devices } from 'playwright';
const base = process.env.BASE_URL ?? 'http://localhost:4322/';
const out = process.env.TEST_OUTPUT ?? 'tests/.output';
let fails = 0;
for (const [engineName, engine, opts] of [['chromium', chromium, {}], ['webkit', webkit, {}]]) {
  const browser = await engine.launch({ headless: true, ...opts });
  for (const name of ['iPhone SE', 'iPhone 15', 'Pixel 7', 'Small 320', 'iPad Mini', 'Desktop']) {
    const d = name === 'Small 320' ? { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
      : name === 'Desktop' ? { viewport: { width: 1440, height: 900 } } : (({ defaultBrowserType, ...rest }) => rest)(devices[name]);
    const page = await (await browser.newContext({ ...d })).newPage();
    await page.goto(`${base}servicios`, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const results = [];
    for (const id of ['que-hago', 'trabajos', 'como', 'preguntas', 'cotizar']) {
      // Tap the section's link like a person would. Cotizar is the separate button.
      const selector = id === 'cotizar' ? '.sv-top__cta' : `.sv-nav a[href="#${id}"]`;
      await page.evaluate((sel) => { const a = document.querySelector(sel); a.scrollIntoView({ inline: 'nearest', block: 'nearest' }); a.click(); }, selector);
      await page.waitForTimeout(1400);
      const r = await page.evaluate((s) => {
        const top = document.querySelector('[data-top]');
        const strip = document.querySelector('.sv-nav');
        const current = top.querySelector('[aria-current="true"]');
        const tb = top.getBoundingClientRect();
        let fullyVisible = false;
        if (current) {
          const box = current.getBoundingClientRect();
          const area = current.closest('.sv-nav') ? strip.getBoundingClientRect() : tb;
          fullyVisible = box.left >= area.left - 1 && box.right <= area.right + 1 && box.width > 0;
        }
        return { want: s, got: current?.hash ?? null, fullyVisible, blue: top.classList.contains('is-scrolled'), barTop: Math.round(tb.top), links: strip ? strip.querySelectorAll('a').length : 0, stripVisible: strip && getComputedStyle(strip).display !== 'none', hScroll: document.documentElement.scrollWidth - innerWidth };
      }, id);
      const ok = r.got === `#${id}` && r.fullyVisible && r.blue && r.barTop === 0 && r.stripVisible && r.hScroll <= 0;
      if (!ok) { fails++; results.push(`FAIL ${JSON.stringify(r)}`); }
      if (id === 'como' && ['iPhone 15', 'Small 320'].includes(name)) await page.screenshot({ path: `${out}/svnav-${engineName}-${name.replace(/\W+/g, '-')}.png`, clip: { x: 0, y: 0, width: d.viewport.width, height: 260 } });
    }
    console.log(`${engineName} · ${name}: ${results.length ? results.join(' ') : 'all 5 sections OK'}`);
  }
  await browser.close();
}
console.log(fails ? `${fails} failures` : 'navbar OK everywhere');
process.exitCode = fails ? 1 : 0;
