# Review 04: Gemini code review

- **Date:** Sat Nov 28, 2026
- **Commit reviewed:** `38404bd` (`main`)
- **Reviewer:** Gemini 4 Neon (independent review; Claude Opus 5.5 wrote the code and tests, Claude Fable 5.2 wrote the specs and customer content)
- **Scope reviewed:** Every file under `src/`, plus `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `public/favicon.svg`, and `.github/workflows/deploy.yml`, checked against `CLAUDE.md`, `docs/requirements.md`, `docs/design.md`, `docs/architecture.md`, `docs/security.md`, `docs/test-plan.md`, and `docs/reviews/03-gemini-content-review.md`.

Overall, the codebase is clean, small, and unusually disciplined. The three-layer boundary holds, `CustomerScreen` leaks nothing in its props, DOM, or styles, `package.json` has the exact eight approved packages, `.github/workflows/deploy.yml` meets SEC-5 to SEC-9 (with all four action SHAs verified live via `git ls-remote`), and `npm test` (10 files, 145 tests) and `npm run build` (80.65 kB gzipped JS + CSS against NFR-7's 200 kB cap) both pass. No high-severity or security-blocking defects were found. The findings below are ordered worst first.

---

## Findings

### 1. `validate.test.ts` has gaps that would still pass if rules V2, V6, V11, or V15 were broken
- **Severity:** medium
- **Files and lines:**
  - `src/game/validate.test.ts:283-289` vs `src/game/validate.ts:300-303` (V11)
  - `src/game/validate.test.ts:299-309` vs `src/game/validate.ts:318-323` (V15)
  - `src/game/validate.test.ts:78-81` vs `src/game/validate.ts:98` (V2)
  - `src/game/validate.test.ts:148-162` vs `src/game/validate.ts:153-156` (V6)
- **Why it matters:** `validateData` is the CI gate that stops bad content from deploying (FR-15, AC-8.3 to AC-8.6). Four branches in `validate.ts` can be broken without failing any test:
  1. **V11 (scam side):** `validate.test.ts:283-289` only tests a transaction type with no *legit* customer. Removing `s-gift` in the V10 test (`validate.test.ts:273-276`) also drops the gift-card scam, but that test only asserts `expectSome(..., 'V10', ...)`. Deleting `if (!scams.some((n) => slipType(n.c) === type))` at `validate.ts:301` leaves all 145 tests passing.
  2. **V15 (both conditions):** `validate.test.ts:299-309` never tests two scam customers carrying `RF-6`/`RF-17` behind a question other than `told` (for example `verified`, which `design.md` section 2.3 allows for `RF-6`), and never tests two scam customers carrying a non-admission flag (such as `RF-3` or `RF-4`) behind `told`. Dropping either `f.shownIn === 'told'` or `ADMISSION_FLAGS.includes(...)` at `validate.ts:319` leaves the suite green.
  3. **V2 (oversized set):** Only a 4-question set is tested (`validate.test.ts:78-81`), never a 6-question set. Changing `set.length !== SET_SIZE` to `set.length < SET_SIZE` at `validate.ts:98` still passes.
  4. **V6 (non-positive gift card count or value):** `validate.test.ts:148-162` never tests `cardCount <= 0` or `valuePerCard <= 0`.

### 2. Silent `localStorage.setItem` failure still displays `"New best score"` (FR-17, AC-9.1, SEC-17)
- **Severity:** medium
- **Files and lines:** `src/ui/bestScore.ts:30-45`, `src/ui/DebriefScreen.tsx:81-92`
- **Why it matters:** `loadBestScore` marks storage `{ available: true }` as soon as `getItem` succeeds. If `setItem` later throws (for instance, quota exceeded or a browser context that permits reads while blocking writes), `saveBestScore` (`bestScore.ts:39-45`) swallows the error without returning a failure status, and `useBestScore` (`DebriefScreen.tsx:81-92`) still renders `"New best score"` for a score that was never saved and will not appear on the start screen after a reload (AC-9.1). Returning a boolean from `saveBestScore` (or suppressing the line when saving fails) would keep the UI honest.

### 3. Rewritten `customers.ts`: pool-wide question shortcuts remain, and two rewrites introduced minor internal friction
- **Severity:** medium
- **Files and lines:**
  - `src/data/customers.ts:21-25`, `56-61`, `93-98`, `126-131`, `162-166`, `184-188`, `208-212`, `232-237`, `257-261`, `281-285`
  - `src/data/customers.ts:59-60` (`c02-gift-government`)
  - `src/data/customers.ts:157`, `163`, `169` (`c05-cash-card`)
- **Why it matters:**
  - **Fixed question shortcuts still solve all three transaction types:** Moving Lorraine's `RF-16` from `next` to `urgency` broke the `purpose` + `origin` + `next` pattern targeted in the fix round, but deterministic 3-question routines still solve 100% of every type without reading the slip:
    - **Cash:** `purpose` + `urgency` + `next` catches Lorraine (`urgency` courier) and Stephen (`next` QR-code machine), clears Curtis (`purpose` truck), and skips Ana's `origin` look-alike while confirming her bills in `next`.
    - **Gift cards:** `recipient` + `next` (only 2 questions) catches Darius (`next` card photos) and clears both Frank and Denise while never touching Denise's `told` look-alike.
    - **Wires:** `recipient` + `met` + `verified` catches Carol (`recipient` + `met`) and clears Margaret and Joel while never touching Joel's `purpose` look-alike.
    - Across all four scam customers, `purpose` carries zero red flags. (AI log entry 13 notes the cash pattern is deferred to the Dec 4 playtest.)
  - **New timing tension in `c02-gift-government` (`customers.ts:59-60`):** `urgency` was rewritten to `"Yes, in the next hour... It just has to be now."`, while `next` still says `"I send Andre pictures of the backs tonight..."`. Paying an immediate arrest-warrant caller "in the next hour" jars against waiting until "tonight" to send the photos.
  - **New banking-realism friction in `c05-cash-card` (`customers.ts:157, 163, 169`):** `origin` now says `"The bank's fraud team called on Saturday. Somebody got into my account, and I've been told not to use it. So I need cash out."` — yet Ana is at the counter withdrawing `$2,600` from that same account, and the slip's `accountNote` (`line 157`) shows no freeze or note from the bank's own fraud team.

### 4. `rules.test.ts` can pass vacuously if target files move, and does not cover timers in `src/game/`, `index.html`, or SEC-11
- **Severity:** low
- **Files and lines:** `src/rules.test.ts:11`, `24`, `70-94`, `138-153`
- **Why it matters:** Because the project has no linter (D17), `rules.test.ts` is the automated backstop for `CLAUDE.md` and `security.md` (D28).
  - The SEC-18 test (`rules.test.ts:146-153`) filters for `ui/CustomerScreen.tsx` and `ui/Slip.tsx`, and the layer tests (`rules.test.ts:82, 97`) filter `inFolder('game')` and `inFolder('data')`, without asserting that the matched file lists are non-empty. Renaming or moving `CustomerScreen.tsx` or `Slip.tsx` would make the SEC-18 test inspect zero files and pass.
  - `CLAUDE.md` layer rule 1 forbids timers in `src/game/`, but `rules.test.ts:86-91` does not check for `setTimeout`, `setInterval`, `Date.now`, or `performance.now`.
  - Line 11 globs only `src/**/*.{ts,tsx,css}`, so an external `<script>` or web font added to `index.html` (SEC-4) or an `<input>`/`<form>`/`location` read in `src/` (SEC-11) would not fail `npm test` (the manual grep in `security.md` section 6 catches `index.html`, and SEC-11 is assigned to review/MT-17, so this is a coverage gap rather than a violation).

### 5. Customer screen tells: zero UI leaks, but a few subtle content tells remain on the slip and behaviour
- **Severity:** low
- **Files and lines:** `src/data/customers.ts:227` (`c08`), `src/data/customers.ts:15-19` (`c01`), `src/data/customers.ts:156, 160` (`c05`)
- **Why it matters:**
  - **UI code check (pass):** `App.tsx:31-39`, `CustomerScreen.tsx:25-100`, `Slip.tsx:10-59`, `customerView.ts:9-17`, and `styles.css:184-287` leak nothing about `truth`, `redFlags`, `scamType`, `lookAlike`, `explanation`, `sourceUrls`, or `id` — not in props, DOM text, class names, `aria-*` attributes, React `key` (uses `state.index`), tab title, URL, or console. Question sets and ordering depend only on slip type.
  - **Content tells on the customer screen:**
    - `c08-gift-crew` (`customers.ts:227`): Removing the company fleece and the `"Twelve, you said?"` line made Frank's phone call ambiguous, but `"Business account: payroll, fuel, suppliers."` on the slip still leaves him as the only business account in the pool, hinting that `12 × $250` cards are employee bonuses before any question is asked.
    - `c01-cash-emergency` (`customers.ts:15-19`): Still holdable at zero questions (shaking hand + `$8,500` against `$200` largest withdrawal on Social Security). This was intentionally left as the easy customer in Review 03's triage (finding 7).
    - `c05-cash-card` (`customers.ts:156, 160`): Raising the withdrawal from `$900` to `$2,600` helped, though she remains the smallest cash withdrawal (next is `$8,500`) paired with the most sympathetic description (`"a toddler on her hip"`, apologizing to the line).

### 6. Weak distribution checks in `draw.test.ts` and one-sided length-mismatch tests in `scoring.test.ts` / `debrief.test.ts`
- **Severity:** low
- **Files and lines:**
  - `src/game/draw.test.ts:35-44`, `52-54` vs `src/game/draw.ts:12-14`, `18-25`
  - `src/game/scoring.test.ts:91-94`, `src/game/debrief.test.ts:64-66` vs `src/game/scoring.ts:13`
- **Why it matters:**
  - `draw.test.ts:35-44` checks only that a scam appears in each position *at least once* and every customer is drawn *at least once* across 1,000 seeds, and line 53 checks `size > 1` unique days. Those match the literal wording of AC-5.2, but would still pass a severely biased shuffle (for example, one that puts scams first 90% of the time or repeats one day for 999 seeds). In addition, the defensive clamp `Math.min(n - 1, ...)` for `rng() === 1` (`draw.ts:13`) is never exercised by a test.
  - Both `scoring.test.ts:91-94` (2 results for 6 customers) and `debrief.test.ts:64-66` (5 results for 6 customers) only test `results.length < day.length`, never `results.length > day.length`. Changing `day.length !== results.length` to `results.length < day.length` at `scoring.ts:13` would leave all tests passing while silently ignoring extra results.

### 7. Minor validation edge cases in `validate.ts`: fractional `valuePerCard`, duplicate `sourceUrls`, and URL ports/userinfo
- **Severity:** low
- **Files and lines:**
  - `src/game/validate.ts:154` vs `src/ui/format.ts:20-23`
  - `src/game/validate.ts:191-195` vs `src/ui/DebriefScreen.tsx:151`
  - `src/game/validate.ts:248-251`
- **Why it matters:**
  - `validate.ts:154` checks `typeof valuePerCard === 'number' && valuePerCard > 0 && valuePerCard <= 500` without `Number.isInteger`. A gift-card slip with `{ cardCount: 2, valuePerCard: 125.5, amount: 251 }` passes V4 and V6, then renders `$125.5` via `formatMoney` (`format.ts:22`).
  - `validate.ts:191-195` does not check for duplicate entries in `sourceUrls`, while `DebriefScreen.tsx:151` keys each `<li>` by `link.href`, which would produce duplicate React keys if a URL were listed twice.
  - `validate.ts:248-251` satisfies SEC-13's protocol and hostname checks, but would accept URLs containing credentials or non-default ports (such as `https://user:pass@consumer.ftc.gov:8443/`), which `DebriefScreen` puts verbatim into `<a href>`.

