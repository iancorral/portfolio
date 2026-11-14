# Project notes for Claude

Ian Corral's site: a portfolio at `/` (English) and the IC Software services page at `/servicios` (Spanish), one Astro codebase. Ian writes to you in Spanish; answer in Spanish. The README covers setup, the file map ("Where things live") and the security model, so read it before changing anything.

## Commands

```sh
npm install && npm run test:setup   # first time on a machine (test:setup downloads Chromium and WebKit for the tests)
npm run dev                         # http://localhost:4321
npm test                            # type-check + build, then every browser suite against dist/ (~6 min)
node tests/run.mjs csp devices      # only some suites, against the current dist/
```

Suites live in `tests/e2e/` (content, desktop-fit, csp, services-nav, devices). `npm test` prints only failures and one summary per suite; full logs and screenshots go to `tests/.output/`. Look at the screenshots for visual changes, since a passing suite doesn't prove a layout looks right. When a change is deliberate and a check encodes the old behavior, update the check in the same commit.

## Shipping

- Run `npm test` before every commit. Everything must pass.
- Commit messages in English, under Ian's git identity. **Never add a `Co-Authored-By` trailer or any Claude attribution** to commits or PRs.
- Ask before `git push`. A push to `main` deploys by itself to Cloudflare **Pages** (project `iancorral`) in 1–2 minutes: https://iancorral.pages.dev and https://iancorral.pages.dev/servicios. After a push, check the live pages, and for header or meta changes also check with `curl -sI`.
- It's Pages, not Workers. Cloudflare's dashboard pushes "Create" toward Workers, which gives a `name.account.workers.dev` URL; Ian didn't want that.
- The site URL defaults to `https://iancorral.pages.dev` in `astro.config.mjs`. Set `SITE_URL` only once a custom domain exists. The plan then is the main domain for the portfolio and `servicios.<domain>` for the services page, rewritten to `/servicios` with a Cloudflare rule.
- The repo `iancorral/portfolio` is private and personal. Nothing goes to the school organization (ITIT-ISC).

## Design rules Ian set

- **Originality is a requirement.** Ian rejected things that look like every AI-made site: circled initials, a rule with a dot and a mono city label, mono uppercase eyebrows, glowing status dots, and cream paper with serif italics. Derive visuals from the logo (the C with the bar; blue `#084dc2`, ink `#1e2124`) and the folder idea instead.
- **Portfolio:** a filing cabinet whose folders open by their tabs. Interactive but not over the top. On monitors (`min-width:1000px` and `min-height:540px`), every folder fits the window with no scrolling. The `desktop-fit` suite enforces this on 14 sizes. Phones scroll, with a compact layout at ≤720px that must not look stretched. Small text never goes below 12px.
- **Services page:** blue and ink from the logo, plus a pale blue tint `#d5e1f4` where white used to be. Plain white looked too much like the Taller Luevano site. WhatsApp green is the only other color.
  - The bar marks the current section the same way everywhere, with a white tab. On phones it is two rows: logo and Cotizar on top, sections below.
  - The nine services are equal cards with none featured, and they stay varied rather than echoing past projects.
  - No link to the portfolio from this page.
  - The WhatsApp button moves gently; it is noticeable but never aggressive.
- Every page must work on every phone, Safari included.

## Content facts

- Facts come from the résumé, except where Ian corrected them:
  - DARPE is finished.
  - LinkedIn is `linkedin.com/in/iancorral/`.
  - AutoZone stays low-key.
  - No Minecraft or game mentions.
- Tangible and DARPE are shown with interactive demos, never screenshots. Taller Luevano is public and shown with real captures.
- The public résumé PDF must not contain a phone number. The WhatsApp number on the services page is intentional.

## Gotchas

- **CSP:** scripts need hashes. Astro hashes bundled ones, and `integrations/inline-script-hashes.mjs` hashes `is:inline` ones after the build. Style attributes are allowed, but `<style>` blocks added at runtime are not, so test tools must inject CSS through element `style` or `bypassCSP`.
- **Scoped styles** in an `.astro` file don't reach the inside of child components. Wrap the child and use `:global(...)`.
- **Build output** uses `build.format: 'file'` (`servicios.html`), so `/servicios` loads without a redirect. Canonical URLs strip `.html`.
- **WebKit on Windows** mis-renders the variable font's width axis: letters look spaced out, as in "e n". Real iPhones render it correctly, so don't "fix" it.
- **Portfolio tagline:** `src/scripts/fit.ts` binary-searches `font-stretch` so the tagline fits its column. Don't measure it while SplitText has it split.
