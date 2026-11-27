# Hold the Line: test plan

Version 3, Fri Nov 27, 2026. Built on [requirements.md](requirements.md) version 6, [architecture.md](architecture.md) version 5, [design.md](design.md) version 5, and [security.md](security.md) version 2. Version 2 uses the new scoring numbers (D1), gives every manual case a priority, and records Jeff's decisions on D28 to D34. Version 3 records what the game-logic step built (PR #7): where the test helper lives and how a message about a question set starts. `src/game/` and its unit tests are implemented; nothing else beyond the scaffold is. Sections 1 to 7 are the strategy and the test cases. Section 8 holds the results and is empty until the tests are run.

Jeff decided D28 to D34 on Nov 27 ([section 9](#9-decisions-for-jeff)). Nothing in this document is waiting for a decision.

## 1. Strategy

Every game rule is in a pure function, so rules are tested by code and screens are tested by hand (D16). The reviews by other AI tools are part of the testing, because Claude wrote both the code and its tests.

| Level | What it checks | Tool | Runs |
|---|---|---|---|
| Type check | The code and the content fit the schema | `tsc -b`, strict, inside `npm run build` | Every pull request and every push to `main` (D23) |
| Unit tests | Draw, reducer, scoring, debrief, and the validator, on small made-up pools | Vitest, `npm test` | Same |
| Data validation test | The real customers and question bank against rules V1 to V17 | Vitest, `npm test` | Same |
| Rules test (D28) | The layer rules and the banned APIs, by reading the source files | Vitest, `npm test` | Same |
| Pipeline | A failing test or build stops the deploy | GitHub Actions | MT-24, once |
| Manual tests | What is on screen, the keyboard, layout, and the browser checks | Jeff, on the live site | Dec 4 |
| Fact-check and content review | Whether the scenarios are true, and whether the customers read as intended | ChatGPT, Gemini | Nov 30, Dec 1 |
| Code review | Architecture, security requirements, and whether the tests test anything | Gemini | Dec 4 |
| Playtest | Whether a new player can finish and what they learn | One person, 15 minutes | Dec 4 |

Rules for all of it:

1. `npm test` does not check types, and `npm run build` does not run tests. Both must pass before a step is called done, and the workflow runs both.
2. Unit tests use made-up pools with placeholder text, built by a small helper, `src/game/testPool.ts`, so they do not break when a customer is rewritten. Only `data.test.ts` reads the real content. The helper has its own copy of the three question sets and no source URLs, so `validate.test.ts` adds those itself.
3. Tests never use `Math.random`. Every draw in a test takes `mulberry32(seed)` with a fixed seed, so no test can pass one day and fail the next.
4. A failing test is fixed in the code. A test is changed only when the requirement it traces to has changed, and the pull request says so.
5. A test is trusted once it has been seen to fail (D34). For each file in section 2, one deliberate break is made in the code, the failing test is named in the pull request, and the break is undone.
6. Manual tests are run on the deployed site at the frozen commit, not on `localhost`, because that is the build players get.

**Not tested, and why**

| What | Why |
|---|---|
| React components by code | D16. Component tests need two or three more packages. The components hold no rules, and each screen has manual cases |
| The browser, end to end, by code | Out of scope in the plan |
| Coverage as a number | A coverage reporter would be a ninth package (SEC-1). Section 5 traces every acceptance criterion to a test, which is the coverage that matters here |
| Browsers other than current Chrome and Firefox, and real phones | NFR-3 and NFR-4 name two desktop browsers and a 375 px viewport |
| Load, performance, and screen readers | No server and a bundle limit (NFR-7). A formal accessibility audit is out of scope. Keyboard use and contrast are tested |

## 2. Unit tests

Each file sits next to the module it tests in `src/game/`. The cases below are the minimum.

| File | Cases | Covers |
|---|---|---|
| `draw.test.ts` | Over seeds 1 to 1,000 on a pool of 4 scam and 6 legit: every day has 6 different customers and 1, 2, or 3 scams; each count occurs between 250 and 420 times; a scam appears in each of the 6 positions; every customer in the pool is drawn at least once. The same seed gives the same day, and the 1,000 days are not all the same. A pool of 3 and 5 still works, and a 3-scam day uses all three. The pool array is not changed. `drawDay` calls only the random source it is given: the test makes `Math.random` throw | AC-5.1 to AC-5.3, section 6, NFR-8 |
| `scoring.test.ts` | `pointsFor`: all four rows of the scoring table. `scoreDay`: every example in requirements section 5. Then every combination of 1, 2, or 3 scams and 64 sets of decisions, each compared with `max(0, 60 − 30 × scams processed − 15 × legit held)`. The result is always 0, 15, 30, 45, or 60. The worst day, with a raw sum of −75, scores 0 | Section 5, AC-6.1, NFR-8 |
| `reducer.test.ts` | One case per row of the transition table in design.md section 1.2. Asking: a valid question is recorded; a fourth question, a repeated question, and a question the customer has no answer to all return the same state. Deciding with 0, 1, 2, and 3 questions asked records the questions and the call, moves on, and clears the questions. The sixth decision gives the debrief phase with 6 results in order. `ask` and `decide` do nothing in `start` and `debrief`; `startDay` does nothing in the middle of a day. No action lowers `index`. `startDay` from the debrief gives exactly the state a first start gives. A whole scripted day is played from `start` to `debrief`. The input state is frozen first, so a mutation throws | FR-2, FR-4 to FR-6, FR-10, AC-3.2, AC-3.3, AC-4.1 to AC-4.3, AC-7.1 |
| `debrief.test.ts` | For a scripted day: rows in the order played, each with the call, right or wrong, and +10, −5, or −20 for the four cases; `score` equals `scoreDay`; the four counts. The day in the debrief wireframe gives 30, "1 of 2" and "4 of 4". Flag status: a slip or behaviour flag is `shown` whatever was asked; a flag behind a question is `asked` or `notAsked` to match. The example customer with `purpose`, `urgency`, and `told` asked gives the four statuses in design.md section 2.5. Flags come out as slip, behaviour, then answers in bank order, whatever order the data has. `floored` is true only when the six points add up to less than 0. A legit customer has no flags. A look-alike has its status and `explanationAsked` both ways, and a customer without one has none | FR-8, FR-9, AC-6.1 to AC-6.3, AC-6.5 |
| `validate.test.ts` | A valid pool of 8 returns no messages. Then one broken copy for each of V1 to V17, each expecting a message that starts with the customer id, the question id, the transaction type for a question set (V2), or `pool`. The broken copies include every case the acceptance criteria name: an answer removed, a red flag removed, the source URLs removed (AC-8.1); a set of 4, a set with a repeat, a bank question in no set, an extra or missing answer (AC-8.3); flags behind 3 questions, and two scam customers admitting on `told` (AC-8.4); one look-alike in an answer, and a look-alike explained by its own question (AC-8.5). Two broken customers give messages for both in one run. A customer with a field missing gives a message and does not throw. For V17: an `http` URL, a URL on a host outside `SOURCE_HOSTS`, and one that only starts with an allowed host, such as `https://consumer.ftc.gov.example.com/` (AC-8.6) | FR-15, AC-8.1, AC-8.3 to AC-8.6, SEC-13 |

A rule about the whole pool (V10 to V13, V15, V16) has no single customer to name. Its message starts with `pool` and names the customers involved where there are any (D32). A message about a transaction type's question set starts with the type, and a customer with no id is named by its place in the list, as in `customers[3]` (design.md section 2.6).

## 3. Data validation test

`src/data/data.test.ts` is the one test that reads the real content. It fails the build, and so stops the deploy, when a content change breaks a rule.

| Check | Covers |
|---|---|
| `validateData` on the real customers, question bank, and sets returns no messages. On failure the test prints every message, each starting with the customer or question id | FR-11 to FR-15, FR-18, FR-19, V1 to V17 |
| Every red flag id, scam type, and transaction type has a label that is not empty. The types already require this, but `npm test` does not check types | FR-9 |
| `drawDay` on the real pool, over seeds 1 to 1,000, gives days of 6 different customers with 1 to 3 scams | AC-5.1 on the real content |

What it cannot check is whether the text is any good: whether a cover story reads like a legit customer, whether an explanation blames the victim, whether a source says what the customer's scenario claims. Those go to the reviews in section 6.

## 4. Rules test

`src/rules.test.ts` reads every source file in `src/` that is not a test, as text, and fails with the file and the rule (D28). It needs no new package. With no linter (D17), nothing else checks these rules on every change. The reviewer's version of the same checks is the commands in [security.md section 6](security.md#6-checks-for-the-code-review).

| Rule | Covers |
|---|---|
| A file in `src/game/` imports nothing from `react`, `react-dom`, `src/ui/`, `src/data/`, or `App`, and does not mention `Math.random`, `localStorage`, `document`, or `window` | Architecture rule 1, NFR-8 |
| A file in `src/data/` has no import except `import type` from `src/game/types` | Architecture rule 2 |
| No file contains an HTML sink from SEC-10 or a network API from SEC-4, and no `console` call | NFR-9, NFR-1, SEC-4, SEC-10, SEC-18 |
| `localStorage` appears only in `src/ui/bestScore.ts`. `sessionStorage`, `document.cookie`, and `indexedDB` appear nowhere | NFR-2, SEC-16 |
| `http://` and `https://` appear only in `src/data/customers.ts` | SEC-4, SEC-13 |
| `CustomerScreen.tsx` and `Slip.tsx` do not mention `truth`, `redFlags`, `scamType`, `lookAlike`, `explanation`, or `sourceUrls` | FR-7, SEC-18 |

It matches text, so a comment containing a banned word fails it, and the comment is reworded. It catches honest mistakes and is not proof.

## 5. Traceability

Eight acceptance criteria are fully automated, seven are manual only, and twelve have both, because the rule is tested by code and the screen is checked by hand.

| Criterion | Automated by | Manual case |
|---|---|---|
| AC-1.1, AC-1.2, AC-1.3 | | MT-1, MT-2 |
| AC-2.1 | | MT-2 |
| AC-3.1 | `data.test.ts` (V5: answers match the type's set) | MT-3 |
| AC-3.2, AC-3.3 | `reducer.test.ts` | MT-3 |
| AC-4.1 | `reducer.test.ts` | MT-4 |
| AC-4.2 | `reducer.test.ts`; `CustomerView` type; rules test | MT-4, MT-18 |
| AC-4.3 | `reducer.test.ts` | MT-12 |
| AC-4.4 | | MT-5, MT-13 |
| AC-5.1, AC-5.2, AC-5.3 | `draw.test.ts`, `data.test.ts` | Not needed |
| AC-6.1, AC-6.2 | `scoring.test.ts`, `debrief.test.ts` | MT-6 |
| AC-6.3 | `debrief.test.ts` | MT-7 |
| AC-6.4 | `validate.test.ts` (V4: not empty); Gemini content review | MT-8 |
| AC-6.5 | `debrief.test.ts`, `validate.test.ts` (V7, V9, V17) | MT-9, MT-25 |
| AC-7.1 | `reducer.test.ts` | MT-10 |
| AC-8.1, AC-8.3 to AC-8.6 | `validate.test.ts`, `data.test.ts` | Not needed |
| AC-8.2 | | MT-24 |
| AC-9.1 (should) | | MT-22 |

| Non-functional | Checked by |
|---|---|
| NFR-1 | MT-16, rules test |
| NFR-2 | MT-17, rules test |
| NFR-3 | MT-13, MT-15 |
| NFR-4 | MT-14 |
| NFR-5 | MT-13 |
| NFR-6 | MT-19 |
| NFR-7 | MT-21 |
| NFR-8 | Section 2, rules test, code review |
| NFR-9 | Rules test, code review |
| NFR-10 | Playtest |
| NFR-11 | Gemini content review, MT-8 |

The security requirements name their own checks in [security.md section 3](security.md#3-requirements).

## 6. Manual test cases

Run on the live site, `https://jeff-meendering.github.io/hold-the-line/`, in seven runs. The times are estimates and add up to about an hour.

Each case has a priority, for a Dec 4 that runs short. Write "not run" against any case that is skipped.

| Priority | Meaning | Cases |
|---|---|---|
| Must | Without it, an acceptance criterion or a basic promise of the game (keyboard play, Firefox, no outside requests, nothing private published) has been checked by nobody, or a broken game could be submitted | MT-1 to MT-7, MT-10, MT-13, and MT-16 on Dec 4, about 25 minutes. MT-22 too if the best score shipped. MT-24 on Nov 29 and MT-27 on Dec 6 |
| Should | The only check of a non-functional or security requirement, or the on-screen half of a criterion the unit tests already cover | MT-8, MT-9, MT-12, MT-14, MT-15, MT-18 to MT-21, MT-25, MT-26 |
| If time | A second look at something another case or test already covers | MT-11, MT-17, MT-23 |

A day is random, so the tester cannot choose the customers. Run A is a script for what to do with whoever turns up, written down on the worksheet in section 8 as it is played.

**Run A: one scripted day. Chrome, 1280×720 viewport, mouse. About 12 minutes.**

| ID | Priority | Covers | Steps | Expected | Result (Dec 4) |
|---|---|---|---|---|---|
| MT-1 | Must | AC-1.1 to AC-1.3 | Open the site | The title, the how-to-play text, and Start are all visible without scrolling. The text says: process or hold; up to 3 questions; both mistakes cost points and a missed scam costs more; results come at the end. It says "some" customers are scams and gives no number or range | |
| MT-2 | Must | AC-2.1, AC-1.3 | Press Start. On each of the 6 customers, read the screen and fill in the worksheet | "Customer *n* of 6", a name, a behaviour description, and a slip with the type, the amount, and "Usual activity". A wire also shows To and Destination. Gift cards show count × value and the total. No screen says how many scams there are. Tick each of the three types when seen, and look for a missing one in run B | |
| MT-3 | Must | AC-3.1 to AC-3.3 | On customer 1, ask three questions, one at a time. Then click an unasked question, then an asked one | Five questions, in this order for the slip's type. Cash: purpose, origin, urgency, next, told. Wire: purpose, recipient, met, verified, told. Gift cards: purpose, recipient, urgency, next, told. The wording matches `src/data/questions.ts`. Each answer appears under its question and stays. The counter goes 3, 2, 1, 0. At 0 the other two are greyed and do nothing. An asked question does nothing | |
| MT-4 | Must | AC-4.1, AC-4.2 | Customer 1 (3 asked): Process. Customer 2: ask nothing, Hold. Customer 3: ask 1, Process. Customer 4: ask 2, Hold | Each press brings the next customer with the counter at 3 and no answers showing. Nothing says right or wrong, scam or legit, a red flag, or a score | |
| MT-5 | Must | AC-4.4 | Customer 5: ask 3, then double-click Process | The header reads "Customer 6 of 6". Customer 6 has not been decided | |
| MT-6 | Must | AC-6.1, AC-6.2 | Customer 6: decide either way. Compare the debrief with the worksheet | The debrief appears. Six cards in the order played, with the names on the worksheet. Each card's call matches the worksheet and shows the truth, RIGHT CALL or WRONG CALL, and +10, −5, or −20 as in the scoring table. The score "*N* / 60" equals the six cards added up, or 0 if that is below 0. The counts line matches the cards | |
| MT-7 | Must | AC-6.3 | For each scam card, compare the flags with the worksheet and with that customer's `redFlags` in `src/data/customers.ts` | Every flag in the data is listed. A slip or behaviour flag says *shown*. A flag behind a question says *you asked* if the worksheet has that question and *you didn't ask* if not, and shows the question and the answer | |
| MT-8 | Should | AC-6.4, NFR-11 | Read the explanation on all 6 cards | Every card has one. A scam card says what the scammer did. None calls the customer foolish, greedy, or careless | |
| MT-9 | Should | AC-6.5, SEC-14 | On a scam card, click a "Read more" link, then inspect it. Find a legit card with "What could look like a red flag" | The link text is the site's hostname. It opens the official page in a new tab and the debrief is still in the first tab. The link has `target="_blank"` and `rel="noopener noreferrer"`. The look-alike card names the flag, shows where it appeared, and shows the explaining question and answer, each marked to match the worksheet. If no look-alike was drawn, check in run B | |

**Run B: replays. Chrome, mouse. About 8 minutes.**

| ID | Priority | Covers | Steps | Expected | Result (Dec 4) |
|---|---|---|---|---|---|
| MT-10 | Must | AC-7.1 | Press Play again on the debrief | "Customer 1 of 6", the counter at 3, no answers, no score. The customers or their order differ from run A | |
| MT-11 | If time | Section 5, D2 | On this day, double-click Hold on customer 1, then hold everyone | The double-click decides one customer. The score depends on how many scams the cards show. With 1 scam it is "0 / 60" and the points key adds "A day cannot score below 0", because the cards add up to −15. With 2 it is "0 / 60" without that line, because they add up to exactly 0. With 3 it is "15 / 60" | |
| MT-12 | Should | AC-4.3, FR-10 | Play again. Decide 2 customers. Look for a score. Press the browser's Back button, then return to the site. Start again, decide 2, and reload | No score is on screen during a day. Back leaves the site or does nothing. Returning shows the start screen or the customer that was on screen, never an earlier one. The reload shows the start screen, and Start gives "Customer 1 of 6" | |

**Run C: keyboard only. Firefox, 1280×720. About 8 minutes.**

| ID | Priority | Covers | Steps | Expected | Result (Dec 4) |
|---|---|---|---|---|---|
| MT-13 | Must | NFR-5, NFR-3, AC-4.4 | Without touching the mouse, play a full day and start a second. Use Enter for some buttons and Space for others. On one customer, hold Enter down on Process for 2 seconds | Every button and link can be reached with Tab, in the order questions, Hold, Process. The focused control always has a visible outline. After a question, focus stays on it. After a decision, focus is on the new customer's heading. Holding Enter decides one customer. No horizontal scrollbar on any of the three screens | |

**Run D: phone width. Chrome device mode, 375 px wide. About 5 minutes.**

| ID | Priority | Covers | Steps | Expected | Result (Dec 4) |
|---|---|---|---|---|---|
| MT-14 | Should | NFR-4 | Play a full day, opening three answers on at least one customer, and scroll the whole debrief | Nothing overlaps, is cut off, or scrolls sideways on any screen. Long questions wrap. Both decision buttons can be reached. The debrief cards can be read | |

**Run E: browser checks. Chrome with the developer tools open. About 10 minutes.**

| ID | Priority | Covers | Steps | Expected | Result (Dec 4) |
|---|---|---|---|---|---|
| MT-15 | Should | NFR-3, N3 | At 1280×720, open three answers on a customer | The slip and all three answers are visible together without scrolling. No horizontal scrollbar. Write down anything that does not fit: design.md gives estimates | |
| MT-16 | Must | NFR-1, SEC-4, SEC-15 | Network tab, cache disabled. Reload and play a full day to the debrief without clicking a link | Every request goes to `jeff-meendering.github.io/hold-the-line/`. None is made after the page has loaded, and none to a source site | |
| MT-17 | If time | NFR-2, SEC-11, SEC-16 | Application tab, after a finished day | No cookies. `localStorage` holds nothing, or only `hold-the-line:best-score`. Session storage and IndexedDB are empty. No screen has a text field | |
| MT-18 | Should | SEC-18, AC-4.2 | On a customer screen, search the Elements panel for `scam`, `legit`, `RF-`, and that customer's `id` from the data file. Watch the tab title across two customers | No match outside the customer's own words. The tab title does not change | |
| MT-19 | Should | NFR-6, N4 | Run the accessibility contrast check on each of the three screens. Check by hand: an asked question, a locked question, the Hold button, RIGHT CALL, and WRONG CALL | No contrast failures. Each of the five is at least 4.5:1 | |
| MT-20 | Should | SEC-12 | Watch the console over a full day. View the page source. Then run `fetch('https://example.com')` in the console | No errors and no policy violations during play. The `<meta>` policy is in the source. The `fetch` is blocked by the policy | |
| MT-21 | Should | NFR-7 | Read the build step's log for the tested commit | The gzip sizes of the JavaScript and CSS add up to 200 kB or less | |

**Run F: best score. Only if FR-17 shipped. About 4 minutes.**

| ID | Priority | Covers | Steps | Expected | Result (Dec 4) |
|---|---|---|---|---|---|
| MT-22 | Must, if FR-17 shipped | AC-9.1 | Clear the site's data and reload. Finish a day. Reload. Finish a day with a higher score, then one with a lower score | No best score at first. After the first day the debrief shows it as the best (D33), and so does the start screen after the reload. The higher score replaces it and says "New best score". The lower one does not | |
| MT-23 | If time | SEC-17, FR-17 | Set `hold-the-line:best-score` in turn to `999`, `-10`, `12.5`, `abc`, and `<img src=x onerror=alert(1)>`, reloading each time. Then, in Firefox, set `dom.storage.enabled` to false and play a day | Each bad value: no best score is shown, nothing pops up, the console has no error, and Start works. With storage off: a full day plays and the debrief shows the score | |

**Run G: pipeline and repository. About 15 minutes, on the dates shown.**

| ID | Priority | Covers | Steps | Expected | Result |
|---|---|---|---|---|---|
| MT-24 | Must | AC-8.2, FR-16 | Nov 29, against the scaffold (D29). Note the script file name in the live page's source and the last entry under Deployments. On a branch, add a test that fails, open a pull request, and merge it. After checking, revert it with a second pull request | On `main` the build job fails at the test step and the deploy job is skipped. The live page has the same script file name and Deployments has no new entry. After the revert, the run passes and deploys | Pass, Nov 27. Runs in section 8 |
| MT-25 | Should | AC-6.5, SEC-13 | Dec 4. Open every URL in every scam customer's `sourceUrls` | Each one loads the page it is meant to, on the official site, not an error page or the site's home page | |
| MT-26 | Should | SEC-3 | Nov 29 and Dec 4. Run `npm audit` | Each finding is written into section 8 with whether it can reach the built site | |
| MT-27 | Must | SEC-19, SEC-20 | Dec 6, with the plan's logged-out check. Read the repository settings against SEC-19. Look at every file in `screenshots/` | The settings match. No screenshot shows a token, an email address, a notification, or an unrelated tab | |

## 7. Reviews and playtest

Each review's output and the triage of every finding are saved in `docs/reviews/`. The reviewer gets the artefact and the requirements, not the author's reasoning (plan section 5).

| Review | Given | Checklist |
|---|---|---|
| ChatGPT fact-check, Nov 30 | The scam customers and their source URLs | Does each source describe this scenario? A fuller source for RF-16 if a courier customer exists (requirements open item 3). Every source is then opened and read by a person |
| Gemini content review, Dec 1 | `customers.ts`, `questions.ts`, requirements, design.md section 2.4 | Content rules C2, C3, and C5 to C10 (N5). No blame in any explanation (NFR-11, AC-6.4). Every question in a set makes sense for every customer of that type. No real contact details (SEC-21) |
| Gemini code review, Dec 4 | The frozen code, the workflow, requirements, architecture, security.md | The three layer rules. SEC-1 to SEC-18, with the commands in security.md section 6. For each row of section 2 here, whether the tests really assert it, and any test that could not fail |

**Playtest, Dec 4, 15 minutes.** One person who has not seen the game, on a laptop, on the live site.

1. Say only "Play this once" and do not help.
2. Time from pressing Start to the debrief appearing. NFR-10 asks for under 10 minutes.
3. Watch for where they hesitate, anything they click by mistake, how many questions they ask, and whether they keep asking `told`.
4. After the debrief, ask: What did you make of the question about being told what to say? (N1) Did you hold anyone who turned out to be fine, and did the debrief make clear why? (N6) What would you tell a friend to watch out for? Was anything confusing?

If nobody is available, Jeff plays it himself and the results say so (plan section 10, item 4).

## 8. Results

Empty until the tests are run. A bug found here is fixed, `npm test` is run again, and the case that found it is repeated.

**Run record**

| | |
|---|---|
| Date | |
| Commit tested | |
| Chrome version | |
| Firefox version | |
| Operating system | |
| Run by | |

**Automated tests**

| | |
|---|---|
| `npm test`: files, tests, passed, failed | |
| `npm run build`: passed, JavaScript and CSS gzip sizes | |
| Workflow run on the tested commit | |

**Pipeline check (MT-24)**

Run Nov 27, two days early, against the scaffold. Before it, the live page loaded `assets/index-WYhNHesa.js`, its `last-modified` was 20:53:02 GMT, and the only deployment was 8119125287, for `cdeabac` (the merge of PR #3, run [46066562082](https://github.com/Jeff-Meendering/hold-the-line/actions/runs/46066562082), build and deploy both passed).

| Step | Pull request | Run | Build job | Deploy job | Live page and Deployments after |
|---|---|---|---|---|---|
| Failing test, on the pull request | [#4](https://github.com/Jeff-Meendering/hold-the-line/pull/4) | [46066706800](https://github.com/Jeff-Meendering/hold-the-line/actions/runs/46066706800) | Failed at `npm test` | Skipped | Not deployed, as for any pull request |
| Failing test, merged into `main` while red (`6261374`) | [#4](https://github.com/Jeff-Meendering/hold-the-line/pull/4) | [46066775001](https://github.com/Jeff-Meendering/hold-the-line/actions/runs/46066775001) | Failed at `npm test`: `src/mt24.test.ts`, expected 2 to be 3 | Skipped | Unchanged: `index-WYhNHesa.js`, `last-modified` 20:53:02 GMT, still only deployment 8119125287 |
| Revert, on the pull request | [#5](https://github.com/Jeff-Meendering/hold-the-line/pull/5) | [46066861660](https://github.com/Jeff-Meendering/hold-the-line/actions/runs/46066861660) | Passed | Skipped | Not deployed |
| Revert, merged into `main` (`1faf74d`) | [#5](https://github.com/Jeff-Meendering/hold-the-line/pull/5) | [46066986346](https://github.com/Jeff-Meendering/hold-the-line/actions/runs/46066986346) | Passed | Passed | New deployment 8119180055 for `1faf74d`, `last-modified` 20:56:54 GMT. Still `index-WYhNHesa.js`, because neither change touched the bundle |

The script file name could not have changed in this check, because a test file is not part of the bundle. Whether a deploy happened shows in Deployments and in the page's `last-modified`, not in the script name.

**Worksheet for run A**

| # | Customer | Type | Questions asked | Call |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |

**`npm audit` (MT-26)**

| Date | Finding | Package | Reaches the built site? | Action |
|---|---|---|---|---|
| Nov 27, at the scaffold, two days early | None. `npm audit` with npm 11.20.0 found 0 vulnerabilities. Its report counts 90 dependencies, which includes optional platform packages not installed on this machine. `npm audit signatures`: 44 installed packages with verified registry signatures, 22 with verified attestations | None | Not applicable | None |
| Dec 4 | | | | |

**Defects**

| # | Found by | What happened | Fix (commit) | Retested |
|---|---|---|---|---|
| | | | | |

**Playtest**

| | |
|---|---|
| Who, and whether they had seen the game | |
| Time from Start to debrief | |
| Score | |
| On the `told` question (N1) | |
| On look-alikes (N6) | |
| What they would tell a friend | |
| What confused them | |

## 9. Decisions for Jeff

The numbering continues from [security.md section 7](security.md#7-decisions-for-jeff). Jeff decided all seven on Nov 27, 2026. D31 to D33 are gaps in the earlier documents that writing the test cases turned up, and those documents were updated when he approved them.

| # | Decision | Outcome | Why | Status |
|---|---|---|---|---|
| D28 | A rules test | Add `src/rules.test.ts` as in section 4 | Three rules in `CLAUDE.md` may never be broken, and with no linter (D17) nothing but the agent's attention enforces the layer rules. A test makes the workflow enforce them on every change. It is about 40 lines, needs no package, and adds one file to the layout in architecture.md | Approved by Jeff, Nov 27 |
| D29 | When to run MT-24 | Nov 29, against the hello-world scaffold | The test needs a failing commit merged into `main` on purpose. That is cheapest when the live site is a placeholder, and it proves the workflow before anything depends on it. It leaves one red run in the history of `main` | Approved by Jeff, Nov 27 |
| D30 | Node on this machine | Opus installs Node, without sudo, as part of the scaffold step, when Jeff's prompt for that step says to | `node` and `npm` are not installed here (checked Nov 27). `CLAUDE.md` tells the coding agent to run the tests before it says a step is done, and today it cannot. The recommendation was for Jeff to install it himself first. The version should be the major version the workflow uses | Decided by Jeff, Nov 27 |
| D31 | The debrief cannot tell that a score was raised to 0 | Add `floored: boolean` to `Debrief` in design.md section 1.4 | Section 3.4 of the design shows "A day cannot score below 0" when the sum was below 0, but `buildDebrief` returns only the final score. The component would have to add up the points itself, which architecture rule 3 says components do not do. MT-11 tests the line | Approved by Jeff, Nov 27 |
| D32 | Messages for rules about the whole pool | They start with `pool` and name the customers involved | FR-15 says every message starts with a customer id or question id. Rules V10 to V13, V15, and V16 are about the pool and have no single customer | Approved by Jeff, Nov 27 |
| D33 | The first best score | The first finished day sets the best score, whatever it is, and the debrief shows it as the best | AC-9.1 covers a day that "beats the stored best" and does not say what happens when nothing is stored, including a first score of 0. Only matters if FR-17 ships | Approved by Jeff, Nov 27 |
| D34 | Seeing each test fail once | Strategy rule 5 | Claude writes both the code and its tests, and a test that cannot fail looks the same in a green run as one that can. One deliberate break per test file costs a few minutes each and puts evidence in the pull request. The Gemini code review looks for the same thing from the outside | Approved by Jeff, Nov 27 |
