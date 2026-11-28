# Hold the Line: requirements

Version 8, Sat Nov 28, 2026. Scope comes from [plan.md](plan.md) version 7. Version 2 applied Jeff's review of version 1: a shared question bank (FR-18), the coaching flag as a documented one (RF-17), clearer debrief labels (FR-9), and the source check (section 7). Version 3 fixes the questions per transaction type (FR-18, D13) and records the approval of D11 and D12. Version 4 adds the cover-story rule for scam customers (FR-19, AC-8.4, D18). Version 5 adds the three decisions from the end of the design step: the guard against deciding twice (FR-6, AC-4.4, D19), the debrief additions (FR-9, AC-6.5, D20), and legit look-alikes whose trait is in an answer (FR-14, AC-8.5, D21). Version 6 changes the scoring numbers (section 5, D1) and applies four decisions from the security and test-plan step: tests on pull requests (FR-16, D23), source links only to listed hosts (FR-12, AC-8.6, D24), messages for rules about the whole pool (FR-15, D32), and the first best score (FR-17, AC-9.1, D33). Version 7 lets an explanation run to two sentences (AC-6.4, FR-9, D4). Version 8 extends the guard to the question buttons, after the UI step showed that a double-click on Start could ask a question on a phone (FR-6, AC-4.4, D19). Choices the plan left open are marked **[D*n*]** and listed in [section 8](#8-decisions).

IDs are stable so the test plan can trace to them: `US` story, `AC` acceptance criterion, `FR` functional, `NFR` non-functional, `RF` red flag.

## 1. Personas

| Persona | Who | Needs |
|---|---|---|
| **Maya, 21**, first-time player | A student who opens a shared link on a laptop. Has never worked in a bank. Will give it five to ten minutes. | To understand the rules from the first screen and finish a day without help. |
| **Ray, 58**, worried family member | His mother, 82, got a "your grandson is in jail" call last year. Reads carefully, uses the keyboard, not a gamer. | To learn which signs matter and why, from a debrief that does not make the victim look foolish. |
| **Priya, 45**, one-play evaluator | Opens the live URL from the README on a desktop, plays once, then compares it with the docs. | One play that contains a scam, works first time, and behaves as documented. |

## 2. User stories and acceptance criteria

**US-1. Learn the rules.** As Maya, I want the rules on the first screen so I can start without help. *(FR-1)*
- AC-1.1 At 1280×720 the start screen shows the how-to-play text and a Start button without scrolling.
- AC-1.2 The text covers: process or hold; up to 3 questions per customer; both kinds of mistake cost points and a missed scam costs more; results come at the end.
- AC-1.3 No screen before the debrief says how many scams a day contains.

