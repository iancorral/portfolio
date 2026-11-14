// Loads every page and folder with the production build and reports any Content Security Policy violation.
import { chromium, webkit } from 'playwright';

const base = process.env.BASE_URL ?? 'http://localhost:4322/';
let problems = 0;
for (const [name, engine, opts] of [
  ['chromium', chromium, {}],
  ['webkit', webkit, {}],
]) {
  const browser = await engine.launch({ headless: true, ...opts });
  for (const reducedMotion of ['no-preference', 'reduce']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion });
    await ctx.addInitScript(() => {
      window.__csp = [];
      document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI} ${e.sample || ''}`.slice(0, 160)));
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });

    await page.goto(base, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const meta = await page.evaluate(() => document.querySelector('meta[http-equiv="content-security-policy"]')?.content ?? '');
    for (const id of ['projects', 'experience', 'services', 'about', 'contact', 'home']) {
      await page.evaluate((v) => document.querySelector(`[data-ear="${v}"]`).click(), id);
      await page.waitForTimeout(1300);
    }
    await page.click('[data-theme-toggle]');
    await page.waitForTimeout(600);
    const portfolio = await page.evaluate(() => ({ csp: window.__csp, theme: document.documentElement.dataset.theme, ready: document.documentElement.classList.contains('ready'), folder: document.documentElement.dataset.folder }));

    await page.goto(base + 'servicios', { waitUntil: 'load' });
    await page.waitForTimeout(800);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(800);
    const servicios = await page.evaluate(() => ({ csp: window.__csp, js: document.documentElement.classList.contains('sv-js') }));

    const all = [...portfolio.csp, ...servicios.csp];
    const ok = all.length === 0 && errors.length === 0 && portfolio.ready && portfolio.theme === 'dark' && servicios.js;
    if (!ok) problems++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} (${reducedMotion})`, ok ? '' : JSON.stringify({ all, errors, portfolio, servicios }));
    if (name === 'chromium' && reducedMotion === 'reduce') console.log('meta CSP:', meta.slice(0, 400));
    await ctx.close();
  }
  await browser.close();
}
console.log(problems ? `${problems} run(s) with problems` : 'No CSP violations or script errors');
process.exitCode = problems ? 1 : 0;
