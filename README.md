# Ian Corral: portfolio and IC Software services

Two pages, one codebase:

- **`/`** is my portfolio, in English, built as a filing cabinet. Each section is a folder you pull out by its tab, and on a monitor every folder fits the window without scrolling.
- **`/servicios`** is the Spanish page for IC Software, where local businesses can see what I build and message me on WhatsApp.

Built with [Astro](https://astro.build), TypeScript and [GSAP](https://gsap.com). The output is a static site with no server code, no cookies and no third-party requests.

## Run it

Needs Node 22.23.4 or newer (`.node-version` pins the exact one).

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # type-checks, then writes the site to dist/
npm run preview  # serves dist/ (use this to test the CSP; it doesn't run in dev)
```

## Where things live

| To change | Edit |
| --- | --- |
| Portfolio text, projects, jobs and links | `src/data/site.ts` |
| Services page text, WhatsApp number and FAQ | `src/data/servicios.ts` |
| Colors shared by both pages | `src/styles/tokens.css` |
| Portfolio layout, and how it scales with the window | `src/styles/global.css` |
| Services page layout | `src/styles/servicios.css` |
| Folder-opening animation and its timing | `src/scripts/cabinet.ts` (constants at the top) |
| Tool and brand logos | `src/lib/icons.ts` |
| Résumé (public copy, without a phone number) | `public/Ian_Corral_Resume.pdf` |

## Security

- **Content Security Policy.** Astro writes a strict CSP `<meta>` tag with a hash for every bundled script and style. `integrations/inline-script-hashes.mjs` adds hashes for the two small inline scripts that must run before first paint, so `'unsafe-inline'` is never needed for scripts.
- **Response headers.** `public/_headers` covers what a meta tag can't: `frame-ancestors`, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` and HSTS.
- **No third parties.** Fonts are self-hosted, nothing is loaded from another domain, and no cookies are set. `localStorage` only remembers the dark mode and animation choices.
- **Dependencies.** Dependabot checks npm packages weekly (`.github/dependabot.yml`).

## Deploy

The site is hosted on Cloudflare Pages, which builds every push to `main`.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | read from `.node-version` |
| `SITE_URL` (optional) | the final domain, for example `https://example.com`. It sets the canonical and social preview URLs. |

To serve the services page on its own subdomain later, point it at the same project and redirect its root to `/servicios`.
