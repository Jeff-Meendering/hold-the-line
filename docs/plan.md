# Hold the Line: project plan

Version 5, Fri Nov 27, 2026. Version 1 was a chat draft written before the assignment text was available, version 2 added the AI workflow, version 3 applied the review fixes, version 4 records the gift-card decision, and version 5 brings the scope line on questions in line with the shared question bank in the requirements; see [ai-log.md](ai-log.md) for what changed and why. The assignment is in [assignment.md](assignment.md).

## 1. Purpose

Hold the Line is a short browser game where the player is a bank teller who must decide whether each customer's transaction is legitimate or the result of a scam. It teaches players to recognise the red flags of coached-victim fraud.

It is also the final project for a course on AI-assisted software engineering. Most of the grade is for how the AI tools are directed, coordinated, and checked across the SDLC, so the process evidence is a deliverable in its own right, equal to the game.

## 2. Scope

### In (must ship)

**Game**
- A pool of 10 scripted customers: 4 scam and 6 legit.
- Each day draws 6 customers from the pool with 1 to 3 scams. The scam count is picked first, then the customers are drawn.
- Three transaction types: cash withdrawal, wire, and bank-issued Visa gift cards with a $500 maximum per card, spread across scam and legit customers so the type alone is not a tell.
- Store gift cards, gold, and crypto ATMs appear as the reasons behind cash withdrawals, not as transactions, since that is what the FTC and FBI document.
- Per customer: a transaction slip, a short text description of their behaviour, and 5 questions with scripted answers, of which the player may ask up to 3. The questions come from a shared bank of 8, and each transaction type has a fixed set of 5, so the questions on offer say nothing about the customer.
- A decision per customer: process or hold.
- The player is not told how many scams a day can contain.
- No feedback on whether a call was right until the debrief, so the score is also hidden until then.
- Scoring that penalises both scams let through and legit customers blocked.
- An end-of-day debrief listing each customer, the player's call, the truth, and the red flags missed.
- A start screen with how-to-play, and a replay button.
- Customers defined in typed data files, with a test that validates them.
- One GitHub Actions workflow that runs the tests, then builds and deploys to GitHub Pages only if they pass.

**Process evidence**
- Documents for all six SDLC areas (section 7).
- `docs/ai-log.md`, updated after every step.
- Screenshots of every prompt, in the `screenshots/01`–`07` folders.
- Saved output of each independent review and fact-check.
- A README with the six sections the assignment requires.

### In if time allows (should)
- A best score saved in localStorage.
- A visual polish pass.

### Explicitly out
- LLM or any runtime-generated dialogue.
- Backend, accounts, leaderboards, and analytics.
- Custom art, sound, and animation; the game uses text, CSS, and emoji only.
- Multiple days, difficulty progression, timers, and a narrative.
- Free-text questions; the player picks from a list.
- A mobile-first layout; it must not break on a phone, but desktop is the target.
- End-to-end browser test automation, localisation, and a formal accessibility audit; basic keyboard use and contrast are still in.
- A separate user guide; the how-to-play screen covers it.

## 3. Constraints

- Solo developer, 25 hours total including docs and testing.
- Due Sunday Dec 6, 2026, 11:59pm.
- Vite, React, and TypeScript; static site on GitHub Pages; no backend.
- Customers are scripted in data files.
- No custom art.
- More than one AI model and tool must be used, with defined responsibilities.
- Every prompt must be screenshotted.
- The repository must be public, with a `/screenshots` folder and a README containing the six required sections.

## 4. Assumptions

1. One day is the whole game, and a day is 6 customers.
2. The pool is 4 scam and 6 legit. Drawing 1 to 3 scams in a day of 6 needs at least 3 scam and 5 legit, so the pool has one spare of each, and it can drop to 8 without changing the draw rules.
3. Scoring is asymmetric: letting a scam through costs more than blocking a legit customer. Exact numbers are set in requirements.
4. There is no per-customer timer.
5. Desktop browser is the target platform.
6. About 3 hours are available on weekend days and 1.5–2.5 on weekdays.
7. `architecture.md` and `security.md` live in `docs/`; `CLAUDE.md` lives at the repository root so the coding agent loads it.
8. Gemini can review the code and content from the public repository or from pasted files.
9. One other person is available to playtest for 15 minutes on Dec 4.
10. Vitest unit tests, a data validation test, and a written manual test plan are enough for the testing area; no end-to-end automation is needed.

## 5. AI tools and roles

