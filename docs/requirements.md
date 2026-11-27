# Hold the Line: requirements

Version 1, Fri Nov 27, 2026. Scope comes from [plan.md](plan.md) version 4; nothing here adds to it. Choices the plan left open are marked **[D*n*]** and listed in [section 8](#8-decisions-for-jeff). They are recommendations until Jeff approves them.

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

**US-3. Ask questions.** As a player, I want to question the customer to test my suspicion. *(FR-4, FR-5)*
- AC-3.1 The customer has 4 or 5 questions. Choosing one shows its answer, which stays on screen.
- AC-3.2 After the third question the rest are disabled and the counter reads 0.
- AC-3.3 An asked question cannot be asked again.

**US-4. Decide.** As a player, I want to process or hold, and not learn whether I was right until the end. *(FR-6, FR-7)*
- AC-4.1 Process and Hold both work with 0, 1, 2, or 3 questions asked.
- AC-4.2 Either button moves to the next customer and shows nothing about correctness, truth, red flags, or score.
- AC-4.3 No score appears before the debrief, and there is no way back to an earlier customer.

**US-5. A day that cannot be counted.** As Priya, I want one play to include a scam; as a returning player, I want the mix to change. *(section 6)*
- AC-5.1 Across 1,000 seeded draws, every day has 6 different customers and 1, 2, or 3 scams, and each count occurs.
- AC-5.2 Across the same draws, a scam appears in each of the 6 positions at least once.
- AC-5.3 The same seed produces the same day.

**US-6. Debrief.** As Ray, I want to see what I got right, what I missed, and why. *(FR-8, FR-9, section 5)*
- AC-6.1 The debrief appears after the sixth decision with a score out of 60 that matches section 5 for a scripted day.
- AC-6.2 All 6 customers are listed in the order played, with the player's call, the truth, and right or wrong.
- AC-6.3 Each scam customer lists its red flags marked *seen* or *not seen*, matching the questions actually asked.
- AC-6.4 Each customer has a one-line explanation. For scams it names the scammer's tactic. None blames the customer.

**US-7. Replay.** As a player, I want to play again with a different day. *(FR-10)*
- AC-7.1 Play again starts a new day with a fresh draw and nothing carried over.

**US-8. Safe content changes.** As the developer, I want bad customer data and failing tests to stop a deploy. *(FR-11 to FR-16)*
- AC-8.1 Removing a question, a red flag, or a source URL from a customer makes `npm test` fail and name the customer.
- AC-8.2 With a failing test on `main`, the deploy job does not run and the live site is unchanged.

**US-9 (should). Best score.** As a returning player, I want to see my best score. *(FR-17)*
- AC-9.1 After a day that beats the stored best, the new best shows on the debrief, and on the start screen after a reload.

## 3. Functional requirements

| ID | Requirement |
|---|---|
| FR-1 | The start screen shows the title, the how-to-play text (AC-1.2), and a Start button. It never states the number or range of scams in a day. |
| FR-2 | Start draws a day (section 6) and shows its 6 customers one at a time in drawn order, with "Customer *n* of 6". |
| FR-3 | The customer screen shows the name, a behaviour description, and a slip: transaction type, amount, a one-line account note on the customer's usual activity **[D5]**, and by type the wire recipient and destination or the number of gift cards and value per card. |
| FR-4 | The customer's 4 or 5 questions are listed. Choosing one reveals its scripted answer, keeps it visible, and marks it asked. |
| FR-5 | At most 3 questions per customer. The number left is shown; at 0 the rest are disabled. |
| FR-6 | Process and Hold are available at any time, including before any question **[D7]**. The decision is final and moves to the next customer. |
| FR-7 | Before the debrief the game shows no correctness, truth, red flag, or score information. |
| FR-8 | After the sixth decision the debrief shows the score (section 5) as "*N* / 60" and the 6 customers in the order played, each with name, transaction, the player's call, the truth, and right or wrong. |
| FR-9 | For each scam customer the debrief shows the scam type, a one-line explanation, and every red flag marked *seen* (on the slip, in the behaviour text, or in an answer the player revealed) or *not seen*. For each legit customer it shows one line on why the transaction was fine **[D4]**. |
| FR-10 | Play again starts a new day with a fresh draw and cleared state. A reload returns to the start screen; no game in progress is saved **[D8]**. |
| FR-11 | Customers live in typed data files, with no customer text in component code. The pool is 4 scam and 6 legit; the smallest valid pool is 3 and 5. |
| FR-12 | Every customer has an id, name, truth, slip fields, behaviour text, 4 or 5 question-and-answer pairs, and a debrief explanation. Every scam customer also has a scam type, at least 1 source URL, and at least 3 red flags, each naming an `RF` id from section 7 and where it shows (slip, behaviour, or a question). |
| FR-13 | Each transaction type (cash withdrawal, wire, gift cards) is used by at least 1 scam and 1 legit customer. Gift cards are bank-issued Visa gift cards, at most $500 each. Store gift cards, gold, and crypto ATMs appear only as the reason behind a cash withdrawal. |
| FR-14 | Each scam customer has at least 1 red flag visible without asking and at least 1 that only a question reveals. At least 3 legit customers show a trait from section 7 and have a question whose answer explains it. The 4 scam customers use 4 different scam types named in the FinCEN sources **[D6]**. |
| FR-15 | A data validation test checks FR-11 to FR-14 and fails with the customer id and the rule broken. |
| FR-16 | One GitHub Actions workflow runs the tests, then builds, then deploys to GitHub Pages. Build and deploy run only if the tests pass. |
| FR-17 (should) | The best score is saved in `localStorage` and shown on the start screen and the debrief. The game works normally without storage. |

## 4. Non-functional requirements

| ID | Requirement | Checked by |
|---|---|---|
| NFR-1 | Static only: the deployed game requests nothing but its own files from the GitHub Pages origin. | Network tab over one full day |
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
| Legit | Holds | −10 |
| Scam | Processes | −30 |

1. The day score is the sum over the 6 customers. A sum below 0 is shown as 0. The maximum is always 60.
2. Equivalent form for tests: `max(0, 60 − 40 × scams processed − 20 × legit held)`.
3. Questions asked and time taken do not affect the score **[D7]**.
4. The score is calculated after the sixth decision and first shown on the debrief.

Examples: perfect day, 60. One scam let through and the rest right, 20. One legit customer held and the rest right, 40. Process everyone on a 1-scam day, 20. Hold everyone on any day, 0.

## 6. Day-draw rules **[D3]**

1. Pick the scam count *k* from {1, 2, 3}, each with probability 1/3.
2. Pick *k* different scam customers from the pool, each equally likely.
3. Pick 6 − *k* different legit customers from the pool, each equally likely.
4. Shuffle the 6 into a uniformly random order (Fisher–Yates).
5. The draw happens once, when the day starts, and does not change during the day.
6. Every new day is an independent draw. Customers can repeat between days, never within one.
7. The rules do not depend on pool size. They need at least 3 scam and 5 legit customers (FR-15 checks this).

## 7. Red flags

The fact-check file does not include ChatGPT's answer or its URLs, so the flags are tied to these eight documents, fetched Nov 27, 2026 (see the open items in section 8). The FinCEN wording was read from the PDF text in this session. The FTC wording came back from a fetch tool and was not read on the page.

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

**Plausible but not documented in these sources.** These do not count toward a scam customer's 3 flags and are not shown in the debrief as official indicators unless the Nov 30 fact-check finds a source **[D10]**.

| ID | Flag | Why it is marked |
|---|---|---|
| RF-P1 | The customer repeats a cover story the caller supplied, or says the caller told them what to tell the teller | None of the eight sources says scammers script what victims tell bank staff. RF-3 is the closest documented flag. |
| RF-P2 | The customer reads the wire details from a note or a text message | Not in any source read. |
| RF-P3 | Every gift card is loaded to the $500 maximum | The sources flag the number of cards, not the value of each. |

## 8. Decisions for Jeff

Each recommendation is already written into the sections above so the document reads as a whole.

| # | Decision | Recommendation | Why |
|---|---|---|---|
| D1 | Scoring numbers | +10 for a right call, −10 for holding a legit customer, −30 for processing a scam | The maximum is 60 on every day, so scores compare across draws. Counting the lost +10, a missed scam costs 40 and a wrong hold 20. At −20 instead of −30, processing everyone on a 1-scam day scores 30 of 60 for never looking. |
| D2 | Negative totals | Show a sum below 0 as 0 | The raw sum can reach −120, which reads as blame and tells the player nothing more than 0 does. |
| D3 | How the scam count is picked | 1, 2, and 3 equally likely | The plan says the count is picked first, not how. Equal odds is the simplest rule to state and test. |
| D4 | What "red flags missed" means | Every flag for every scam customer, marked *seen* or *not seen*, plus one line for every legit customer | Flags only for wrong calls would hide what a player missed on a scam they held on a hunch, and a player who blocked a legit customer needs the innocent explanation. This is debrief text, not a new screen. |
| D5 | Account note on the slip | One line of usual activity per customer | RF-8, RF-9, and RF-10 all mean "unusual for this account". Without the line the player cannot see them. |
| D6 | Content minimums | 3 flags per scam, 1 or more up front and 1 or more behind a question; 3 legit customers with a look-alike trait; 4 different scam types | They keep the game from being obvious or a coin flip (plan risk 7) and give the data test exact rules. They constrain the Nov 30 content work. |
| D7 | Questions and score | Deciding with no questions is allowed; questions do not affect the score | The limit of 3 is already the cost. Scoring questions would be a mechanic the plan does not have. |
| D8 | Reload and replay | A reload returns to the start screen; Play again goes straight to a new day | Saving a game in progress is out of scope, and a returning player has read the rules. |
| D9 | NFR numbers | Chrome and Firefox; 375 px; 200 kB gzipped; 10 minutes | The plan gives no numbers for browsers, phone width, size, or session length. These are mine, each checkable in a few minutes. |
| D10 | Flags RF-P1 to RF-P3 | Keep them out of the required 3 and the debrief until sourced | RF-P1 is closest to the game's premise ("coached") and I could not source it. Ask about it directly in the Nov 30 fact-check. |

**Open items, not decisions**

1. `reviews/01-gift-card-check.md` has a TODO where ChatGPT's answer should be. A and T are very likely the two FinCEN PDFs it verified (T contains the check statistic the triage mentions), but until the answer is pasted nobody can confirm that, or which two FTC pages it used.
2. All eight sources need the open-and-read check the plan requires.
3. No FTC page I found describes couriers collecting cash or gold in detail. RF-16 rests on one clause in F6 and one in A.
4. The header of `plan.md` says "Version 3" while its text describes version 4.