**US-2. Read a customer.** As a player, I want to see the transaction and how the customer is acting. *(FR-2, FR-3)*
- AC-2.1 Each customer screen shows the name, the slip (type, amount, account note, and the type's extra fields), a behaviour description, and "Customer *n* of 6".

**US-3. Ask questions.** As a player, I want to question the customer to test my suspicion. *(FR-4, FR-5, FR-18)*
- AC-3.1 The customer has the 5 questions set for their transaction type, the same 5 as every other customer of that type, each worded exactly as in the shared bank and listed in bank order. Choosing one shows this customer's answer, which stays on screen.
- AC-3.2 After the third question the rest are disabled and the counter reads 0.
- AC-3.3 An asked question cannot be asked again.

**US-4. Decide.** As a player, I want to process or hold, and not learn whether I was right until the end. *(FR-6, FR-7)*
- AC-4.1 Process and Hold both work with 0, 1, 2, or 3 questions asked.
- AC-4.2 Either button moves to the next customer and shows nothing about correctness, truth, red flags, or score.
- AC-4.3 No score appears before the debrief, and there is no way back to an earlier customer.
- AC-4.4 A double-click on Process or Hold decides one customer, not two. A double-click on Start or Play again asks no question of the first customer.

**US-5. A day that cannot be counted.** As Priya, I want one play to include a scam; as a returning player, I want the mix to change. *(section 6)*
- AC-5.1 Across 1,000 seeded draws, every day has 6 different customers and 1, 2, or 3 scams, and each count occurs.
- AC-5.2 Across the same draws, a scam appears in each of the 6 positions at least once.
- AC-5.3 The same seed produces the same day.

**US-6. Debrief.** As Ray, I want to see what I got right, what I missed, and why. *(FR-8, FR-9, section 5)*
- AC-6.1 The debrief appears after the sixth decision with a score out of 60 that matches section 5 for a scripted day.
- AC-6.2 All 6 customers are listed in the order played, with the player's call, the truth, and right or wrong.
- AC-6.3 Each scam customer lists its red flags. Flags on the slip or in the behaviour text are marked *shown*. Flags behind a question are marked *you asked* or *you didn't ask*, matching the questions actually asked.
- AC-6.4 Each customer has an explanation of at most two sentences. For scams it names the scammer's tactic. None blames the customer.
- AC-6.5 Each scam customer's card links to its sources. A legit look-alike's card names the red flag it resembled, shows where that appeared, and shows the question and answer that explain it, marked *you asked* or *you didn't ask*.

**US-7. Replay.** As a player, I want to play again with a different day. *(FR-10)*
- AC-7.1 Play again starts a new day with a fresh draw and nothing carried over.

**US-8. Safe content changes.** As the developer, I want bad customer data and failing tests to stop a deploy. *(FR-11 to FR-16, FR-18, FR-19)*
- AC-8.1 Removing a question, a red flag, or a source URL from a customer makes `npm test` fail and name the customer.
- AC-8.2 With a failing test on `main`, the deploy job does not run and the live site is unchanged.
- AC-8.3 `npm test` fails if a transaction type's set is not 5 different bank questions, if a bank question is in no set, or if a customer's answers are not to exactly the 5 questions of their transaction type's set.
- AC-8.4 `npm test` fails if a scam customer has red flags behind 3 or more questions, or if 2 or more scam customers have RF-6 or RF-17 behind the `told` question.
- AC-8.5 `npm test` fails if fewer than 2 legit customers show a look-alike trait in an answer, or if a look-alike's trait and its explanation are behind the same question.
- AC-8.6 `npm test` fails if a source URL is not `https` or is on a host outside the approved list.

**US-9 (should). Best score.** As a returning player, I want to see my best score. *(FR-17)*
- AC-9.1 After the first finished day, or a day that beats the stored best, the new best shows on the debrief, and on the start screen after a reload.

## 3. Functional requirements

| ID | Requirement |
|---|---|
| FR-1 | The start screen shows the title, the how-to-play text (AC-1.2), and a Start button. It never states the number or range of scams in a day. |
| FR-2 | Start draws a day (section 6) and shows its 6 customers one at a time in drawn order, with "Customer *n* of 6". |
| FR-3 | The customer screen shows the name, a behaviour description, and a slip: transaction type, amount, a one-line account note on the customer's usual activity **[D5]**, and by type the wire recipient and destination or the number of gift cards and value per card. |
| FR-4 | The customer's 5 questions (FR-18) are listed. Choosing one reveals that customer's scripted answer, keeps it visible, and marks it asked. |
| FR-5 | At most 3 questions per customer. The number left is shown; at 0 the rest are disabled. |
| FR-6 | Process and Hold are available at any time, including before any question **[D7]**. The decision is final and moves to the next customer. Both buttons, and the question buttons, ignore presses for the first half second after a customer appears, so the second click of a double-click cannot decide the next customer or ask it a question **[D19]**. |
| FR-7 | Before the debrief the game shows no correctness, truth, red flag, or score information. |
| FR-8 | After the sixth decision the debrief shows the score (section 5) as "*N* / 60" and the 6 customers in the order played, each with name, transaction, the player's call, the truth, and right or wrong. |
| FR-9 | For each scam customer the debrief shows the scam type, an explanation of at most two sentences, and every red flag marked *shown* (it was on the slip or in the behaviour text), *you asked* (it was in an answer the player revealed) **[D12]**, or *you didn't ask* (it was behind a question the player did not ask). For each legit customer it shows at most two sentences on why the transaction was fine **[D4]**. Each scam customer's card also links to its source URLs, which open in a new tab. A legit look-alike's card also shows the red flag it resembled, where that appeared, and the question and answer that explain it, with the same labels **[D20]**. |
| FR-10 | Play again starts a new day with a fresh draw and cleared state. A reload returns to the start screen; no game in progress is saved **[D8]**. |
| FR-11 | Customers live in typed data files, with no customer text in component code. The pool is 4 scam and 6 legit; the smallest valid pool is 3 and 5. |
| FR-12 | Every customer has an id, name, truth, slip fields, behaviour text, a scripted answer to each of the 5 questions in their transaction type's set (FR-18) and to no other question, and a debrief explanation. Every scam customer also has a scam type, at least 1 source URL, each one `https` and on a host in the approved list **[D24]**, and at least 3 red flags, each naming an `RF` id from section 7 and where it shows (slip, behaviour, or a question in that set). |
| FR-13 | Each transaction type (cash withdrawal, wire, gift cards) is used by at least 1 scam and 1 legit customer. Gift cards are bank-issued Visa gift cards, at most $500 each. Store gift cards, gold, and crypto ATMs appear only as the reason behind a cash withdrawal. |
| FR-14 | Each scam customer has at least 1 red flag visible without asking and at least 1 that only a question reveals. At least 3 legit customers show a trait from section 7 and have a question whose answer explains it. At least 2 of them show the trait in an answer, explained by a different question, so that one alarming answer does not always mean a scam **[D21]**. The 4 scam customers use 4 different scam types named in the FinCEN sources **[D6]**. |
| FR-15 | A data validation test checks FR-11 to FR-14, FR-18, and the two counts in FR-19, and fails with the customer id or question id and the rule broken. A rule about the whole pool has no single customer, so its message starts with `pool` **[D32]**. |
| FR-16 | One GitHub Actions workflow runs the tests, then builds, then deploys to GitHub Pages. Build and deploy run only if the tests pass. The tests and the build also run on a pull request into `main`, and the deploy runs only on a push to `main` **[D23]**. |
| FR-17 (should) | The best score is saved in `localStorage` and shown on the start screen and the debrief. The first finished day sets it, whatever the score **[D33]**. The game works normally without storage. |
| FR-18 | Questions come from one shared bank of 8 questions a teller could ask any customer, each with an id and fixed wording, kept in a data file **[D11]**. Each transaction type has a fixed set of 5 bank questions, and every customer of that type offers exactly those 5, with their own answers, listed in bank order **[D13]**. Every bank question is in at least 1 set. The questions on offer then depend only on the transaction type, which is already on the slip, so neither their wording nor their selection hints at the answer. With FR-13, every bank question is still offered by at least 1 scam and 1 legit customer. |
| FR-19 | Scam customers have been coached and arrive with a cover story **[D18]**. A scam customer's red flags are behind at most 2 of their 5 answers. The other answers are the cover story: they agree with each other and read like a legit customer's answers. A scam customer's slip and behaviour are things a legit customer could also show. Across the pool, at most 1 scam customer admits on the `told` question to being coached or told to keep quiet (RF-6 or RF-17). The data validation test checks the two counts, and the Gemini content review checks the rest. The content rules are in [design.md](design.md) section 2.4. |

## 4. Non-functional requirements

| ID | Requirement | Checked by |
|---|---|---|
| NFR-1 | Static only: the deployed game requests nothing but its own files from the GitHub Pages origin. The source links on the debrief (FR-9) leave the site only when the player clicks one. | Network tab over one full day |
| NFR-2 | No personal data: no cookies, analytics, or text inputs. The only stored value is the best score. | Storage tab; code search |
| NFR-3 | Works in current desktop Chrome and Firefox at 1280×720 with no horizontal scroll **[D9]**. | Manual test in both |
| NFR-4 | Does not break on a phone: at 375 px wide a full day is playable with nothing overlapping or cut off. | Browser device mode |
| NFR-5 | A full day, Start to Play again, is playable by keyboard alone, with a visible focus indicator. | Manual test |
| NFR-6 | Text and controls meet a 4.5:1 contrast ratio. | Browser accessibility tool |
| NFR-7 | Built JavaScript and CSS total at most 200 kB gzipped. | Build output |
| NFR-8 | Scoring, the day draw, and game state are pure functions with no React or DOM imports. The draw takes its random source as a parameter. Unit tests cover every row of the scoring table and every scam count. | Code review; test run |
| NFR-9 | Customer text is rendered as plain text, never as HTML. | Code search |
| NFR-10 | A first-time player finishes a day in under 10 minutes. | Dec 4 playtest, timed |
| NFR-11 | Debrief text describes what the scammer did and never calls the customer foolish, greedy, or careless. | Gemini content review checklist |

## 5. Scoring rules **[D1, D2]**

| The customer is | The player | Points |
|---|---|---|
| Legit | Processes | +10 |
| Scam | Holds | +10 |
| Legit | Holds | −5 |
| Scam | Processes | −20 |

1. The day score is the sum over the 6 customers. A sum below 0 is shown as 0. The maximum is always 60.
2. Equivalent form for tests: `max(0, 60 − 30 × scams processed − 15 × legit held)`.
3. Questions asked and time taken do not affect the score **[D7]**.
4. The score is calculated after the sixth decision and first shown on the debrief.

Examples: perfect day, 60. One legit customer held and the rest right, 45. One scam let through and the rest right, 30. One of each and the rest right, 15. Process everyone on a 1-scam day, 30, and on a 2-scam or 3-scam day, 0. Hold everyone on a 1-scam or 2-scam day, 0, and on a 3-scam day, 15.

The only scores a day can have are 60, 45, 30, 15, and 0.

## 6. Day-draw rules **[D3]**

1. Pick the scam count *k* from {1, 2, 3}, each with probability 1/3.
2. Pick *k* different scam customers from the pool, each equally likely.
3. Pick 6 − *k* different legit customers from the pool, each equally likely.
4. Shuffle the 6 into a uniformly random order (Fisher–Yates).
5. The draw happens once, when the day starts, and does not change during the day.
6. Every new day is an independent draw. Customers can repeat between days, never within one.
7. The rules do not depend on pool size. They need at least 3 scam and 5 legit customers (FR-15 checks this).

## 7. Red flags

Every flag is tied to one of the ten documents below. ChatGPT's answer to the gift-card check was not saved in the repo, so the documents were fetched directly on Nov 27, 2026. The planning-partner chat then checked the quoted wording for RF-1 to RF-16 against the FinCEN PDFs and the FTC pages, and all of it is there. The two RF-17 quotes came from that review and were confirmed by fetching both pages the same day.

| Key | Source |
|---|---|
| A | FinCEN, [Advisory on Elder Financial Exploitation](https://www.fincen.gov/system/files/advisory/2022-06-15/FinCEN%20Advisory%20Elder%20Financial%20Exploitation%20FINAL%20508.pdf), FIN-2022-A002, June 15, 2022 |
| T | FinCEN, [Financial Trend Analysis: Elder Financial Exploitation, June 2022 to June 2023](https://www.fincen.gov/system/files/shared/FTA_Elder_Financial_Exploitation_508Final.pdf), 2024 |
| F1 | FTC, [Avoiding and Reporting Gift Card Scams](https://consumer.ftc.gov/articles/avoiding-and-reporting-gift-card-scams) |
| F2 | FTC, [How To Avoid a Scam](https://consumer.ftc.gov/articles/how-avoid-scam) |
| F3 | FTC, [Never move your money to "protect it." That's a scam](https://consumer.ftc.gov/consumer-alerts/2024/03/never-move-your-money-protect-it-thats-scam) |
| F4 | FTC, [Did someone send you to a Bitcoin ATM? It's a scam](https://consumer.ftc.gov/consumer-alerts/2024/03/did-someone-send-you-bitcoin-atm-its-scam) |
| F5 | FTC, [Scammers Use Fake Emergencies To Steal Your Money](https://consumer.ftc.gov/articles/scammers-use-fake-emergencies-steal-your-money) |
| F6 | FTC, [How To Spot, Avoid, and Report Tech Support Scams](https://consumer.ftc.gov/articles/how-spot-avoid-and-report-tech-support-scams) |
| F7 | FTC, [Will your bank or investment fund stop a transfer to a scammer? Probably not](https://consumer.ftc.gov/consumer-alerts/2024/03/will-your-bank-or-investment-fund-stop-transfer-scammer-probably-not), March 7, 2024 |
| F8 | FTC, [Sure ways to spot a scammer](https://consumer.ftc.gov/consumer-alerts/2024/03/sure-ways-spot-scammer), March 7, 2024 |

FinCEN writes its flags about customers aged 60 and over and says "no single red flag is determinative" (A, p. 8), which is why FR-12 asks for at least 3 per scam customer.

**Documented**

| ID | What the player can notice | Shows in | Source wording |
|---|---|---|---|
| RF-1 | On the phone during the transaction, taking directions, will not hang up | Behaviour | "appears to be taking direction from someone with whom they are speaking on a cell phone, and … seems nervous, leery, or unwilling to hang up" (A, p. 9) |
| RF-2 | Fearful, distressed, or anxious to do as told | Behaviour | "appears distressed, submissive, fearful, anxious to follow others' directions" (A, p. 9) |
| RF-3 | The reason changes, or basic questions go unanswered | Answers | "struggled to maintain a consistent reason for sending their attempted transaction" (T, p. 5) |
| RF-4 | Suddenly unwilling to talk about the money | Answers | "shows a sudden reluctance to discuss financial matters" (A, p. 10) |
| RF-5 | Money must go now for a loved one's emergency, but to a stranger | Answers, slip | "agitated or frenzied about the need to send money immediately in the face of a purported emergency of a loved one, but the money would be sent to … a seemingly unconnected third-party" (A, p. 9) |
| RF-6 | Was told to keep it secret | Answers | "The scammer might tell you it's important to keep it secret." (F5). FTC only, and about secrecy in general, not the bank. |
| RF-7 | Says the account is compromised and the money must be moved to keep it safe | Answers | "Bank impersonators typically tell victims that their accounts are compromised, and they need to move their funds to a secure account" (T, p. 11). Also F3. |
| RF-8 | Large cash withdrawal that does not fit the account | Slip | "Uncharacteristic, sudden, abnormally frequent, or significant withdrawals of cash" (A, p. 10) |
| RF-9 | Large wire that does not fit the account | Slip | "Uncharacteristic attempts to wire large sums of money." (A, p. 10) |
| RF-10 | Cashing in a CD or closing savings early despite the penalty | Slip | "Closing of CDs or accounts without regard to penalties." (A, p. 10) |
| RF-11 | Buying many gift cards at once | Slip | "purchases large numbers of gift cards or prepaid access cards" (A, p. 10). FTC's examples are store cards; this line is what covers bank-issued ones. |
| RF-12 | The gift cards are to pay someone, or the numbers will be read to someone | Answers | "putting money on a gift card and then giving them the numbers on the back of the card" (F2). Also F1. |
| RF-13 | The money is for someone they have only met online | Answers | Romance scammers "ask victims to send money for travel expenses, a sudden 'hardship' … or a supposed investment or business deal" (A, p. 6) |
| RF-14 | The payment is for tech support, a refund sent "by mistake", prize fees, or taxes owed to a caller | Answers, slip | Memo lines "such as 'tech support services,' 'winnings,' or 'taxes'" (A, p. 10). **Partial:** the indicator is about repeated checks or wires; the game shows one. |
| RF-15 | The cash is going into a crypto ATM | Answers | "Is there a legit reason for someone to send you to a Bitcoin ATM? The short answer is NO." (F4) |
| RF-16 | The cash, or gold bought with it, will be handed to someone who collects it | Answers | "buy gold or get cash and give it to someone" (F6); "cash pick-up at the victims' houses" (A, p. 5) |
| RF-17 | Says someone told them to lie to the bank, or told them what to say | Answers | "The scammer, who might even try to keep you on the phone, will tell you to lie, so the bank won't stop your transfer." (F7); "The minute someone tells you to lie to anyone — including bank tellers or investment brokers — stop. It's a scam." (F8) |

**Plausible but not documented.** None in this version. A flag without a source is listed here, and kept out of FR-12's count and out of the debrief, until it has one. Version 1 listed three: one is now RF-17 and two were dropped (D10).

## 8. Decisions

Jeff approved D1 to D9 on Nov 27, 2026 and decided D10 differently from the recommendation. He approved D11 and D12 the same day, with the design-step prompt, and decided D13 in it. Decisions made during design continue the numbering from D14 in [design.md](design.md) section 6 and [architecture.md](architecture.md) section 7. D18 to D21, behind FR-19, FR-6, FR-9, and FR-14, are among them. D22 to D34 came from the security and test-plan step and are in [security.md](security.md) section 7 and [test-plan.md](test-plan.md) section 9.

| # | Decision | Outcome | Why | Status |
|---|---|---|---|---|
| D1 | Scoring numbers | +10 for a right call, −5 for holding a legit customer, −20 for processing a scam | The maximum is 60 on every day, so scores compare across draws. Counting the lost +10, a missed scam costs 30 and a wrong hold 15, so a missed scam still costs twice as much, and holding still only pays when a scam is more than 1 in 3 likely. Version 1 used −10 and −30. With those the only scores were 60, 40, 20, and 0, and one missed scam plus one wrong hold scored 0 with 4 of 6 calls right. The cost of the change is the one version 1 chose −30 to avoid: processing everyone on a 1-scam day now scores 30 of 60, where it scored 20. | Approved Nov 27 as −10 and −30. Changed by Jeff the same day, in version 6 |
| D2 | Negative totals | Show a sum below 0 as 0 | The raw sum can reach −75, which reads as blame and tells the player nothing more than 0 does. | Approved |
| D3 | How the scam count is picked | 1, 2, and 3 equally likely | The plan says the count is picked first, not how. Equal odds is the simplest rule to state and test. | Approved |
| D4 | What "red flags missed" means | Every flag for every scam customer, with a label saying whether the player had it in front of them, plus an explanation of at most two sentences for every legit customer | Flags only for wrong calls would hide what a player missed on a scam they held on a hunch, and a player who blocked a legit customer needs the innocent explanation. | Approved. Labels changed in version 2: "seen" was misleading for a flag that was always on screen. The explanation went from one line to at most two sentences in version 7 |
| D5 | Account note on the slip | One line of usual activity per customer | RF-8, RF-9, and RF-10 all mean "unusual for this account". Without the line the player cannot see them. | Approved |
| D6 | Content minimums | 3 flags per scam, 1 or more up front and 1 or more behind a question; 3 legit customers with a look-alike trait; 4 different scam types | They keep the game from being obvious or a coin flip (plan risk 7) and give the data test exact rules. | Approved |
| D7 | Questions and score | Deciding with no questions is allowed; questions do not affect the score | The limit of 3 is already the cost. Scoring questions would be a mechanic the plan does not have. | Approved |
| D8 | Reload and replay | A reload returns to the start screen; Play again goes straight to a new day | Saving a game in progress is out of scope, and a returning player has read the rules. | Approved |
| D9 | NFR numbers | Chrome and Firefox; 375 px; 200 kB gzipped; 10 minutes | The plan gives no numbers for browsers, phone width, size, or session length. | Approved |
| D10 | Flags RF-P1 to RF-P3 | RF-P1 is documented and is now RF-17. RF-P2 and RF-P3 are dropped. | Two FTC alerts say scammers tell victims to lie to the bank. Version 1 recommended holding the flag back as unsourced because the search behind it missed both alerts. The other two flags are not needed. | Decided by Jeff |
| D11 | Size and order of the question bank | Exactly 8 questions, listed in bank order on every customer | Jeff asked for "about 8"; a fixed number is what the data test can check. A fixed order stops the order of questions from hinting at the answer. | Approved |
| D12 | Label for a flag behind a question the player did ask | *you asked* | Jeff set *shown* and *you didn't ask*. The third case needs its own label, and *shown* would hide that the player found the flag by asking. | Approved |
| D13 | Which questions a customer offers | A fixed set of 5 bank questions per transaction type; every customer of that type offers the same 5 | Version 2 let each customer offer any 4 or 5, so the selection could still hint: a question offered by three scam customers and one legit customer passed the rule. A set fixed by type carries no information the slip does not already show. | Decided by Jeff |

**Open items, not decisions**

1. `reviews/01-gift-card-check.md` still has TODOs for ChatGPT's answer and model name. The quotes in section 7 are verified without it, so this is a gap in the process record, not in this document.
2. The bank's 8 question ids and the three sets of 5 are approved and locked (D14, [design.md](design.md) section 2.3). The wording can still change. Every question in a set has to make sense for every customer of that type, scam or legit, which the Gemini content review should check.
3. RF-16's quotes are on the pages, but each is a single clause. If a courier customer is written, the Nov 30 fact-check should look for a fuller source.
