import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Astro's CSP hashes the scripts it bundles, but not the small `is:inline` ones that have to run
// before first paint. After the build, this adds a hash for each inline script to the page's own
// script-src, so the policy stays strict ('unsafe-inline' is never needed) and can't drift from the code.
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g;
const SCRIPT_SRC = /(<meta http-equiv="content-security-policy" content="[^"]*?script-src )/;

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(full);
      return entry.name.endsWith('.html') ? [full] : [];
    }),
  );
  return nested.flat();
}

export default function inlineScriptHashes() {
  return {
    name: 'inline-script-hashes',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        for (const file of await htmlFiles(fileURLToPath(dir))) {
          const html = await readFile(file, 'utf8');
          const hashes = [...html.matchAll(INLINE_SCRIPT)].map(
            ([, body]) => `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`,
          );
          if (!hashes.length) continue;
          if (!SCRIPT_SRC.test(html)) {
            throw new Error(`${file} has inline scripts but no CSP script-src to add their hashes to.`);
          }
          await writeFile(file, html.replace(SCRIPT_SRC, `$1${[...new Set(hashes)].join(' ')} `));
          logger.info(`${path.basename(path.dirname(file))}: ${hashes.length} inline script hash(es) added`);
        }
      },
    },
  };
}
