# Hold the Line: security

Version 3, Sat Nov 28, 2026. Built on [requirements.md](requirements.md) version 6, [architecture.md](architecture.md) version 4, and [design.md](design.md) version 4. Version 2 records Jeff's decisions on D22 to D27. Version 3 adds `www.cftc.gov` to the source hosts in D24. Nothing is implemented yet. The requirements in section 3 are what the code and the workflow are checked against in the Gemini code review on Dec 4, and this document is brought in line with what was built on Dec 5.

Jeff approved D22 to D26 on Nov 27 and D27 in part ([section 7](#7-decisions-for-jeff)). Nothing in this document is waiting for a decision.

## 1. What there is to protect

Hold the Line is a folder of static files on GitHub Pages. There is no server, account, form, payment, personal data, or secret anywhere in the project, so most of what a security document usually covers does not exist here (section 5). Four things are left:

1. **The site runs the code we wrote.** Players, and Jeff's instructor, load JavaScript from `jeff-meendering.github.io/hold-the-line/`. The real risk is code we did not write getting into that bundle or replacing it, through an npm package, a GitHub Action, or a push to `main`.
2. **The site sends players only to official sources.** A game about scams must not link to the wrong place.
3. **The repository publishes nothing private.** It is public and will hold dozens of screenshots.
4. **The game does not give the answer away before the debrief.** This is a game rule (FR-7), not a security boundary. Section 4 says where the line is.

## 2. Risks and what we do

| # | Risk | How real it is | What we do |
|---|---|---|---|
| 1 | **Dependencies.** The eight packages bring in many more that nobody on this project reads. They run on Jeff's machine and in CI, and the build tools decide what goes in the bundle | The most real one | A fixed list of eight, a committed lockfile, `npm ci`, and `npm audit` twice. No new package without asking, which also covers an AI inventing a package name that someone else has registered (SEC-1 to SEC-4). **Limit:** the lockfile makes every install the same. It does not make the packages safe, and nothing here would notice a malicious build tool |
| 2 | **The workflow.** It runs other people's code with a token for this repository and decides what gets published | Real | A read-only token. Write permission only in the deploy job, which runs no repository or npm code. GitHub's own actions, pinned. No secrets (SEC-5 to SEC-9) |
| 3 | **A push to `main` is a deploy.** Anyone with Jeff's GitHub login can replace the site, and the coding agent runs with that login | Real, and mostly outside the repository | A branch and a pull request per step, merged by Jeff, and a ruleset on `main` that enforces it (SEC-19). Two-factor sign-in on the account is Jeff's to keep on and cannot be checked from here |
| 4 | **Rendering customer text as HTML** | Low today. We write the text, it is compiled in, and there is no input field, so no attacker supplies any. But it is drafted by an AI, and the rule costs nothing | React text nodes only, and a list of banned APIs, with a Content-Security-Policy as the backstop (SEC-10 to SEC-12) |
| 5 | **The external links on the debrief** | Low, but it is the one place the game hands the player to another site. The likely failure is a mistyped or invented URL, not an attacker: this project has already had AI-written URLs that returned 404 ([ai-log.md](ai-log.md) entry 5) | `https` only, and an allowlist of hosts in the data test. Link text computed from the URL. A new tab with `noopener noreferrer`. Nothing requested before a click (SEC-13 to SEC-15) |
| 6 | **`localStorage`** | Low: one number. But the value is not ours to trust. Every Pages site on this account shares the origin `https://jeff-meendering.github.io`, so another of Jeff's sites, or the player in the developer tools, can read or change it | One namespaced key in one file, checked when read, and every call in a `try`/`catch` (SEC-16, SEC-17) |
| 7 | **The answers are readable in the bundle** | Certain | Accepted. See section 4 (SEC-18) |
| 8 | **Publishing something private.** Screenshots of prompts, terminals, and browser windows are the likeliest way a token, an email address, or another tab ends up public | Medium | Every screenshot is looked at before it is committed. Secret scanning and push protection are on (SEC-20, SEC-21) |

## 3. Requirements

"Review" in the last column means the Gemini code review. `MT-n` is a manual test in [test-plan.md](test-plan.md). The rules test is `src/rules.test.ts`, described in section 4 of that document.

| ID | Requirement | Checked by |
|---|---|---|
| **Dependencies** | | |
| SEC-1 | `package.json` lists exactly the eight packages in architecture.md section 5. `dependencies` holds only `react` and `react-dom`. Adding, removing, or swapping a package needs Jeff's approval first, recorded in the AI log | Review |
| SEC-2 | `package-lock.json` is committed. The workflow installs with `npm ci`, never `npm install`. The lockfile changes only in a pull request that says why | Review |
| SEC-3 | `npm audit` is run on Nov 29 and Dec 4, and each finding is recorded with whether it can reach the built site. `npm audit fix --force` is never run, because it can change major versions (D26) | MT-26 |
| SEC-4 | At runtime the game loads nothing from another origin: no CDN script, web font, analytics, embed, or remote image. `src/` calls no network API: `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon` (NFR-1) | Rules test, MT-16 |
| **Workflow** | | |
| SEC-5 | The workflow sets `permissions: contents: read` at the top. Only the deploy job adds `pages: write` and `id-token: write`. No job has any other write permission | Review |
| SEC-6 | Only the build job checks out the repository or runs `npm`. The deploy job has one step, `actions/deploy-pages`, and no `run:` line, so code from npm never runs in a job that can publish | Review |
| SEC-7 | Every `uses:` is one of the four `actions/*` actions in the table below. Each is pinned to a full 40-character commit SHA with the version in a comment, and the SHA is looked up with `git ls-remote`, never written from memory (D22) | Review, section 6 |
| SEC-8 | The workflow runs on `push` to `main` and on `pull_request` into `main` (D23). It never uses `pull_request_target` or `workflow_run`. The deploy job has `if: github.event_name == 'push' && github.ref == 'refs/heads/main'` and `environment: github-pages` | Review |
| SEC-9 | The workflow uses no `secrets.*` value and the repository has none. No `.env` file is committed, and the code reads no `import.meta.env.VITE_*` value, because Vite copies those into the bundle. No `${{ github.event.… }}` value appears in a `run:` line. `actions/checkout` runs with `persist-credentials: false` | Review |
| **Rendering** | | |
| SEC-10 | All content reaches the page as React text children. `src/` does not contain `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, or a Markdown or HTML renderer (NFR-9) | Rules test, review |
| SEC-11 | The game takes no input. There is no `<input>`, `<textarea>`, `<form>`, or `contenteditable`, and the code reads nothing from `location`, `document.referrer`, or `postMessage` (NFR-2) | Review, MT-17 |
| SEC-12 | The built `index.html` carries the Content-Security-Policy below in a `<meta>` tag, added at build time only. The app uses no inline script or inline style (D25) | MT-20 |
| **External links** | | |
| SEC-13 | Every source URL parses with `new URL()` and has the protocol `https:`. Its hostname is exactly one of the hosts in `SOURCE_HOSTS` (D24, rule V17). `validateData` checks both, on the parsed hostname and not with `startsWith`, which `https://consumer.ftc.gov.example.com` would pass | Data test, MT-25 |
| SEC-14 | The only links in the app are the debrief's source links. Each has `target="_blank"` and `rel="noopener noreferrer"`. Its `href` is the source URL unchanged, and its text is the hostname taken from that same URL, never text from the content | Review, MT-9 |
| SEC-15 | Nothing is requested from a source site until the player clicks: no prefetch, preconnect, preview, or icon (NFR-1) | MT-16 |
| **Storage** | | |
| SEC-16 | Only `src/ui/bestScore.ts` touches browser storage. It uses one key, `hold-the-line:best-score`, holding one number. There are no cookies, `sessionStorage`, or IndexedDB (NFR-2) | Rules test, MT-17 |
| SEC-17 | The stored value is treated as untrusted. It is used only if it parses to a whole number from 0 to 60, and anything else means no best score. It is rendered as a number. Every storage call is inside a `try`/`catch`, and the game plays normally when storage throws (FR-17) | Review, MT-23 |
| **Hidden information** | | |
| SEC-18 | Before the debrief, nothing from a customer's `truth`, `redFlags`, `scamType`, `lookAlike`, `explanation`, `sourceUrls`, or `id` reaches the page: not as text, a class name, an element id, a `data-*`, `aria-*`, or `title` attribute, the tab title, the URL, or the console. `CustomerScreen` and `Slip` are given a `CustomerView` or a `Slip` and nothing else about the customer (FR-7, architecture T6). The shipped code has no `console` call | Rules test, MT-18 |
| **Repository and evidence** | | |
| SEC-19 | Repository settings: Pages is built from GitHub Actions with HTTPS enforced; the default workflow token is read-only; secret scanning and push protection are on; the `github-pages` environment deploys only from `main`; Dependabot alerts are on (D26). A ruleset on `main` requires a pull request and blocks force pushes, with no required status check. Actions are limited to GitHub-owned actions. The setting that requires SHA pinning is left off (D27) | MT-27 |
| SEC-20 | Every screenshot, and the AI log, is checked for tokens, email addresses, other tabs, and notifications before it is committed. A secret that does get pushed is revoked, not just deleted, because the history is public | MT-27 |
| SEC-21 | Customer text contains no real phone number, email address, account number, or web address, and names no real person or business as a scammer | Gemini content review |

**Actions and versions (SEC-7).** The tags and SHAs were read from each action's repository on Nov 27, 2026 with `git ls-remote`. They are checked again at the scaffold, and a newer release is fine if it is looked up the same way.

| Action | Job | Version | Commit |
|---|---|---|---|
| `actions/checkout` | build | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/setup-node` | build | v7.1.0 | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| `actions/upload-pages-artifact` | build | v5.0.0 | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| `actions/deploy-pages` | deploy | v5.0.1 | `368f82528645a54fb793d4d04e342629a3f51346` |

`actions/configure-pages` is left out, because the base path is fixed in `vite.config.ts`. If the first deploy fails without it, it is added to the build job and pinned the same way. GitHub's starter workflow for Pages, read on Nov 27, gives all three permissions to the whole workflow and pins by tag, so it is not copied as it is.

**Content-Security-Policy (SEC-12).**

```text
default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'
```

With this the browser refuses inline script and any request to another origin, so SEC-4 and SEC-10 no longer rest only on review. A few lines in `vite.config.ts` add it to the build only, because Vite's dev server needs inline script. A `<meta>` policy cannot set `frame-ancestors`, so it does nothing about the page being framed (section 5). It has not been tried against a real build.

**Repository settings as they were on Nov 27, 2026**, read through the GitHub API: public; default workflow token read-only; no Actions secrets; secret scanning and push protection on; Dependabot alerts off; `main` not protected and no rulesets; any action allowed and SHA pinning not required; Pages not yet enabled.

## 4. Accepted risks

1. **Anyone can read the answers.** Each customer's truth, red flags, and explanation are in the JavaScript the player downloads, and in `src/data/customers.ts` in the public repository. Hiding them would need a server, which the plan rules out, and obfuscating them is not security and would make the code harder to review. Nothing is won by cheating: there is no prize, leaderboard, or account. What FR-7 promises is narrower and is kept: a player using the page as it is rendered, with a mouse, a keyboard, or a screen reader, learns nothing before the debrief (SEC-18). A player who opens the developer tools can learn everything.
2. **The shared origin.** Other Pages sites on Jeff's account can read and write the best score, and could script this page. Only Jeff publishes there.
3. **We trust GitHub and npm.** Pages serves the files and sets the HTTPS certificate and every response header. Actions runs the build. The registry serves the packages the lockfile names. If any of these is compromised, nothing in this repository helps.
4. **The best score can be edited** in the developer tools. It is shown only to the person who edited it.
5. **`Math.random` is predictable.** It picks which customers appear, and nothing depends on that being secret.

## 5. Out of scope

| Topic | Why |
|---|---|
| Sign-in, sessions, permissions, CSRF, SQL injection, rate limiting, server hardening | There is no server, account, or database |
| Secret management and encryption | There are no secrets and no stored personal data |
| Response headers, including a header-based CSP, `X-Frame-Options`, and HSTS | GitHub Pages sets the headers and does not let a site change them. Framing the game gains an attacker nothing, because a click in it does nothing outside it |
| Cheat prevention | Section 4, item 1 |
| Privacy compliance work | The game collects nothing and stores one number that identifies nobody (NFR-2). GitHub logs visitors' IP addresses under its own privacy statement, which we do not control |
| Denial of service and availability | GitHub's to handle. The game can be rebuilt from the repository |
| Penetration testing, static-analysis services, and dependency scanning beyond `npm audit` | Out of proportion to a 25-hour project with no data to steal |
| Automatic dependency updates | The code is frozen on Dec 3 and submitted on Dec 6 |
| A compromised browser, extension, or device on the player's side | Nothing a web page can defend against |

## 6. Checks for the code review

Run from the repository root. The rules test checks the first four on every run of `npm test`, and these are for the reviewer. Each was tried on sample files on Nov 27. They catch honest mistakes. They are not proof, because code written to avoid them would pass.

```sh
# SEC-10: expect no output
grep -rnE "dangerouslySetInnerHTML|innerHTML|outerHTML|insertAdjacentHTML|document\.write|\beval\(|new Function" src --exclude='*.test.ts'

# SEC-16: expect only src/ui/bestScore.ts
grep -rlE "localStorage|sessionStorage|document\.cookie|indexedDB" src --exclude='*.test.ts'

# SEC-4: expect no output
grep -rnE "fetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon" src --exclude='*.test.ts'

# SEC-4, SEC-13: expect only sourceUrls lines in src/data/customers.ts
grep -rnE "https?://" src index.html --exclude='*.test.ts'

# SEC-7: expect no output (every action is pinned to a SHA with a version comment)
grep -n "uses:" .github/workflows/deploy.yml | grep -vE "@[0-9a-f]{40} # v[0-9]+\.[0-9]+\.[0-9]+$"

# SEC-7: the SHA printed is the one in the workflow, for each action and version
git ls-remote https://github.com/actions/checkout refs/tags/v7.0.1
```

The reviewer also reads `package.json` against SEC-1 and the whole workflow file against SEC-5 to SEC-9. It is one short file.

## 7. Decisions for Jeff

The numbering continues from [design.md section 6](design.md#6-decisions). D28 to D34 are in [test-plan.md](test-plan.md#9-decisions-for-jeff). Jeff decided all six on Nov 27, 2026.

| # | Decision | Outcome | Why | Status |
|---|---|---|---|---|
| D22 | How actions are pinned | Full commit SHA, with the version in a comment. No automatic updates | A tag can be moved to different code, which is how the `tj-actions/changed-files` action was used to leak CI secrets in March 2025. A SHA cannot. A pinned action never updates itself, which does not matter over nine days. The alternative is a major tag such as `@v7`, as in GitHub's starter | Approved by Jeff, Nov 27 |
| D23 | Run the tests on pull requests | The build job (test, then build) also runs on a pull request into `main`. The deploy job still runs only on a push to `main` | Every step ends in a pull request that Jeff merges, and a merge is a deploy. With this he sees a pass or fail that does not depend on the coding agent saying the tests passed. Architecture.md section 2 now shows it | Approved by Jeff, Nov 27 |
| D24 | An allowlist of source hosts | A new validation rule, V17: every source URL's hostname is one of `consumer.ftc.gov`, `www.ftc.gov`, `www.fincen.gov`, `www.aarp.org`, `www.fbi.gov`, `www.ic3.gov`, `www.consumerfinance.gov`, `www.cftc.gov` | Rule V7 only asks for `https://`, so a wrong or invented domain passes the test. With the list, adding a host is a one-line change that shows in a pull request. It adds a rule to design.md section 2.6. The fact-check still has to open every page: the list checks the site, not what the page says | Approved by Jeff, Nov 27. `www.cftc.gov` was added on Nov 28, in Jeff's prompt for the fix round, for the CFTC advisory that `c04` cites |
| D25 | A Content-Security-Policy `<meta>` tag | Add it at the scaffold on Nov 29, when a blank page costs nothing. Drop it if it takes more than 15 minutes | It makes the browser enforce NFR-1 and NFR-9. The risk is that a wrong policy blanks the live page while every test passes, because no test loads the page. MT-20 checks for that | Approved by Jeff, Nov 27 |
| D26 | `npm audit` | Run by hand at the scaffold and on Dec 4, and record the triage. Not a step in the workflow. Turn on Dependabot alerts in the repository settings | As a workflow step, a new advisory in a dev-only package could block a deploy on Dec 6 over a problem that cannot reach the built site. Alerts are one switch and open no pull requests | Approved by Jeff, Nov 27 |
| D27 | Repository settings | (a) A ruleset on `main`: changes come through a pull request, and no force pushes. No required status check, because MT-24 has to merge a failing test on purpose. (b) Actions: allow only GitHub-owned actions. The setting that requires SHA pinning stays off | (a) The coding agent runs with Jeff's login, and earlier steps were committed straight to `main`. Once the workflow exists, that would publish unreviewed code. (b) makes GitHub refuse an action from anyone else. The recommendation was to require SHA pinning too. Jeff left that out: the workflow pins by SHA anyway and the review checks it, and an untested setting should not be able to break the first deploy. Neither of the approved settings has been tried against this workflow | Approved in part by Jeff, Nov 27 |

A repository setting is changed by Jeff, or by an AI only when his prompt says to and names the setting. As of this version none has been changed.