| Tool | Role | Does not do |
|---|---|---|
| Claude Fable, in the repo | Writes the planning, requirements, and design documents, including `architecture.md`, `security.md`, the test strategy, and the first draft of `CLAUDE.md` | Implementation |
| Claude Fable, separate chat | Planning partner: drafts the prompts with Jeff and reviews what all the other tools produce. It reads the repo | Writing to the repo |
| Claude Opus, in the repo | Implementation: code, tests, customer data files, and the CI workflow, guided by `CLAUDE.md` | Reviewing its own work as the final check |
| Gemini 4 Neon | Independent reviewer of the customer content and of the code, so Claude is not the only thing checking Claude's work | Writing code or content |
| ChatGPT, in the browser | Fact-checks against real sources: first whether gift cards make sense at a teller window (done Nov 27, see [reviews/01-gift-card-check.md](reviews/01-gift-card-check.md)), then the scam scenarios against FTC and AARP sources (Nov 30) | Writing content |
| Jeff | Engineer of record: drafts the prompts with the planning partner, edits and approves every prompt before it is sent, makes every decision, triages every review finding, and approves every commit | — |

Exact model versions are recorded in the AI log the first time each tool is used.

**Rules for coordinating them**
- No tool has the last word on its own output. The planning-partner chat reviews what every other tool produces; Opus's code and content also go to Gemini; factual claims go to ChatGPT, and its sources are checked in turn; every finding comes back to Jeff.
- Review findings are triaged one by one as accept, reject, or defer, with the reason recorded in the AI log. A rejected finding is as useful to the record as an accepted one.
- For the fact-check, every cited source is opened and read before it is trusted. The source URL is stored with the customer it supports.
- Reviewers get the artefact and the requirements, not the author's reasoning, so the review is not steered toward agreeing.
- The README's AI analysis and reflection sections are written by Jeff from the AI log, not generated.

## 6. How each step runs

1. Draft the prompt with the planning-partner chat. Jeff edits and approves every prompt before it is sent.
2. Screenshot the prompt before sending it.
3. Run it and read the whole output.
4. Question, correct, or reject what is wrong, and re-prompt if needed. Screenshot each iteration. The planning-partner chat also reviews what each tool produces.
5. Commit the result in a small commit, so the history shows how the work evolved.
6. Add an entry to `docs/ai-log.md`: the prompt, what worked, what the AI got wrong, and what was changed, with the screenshot filenames.

Screenshots are named `NN-tool-short-description.png`, numbered in order within the phase folder, for example `screenshots/01-planning/02-fable-plan-revision.png`. Prompts sent to the planning-partner chat, Gemini, and ChatGPT are screenshotted too.

## 7. Deliverables

| File | SDLC area | Content |
|---|---|---|
| `docs/plan.md` | Planning | This plan |
| `docs/requirements.md` | Requirements | Functional and non-functional requirements, user personas, user stories, acceptance criteria, scoring and day-draw rules |
| `docs/design.md` | Design | UI and UX plan, wireframes, game-flow state diagram, customer data schema, design decisions |
| `docs/architecture.md` | Design | System architecture and technical decisions |
| `docs/security.md` | Design | Security considerations and requirements for a static site: dependencies, workflow permissions, rendering of content, no secrets or personal data |
| `CLAUDE.md` | Design | Instructions and context for the coding agent |
| `src/`, `.github/workflows/` | Implementation | The application and the test-then-deploy workflow |
| `docs/test-plan.md` | Testing | Test strategy, manual test cases traced to acceptance criteria, and results |
| `docs/reviews/` | Testing | Saved output of the gift-card check, the scenario fact-check, the Gemini content review, and the Gemini code review, with the triage of each finding |
| `docs/ai-log.md` | All | Running log of every AI step |
| `screenshots/` | All | Every prompt, plus the finished app |
| `README.md` | Documentation | Project overview, architecture summary, AI models and tools used, AI engineering analysis, engineering reflection, supporting documentation and context files |

## 8. Risks

| # | Risk | Likelihood / impact | Mitigation |
|---|---|---|---|
| 1 | Writing 10 believable customers takes longer than planned | High / high | Lock the data schema on Nov 28, write the customers on Nov 30 before any UI exists, and fall back to a pool of 8 if needed |
| 2 | Process evidence has gaps: a prompt is not screenshotted or a step is not logged, and it cannot be recreated | Medium / high | Screenshot before sending, log after every step, and check the log against the commit history on Dec 5 |
| 3 | 6.5 hours of coding leaves little room for iteration on the UI | Medium / high | Keep `CLAUDE.md` and the design specific so the first output is close, build in small steps, and apply the cut order in section 10; if the UI runs over, the pool drops to 8 first |
| 4 | The schedule slips, with only 1.5 hours of buffer | Medium / high | Milestones, a feature freeze on Dec 3, and the agreed cut order |
| 5 | A reviewer or the fact-checker is wrong: noisy findings, or sources that do not say what is claimed | Medium / medium | Triage every finding, open every source, and record rejections in the log |
| 6 | Coordinating four tools costs more time than it saves | Medium / medium | Two Gemini reviews and two fact-checks only, each with a fixed time box |
| 7 | The game is too obvious or too ambiguous to be fun | Medium / medium | Give legit customers some red-flag-like traits, have Gemini review for ambiguity, and playtest on Dec 4 |
| 8 | GitHub Pages deployment problems, such as the Vite `base` path | Medium / medium | Deploy a hello-world build through the full workflow on Nov 29 |
| 9 | Scam scenarios are inaccurate or mock the victims | Low / medium | The ChatGPT fact-check against FTC and AARP sources, and a debrief that explains rather than blames |
| 10 | Closed Nov 27. Gift cards turn out not to be something a teller sells, which would change the transaction types | — | Checked with ChatGPT before the schema was locked. Some credit unions sell Visa gift cards at their branches, so gift cards stay as bank-issued Visa gift cards. The cashier's-check fallback was dropped because the sources did not support it. See [reviews/01-gift-card-check.md](reviews/01-gift-card-check.md) |