### 8. Minor unnecessary complexity and duplication
- **Severity:** low
- **Files and lines:**
  - `src/game/debrief.ts:90-95`: `buildDebrief` calls `sumPoints(day, results)`, then `buildRow` calls `pointsFor` for every customer, and then line 95 calls `scoreDay(day, results)` (which calls `sumPoints` again). `score: Math.max(0, total)` avoids recalculating the sum three times.
  - `src/ui/customerView.ts:15-29` vs `src/game/reducer.ts:17-26`: Both files implement the `Object.hasOwn(answers, id) && typeof answers[id] === 'string'` check and the `MAX_QUESTIONS` limit. `CLAUDE.md` layer rule 3 says rules needed by components belong in `src/game/` (AI log entry 14 notes this was left in `src/ui/` because the UI prompt froze `src/game/`).
  - `src/game/validate.ts:39` and `99-105`: `show()` special-cases strings when `String(JSON.stringify(v))` already quotes strings (and escapes embedded quotes); `checkSets` builds a second `Set` on line 105 after already tracking `seen` on lines 99–104.
  - `src/game/draw.ts:20-23`: When shuffling all 6 customers (`pick(day, day.length, rng)`), the last iteration (`i = 5`) calls `rng()` for a 1-element slice and swaps index 5 with itself.
  - `src/ui/format.ts:59`: `slipSummary` hardcodes plural `"Visa gift cards"` (all real gift-card slips have 3, 4, or 12 cards, but a 1-card slip would read `"1 Visa gift cards"`).

