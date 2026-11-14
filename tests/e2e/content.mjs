// Content, behavior and accessibility checks for both pages: removed facts, folders, controls, quote form, FAQ, axe.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.env.BASE_URL ?? 'http://localhost:4322/';
const out = process.env.TEST_OUTPUT ?? 'tests/.output';
const ids = ['home', 'projects', 'experience', 'services', 'about', 'contact'];
const browser = await chromium.launch({ headless: true });

let failures = 0;
let total = 0;
const check = (name, ok, extra = '') => {
  total++;
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`);
};
const visiblePanels = (page) => page.evaluate(() => [...document.querySelectorAll('[data-folder-panel]')].filter((p) => getComputedStyle(p).display !== 'none').map((p) => p.id));
const clickEar = (page, id) => page.evaluate((v) => document.querySelector(`[data-ear="${v}"]`).click(), id);

async function open(opts = {}) {
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await c.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return { c, page, errors };
}

// What was asked to go away, and the facts that changed
{
  const { c, page } = await open({ javaScriptEnabled: false });
  await page.goto(base, { waitUntil: 'load' });
  const html = await page.content();
  for (const gone of ['Swapi', 'Restaurant App', 'DB-API', 'Packet Tracer', 'Pick a folder', 'side-quest', '614-473', 'In development', 'ian-corral"', '>Index<', 'Minecraft', 'SAS jobs moved from FTP to SFTP</dt>', 'at AutoZone</dt>', '#f95c38']) {
    check(`removed: ${gone}`, !html.includes(gone));
  }
  const alts = await page.locator('img').evaluateAll((els) => els.map((e) => e.alt).filter((a) => a !== 'IC Software'));
  check('only the public workshop site is pictured', alts.length === 1 && alts[0].includes('Luevano'), alts.join(' | '));
  check('full logo appears at the end', (await page.locator('#contact img[src="/logo-full.svg"]').count()) === 1);
  check('old identity is gone', !/brand__mark|cover__foot|rule__dot|crosshair|ear__num/.test(html));
  check('tools show icons', (await page.locator('.tool svg').count()) >= 20);
  check('workshop repo and site are linked', html.includes('github.com/iancorral/luevano-web') && html.includes('taller-luevano-web.vercel.app'));
  check('services folder links to the Spanish page', html.includes('href="/servicios"'));
  check('LinkedIn points to the new profile', html.includes('https://www.linkedin.com/in/iancorral/'));
  check('first tab says Hello', (await page.locator('[data-ear="home"] .ear__label').innerText()) === 'Hello');
  check('DARPE reads as delivered', html.includes('Delivered'));
  check('work in progress is mentioned', html.includes('More in progress'));
  const pdf = await page.request.get(base + 'Ian_Corral_Resume.pdf');
  check('résumé is served', pdf.ok() && (pdf.headers()['content-type'] || '').includes('pdf'));
  await c.close();
}

// axe in both themes, on every folder and paper
for (const theme of ['light', 'dark']) {
  const { c, page, errors } = await open({ reducedMotion: 'reduce' });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  if (theme === 'dark') await page.click('[data-theme-toggle]');
  await page.waitForTimeout(800);
  await page.evaluate(axeSource);
  for (const id of ids) {
    await clickEar(page, id);
    await page.waitForTimeout(700);
    const tabs = await page.locator(`#${id} [data-file-tab]`).count();
    for (let t = 0; t < Math.max(tabs, 1); t++) {
      if (tabs) {
        await page.locator(`#${id} [data-file-tab]`).nth(t).click();
        await page.waitForTimeout(60);
      }
      const res = await page.evaluate(async () => {
        const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] });
        return r.violations.map((v) => ({ id: v.id, n: v.nodes.length, sample: v.nodes.slice(0, 3).map((x) => x.target.join(' ') + ' :: ' + (x.any[0]?.message ?? '').slice(0, 120)) }));
      });
      check(`axe ${theme} ${id}${tabs ? '#' + t : ''}`, res.length === 0, res.length ? JSON.stringify(res) : '');
    }
  }
  check(`no console errors (${theme})`, errors.length === 0, errors.join(' | ').slice(0, 300));
  await c.close();
}