## 9. Schedule (25 hours)

Each day's hours include the screenshots and AI log entries for that day's steps.

| Day | Hours | Phase | Work | Output |
|---|---|---|---|---|
| Fri Nov 27 | 2 | Planning 1.5, Requirements 0.5 | Plan draft and revision; save the assignment; start the AI log; **ChatGPT fact-check** on whether gift cards make sense at a teller window, done a day ahead of its Nov 28 slot; start the personas | `plan.md`, `assignment.md`, `ai-log.md`, `reviews/01-gift-card-check.md`, screenshots 01 |
| Sat Nov 28 | 3 | Requirements 1.5, Design 1.5 | Functional and non-functional requirements, personas, user stories, acceptance criteria, scoring and day-draw rules; then the customer data schema, the game-flow state diagram, and `architecture.md` | `requirements.md`, `architecture.md`, schema, screenshots 02 |
| Sun Nov 29 | 3 | Design 1.5, Testing 0.5, Implementation 1 | Wireframes, UI plan, and design decisions; `security.md`; `CLAUDE.md`; the test strategy; then scaffold the app with the workflow that tests, builds, and deploys | `design.md`, `security.md`, `CLAUDE.md`, `test-plan.md`, screenshots 03, **M1: live URL through CI** |
| Mon Nov 30 | 2.5 | Implementation 2, Testing 0.5 | Types and the data validation test from the schema; draft all 10 customers with Opus; **ChatGPT fact-check** of the scam scenarios, with sources recorded | Customer data files, `reviews/` fact-check |
| Tue Dec 1 | 2.5 | Testing 0.5, Implementation 2 | **Gemini content review**; fix the content from both reviews; then the game-state reducer, scoring, and day draw as pure functions with unit tests | `reviews/` content review, **M2: content locked**, tested core logic |
| Wed Dec 2 | 2 | Implementation 2 | Customer screen: slip, questions, process and hold; the day loop | One day playable without a debrief |
| Thu Dec 3 | 1.5 | Implementation 1.5 | Debrief screen; start and how-to-play screen; basic styling | **M3: playable end to end, feature freeze**, screenshots 04 |
| Fri Dec 4 | 3 | Testing 2, Documentation 1 | **Gemini code review** of the frozen code; triage and fix; run the manual test plan; playtest with one other person; then README sections 1–3 and 6 | `reviews/` code review, test results, screenshots 05 |
| Sat Dec 5 | 3.5 | Documentation 3.5 | README AI engineering analysis and reflection, written from the AI log; bring `architecture.md`, `security.md`, and `design.md` in line with what was built; organise the screenshots; final app screenshots; final deploy | **M4: submission-ready**, screenshots 06–07 |
| Sun Dec 6 | 2 | Documentation 0.5, Buffer 1.5 | Check the public repository from a logged-out browser: links, screenshots, live URL; submit | Submitted |

Hours by phase:

| Phase | Hours | Notes |
|---|---|---|
| Planning | 1.5 | |
| Requirements | 2 | Includes the gift-card check |
| Design | 3 | Includes `architecture.md`, `security.md`, and `CLAUDE.md` |
| Implementation | 8.5 | 6.5 code, 2 customer content |
| Testing | 3.5 | Includes the scenario fact-check and both Gemini reviews |
| Documentation | 5 | |
| Buffer | 1.5 | |
| **Total** | **25** | |

## 10. Cut order if behind

1. The "should" list: the best score and the polish pass.
2. The pool, from 10 customers to 8 (3 scam and 5 legit), which still supports draws of 1 to 3 scams.
3. Start-screen and styling effort: plain, readable CSS with the how-to-play text on the first screen.
4. The outside playtester: self-playtest, and say so in the test results.
5. Component-level tests: keep the scoring, draw, and state unit tests, the data validation test, and the manual test plan.

Not to be cut: the debrief screen, the test-then-deploy workflow, the two Gemini reviews and the two fact-checks, the AI log, the prompt screenshots, and the README analysis and reflection. These are what the assignment grades.
