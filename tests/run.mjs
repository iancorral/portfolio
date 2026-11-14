// Runs the browser suites in tests/e2e against the production build in dist/.
//   npm test                      build, then run every suite
//   node tests/run.mjs csp devices  run only these suites against the current dist/
// Full logs and screenshots land in tests/.output/. Only failures and each suite's summary are printed.
import { preview } from 'astro';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const suites = {
  content: 'Content, behavior and accessibility (axe) on both pages',
  'desktop-fit': 'Every folder fits one screen on 14 monitor sizes',
  csp: 'No Content Security Policy violations or script errors, Chromium and WebKit',
  'services-nav': 'Services bar: every section link marks the right tab, 6 devices x 2 engines',
  devices: 'Both pages on 9 phones and tablets x 2 engines, with axe',
};

const picked = process.argv.slice(2);
const unknown = picked.filter((name) => !(name in suites));
if (unknown.length) {
  console.error(`Unknown suite: ${unknown.join(', ')}. Available: ${Object.keys(suites).join(', ')}`);
  process.exit(2);
}
if (!fs.existsSync('dist/index.html')) {
  console.error('No build in dist/. Run "npm run build" first, or use "npm test", which builds.');
  process.exit(2);
}

const port = Number(process.env.TEST_PORT ?? 4399);
const base = `http://localhost:${port}/`;
const out = path.resolve('tests/.output');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const server = await preview({ root: process.cwd(), server: { port, host: 'localhost' }, logLevel: 'error' });

const run = (name) =>
  new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(process.execPath, [path.join('tests', 'e2e', `${name}.mjs`)], {
      env: { ...process.env, BASE_URL: base, TEST_OUTPUT: out },
    });
    let log = '';
    child.stdout.on('data', (chunk) => (log += chunk));
    child.stderr.on('data', (chunk) => (log += chunk));
    child.on('close', (code) => {
      fs.writeFileSync(path.join(out, `${name}.log`), log);
      const lines = log.trim().split('\n');
      const seconds = Math.round((Date.now() - started) / 1000);
      console.log(`\n${code === 0 ? 'PASS' : 'FAIL'}  ${name}  (${seconds}s)  ${suites[name]}`);
      const failing = lines.filter((line) => /\bFAIL\b/.test(line));
      failing.slice(0, 20).forEach((line) => console.log(`      ${line.trim().slice(0, 300)}`));
      if (failing.length > 20) console.log(`      ...and ${failing.length - 20} more in tests/.output/${name}.log`);
      // A crash prints no FAIL lines, so show the end of the log instead.
      if (code !== 0 && !failing.length) lines.slice(-12).forEach((line) => console.log(`      ${line}`));
      console.log(`      ${lines.at(-1)}`);
      resolve(code === 0);
    });
  });

const results = [];
for (const name of picked.length ? picked : Object.keys(suites)) results.push([name, await run(name)]);
await server.stop();

const failed = results.filter(([, ok]) => !ok).map(([name]) => name);
console.log(`\n${failed.length ? `Failed: ${failed.join(', ')}` : 'All suites passed'}. Logs and screenshots: tests/.output/`);
process.exit(failed.length ? 1 : 0);
