---
name: ship
description: Verify and publish a change to Ian's portfolio or services page. Runs the full browser test suite, checks the screenshots, commits in English without any Claude attribution, pushes after Ian confirms, and checks the live site on Cloudflare Pages. Use when Ian asks to upload, publish, deploy or "subir" changes, or after finishing a change he approved.
---

# Ship a change

Follow these steps in order. Stop and report if any step fails; never skip one to get a change out.

## 1. Check the work tree

Run `git status` and `git diff --stat`. Make sure only the intended files changed, and that nothing private is staged: no `.env`, and no résumé with a phone number. If `tests/.output/` or `dist/` show up, `.gitignore` is broken. Fix that first.

## 2. Test

Run `npm test`, which builds and then runs every suite (about 6 minutes). On a new machine, run `npm install` and `npm run test:setup` first.

- Every suite must print `PASS`. On a failure, read `tests/.output/<suite>.log`, fix the cause and run again.
- If a check fails because the behavior changed on purpose (Ian asked for it), update that check in `tests/e2e/` in the same change. Say so in the report.
- For visual changes, open the relevant screenshots in `tests/.output/` and look at them on desktop and phone. A green suite doesn't prove a layout looks right.

## 3. Commit

- Write the message in English: a short imperative subject, then a body that says what changed for the visitor and why.
- Use Ian's git identity, already configured in the repo.
- **Never add `Co-Authored-By` or any other Claude attribution line.**

## 4. Push

Ask Ian before pushing, unless he already said to upload it in this conversation. Push `main` to `origin`. If git has no credentials on this machine, ask Ian to sign in. GitHub CLI's `gh auth login` is one way; then use `gh auth git-credential` as the helper. Never put tokens in commands, files or the remote URL.

## 5. Verify live

Cloudflare Pages deploys `main` by itself in 1–2 minutes.

- Poll until the new version is live. Check for something unique to the change, not just a 200.
- Then check:
  - `/` and `/servicios` return 200.
  - A made-up path returns 404.
  - `/Ian_Corral_Resume.pdf` and `/og.png` load.
  - `curl -sI https://iancorral.pages.dev/servicios` still shows the security headers: CSP `frame-ancestors`, `X-Frame-Options`, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
  - `og:image` and the canonical link are absolute `https://iancorral.pages.dev/...` URLs.

## 6. Report

Tell Ian in Spanish:
- What changed.
- The test results.
- The commit hash.
- The live links.

Mention anything skipped or changed in the tests.
