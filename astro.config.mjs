import { defineConfig } from 'astro/config';
import inlineScriptHashes from './integrations/inline-script-hashes.mjs';

// The live address. SITE_URL replaces it once there is a custom domain,
// and preview builds of other branches use the URL Cloudflare Pages gives them.
const isPreview = Boolean(process.env.CF_PAGES_BRANCH) && process.env.CF_PAGES_BRANCH !== 'main';
const site = process.env.SITE_URL ?? (isPreview ? process.env.CF_PAGES_URL : 'https://iancorral.pages.dev');

export default defineConfig({
  site,
  output: 'static',
  // servicios.html instead of servicios/index.html, so /servicios loads without a redirect to /servicios/.
  build: { format: 'file' },
  devToolbar: { enabled: false },
  integrations: [inlineScriptHashes()],
  // No Markdown code blocks here, and Shiki's inline styles would conflict with the CSP.
  markdown: { syntaxHighlight: false },
  security: {
    // Emitted as a <meta> tag with hashes for every script and style Astro bundles.
    // Headers a meta tag can't carry (frame-ancestors and friends) live in public/_headers.
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
      ],
      styleDirective: {
        // A few elements carry small custom properties in a style attribute (tab order, stagger index).
        // That only covers style attributes; style elements and files still need a hash or 'self'.
        resources: [{ resource: "'unsafe-inline'", kind: 'attribute' }],
      },
    },
  },
});