---

## Re-check of `src/data/customers.ts` against Review 03

All ten explanations are now two sentences (AC-6.4), none blames the customer (NFR-11), and no real person, business, phone number, email address, or account number appears as a scammer or contact (SEC-21).

| Review 03 # | Customer / area | Status after rewrite | Notes |
|---|---|---|---|
| 1 | `c04` Stephen (`origin`, `next`) | **Fixed** | `origin` (`customers.ts:128`) weaves the fraud call into the kitchen remodel cleanly; `next` (`line 130`) keeps the contractor cover and removes `"gas station"` while keeping the QR-code/machine slip for RF-15 (C5). |
| 2 | `c02` Darius (`behaviour`, `urgency`, `next`) | **Fixed (minor new issue)** | Earbud behaviour (`line 54`), `urgency` (`line 59`), and `next` (`line 60`) all resolve the earlier giveaways. Introduces a minor timing tension between `"in the next hour"` (`urgency`) and `"tonight"` (`next`). |
| 3 | Pool-wide `next` shortcut | **Partially fixed** | Moving Lorraine's RF-16 to `urgency` broke `purpose + origin + next` on cash, as triaged, but `purpose + urgency + next` (cash), `recipient + next` (gift cards), and `recipient + met + verified` (wires) remain 100% shortcuts (finding 3). |
| 4 | `c09` Joel (`purpose` -> `verified`) | **Fixed as triaged** | `"A message came in the night with the bank details"` (`line 257`) makes `purpose` alarming and points clearly to `verified`. Keeping the hospital name was an explicit triage choice, leaving a mild wording mismatch with `RF-5`'s label (`"a stranger gets paid"`). |
| 5 | `c05` Ana (`$900`, `origin`) | **Fixed (minor new issue)** | Raised to `$2,600`, `origin` (`line 163`) now reads like RF-7, and `purpose` (`line 162`) no longer bypasses `next`. Introduces minor banking-realism friction: withdrawing cash from an account she says the bank's fraud team told her not to use, with no freeze on `accountNote` (`line 157`). |
| 6 | `c03` Carol (`recipient`, `met`) | **Fixed** | `recipient` (`line 95`) keeps the `"friend and business partner"` cover and drops the dating-site/oil-rig cliché; `met` (`line 96`) directly establishes RF-13. |
| 7 | `c01` Lorraine (zero-question tell) | **Intentionally skipped** | Left unchanged per triage as the deliberate easy customer. |
| 8 | `c08` Frank (`behaviour` phone line) | **Mostly fixed** | `"company fleece"` and `"Twelve, you said?"` are gone; `"I'm at the counter now, stay on"` (`line 230`) genuinely mirrors RF-1. `"Business account: payroll, fuel, suppliers."` (`line 227`) still hints legit on the slip (finding 5). |
| 9 | Cash cover stories and amounts | **Fixed as triaged** | Curtis raised to `$11,500` (above Lorraine's `$8,500`); duplicate cash-discount wording removed (`line 21`). |
| 10 | `c02`/`c07` gift cards | **Fixed** | `c07` is now `3 × $500 = $1,500` (`lines 200-202`), and `c02`'s `$2,000` is pooled `"from me and my brothers"` (`line 57`). |
| 11 | `c07` Denise (`told` cue) | **Fixed** | `"her"` and `"the whole floor"` (`line 212`) point cleanly to `recipient`. |
| 12 | `QUESTION_TEXT.verified` wording | **Fixed** | `"by calling a number you already had or found on your own"` (`src/data/questions.ts:13`) fits all three wire customers. |

---

## Security check summary (`docs/security.md`)

All checks from `docs/security.md` section 6 were run against commit `38404bd`.

| ID | Status | Evidence |
|---|---|---|
| SEC-1 | **Pass** | `package.json` lists the exact 8 approved packages (`react`, `react-dom` in `dependencies`; 6 dev packages). |
| SEC-2 | **Pass** | `package-lock.json` is committed, changed only in scaffold commit `530f62b`; `.github/workflows/deploy.yml:29` uses `npm ci`. |
| SEC-3 | **Not checked here** | `npm audit` was not run in this review (scheduled for Dec 4 in MT-26; Nov 27 result is recorded in `docs/test-plan.md`). |
| SEC-4 | **Pass** | Grep over `src/` and `index.html` found zero network APIs and zero external URLs outside `customers.ts:sourceUrls`; `public/favicon.svg` is local. |
| SEC-5 | **Pass** | `.github/workflows/deploy.yml:13-14, 44-47`: top-level `contents: read`; only `deploy` adds `pages: write` and `id-token: write`. |
| SEC-6 | **Pass** | `.github/workflows/deploy.yml:40-53`: `deploy` has only `actions/deploy-pages` and no `run:` steps. |
| SEC-7 | **Pass** | All four `uses:` lines in `.github/workflows/deploy.yml` are pinned to full 40-char SHAs with `# vX.Y.Z` comments; all four SHAs matched `git ls-remote` live on Nov 28, 2026 (`3d3c42e5...`, `949feb24...`, `fc324d35...`, `368f8252...`). |
| SEC-8 | **Pass** | Triggers are `push` and `pull_request` on `main`; `deploy` has `if: github.event_name == 'push' && github.ref == 'refs/heads/main'` and `environment: github-pages`. |
| SEC-9 | **Pass (code/workflow)** | No `secrets.*`, no `${{ github.event.* }}` in `run:`, `persist-credentials: false` on checkout, no `.env*` files, no `import.meta.env.VITE_*`. (Repository secrets list in GitHub settings not queried.) |
| SEC-10 | **Pass** | Zero banned HTML/eval sinks in `src/`; all customer text renders as React text children. |
| SEC-11 | **Pass** | Zero `<input>`, `<textarea>`, `<form>`, `contenteditable`, `location`, `document.referrer`, or `postMessage` in `src/` or `index.html`. |
| SEC-12 | **Pass (build output)** | `vite.config.ts:7-24` injects the exact CSP `<meta>` tag with `apply: 'build'`, verified in built `dist/index.html`; zero inline scripts or styles in `src/`. (Live browser enforcement is MT-20.) |
| SEC-13 | **Pass** | `validate.ts:236-252` parses with `new URL()` and checks `protocol === 'https:'` and exact `hostname` membership in `SOURCE_HOSTS` (see minor note in finding 7 on ports/userinfo). |
| SEC-14 | **Pass** | The only `<a>` in the app (`DebriefScreen.tsx:152`) has `target="_blank" rel="noopener noreferrer"`, raw `href`, and text from `new URL(href).hostname` (`format.ts:113`). |
| SEC-15 | **Pass** | No prefetch, preconnect, or external icon/preview requests in `index.html` or `src/`. |
| SEC-16 | **Pass** | Grep confirms `src/ui/bestScore.ts` is the only file referencing `localStorage`, using key `hold-the-line:best-score`; no cookies, `sessionStorage`, or `indexedDB`. |
| SEC-17 | **Partial** | `parseBestScore` strictly accepts whole numbers `0` to `60`, rendered as a number, and all storage calls are inside `try`/`catch`; however, a read-succeeds/write-throws failure still displays `"New best score"` (finding 2). |
| SEC-18 | **Pass** | `CustomerScreen` receives only `CustomerView` (`App.tsx:33`, `customerView.ts:9-11`), `Slip` receives only `Slip`, zero `console.*` calls exist in `src/`, and no hidden fields appear in DOM, attributes, or title. |
| SEC-19, SEC-20 | **Not checked here** | GitHub repository settings/rulesets and `screenshots/` images were not inspected (MT-27). |
| SEC-21 | **Pass** | Re-read `src/data/customers.ts`: no real phone numbers, email addresses, account numbers, web addresses in customer text, or real people/businesses named as scammers. |

---

## What I did not look at

- **Browser rendering and interaction (MT-1 to MT-23):** I did not open the built site in Chrome or Firefox, so visual layout at 1280×720 and 375 px, keyboard tabbing and focus rings, screen-reader live-region announcements, measured contrast ratios, live CSP enforcement, and real double-click timing were not verified here.
- **External source URLs (MT-25):** I did not fetch or open any of the 16 URLs in `src/data/customers.ts` to verify they still resolve to the cited articles.
- **`npm audit` and `package-lock.json` internals (MT-26 / SEC-3):** I verified `package-lock.json` commit history and `package.json`'s eight dependencies, but did not run `npm audit` or read the resolved transitive tree inside `package-lock.json`.
- **GitHub repository settings and screenshots (MT-27 / SEC-9, SEC-19, SEC-20):** I did not query the GitHub API for repository rulesets, Actions permissions, Pages configuration, or Actions secrets, and I did not inspect the PNG files in `screenshots/`.
- **Other docs:** I did not read `docs/plan.md`, `docs/reviews/01-gift-card-check.md`, `docs/reviews/02-chatgpt-scam-fact-check.md`, or `README.md`, as they were outside the requested review scope.