// Light is the default, even for a dark OS. Dark stays one click away.
{
  const { c, page } = await open({ colorScheme: 'dark' });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  check('dark OS still opens on paper', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'light');
  await page.click('[data-theme-toggle]');
  await page.waitForTimeout(900);
  check('theme toggle goes dark', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
  check('dark switch says On', (await page.getAttribute('[data-theme-toggle]', 'aria-checked')) === 'true' && (await page.locator('[data-theme-toggle] [data-state]').innerText()) === 'On');
  await page.click('[data-ear="contact"]');
  await page.waitForTimeout(1500);
  const clock = await page.locator('[data-clock]').innerText();
  check('clock shows the time in Chihuahua', /^\d{1,2}:\d{2} (am|pm) right now in Chihuahua, Mexico$/.test(clock), clock);
  await page.reload({ waitUntil: 'load' });
  check('theme choice survives reload', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
  await page.waitForTimeout(2300);
  await page.screenshot({ path: path.join(out, 'v-dark-home.png') });
  for (const id of ['projects', 'experience', 'services', 'contact']) {
    await page.click(`[data-ear="${id}"]`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(out, `v-dark-${id}.png`) });
  }
  await c.close();
}

// The desk follows the folder
{
  const { c, page } = await open();
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const deskColor = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const a = await deskColor();
  await page.click('[data-ear="projects"]');
  await page.waitForTimeout(1500);
  const b = await deskColor();
  check('background changes with the folder', a !== b, `${a} -> ${b}`);
  await c.close();
}

// Rapid tab switching, then history
{
  const { c, page, errors } = await open();
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  for (const id of ['projects', 'contact', 'about', 'experience', 'projects', 'about']) {
    await clickEar(page, id);
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(1800);
  let v = await visiblePanels(page);
  check('rapid clicks settle on one folder', v.length === 1 && v[0] === 'about', v.join(','));
  const stuck = await page.evaluate(() => [...document.querySelectorAll('[data-folder-panel], [data-content] > *')].filter((p) => p.getAttribute('style') && !p.closest('.papers') && p.id !== 'about-title').map((p) => (p.id || p.className) + ':' + p.getAttribute('style')));
  check('no leftover inline styles', stuck.length === 0, stuck.join(' ; ').slice(0, 300));
  const leftover = await page.evaluate(() => {
    const panel = document.getElementById('about');
    return { title: panel.querySelectorAll('.split-line').length, hidden: [...panel.querySelectorAll('.paper.is-current, .folder__title')].filter((e) => getComputedStyle(e).visibility === 'hidden').length, filter: getComputedStyle(panel).filter, persp: document.querySelector('[data-stack]').style.perspective };
  });
  check('open folder is fully visible and clean', leftover.title === 0 && leftover.hidden === 0 && leftover.filter === 'none' && !leftover.persp, JSON.stringify(leftover));
  const depths = await page.evaluate(() => [...document.querySelectorAll('[data-layer]')].map((l) => Math.round(parseFloat(l.style.getPropertyValue('--d')) * 100) / 100));
  check('rail depths are whole and unique', new Set(depths).size === 6 && depths.every(Number.isInteger), depths.join(','));

  await page.goBack(); await page.waitForTimeout(1500);
  v = await visiblePanels(page);
  check('back button returns to previous folder', v[0] === 'projects', `${v} ${page.url()}`);
  await page.goForward(); await page.waitForTimeout(1500);
  check('forward button works', (await visiblePanels(page))[0] === 'about');
  check('no console errors (rapid)', errors.length === 0, errors.join(' | ').slice(0, 300));
  await c.close();
}

// Returning to a folder shows everything again
{
  const { c, page } = await open();
  await page.goto(base + '#projects', { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  check('deep link opens the folder', (await visiblePanels(page))[0] === 'projects');
  await page.click('[data-ear="services"]');
  await page.waitForTimeout(1500);
  await page.click('[data-ear="projects"]');
  await page.waitForTimeout(1600);
  const st = await page.evaluate(() => {
    const p = document.querySelector('#projects .papers');
    const r = p.getBoundingClientRect();
    return { top: r.top, vis: getComputedStyle(p).visibility, transform: p.style.transform, op: getComputedStyle(document.querySelector('#projects .files')).opacity };
  });
  check('folder contents return after leaving', st.vis === 'visible' && st.op === '1' && st.top < 300, JSON.stringify(st));
  await c.close();
}

// Papers inside a folder
{
  const { c, page, errors } = await open();
  await page.goto(base + '#projects', { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  const current = () => page.evaluate(() => [...document.querySelectorAll('#projects [data-paper].is-current')].map((p) => p.dataset.paper).join());
  check('Tangible opens first', (await current()) === 'tangible');
  await page.click('#projects [data-file-tab="darpe"]');
  await page.waitForTimeout(900);
  check('file tab swaps the paper', (await current()) === 'darpe');
  check('picked file tab is marked', (await page.getAttribute('#projects [data-file-tab="darpe"]', 'aria-current')) === 'true' && (await page.getAttribute('#projects [data-file-tab="tangible"]', 'aria-current')) === null);
  for (const id of ['tangible', 'darpe', 'tangible', 'darpe']) {
    await page.evaluate((v) => document.querySelector(`#projects [data-file-tab="${v}"]`).click(), id);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(900);
  const one = await page.evaluate(() => {
    const shown = [...document.querySelectorAll('#projects [data-paper]')].filter((p) => getComputedStyle(p).display !== 'none');
    return { n: shown.length, id: shown[0]?.dataset.paper, vis: shown[0] && getComputedStyle(shown[0]).visibility, opacity: shown[0] && getComputedStyle(shown[0]).opacity };
  });
  check('rapid paper swaps settle on one visible paper', one.n === 1 && one.id === 'darpe' && one.vis === 'visible' && one.opacity === '1', JSON.stringify(one));
  check('no console errors (papers)', errors.length === 0, errors.join(' | ').slice(0, 300));
  await c.close();
}

// Demos compute the right answers
{
  const { c, page } = await open();
  await page.goto(base + '#projects', { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  const readout = () => page.locator('[data-slots-readout]').innerText();
  const lit = () => page.locator('.slot.is-valid').count();
  check('slots: manicure gives 6 starts', (await lit()) === 6 && (await readout()).startsWith('6 valid'), await readout());
  await page.click('[data-service="90"]');
  check('slots: 150 minutes fits nowhere', (await lit()) === 0 && (await readout()).startsWith('Nothing fits'), await readout());
  await page.click('[data-service="60"]');
  check('slots: gel alone gives 2 starts', (await lit()) === 2, await readout());
  await page.click('[data-service="90"]');
  check('slots: nothing picked asks for a service', (await readout()).startsWith('Pick at least'), await readout());
  await page.click('[data-service="30"]');
  await page.locator('.slot.is-booked').first().waitFor();
  const overlap = await page.locator('.slot.is-booked.is-valid').count();
  check('slots: never offers a booked time', overlap === 0);

  await page.click('#projects [data-file-tab="darpe"]');
  await page.waitForTimeout(900);
  const time = (tz) => page.locator(`[data-zones-time="${tz}"]`).innerText();
  check('zones: Oct 19 Madrid +8h', (await time('Europe/Madrid')) === 'Mon 17:00', await time('Europe/Madrid'));
  check('zones: Oct 19 New York +2h', (await time('America/New_York')) === 'Mon 11:00', await time('America/New_York'));
  await page.click('[data-zones-week="after"]');
  await page.waitForTimeout(100);
  check('zones: after the change Madrid moves', (await time('Europe/Madrid')) === 'Mon 16:00', await time('Europe/Madrid'));
  check('zones: after the change New York moves', (await time('America/New_York')) === 'Mon 10:00', await time('America/New_York'));
  check('zones: Chihuahua does not move', (await time('America/Chihuahua')) === 'Mon 09:00', await time('America/Chihuahua'));
  await page.locator('[data-zones-input]').fill('20');
  await page.waitForTimeout(100);
  check('zones: evening class rolls to Tuesday in Madrid', (await time('Europe/Madrid')) === 'Tue 03:00', await time('Europe/Madrid'));
  await c.close();
}

// Pipeline
{
  const { c, page } = await open();
  await page.goto(base + '#experience', { waitUntil: 'load' });
  await page.waitForTimeout(5200);
  check('pipeline runs to the end', (await page.locator('[data-pipe-step]:not(.is-done)').count()) === 0);
  await page.locator('[data-pipe-step]').nth(3).click();
  const note = await page.locator('[data-pipe-note]').innerText();
  check('pipeline step explains itself', note.includes('dependency audit'), note);
  await c.close();
}

// Cards on the desk
{
  const { c, page } = await open();
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(2300);
  const card = page.locator('[data-card]').first();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x - 300, box.y + 260, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(1000);
  const moved = await card.boundingBox();
  check('card can be dragged', Math.abs(moved.x - box.x) > 60, `dx ${Math.round(moved.x - box.x)}`);
  const cover = await page.locator('.cover').boundingBox();
  check('a hard throw stays on screen', moved.y >= cover.y - 30 && moved.y + moved.height <= cover.y + cover.height + 30 && moved.x >= cover.x - 30, JSON.stringify({ y: Math.round(moved.y), h: Math.round(moved.height), bottom: Math.round(cover.y + cover.height) }));
  check('dragging does not change folder', (await visiblePanels(page))[0] === 'home');
  await page.click('[data-ear="projects"]');
  await page.waitForTimeout(1400);
  await page.click('[data-ear="home"]');
  await page.waitForTimeout(1400);
  const after = await card.boundingBox();
  check('cards stay where they were left', Math.abs(after.x - moved.x) < 3 && Math.abs(after.y - moved.y) < 3, `dx ${Math.round(after.x - moved.x)}`);
  const counts = await page.evaluate(() => [...document.querySelectorAll('[data-count]')].map((e) => e.textContent).join());
  await page.waitForTimeout(1200);
  const counts2 = await page.evaluate(() => [...document.querySelectorAll('[data-count]')].map((e) => e.textContent).join());
  check('numbers end on the real values', counts2 === '200,30,15,0', `${counts} -> ${counts2}`);
  await c.close();
}

// Reduced motion and the toggle
{
  const { c, page } = await open({ reducedMotion: 'reduce' });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(250);
  check('reduced: switch says animations are off', (await page.getAttribute('[data-motion-toggle]', 'aria-checked')) === 'false' && (await page.locator('[data-motion-toggle] [data-state]').innerText()) === 'Off');
  await page.click('[data-ear="experience"]');
  await page.waitForTimeout(40);
  check('reduced: folder swaps at once', (await visiblePanels(page)).join() === 'experience');
  check('reduced: pipeline starts complete', (await page.locator('[data-pipe-step]:not(.is-done)').count()) === 0);
  await c.close();

  const b = await open();
  await b.page.goto(base, { waitUntil: 'load' });
  await b.page.waitForTimeout(500);
  await b.page.click('[data-motion-toggle]');
  await b.page.click('[data-ear="about"]');
  await b.page.waitForTimeout(40);
  check('toggle: turns animation off in-page', (await visiblePanels(b.page)).join() === 'about');
  await b.page.reload({ waitUntil: 'load' });
  check('toggle: choice survives reload', (await b.page.evaluate(() => document.documentElement.dataset.motion)) === 'reduced');
  await b.c.close();
}

// No JavaScript: everything readable by scrolling
{
  const { c, page } = await open({ javaScriptEnabled: false });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const text = await page.locator('body').innerText();
  check('no JS: every folder and paper is readable', ['software that fits', 'Tangible', 'DARPE Admin', 'Business Intelligence', 'Universidad La Salle', 'Internal tools', 'before opening the editor', 'ian.corr.mar@gmail.com'].every((s) => text.includes(s)));
  check('no JS: the page can scroll', await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 500));
  await page.screenshot({ path: path.join(out, 'v-nojs.png') });
  await c.close();
}

// Keyboard
{
  const { c, page } = await open({ reducedMotion: 'reduce' });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  await page.focus('[data-ear="projects"]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
  check('keyboard: Enter opens a folder', (await visiblePanels(page))[0] === 'projects');
  check('keyboard: focus moves to the folder heading', (await page.evaluate(() => document.activeElement?.id)) === 'projects-title');
  check('aria-current follows the open folder', (await page.getAttribute('[data-ear="projects"]', 'aria-current')) === 'true' && (await page.getAttribute('[data-ear="home"]', 'aria-current')) === null);
  await page.focus('#projects [data-file-tab="darpe"]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(100);
  check('keyboard: Enter picks a paper', await page.locator('[data-paper="darpe"].is-current').count() === 1);
  await c.close();
}

// Spanish services page
{
  const { c, page, errors } = await open({ reducedMotion: 'reduce' });
  await page.goto(base + 'servicios', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.evaluate(axeSource);
  const res = await page.evaluate(async () => {
    const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] });
    return r.violations.map((v) => ({ id: v.id, n: v.nodes.length, sample: v.nodes.slice(0, 3).map((x) => x.target.join(' ') + ' :: ' + (x.any[0]?.message ?? '').slice(0, 120)) }));
  });
  check('servicios: axe', res.length === 0, res.length ? JSON.stringify(res) : '');
  check('servicios: page is in Spanish', (await page.getAttribute('html', 'lang')) === 'es');
  await page.locator('.sv-chip', { hasText: 'Tienda en línea' }).click();
  await page.fill('[name="negocio"]', 'Llantera');
  await page.fill('[name="detalles"]', 'Tengo dos sucursales & más');
  const preview = await page.locator('[data-quote-preview]').innerText();
  check('servicios: quote builds the message', preview.includes('Mi negocio: Llantera') && preview.includes('Necesito: Tienda en línea') && preview.includes('dos sucursales'), preview);
  const mail = await page.getAttribute('[data-quote-correo]', 'href');
  check('servicios: email link carries it, safely encoded', mail.startsWith('mailto:ian.corr.mar@gmail.com') && mail.includes('Llantera') && mail.includes('%26'));
  const waHref = await page.getAttribute('[data-quote-whatsapp]', 'href');
  check('servicios: WhatsApp carries the same message', waHref.startsWith('https://wa.me/526144731147?text=') && decodeURIComponent(waHref).includes('Mi negocio: Llantera'), waHref);
  check('servicios: every WhatsApp link opens safely in a new tab', await page.evaluate(() => [...document.querySelectorAll('a[href^="https://wa.me/"]')].every((a) => a.target === '_blank' && a.rel.includes('noopener'))));
  check('servicios: first FAQ starts open as a hint', await page.locator('details').first().evaluate((d) => d.open));
  await page.locator('summary').nth(1).click();
  check('servicios: FAQ opens', await page.locator('details').nth(1).evaluate((d) => d.open));
  check('servicios: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300));
  await c.close();

  const nav = await open({ viewport: { width: 1440, height: 900 } });
  await nav.page.goto(base + 'servicios', { waitUntil: 'load' });
  await nav.page.waitForTimeout(300);
  await nav.page.click('.sv-nav a[href="#trabajos"]');
  await nav.page.waitForTimeout(1400);
  const navState = await nav.page.evaluate(() => ({
    top: Math.round(document.querySelector('[data-top]').getBoundingClientRect().top),
    logo: getComputedStyle(document.querySelector('.sv-brand__full')).display,
    current: document.querySelector('[data-spy][aria-current="true"]')?.hash,
    heading: Math.round(document.querySelector('#sv-trabajos').getBoundingClientRect().top),
    barBottom: Math.round(document.querySelector('[data-top]').getBoundingClientRect().bottom),
  }));
  check('servicios: navbar stays on top with the logo', navState.top === 0 && navState.logo === 'block', JSON.stringify(navState));
  check('servicios: nav marks the section you jumped to', navState.current === '#trabajos', JSON.stringify(navState));
  check('servicios: the bar never covers the section title', navState.heading >= navState.barBottom, JSON.stringify(navState));
  await nav.page.screenshot({ path: path.join(out, 'v-sv-nav.png') });
  await nav.c.close();
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    const v = await open({ viewport: { width, height: 800 } });
    await v.page.goto(base + 'servicios', { waitUntil: 'load' });
    await v.page.waitForTimeout(150);
    const over = await v.page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`servicios: fits at ${width}px`, over <= 0, `over ${over}`);
    await v.c.close();
  }
  const nojs = await open({ javaScriptEnabled: false });
  await nojs.page.goto(base + 'servicios', { waitUntil: 'load' });
  const hidden = await nojs.page.locator('[data-reveal]').evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
  check('servicios: nothing hidden without JS', hidden === 0);
  await nojs.c.close();
}

// The tagline has to land on its column edge, on any screen, in both motion modes
for (const [width, height, reducedMotion] of [[320, 700, 'reduce'], [390, 844, 'reduce'], [768, 1024, 'reduce'], [1280, 593, 'reduce'], [1440, 900, 'reduce'], [1920, 1080, 'reduce'], [2560, 1300, 'reduce'], [1440, 900, 'no-preference'], [390, 844, 'no-preference']]) {
  const { c, page } = await open({ viewport: { width, height }, reducedMotion });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(reducedMotion === 'reduce' ? 700 : 3000);
  const r = await page.evaluate(() => {
    const title = document.querySelector('[data-fit-title]');
    const line = title.querySelector('em');
    return { line: line.offsetWidth, col: title.clientWidth, fit: Number(title.style.getPropertyValue('--fit')) };
  });
  const atMax = r.fit > 124.5;
  check(`tagline fits at ${width}x${height} (${reducedMotion})`, r.line <= r.col && (atMax || r.col - r.line <= 10), JSON.stringify(r));
  await c.close();
}

// Monitors: no page scroll, no paper scroll, on any folder
for (const [width, height] of [[1280, 593], [1366, 625], [1366, 768], [1440, 900], [1536, 730], [1920, 950], [1920, 1080], [2560, 1300], [3440, 1300]]) {
  const { c, page } = await open({ viewport: { width, height }, reducedMotion: 'reduce' });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(150);
  const bad = [];
  for (const id of ids) {
    await clickEar(page, id);
    await page.waitForTimeout(30);
    const tabs = await page.locator(`#${id} [data-file-tab]`).count();
    for (let t = 0; t < Math.max(tabs, 1); t++) {
      if (tabs) { await page.locator(`#${id} [data-file-tab]`).nth(t).click(); await page.waitForTimeout(20); }
      const r = await page.evaluate((f) => {
        const panel = document.getElementById(f);
        const paper = panel.querySelector('.paper.is-current');
        const content = panel.querySelector('[data-content]');
        const side = panel.querySelector('.folder__side');
        return { page: document.documentElement.scrollHeight - innerHeight, paper: paper ? paper.scrollHeight - paper.clientHeight : 0, content: paper ? 0 : content.scrollHeight - content.clientHeight, side: side ? side.scrollHeight - side.clientHeight : 0, wide: document.documentElement.scrollWidth - innerWidth };
      }, id);
      if (Object.values(r).some((n) => n > 1)) bad.push(`${id}#${t}:${JSON.stringify(r)}`);
    }
  }
  check(`no scroll at ${width}x${height}`, bad.length === 0, bad.join(' '));
  await c.close();
}

// Phones and narrow windows
for (const width of [320, 360, 390, 768, 900]) {
  const { c, page } = await open({ viewport: { width, height: 800 }, reducedMotion: 'reduce' });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(150);
  const worst = [];
  for (const id of ids) {
    await clickEar(page, id);
    await page.waitForTimeout(40);
    const res = await page.evaluate(() => ({
      over: document.documentElement.scrollWidth - innerWidth,
      clipped: [...document.querySelectorAll('.ear__label')].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent),
    }));
    if (res.over > 0 || res.clipped.length) worst.push(`${id}:${JSON.stringify(res)}`);
  }
  check(`layout at ${width}px`, worst.length === 0, worst.join(' '));
  await c.close();
}
{
  const { c, page } = await open({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(2300);
  await page.screenshot({ path: path.join(out, 'v-m-home.png') });
  await page.tap('[data-ear="projects"]');
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(out, 'v-m-flap.png') });
  await page.waitForTimeout(1300);
  await page.screenshot({ path: path.join(out, 'v-m-projects.png') });
  await page.screenshot({ path: path.join(out, 'v-m-projects-full.png'), fullPage: true });
  await page.tap('[data-ear="experience"]');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(out, 'v-m-experience-full.png'), fullPage: true });
  await c.close();
}

await browser.close();
console.log(`\n${total - failures}/${total} passed`);
process.exitCode = failures ? 1 : 0;
