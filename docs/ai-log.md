# AI log

A running log of every step where an AI tool was used. One entry per step, added when the step ends. The README's AI engineering analysis and reflection are written from this file.

Each entry records the tool, the prompt, what worked, what the AI got wrong, and what I changed. Screenshots are in `/screenshots`, named as described in [plan.md](plan.md).

---

## 1. Repo setup

- **Date:** Fri Nov 27, 2026
- **Phase:** Planning
- **Tool:** Claude Opus 5.5 (co-author on commit `50d5063`)
- **Screenshots**, in [`/screenshots`](../screenshots):
  - [`01-planning/01-planning-chat-kickoff-p1.png`](../screenshots/01-planning/01-planning-chat-kickoff-p1.png)
  - [`01-planning/01-planning-chat-kickoff-p2.png`](../screenshots/01-planning/01-planning-chat-kickoff-p2.png)
  - [`01-planning/01-planning-chat-kickoff-p3.png`](../screenshots/01-planning/01-planning-chat-kickoff-p3.png)
  - [`01-planning/01-planning-chat-kickoff-p4.png`](../screenshots/01-planning/01-planning-chat-kickoff-p4.png)
  - [`01-planning/02-planning-chat-project-name-p1.png`](../screenshots/01-planning/02-planning-chat-project-name-p1.png)
  - [`01-planning/03-planning-chat-first-prompt-p1.png`](../screenshots/01-planning/03-planning-chat-first-prompt-p1.png)
  - [`01-planning/04-opus-repo-setup-p1.png`](../screenshots/01-planning/04-opus-repo-setup-p1.png)
  - [`01-planning/05-planning-chat-repo-setup-review-p1.png`](../screenshots/01-planning/05-planning-chat-repo-setup-review-p1.png)

**Prompt**

> I'm starting my final project for my AI-assisted software engineering class. It's a browser game called Hold the Line where you play a bank teller trying to spot customers who are being scammed. I'll explain the game more later, right now I just want the repo set up.
>
> Can you:
> - git init here and make a public GitHub repo called hold-the-line with the gh cli
> - add a docs/ folder and a screenshots/ folder with these subfolders: 01-planning, 02-requirements, 03-design, 04-implementation, 05-testing, 06-documentation, 07-final-app (put a .gitkeep in each)
> - add a .gitignore for a Node/Vite project
> - add a placeholder README.md with just the project name and one sentence about it
> - commit and push to main
>
> Please don't scaffold the app or install anything yet, we haven't done planning. Tell me the repo URL when you're done.

**Result**

Commit `50d5063`: a `docs/` folder, seven numbered screenshot folders (`01-planning` to `07-final-app`), a `.gitignore` for a Vite project, and a one-line README, in a public repository.

**What worked**

- It did exactly what the list asked and nothing more. Nothing was scaffolded or installed.
- It set the git name and email for this repo without asking, using my GitHub no-reply address. That was the right call, and it told me it had done it.
- The screenshot folders follow the SDLC phases, so evidence is sorted from the first commit.

**What the AI got wrong**

Nothing.

**What I changed**

Nothing.

---

## 2. First plan draft

- **Date:** Fri Nov 27, 2026
- **Phase:** Planning
- **Tool:** Claude Fable 5.2, in the repo. The prompt was drafted in the planning-partner chat.
- **Screenshots**, in [`/screenshots`](../screenshots):
  - [`01-planning/06-fable-plan-draft-p1.png`](../screenshots/01-planning/06-fable-plan-draft-p1.png)
  - [`01-planning/06-fable-plan-draft-p2.png`](../screenshots/01-planning/06-fable-plan-draft-p2.png)
  - [`01-planning/06-fable-plan-draft-p3.png`](../screenshots/01-planning/06-fable-plan-draft-p3.png)
  - [`01-planning/07-planning-chat-plan-draft-review-p1.png`](../screenshots/01-planning/07-planning-chat-plan-draft-review-p1.png)
  - [`01-planning/07-planning-chat-plan-draft-review-p2.png`](../screenshots/01-planning/07-planning-chat-plan-draft-review-p2.png)

**Prompt**

> Now let's do the project plan. Here's the game:
>
> You play a bank teller. Customers come to your window to withdraw cash, send a wire, or buy gift cards. Most are legit but some are being scammed by someone coaching them over the phone. For each customer you can ask a few questions, then you either process the transaction or put a hold on it. You lose points for letting a scam through and for blocking a legit customer. A day is a handful of customers and it ends with a debrief showing the red flags you missed.
>
> Constraints:
> - I'm solo and it's due Dec 6. I have about 25 hours total, and that includes docs and testing, not just coding.
> - Vite + React + TypeScript, no backend, hosted on GitHub Pages.
> - Customers are scripted (data files), not played by an LLM at runtime.
> - No custom art.
>
> Write me a draft plan with: purpose, scope (what's in and what's explicitly out), constraints, assumptions, risks, and a day-by-day schedule from today to Dec 6. The assignment grades the whole SDLC (planning, requirements, design, implementation, testing, documentation) so the schedule needs time for all of those.
>
> Don't write any files yet, just show me the draft here. At the end, list the assumptions you made that I didn't tell you, and tell me what you'd cut first if I fall behind.

**Result**

A plan shown in chat, with no files written: purpose, scope split into must, should, and out, a risk table, a 10-day schedule adding up to 25 hours, a list of 11 assumptions, and a cut order.

**What worked**

- Asking for the unstated assumptions as a separate list. It surfaced decisions I had not made, such as the day size, the scoring weights, and the number of questions per customer.
- Asking for the cut order up front.
- "Don't write any files yet" kept the draft cheap to throw away.
- The AI read the repo, noticed the numbered screenshot folders, and scheduled screenshots per phase without being told.
- It listed "AI assistance is allowed; check whether it has to be disclosed" as an assumption. That was a sign it was missing the point of the course.

**What the AI got wrong**

- It missed every AI-workflow part of the assignment: no tools and roles, no AI log, no process for screenshotting prompts, no `architecture.md`, `security.md`, or `CLAUDE.md`, no README analysis and reflection sections, and no user personas. It treated the project as a game with documentation attached.
- It gave coding 11.5 hours and documentation 2.5, which is the wrong way round when AI writes the code and the README is a critical part of the grade.
- It named content writing as the top risk and then scheduled it last, on the day of the feature freeze.
- It fixed each day at 4 legit and 2 scam, so a player could count scams instead of reading the customers.
- Tests and deployment were not connected, so a failing build could still go live.
- It planned a user guide that the how-to-play screen already covers.

**What I changed**

All of the above, in the revision prompt in entry 3.

**Lesson**

The biggest miss was a handoff, not the model. The prompt was drafted in the planning chat, which had the full assignment. Neither it nor I carried the assignment over, so the prompt only said "grades the whole SDLC", and the AI in the repo planned for that summary. Context one tool has does not reach another unless I move it. The receiving tool cannot tell what it was not given, and it fills the gap with a reasonable guess that looks complete.

---

## 3. Plan revision

- **Date:** Fri Nov 27, 2026
- **Phase:** Planning
- **Tool:** Claude Fable 5.2, in the repo
- **Screenshots**, in [`/screenshots`](../screenshots):
  - [`01-planning/08-planning-chat-full-revision-prompt-p1.png`](../screenshots/01-planning/08-planning-chat-full-revision-prompt-p1.png)
  - [`01-planning/08-planning-chat-full-revision-prompt-p2.png`](../screenshots/01-planning/08-planning-chat-full-revision-prompt-p2.png)
  - [`01-planning/09-fable-plan-revision-p1.png`](../screenshots/01-planning/09-fable-plan-revision-p1.png)
  - [`01-planning/09-fable-plan-revision-p2.png`](../screenshots/01-planning/09-fable-plan-revision-p2.png)
  - [`01-planning/09-fable-plan-revision-p3.png`](../screenshots/01-planning/09-fable-plan-revision-p3.png)
  - [`01-planning/09-fable-plan-revision-p4.png`](../screenshots/01-planning/09-fable-plan-revision-p4.png)
  - [`01-planning/10-planning-chat-plan-v2-review-p1.png`](../screenshots/01-planning/10-planning-chat-plan-v2-review-p1.png)
  - [`01-planning/10-planning-chat-plan-v2-review-p2.png`](../screenshots/01-planning/10-planning-chat-plan-v2-review-p2.png)
  - [`01-planning/11-fable-plan-fixes-p1.png`](../screenshots/01-planning/11-fable-plan-fixes-p1.png)
  - [`01-planning/12-planning-chat-plan-v3-review-p1.png`](../screenshots/01-planning/12-planning-chat-plan-v3-review-p1.png)

**Prompt**

The full assignment text was pasted below the prompt; it is saved as [assignment.md](assignment.md).

> Good draft, but I should have given you the actual assignment. It's pasted at the bottom. Save it as docs/assignment.md first and read it. The class is about how I use AI, so most of the grade is the process, not the game.
>
> Please revise the plan with these changes:
>
> 1. Add an "AI tools and roles" section. Claude Fable does planning and design docs (I also have a separate Fable chat as my planning partner that helps me write and review prompts). Claude Opus does implementation. Gemini 4 Neon does independent reviews of the code and the customer content, so Claude isn't the only thing checking Claude's work. ChatGPT in the browser fact-checks the scam scenarios against real FTC and AARP sources. Put the Gemini reviews and the fact-check in the schedule.
> 2. The schedule is missing files the assignment requires: architecture.md, security.md, CLAUDE.md, and a README with the AI analysis and reflection sections. Add them. Drop the user guide, the how-to-play screen covers it.
> 3. Add a running docs/ai-log.md that gets updated after every step (the prompt, what worked, what the AI got wrong, what I changed). The README reflection gets written from it. Create it now with entries for the repo setup, the first plan draft, and this revision. For the first draft, the lesson is that it missed all the AI workflow parts because I forgot to give you the assignment.
> 4. Move hours from implementation to documentation. 11.5 hours of coding is too much when AI writes the code and 2.5 is too little for the README. Something like 8.5 and 5.
> 5. Writing customers is your #1 risk but it's scheduled last. Move it earlier, it only depends on the data schema, not the UI.
> 6. A fixed 4 legit / 2 scam day means players can just count scams. Make the must-ship a pool of 10 customers where each day draws 6 with 1 to 3 scams.
> 7. Run the tests in the same GitHub Actions workflow before deploying.
>
> Write it to docs/plan.md, commit, and push. Then tell me if you disagree with any of my changes.

**Result**

`docs/assignment.md`, `docs/plan.md` (version 2), and this log, committed and pushed in `8e8b785`.

**What worked**

- A numbered list of changes, each with its reason. All seven were applied.
- Asking the AI to say where it disagreed, after doing the work and not in place of it. The pushback was useful.
- With the assignment in hand, the AI found a requirement neither of us had listed: user personas.
- It raised whether gift cards are something a bank teller sells at all, which I had not questioned.

**What the AI pushed back on**

- Change 4: it applied 8.5 and 5, but pointed out that the same revision adds work (three more documents, two reviews, a fact-check, and 10 customers in place of 6), so only 6.5 of the 8.5 hours are code and the buffer fell from 2 hours to 1.5.
- Change 6: it applied the pool, but noted that a known range of 1 to 3 still lets a player count at the edges. It suggested not telling the player the range, or allowing a zero-scam day.
- Change 1: it agreed, and added that ChatGPT's sources need to be opened and read, because a fact-checker can invent citations.

**What the AI got wrong**

The planning-partner chat found these three when it reviewed the plan. I agreed with all of them.

1. It contradicted itself. Assumption 2 said 4 scam and 6 legit was the smallest pool that supports draws of 1 to 3 scams, while its own cut order dropped the pool to 3 and 5.
2. It raised the gift-card question and then scheduled the check for Nov 30, two days after the data schema is locked on Nov 28. A question that can change the transaction types has to be answered before the schema, not after.
3. The roles table was inaccurate about the planning-partner chat. It said the chat reviews "large prompts" and does not touch the repo. In fact the chat drafts every prompt with me, reviews what the AI in the repo produces, and reads the repo but never writes to it, and I edit and approve every prompt before sending. The AI had filled in details I never gave it. It did flag that column as its own wording for me to check.

**My decisions on the pushback**

- Change 4: kept 8.5 and 5. If the UI runs over, the pool drops to 8 first, as the cut order says.
- Change 6: kept 1 to 3 scams. I rejected zero-scam days, because my instructor might only play once and would see no scam. I accepted hiding the range. The planning-partner chat's review added a second rule, which I agreed with: the game does not show whether a call was right until the debrief.
- Change 1: the rule about opening every cited source stays in the plan.

**What I changed**

Sent a follow-up prompt with my decisions and six fixes, three to the plan and three to this log:

> Thanks, the pushback was useful. My decisions:
>
> - Change 4: keeping 8.5 and 5. If the UI runs over, the pool drops to 8 first, like your cut order says.
> - Change 6: keeping 1 to 3 scams. No zero-scam days, because my instructor might only play once and would see no scam. Instead, don't tell the player the range, and don't show whether a call was right until the debrief. Add both to the scope.
>
> Fixes to plan.md:
> 1. Assumption 2 says 4 scam / 6 legit is the smallest split that works, but your own cut order uses 3 and 5. Fix the wording.
> 2. The gift card question can't wait until Nov 30, that's after the schema is locked. Move it to the start of requirements on Nov 28: a quick ChatGPT fact-check on whether gift cards make sense at a teller window. If they don't, the third type becomes cashier's checks, and gift cards become a reason someone gives for a cash withdrawal.
> 3. The roles table isn't accurate about the separate Fable chat. It drafts the prompts with me and reviews what you produce, and it reads the repo but never writes to it. I edit and approve every prompt before sending. Fix the table, the "Jeff" row, and step 1 in section 6 to match.
>
> Fixes to ai-log.md:
> 4. Entry 1: the prompt is below. Nothing was wrong. Worth noting that it set the git name and email for this repo without asking, using my GitHub no-reply address. That was the right call and it told me.
> 5. Entry 2 lesson: the prompt was drafted in the planning chat, which had the full assignment, and neither it nor I carried the assignment over. Context one tool has doesn't reach another unless I move it.
> 6. Entry 3: fill in my decisions from above, and for "what the AI got wrong" use fixes 1 to 3.
>
> Leave the screenshot filename TODOs, I'll fill those in. Commit and push.

The entry 1 prompt followed and is quoted in entry 1. The result is `docs/plan.md` version 3.

---

## 4. Gift-card fact-check

- **Date:** Fri Nov 27, 2026
- **Phase:** Requirements
- **Tool:** ChatGPT, in the browser. Model: TODO. The planning-partner chat checked the sources.
- **Screenshots**, in [`/screenshots`](../screenshots):
  - [`02-requirements/01-planning-chat-fact-check-review-p1.png`](../screenshots/02-requirements/01-planning-chat-fact-check-review-p1.png)
  - [`02-requirements/01-planning-chat-fact-check-review-p2.png`](../screenshots/02-requirements/01-planning-chat-fact-check-review-p2.png)
  - [`02-requirements/02-fable-save-fact-check-p1.png`](../screenshots/02-requirements/02-fable-save-fact-check-p1.png)
  - TODO: the ChatGPT conversation

**Prompt**

> I'm making a small educational browser game where the player is a bank teller who has to spot customers who are being scammed. I need the transactions to be realistic for a US bank teller window.
>
> 1. Do US banks or credit unions actually sell gift cards or prepaid cards at the teller window? How common is it and what are the typical limits?
> 2. In real gift card scams, where does the victim usually buy the cards, and what part of it does a bank teller see, if any?
> 3. Besides cash withdrawals and wire transfers, what other teller transactions are commonly used in scams where the victim is being coached by the scammer?
>
> Please search the web and give me a link for every claim, preferring the FTC, AARP, FBI/IC3, CFPB, or FinCEN. Quote the sentence from the source that supports each claim. If you can't find a source for something, say so instead of guessing.

**Result**

An answer with linked and quoted sources, saved with my triage as [reviews/01-gift-card-check.md](reviews/01-gift-card-check.md). The planning-partner chat fetched the cited pages and checked the quotes against them.

**What worked**

- Asking for the supporting sentence to be quoted. It made every claim checkable against its page, and that is how the errors below were found.
- The quotes from both FTC pages, both FinCEN PDFs, and the OCC handbook are on the pages cited.
- It answered the question the check was run for: some credit unions do sell Visa gift cards at their branches. The $10 to $1,000 limit it gave for Educational Systems FCU is correct.

**What the AI got wrong**

- It changed a quote. It quoted Educational Systems FCU as selling gift cards "from any lobby teller", which is not on the page. The page says "Members can purchase Visa gift cards at any of our branch locations." The prompt had asked it to quote the source.
- It gave the wrong title for the CFPB link. The page is "Who do I contact for help with a scam or fraud?". The quote itself is on it.
- It used a FinCEN case study as evidence that victims pay scammers with cashier's checks, but the quote is about a defendant buying them. The source does not support the claim it was attached to.
- It cited a FinCEN check statistic without saying that the figure also includes counterfeit checks.
- It went past the question. Sections 4 to 6 are game design and scenarios, which I did not ask for and which is not ChatGPT's job in this project.

**Not verified yet**

FBI Albuquerque, the IC3 image, Together CU, Priority First FCU, and the FinCEN case study page.

**What I changed**

- Decided that gift cards stay as the third transaction type, as bank-issued Visa gift cards with a $500 maximum per card.
- Store gift cards, gold, and crypto ATMs become reasons behind cash withdrawals, since that is what the FTC and FBI document.
- Dropped the cashier's-check fallback, because the sources did not support it.
- Rejected sections 4 to 6 as out of scope. Not using money orders, money mules, or configurable limits.
- Updated `docs/plan.md` to version 4 with the decision, and closed risk 10.

---

## 5. Requirements

- **Date:** Fri Nov 27, 2026
- **Phase:** Requirements
- **Tool:** Claude Fable 5.2, in the repo. The prompt was drafted in the planning-partner chat, which also reviewed the result.
- **Screenshots**, in [`/screenshots`](../screenshots):
  - [`02-requirements/03-fable-requirements-draft-p1.png`](../screenshots/02-requirements/03-fable-requirements-draft-p1.png)
  - [`02-requirements/04-planning-chat-requirements-review-p1.png`](../screenshots/02-requirements/04-planning-chat-requirements-review-p1.png)
  - [`02-requirements/04-planning-chat-requirements-review-p2.png`](../screenshots/02-requirements/04-planning-chat-requirements-review-p2.png)
  - [`02-requirements/05-fable-requirements-revision-p1.png`](../screenshots/02-requirements/05-fable-requirements-revision-p1.png)
  - [`02-requirements/06-planning-chat-requirements-v2-review-p1.png`](../screenshots/02-requirements/06-planning-chat-requirements-v2-review-p1.png)

**Prompt**

> Read docs/plan.md, docs/assignment.md, and docs/reviews/01-gift-card-check.md, then write docs/requirements.md. This is the requirements step in the plan.
>
> It needs:
> - 3 short user personas
> - user stories with acceptance criteria I can actually test
> - numbered functional requirements (FR-1...) and non-functional requirements (NFR-1...), each one testable, so the test plan can trace back to them
> - the exact scoring rules and the exact day-draw rules
> - the list of red flags the game uses, each tied to a real indicator from the FinCEN or FTC sources in the fact-check. Mark anything that's plausible but not documented.
>
> Keep it proportional to a 25-hour project, I should be able to read it in 10 minutes. Don't add features that aren't in the plan's scope.
>
> Where you have to make a decision I haven't made (like the scoring numbers), don't bury it in the doc. Put those in a "Decisions for Jeff" list at the end with your recommendation and why. Commit, push, and add the ai-log entry.

**Result**

[requirements.md](requirements.md), version 1: 3 personas, 9 user stories with 21 acceptance criteria, FR-1 to FR-17, NFR-1 to NFR-11, the scoring table, the 7 day-draw rules, 16 documented red flags and 3 marked as undocumented, and 10 decisions waiting for me.

**What worked**

This part is the record of what the AI did. TODO: add my own view after reading the document.

- It noticed that the fact-check file has no source URLs and a TODO where ChatGPT's answer should be, so "the sources in the fact-check" could not be read from the repo. It said so in the document and did not invent citations.
- It fetched the sources itself: two FinCEN PDFs and six FTC pages. It read the full text of both PDFs and quoted each indicator with a page number.
- It marked the flag closest to the game's premise, that the scammer coaches the victim on what to tell the teller (RF-P1), as not documented in any of the eight sources. That was right about those eight and wrong about the FTC (see below). The documented indicators are about being directed over the phone and not keeping a consistent reason, which is not the same claim.
- It marked one indicator as only a partial match (RF-14) and noted where a quote covers less than the flag it supports (RF-6, RF-11).
- The decisions are tagged in the text ([D1] to [D10]) and collected at the end with a reason each, as the prompt asked.

**What the AI got wrong**

- Length. The first draft was about 4,000 words against a 10-minute limit. It cut the draft itself to about 3,200 words, which is still over. The red-flag and source tables are roughly a third of that.
- It guessed both FinCEN PDF URLs from memory and both returned 404. The working URLs came from fincen.gov's own pages.
- It told its fetch helper the FinCEN trend analysis was published in February 2024. The PDF is dated April 2024. The document only says 2024.
- Its fetch tool could not read either PDF, so it extracted the text locally. The FTC quotes came back through the fetch tool with a length cap and were not read on the page. None of the eight sources has had my open-and-read check yet.
- It could not find an FTC page describing couriers collecting cash or gold, so RF-16 rests on two short clauses.
- It marked coaching as undocumented. It is documented, in two FTC alerts from March 7, 2024 that its search did not find. It did find a third FTC alert from the same day.
- Each customer had their own questions. A question like "did someone tell you to keep this secret?" would then only show up on scam customers, so the list of questions could give the answer away.
- The debrief marked a flag on the slip or in the behaviour text as "seen". Those were always on screen, so the label was misleading.

**My mistake**

I sent the fact-check prompt with the placeholders still in it. That is why the AI in the repo did not have ChatGPT's sources, and why it marked coaching as unsourced.

**What the review found**

The planning-partner chat reviewed version 1. These are its findings, and I agreed with all of them.

1. Coaching is documented. Two FTC alerts from March 7, 2024 say scammers tell victims to lie to the bank.
2. Custom questions per customer can leak the answer.
3. "Seen" is misleading for a flag that was always on screen.
4. It checked all 16 source quotes against the FinCEN PDFs and the FTC pages, and they are all there.
5. The header of `plan.md` said version 3.

**What I changed**

I approved D1 to D9 as written and sent this follow-up:

> Good doc. I approve D1 to D9 as written. Changes:
>
> 1. D10: the coaching flag is documented, you just didn't have the sources. Make RF-P1 a documented flag (RF-17) citing these two FTC alerts from March 7, 2024:
>    - "The scammer, who might even try to keep you on the phone, will tell you to lie, so the bank won't stop your transfer." https://consumer.ftc.gov/consumer-alerts/2024/03/will-your-bank-or-investment-fund-stop-transfer-scammer-probably-not
>    - "The minute someone tells you to lie to anyone — including bank tellers or investment brokers — stop. It's a scam." https://consumer.ftc.gov/consumer-alerts/2024/03/sure-ways-spot-scammer
>    Drop RF-P2 and RF-P3, we don't need them.
> 2. Questions can leak the answer. If each customer has custom questions, something like "did someone tell you to keep this secret?" only shows up on scam customers. Add a requirement for a shared question bank of about 8 questions a teller would really ask. Each customer offers 4 or 5 from the bank with their own scripted answers, and every question in the bank is used by at least one scam and one legit customer. Add that to the data validation rules.
> 3. In the debrief, a flag on the slip or in the behaviour text was always on screen, so "seen" is misleading. Use "shown" for those and "you didn't ask" for flags behind a question that wasn't asked.
> 4. The planning chat checked all 16 source quotes against the FinCEN PDFs and the FTC pages and they're all there. Update section 7 and the open items so they don't say unverified.
> 5. Fix the plan.md header to say version 4.
>
> For ai-log entry 5: the prompt was drafted in the planning chat. Also record that I sent the fact-check prompt with the placeholders still in it, which is why you didn't have ChatGPT's sources and marked coaching as unsourced. The findings above came from the planning chat's review and I agreed with them.
>
> Bump requirements to version 2, commit and push. Tell me if you disagree with anything.

The result is `docs/requirements.md` version 2 and the corrected header in `docs/plan.md`.

**What the AI did with the follow-up**

- It applied all five changes and did not disagree with any of them.
- It fetched both FTC alerts before citing them. Both quotes are on the pages, and both pages are dated March 7, 2024.
- It added the question bank as FR-18, so that FR-1 to FR-17 keep their numbers, with a new acceptance criterion (AC-8.3) for the validation rules.
- It made two choices I had not, and listed them as D11 and D12: the bank has exactly 8 questions shown in bank order, and a flag behind a question the player did ask is labelled "you asked".
- It pointed out that the bank does not close the leak completely. The wording can no longer give the answer away, but which 4 or 5 questions a customer offers still can, because a question offered by three scam customers and one legit customer passes the rule. It added this to the open items for the Gemini content review.
- It noted that the document is now about 3,500 words, further over the 10-minute limit than version 1.

I approved D11 and D12 in the design-step prompt (entry 6).

**Open items**

- `reviews/01-gift-card-check.md` still has TODOs for ChatGPT's answer and model name.
- The bank's 8 questions are not written yet. Their ids are part of the data schema, which is locked on Nov 28.
- The plan's scope line still says "4–5 available questions" and does not mention the shared bank.

---

## 6. Architecture and design, part 1

- **Date:** Fri Nov 27, 2026, a day ahead of the plan's Nov 28 slot
- **Phase:** Design, with two small updates to the requirements and the plan
- **Tool:** Claude Fable 5.2, in the repo. The prompt was drafted in the planning-partner chat.
- **Screenshots**, in [`/screenshots`](../screenshots):
  - [`03-design/01-fable-architecture-schema-p1.png`](../screenshots/03-design/01-fable-architecture-schema-p1.png)
  - [`03-design/01-fable-architecture-schema-p2.png`](../screenshots/03-design/01-fable-architecture-schema-p2.png)
  - [`03-design/02-planning-chat-architecture-review-p1.png`](../screenshots/03-design/02-planning-chat-architecture-review-p1.png)
  - [`03-design/02-planning-chat-architecture-review-p2.png`](../screenshots/03-design/02-planning-chat-architecture-review-p2.png)

**Prompt**

> Read docs/plan.md and docs/requirements.md, then do the first half of the design step.
>
> Two small updates first:
> - I approve D11 and D12.
> - Tighten FR-18 so which questions a customer offers can't hint at the answer either. Each transaction type gets a fixed set of 5 questions from the bank, and every customer of that type offers the same 5. Update the validation rule, AC-3.1, FR-12, and the plan's scope line that still says "4–5 available questions".
>
> Then write docs/architecture.md and start docs/design.md, split the way the plan's deliverables table says:
> - the system architecture with a diagram (Mermaid, so GitHub renders it)
> - the folder layout and what each module is responsible for, with the pure game logic kept separate from React like NFR-8 says
> - the customer and question bank data schema as TypeScript types, plus one example customer to prove the schema works. Don't write the real customers yet.
> - the game flow as a state diagram
> - the main technical decisions, each with what you considered and why you picked it
>
> Keep it as simple as the requirements allow. If you want a library beyond React, Vite, and Vitest, justify it or leave it out. Put anything I need to decide in a "Decisions for Jeff" list like last time. Leave the UI wireframes for the next step.
>
> Commit, push, and add the ai-log entry. This prompt was drafted in the planning chat.

**Result**

Two commits on the branch `t3/architecture-design-part-1`, plus the commit that adds this entry.

- `8743c2e`: [requirements.md](requirements.md) version 3 and [plan.md](plan.md) version 5. FR-18 now fixes 5 questions per transaction type. AC-3.1, AC-8.3, FR-4, and FR-12 match it. D11 and D12 are marked approved, and the new rule is recorded as D13.
- `fc43d80`: [architecture.md](architecture.md) version 1 and [design.md](design.md) version 1, part 1. Architecture has two Mermaid diagrams (the layers, and test-build-deploy), the folder layout, a responsibility table per module, the 8 packages, and 11 technical decisions. Design has the state diagram, the state and action types, the transition table, the schema as TypeScript types, a draft question bank, one example customer, 13 validation rules, and 12 flow and schema decisions. Four decisions are waiting for me: D14 to D17.

**What worked**

This part is the record of what the AI did. TODO: add my own view after reading the documents.

- It added no library. The dependency list is React, Vite, TypeScript, Vitest, and the four packages those need to work together. It decided against a router, a state library, a schema library, a seeded-random package, a CSS framework, React Testing Library, and ESLint, and gave the reason for each.
- It checked its own output before committing. This machine has no Node, so it ran the checks in containers: it took the code blocks out of `design.md`, compiled them with `tsc --strict`, and compiled three broken copies of the example to confirm the types reject them. It rendered all three Mermaid diagrams with mermaid-cli and looked at the images.
- It noticed that `npm test` does not type-check, because Vitest strips types. So the types alone cannot meet AC-8.1, and the validator has to check typed data at runtime. That shaped three of the decisions (T5, S2, S7).
- It worked out that the fixed sets make part of the old FR-18 rule redundant: if every bank question is in at least one set, FR-13 already guarantees a scam and a legit customer offer it. The validation rule is now three checks on the sets and one on each customer's answers.
- It read the FinCEN PDFs for the list of scam types before putting them in the schema, and opened both FTC pages the example customer cites. The page numbers it gives match the printed pages.
- FR-7 (nothing about correctness before the debrief) is enforced by the structure: the customer screen gets a type without the truth or the flags, and no score exists in the state.
- The decisions it could not make are numbered D14 to D17, continuing the requirements' numbering, with a recommendation and a reason each.

**What the AI got wrong**

- Its first architecture diagram was not readable. It had every arrow drawn between individual modules, and when rendered the arrows crossed through the layers they had nothing to do with. It only saw this because it rendered the diagram. It redrew it with arrows between layers.
- It went past the prompt on the question bank. I asked for the schema and one example customer. It also drafted the wording of all 8 questions and chose which 5 go with each transaction type. Its reason is that the ids and sets are part of the schema and the example needs real questions to answer. It did flag the whole draft as D14, not as settled.
- It downloaded two container images, about 1.7 GB together, to run the checks, without asking first. They are still on my machine.
- The diagrams were checked with mermaid-cli, not with GitHub's renderer. I still need to look at both files on GitHub.
- Length again. `architecture.md` is about 2,350 words and `design.md` about 3,700, counting code and diagrams.
- It bumped the plan to version 5 for a one-line scope change. I had only asked for the line to be updated.
- The example customer's scenario has not been through the fact-check. The document says so, but it is a scam scenario written by the AI that wrote the schema, which is the thing the plan gives to ChatGPT and Gemini to check.

**What I changed**

The planning-partner chat reviewed both documents. Its findings and my follow-up prompt are in entry 7. I approved D14 with one change and D15 to D17 as written.

**Decisions waiting for me at the time**

- D14: the 8 question ids, their wording, and the set of 5 for each transaction type ([design.md](design.md) section 2.3).
- D15: the debrief shows a shared label per red flag plus the customer's own answer, with no sentence written per customer per flag.
- D16: no component tests, so no `jsdom` or React Testing Library. This changes what the plan's cut-order item 5 assumes.
- D17: no ESLint or Prettier.

**Open items**

- The schema is not locked until I decide D14 and D15. The plan locks it on Nov 28.
- The work is on the branch `t3/architecture-design-part-1`, not on `main`.
- `design.md` sections 3 to 5 (UI plan, wireframes, UI decisions) are placeholders for the next step.
- The open items from entry 5 on the gift-card review file still stand. The one about the plan's scope line is closed.

---

## 7. Design review fixes, and design part 2

- **Date:** Fri Nov 27, 2026
- **Phase:** Design
- **Tool:** Claude Fable 5.2, in the repo. The prompt was drafted in the planning-partner chat, and the findings in it came from that chat's review of entry 6.
- **Screenshots**, in [`/screenshots`](../screenshots):
  - [`03-design/03-planning-chat-screenshot-question-p1.png`](../screenshots/03-design/03-planning-chat-screenshot-question-p1.png)
  - [`03-design/04-fable-design-part-2-p1.png`](../screenshots/03-design/04-fable-design-part-2-p1.png)
  - [`03-design/04-fable-design-part-2-p2.png`](../screenshots/03-design/04-fable-design-part-2-p2.png)
  - [`03-design/05-planning-chat-design-review-p1.png`](../screenshots/03-design/05-planning-chat-design-review-p1.png)
  - [`03-design/05-planning-chat-design-review-p2.png`](../screenshots/03-design/05-planning-chat-design-review-p2.png)
  - [`03-design/06-fable-design-final-fixes-p1.png`](../screenshots/03-design/06-fable-design-final-fixes-p1.png), the same capture as `04-fable-design-part-2-p2.png`

**Prompt**

> Nice work. My decisions:
>
> - D14: approved with one change. `told` is the question closest to the game's premise, so it goes in every set. On gift cards it replaces `verified`, like you offered.
> - D15, D16, D17: approved. Update the plan's cut order since component tests are no longer planned.
> - Branch: open a PR into main when this step is done, but don't merge it yet. From now on every thread works on a branch and ends with a PR.
>
> One problem with the example customer: it's too easy. The slip and behaviour already give it away, and all five answers sound like a scam, so no question is worth asking. Whatever is in this doc is what Opus will copy for the real 10. The victims are also supposed to be coached, so they should have a cover story.
> - Add a content rule and a validation rule: a scam customer has flags behind at most 2 of its 5 answers. The other answers are the cover story and should sound like something a legit customer would say.
> - Rewrite the example to follow it, and make its slip and behaviour something a legit customer could also show.
> - An outright confession on `told` should be rare, since they've been told to lie.
>
> Then do part 2 of design.md: the UI and UX plan, wireframes for the three screens at 1280 and 375 wide (ASCII is fine), and the UI decisions. Stick to plain CSS, text, and emoji like the plan says. The debrief is the most important screen, so put the most effort there.
>
> Add the ai-log entry. The prompt was drafted in the planning chat and the findings came from its review. Tell me if you disagree with anything.

**What the review found**

The planning-partner chat reviewed the documents from entry 6. I agreed with its findings.

1. The example customer was too easy. Its slip and behaviour gave it away before any question, and all five answers sounded like a scam, so no question was worth asking.
2. The example had no cover story, although the game's premise is that the victims are coached.
3. The example is what Opus will copy for the real 10, so its faults would be repeated ten times.

The example in entry 6 passed every rule in the requirements. The requirements only had minimums, such as at least 3 flags and at least 1 behind a question, and nothing stopped a customer from having a flag behind every answer.

**Result**

Two commits on the branch `t3/architecture-design-part-1`, plus the commit that adds this entry, and a pull request into `main` that is open and not merged.

- `e112988`: [requirements.md](requirements.md) version 4 and [plan.md](plan.md) version 6. The cover-story rule is FR-19, with AC-8.4 for the test. The plan's cut order no longer has component tests, and section 6 has the branch and pull request rule.
- `5c08dc6`: [design.md](design.md) version 2 and [architecture.md](architecture.md) version 2.
  - `told` is in all three question sets.
  - Eight content rules for writing customers (C1 to C8), each marked as checked by the test or by the Gemini review, and two new validation rules (V14, V15).
  - The example customer rewritten: three of his five answers are a cover story about presents for his grandchildren, two have a flag, and his answer to `told` is a denial.
  - Part 2: the UI and UX plan, six ASCII wireframes (three screens at 1280 and 375 px), a colour palette with contrast ratios, a keyboard and focus plan, and 12 UI decisions. The debrief has the most detail: what every card shows, the four verdict sentences, and how each flag status is displayed.
  - D14 to D17 marked approved and D18 recorded as mine. Two new decisions are waiting: D19 and D20.

**What worked**

This part is the record of what the AI did. TODO: add my own view after reading the documents.

- It turned "the other answers should sound legit" into two things: counts a test can check (V14, V15) and rules only a reader can judge, which it put on the checklist for the Gemini content review. It did not pretend a test could check tone.
- It worked out the odds the new rule creates. With flags behind 2 of 5 answers, a player who picks 3 questions blind misses both 1 time in 10. With flags behind 1, they miss 4 times in 10. It wrote that into the content rules (C2) as a reason to use 2.
- The cover story needed no new field. A cover answer is any answer without a flag, and the coaching is named in the explanation line (S8, C7).
- The debrief wireframe uses the rewritten example with a player who asked three questions and still got it wrong, so one card shows all three flag statuses.
- It checked again before committing: the code blocks compile with `tsc --strict`, the three broken variants are rejected, the example's answers match the gift-card set, its flags are behind 2 questions, and every wireframe's lines are the same width. It opened the third FTC source (F8) before citing it for the example.
- The wireframes were generated by a script, not typed by hand, so the boxes line up.
- It found a problem I had not asked about: after a decision, the next customer's buttons are in the same place, so a double-click decides two customers. It proposed a guard as D19.

**Where the AI disagreed**

It did not disagree with any change. It raised four consequences:

1. `told` is now in every set, and a confession there is rare. So the question closest to the premise will nearly always get "no" from scam and legit customers alike. That is realistic, and it is the lesson, but only if the debrief says the customer was told to lie. C7 makes the explanation carry that. Players may still learn to skip `told`, which the playtest should watch for.
2. "At most 2" also allows 1, and with 1 the call is luck 4 times in 10. It recommends 2 as the norm and left that as a content rule, not a test.
3. "Rare" is not testable, so it set the limit at 1 scam customer in the pool. That number is its own.
4. The rule is one-sided. Scam customers' cover answers must read as legit, but nothing makes a legit customer's answer ever read as suspicious, so any odd answer still means scam. The three look-alikes (FR-14) cover the slip and behaviour, and C8 covers mood. It did not add a rule, and suggested the Gemini review look at it.

**What the AI got wrong**

- The version 1 example, as the review found. It followed the rules it had been given and did not ask whether the result was a game worth playing.
- It added things I did not ask for and drew them into the wireframes before I approved them: the half-second guard on the decision buttons (D19), source links on scam cards, and a look-alike line on legit cards (D20). They are marked as proposals in the text, but the wireframes show them as if they were settled.
- Length. `design.md` is about 900 lines. Roughly 350 of them are wireframes.
- Several numbers in the UI plan are its estimates, not measurements: the start screen being "about 600 px tall", and the customer screen fitting in 1280×720 with three answers open. The contrast ratios were calculated by its own script, not by a browser tool. NFR-6 still has to be checked in the browser.
- It put the branch and pull request rule into the plan's section 6 without being asked to.

**What I changed**

The planning-partner chat reviewed version 2 of the design. The three changes below came from that review, and I agreed with them. I approved D19 and D20. Both were already drawn in the wireframes before I had approved them, which the AI said itself in its reply.

> D19 and D20 are approved. Three last changes, then merge PR #1:
>
> 1. Your point 4 needs a rule, not just a review note. Right now no legit customer ever says anything alarming, so one odd answer always means scam. Give `lookAlike` a `shownIn` like red flags have (slip, behaviour, or a question), and require at least 2 legit look-alikes to show their trait in an answer, explained by a different question. Add the validation rule and a content rule, and show where the trait appeared on the look-alike's debrief card.
> 2. Leave `told` as it is. I accept that it's usually a dead question, since that's the real lesson. Add a note to check it in the playtest.
> 3. Roles table in plan.md: the planning chat will also capture the prompt screenshots through T3 Code's built-in browser and save them into screenshots/. It writes nothing else to the repo. Add a line to the plan's README notes that the README has to say how the screenshots were captured.
>
> Update the ai-log entry (these came from the planning chat's review, and note that D19 and D20 were drawn before I approved them). Then merge the PR and tell me the merge commit.

The AI had raised point 4 itself, as a consequence of the cover-story rule, and had left it for the Gemini review to look at. The review's point was that a known hole in the rules should be closed with a rule.

**What the AI did with the follow-up**

Commit `c75ce1f`, then the commit that updates this entry, then the merge of PR #1.

- `lookAlike` now has `flag`, `shownIn`, and `explainedBy`. Rule V16 requires at least 2 legit look-alikes whose trait is in an answer, and V9 requires the explaining question to be a different one. Two content rules were added: C9 for the alarming answer and C10 for making it point toward the question that explains it. The rule is D21, and the requirements carry it in FR-14 and AC-8.5.
- It added a second example, a fragment of a legit wire customer who says "No, never. It has all been by email" when asked if they have met the recipient, and explains it under `verified`. That fragment is the second card in the debrief wireframe, where the look-alike's trait gets the same *you asked* and *you didn't ask* labels as a red flag.
- It worked out the odds for this rule too: a player who has heard the alarming answer and has 2 questions left finds the explanation half the time by picking blind. That is why C10 exists.
- D19 and D20 are in the requirements as FR-6 and FR-9, with AC-4.4 and AC-6.5 to test them. NFR-1 now says the source links leave the site only on a click.
- `told` is unchanged. [design.md](design.md) has a new section 7, notes for the test plan, and its first note is the playtest check on `told`. The section also lists the double-click test, the measurements the UI plan only estimated, and the content rules that go to Gemini.
- [plan.md](plan.md) is version 7: the planning-partner chat's row says it captures the prompt screenshots through T3 Code's built-in browser and writes nothing else, and the README has to say how the screenshots were captured.

**What the AI got wrong in the follow-up**

- The source links have no titles, because the schema stores only URLs. The debrief can only show "consumer.ftc.gov (1)", which tells the player nothing about what they will read. It kept the schema as it was and did not raise it as a decision.
- It added a second example customer fragment, although the earlier prompt asked for one example.
- It left step 2 in the plan's section 6 as "Screenshot the prompt before sending it". With the planning-partner chat capturing the screenshots, I need to check that this still describes what happens.
- Two of the regenerated wireframe lines were too wide at first. The script that builds them refused to write the file, so the mistake did not reach the document.

**Open items**

- PR #1 is merged at the end of this step.
- `security.md`, `CLAUDE.md`, and the test strategy are still to write in the design phase (plan, Nov 29). If D20 (a) is approved, `security.md` has to cover links that leave the site.
- The content rules C2, C3, and C5 to C8 need to go on the checklist for the Gemini content review.
- This machine still has no Node, which the Nov 29 scaffold needs.

---

## 8. Security, test plan, and CLAUDE.md

- **Date:** Fri Nov 27, 2026, two days ahead of the plan's Nov 29 slot
- **Phase:** Design (`security.md`, `CLAUDE.md`) and Testing (the test strategy)
- **Tool:** Claude Fable 5.2, in the repo. The prompt was drafted in the planning-partner chat.
- **Screenshots**, in [`/screenshots`](../screenshots):
  - [`03-design/07-fable-security-test-plan-claude-md-p1.png`](../screenshots/03-design/07-fable-security-test-plan-claude-md-p1.png)
  - [`03-design/07-fable-security-test-plan-claude-md-p2.png`](../screenshots/03-design/07-fable-security-test-plan-claude-md-p2.png)
  - [`03-design/08-planning-chat-security-review-p1.png`](../screenshots/03-design/08-planning-chat-security-review-p1.png)
  - [`03-design/08-planning-chat-security-review-p2.png`](../screenshots/03-design/08-planning-chat-security-review-p2.png)
  - [`03-design/09-fable-security-decisions-merge-p1.png`](../screenshots/03-design/09-fable-security-decisions-merge-p1.png), the same capture as `07-fable-security-test-plan-claude-md-p2.png`

**Prompt**

> Read docs/plan.md, requirements.md, architecture.md, and design.md, then write the last three documents before coding starts:
>
> 1. docs/security.md. Keep it honest for a static site with no backend: what the real risks are (dependencies, the GitHub Actions workflow permissions and pinned action versions, rendering customer text, the external links on the debrief, localStorage, the answers being readable in the bundle) and what we do about each. Say what is out of scope and why. Give each requirement an id so the code review can check it.
> 2. docs/test-plan.md, the test strategy: what is unit tested, what the data validation test covers, and a manual test case for every acceptance criterion that isn't automated. Leave a results column empty for Dec 4.
> 3. CLAUDE.md at the repo root for the coding agent (Opus). Keep it under about 80 lines and point to the docs instead of repeating them. It should cover: the commands, the layer rules from the architecture, the rules it must never break (nothing about correctness shown before the debrief, no new dependencies without asking, customer text never rendered as HTML), how to work (a branch and PR per step, small commits, run the tests before saying it's done, add an ai-log entry), and what to do when the docs and the code disagree (stop and ask me).
>
> Don't write any app code. Put anything I need to decide in a "Decisions for Jeff" list. Open a PR, don't merge it, and add the ai-log entry. This prompt was drafted in the planning chat.

**Result**

Three commits on the branch `docs/security-test-plan-claude-md`, plus the commit that adds this entry, and a pull request into `main` that is open and not merged. No app code was written and no other document was changed.

- `4fc0958`: [security.md](security.md) version 1. Eight risks, each with how real it is and what is done about it. 21 requirements, SEC-1 to SEC-21, each with how it is checked. Five accepted risks, a table of what is out of scope and why, six commands for the code review, and six decisions (D22 to D27).
- `b0f7aa7`: [test-plan.md](test-plan.md) version 1. The strategy, the cases each of the five unit test files must cover, what the data validation test covers, a proposed rules test, a table tracing all 26 acceptance criteria and 11 non-functional requirements to a test, 27 manual cases in seven runs with an empty result column, the review checklists, the playtest steps, empty results tables, and seven decisions (D28 to D34).
- `2aeb5ba`: `CLAUDE.md`, 67 lines.

**What worked**

This part is the record of what the AI did. TODO: add my own view after reading the documents.

- It looked facts up and did not write them from memory. It read the latest release and commit of each GitHub action with `git ls-remote`. Two of them are several major versions newer than the ones in GitHub's own starter workflow. It read that starter workflow too, and did not copy it, because it gives the write permissions to the whole workflow and pins by tag.
- It read this repository's settings through the GitHub API, which I had not asked for. It changed nothing. That is how the document can say that secret scanning is already on, that Dependabot alerts are off, and that `main` is not protected.
- It said plainly which risks are small. Rendering customer text is rated low today, because we write the text and there is no input field. The answers being readable is accepted, with the line drawn at what a player sees on the page. It also wrote down a limit of its own mitigation: the lockfile makes installs repeatable, not safe.
- It added two risks that were not in my list: a push to `main` is a deploy and the coding agent runs with my login, and the screenshots are the likeliest way something private gets published.
- It noticed that every Pages site on my account shares one origin, so the best score in `localStorage` can be read and changed by my other sites.
- Writing the test cases turned up three gaps in the earlier documents (D31 to D33). It listed them and did not edit those documents.
- It worked out that only four scores are possible: 0, 20, 40, and 60.
- Everything that depends on a decision I have not made is marked "Proposed" in the body, and `CLAUDE.md` tells the coding agent not to build anything marked Proposed or Recommended. In entry 7 the proposals were drawn in as if they were settled.
- It tried the six review commands on sample files before putting them in the document.
- `CLAUDE.md` came in under the limit and points to document sections.

**What the AI got wrong**

- It started from a stale checkout. Local `main` was 9 commits behind `origin/main`, so its first read was of plan version 4 and requirements version 2. It noticed only because `architecture.md` and `design.md` did not exist there. It then fast-forwarded local `main` and read the changes. If those two files had not been missing, it would have written from the old requirements.
- Length again. `security.md` is about 3,100 words and `test-plan.md` about 4,950, counting the tables. It tried to cut `security.md` and took out about 120 words.
- It came back with 13 decisions. Six of them are things nobody asked for: the pull request trigger, the host allowlist, the Content-Security-Policy, the ruleset, the rules test, and seeing each test fail once. They are marked as proposals, but they are written into the requirement tables, and two manual cases exist only for them (MT-20 and MT-26).
- Three of its proposals are untested, because this machine has no Node and nothing is scaffolded: the Content-Security-Policy against a real Vite build, the two Actions settings in D27, and the way the rules test would read the source files. The documents say so.
- The times for the manual runs are its estimates. They add up to about an hour, and the Dec 4 slot is 2 hours that also has to hold the Gemini code review, the fixes, and the playtest.

**Decisions waiting for me at the time**

- D22: pin actions to a full commit SHA, not a tag.
- D23: run the tests on pull requests as well as on `main`.
- D24: an allowlist of hosts for the source links, as validation rule V17.
- D25: a Content-Security-Policy `<meta>` tag, added at build time.
- D26: `npm audit` by hand on Nov 29 and Dec 4, not in the workflow, and Dependabot alerts on.
- D27: a ruleset on `main`, and Actions limited to GitHub's own and pinned by SHA.
- D28: a rules test that reads the source files and enforces the layer rules and banned APIs.
- D29: run the failing-test pipeline check on Nov 29, against the scaffold.
- D30: install Node on this machine before the scaffold.
- D31: add `floored` to `Debrief`, so the debrief can say a score was raised to 0.
- D32: validation messages about the whole pool start with `pool`.
- D33: the first finished day sets the best score.
- D34: see each test file fail once.

**What the review found**

The planning-partner chat reviewed the three documents. The three changes below came from that review, and I agreed with them.

The scoring problem is older than this step. The AI recommended +10, −10, and −30 in entry 5. The planning-partner chat reviewed that version of the requirements and did not catch it, and I approved it as D1. In this step the AI worked out that only four scores were possible and reported it as a side note, that the best score would be coarse. It did not say what that meant for a player: one missed scam and one wrong hold scored 0 out of 60 with 4 of 6 calls right. The review saw that.

**What I changed**

> Decisions:
> - D22 to D26 and D28 to D34: approved as recommended.
> - D27: approved for the ruleset on main and for limiting Actions to GitHub-owned. Skip the setting that requires SHA pinning. The workflow pins by SHA anyway and the review checks it, and I don't want an untested setting breaking the first deploy.
> - D30: I'll let Opus install Node without sudo in the scaffold step.
>
> Changes:
> 1. Scoring. Your note that only 0, 20, 40 and 60 are possible is a real problem: one missed scam plus one wrong hold is 0 out of 60 with 4 of 6 calls right. Change D1 to +10 right, -5 legit held, -20 scam processed. It keeps the same break-even (holding only pays when a scam is more than 1 in 3 likely) and gives 60, 45, 30, 15, 0. Update requirements section 5 and its examples, the wireframes, and the test cases.
> 2. CLAUDE.md says the agent never merges a PR or changes a repo setting. Change both to "only when Jeff's prompt says to, and only what it names", since that's how PR #1 was merged.
> 3. Manual tests: add a priority column, so if Dec 4 runs short I know which 10 or so cases must run.
>
> Update the ai-log entry (these came from the planning chat's review, which also missed the scoring problem when it approved D1). Then merge PR #2 and tell me the merge commit.

**What the AI did with the follow-up**

Three commits, then the commit that updates this entry, then the merge of PR #2.

- `89a9d91`: the scoring change. [requirements.md](requirements.md) section 5 has the new table, the formula `max(0, 60 − 30 × scams processed − 15 × legit held)`, new examples, and the five possible scores. [design.md](design.md) has the new numbers in the debrief plan, the start-screen text, and all four wireframes that show points. The test plan's scoring and debrief cases and two manual cases use them.
- It checked my break-even claim before applying it. Holding pays above a 1 in 3 chance of a scam under both sets of numbers, and a missed scam still costs twice what a wrong hold does.
- It pointed out two consequences and wrote the first into D1. Processing everyone on a 1-scam day now scores 30 of 60, where it scored 20. That is the exact case the old D1 gave as its reason for choosing −30. Holding everyone on a 3-scam day now scores 15, where it scored 0.
- `cdceb91`: the decisions. [security.md](security.md) and [test-plan.md](test-plan.md) are version 2, with nothing marked proposed. D27 is recorded without the SHA-pinning setting and D30 as Opus installing Node in the scaffold step. It also applied the approved decisions to the earlier documents, which are now requirements version 6, design version 4, and architecture version 4: rule V17 and the list of source hosts (D24), `floored` on the debrief (D31), `pool` messages (D32), the first best score (D33), the pull request trigger in the workflow diagram (D23), the Content-Security-Policy in the build (D25), and the rules test in the folder layout (D28).
- The manual cases have a priority. 10 are Must for Dec 4, which it estimates at 25 minutes: MT-1 to MT-7, MT-10, MT-13, and MT-16. MT-22 is Must only if the best score ships, and MT-24 and MT-27 are Must on their own dates. 11 are Should and 3 are If time.
- `2d8b519`: `CLAUDE.md`. Merging a pull request and changing a repository setting are allowed only when my prompt says to, and only what it names. Pushing to `main` is still never allowed. The file is 68 lines.
- It checked its edits. Every wireframe line is still the same width. The code blocks in `design.md` still compile with `tsc --strict`. The changed workflow diagram was rendered with mermaid-cli and looked at.

**What the AI got wrong in the follow-up**

- It did more than the prompt said. I asked for the scoring to be updated in the requirements and the wireframes. It also edited `requirements.md`, `design.md`, and `architecture.md` to apply the decisions I had approved. Its reason was that `CLAUDE.md` tells the coding agent to stop when two documents disagree, and without those edits `security.md` and the test plan would have disagreed with the other three.
- It added an acceptance criterion I did not ask for, AC-8.6, for the source host rule. There are now 27.
- To compile the code blocks it downloaded TypeScript from npm inside a throwaway container, without asking. It used container images that were already on the machine and installed nothing on it. `CLAUDE.md`, which it had just written, says not to install tools or download images without asking, and this is close to that line.
- The priorities are its judgment and the times are still estimates.
- The changed diagram was checked with mermaid-cli, not with GitHub's renderer.

**Open items**

- No repository setting has been changed. The ruleset on `main`, limiting Actions to GitHub-owned, and turning on Dependabot alerts are mine to do, or to name in a prompt.
- Node is not installed. The scaffold prompt has to tell Opus to install it without sudo (D30).
- The Content-Security-Policy, the rules test's way of reading source files, and the two repository settings are still untried.
- The entry 7 open item about writing `security.md`, `CLAUDE.md`, and the test strategy is closed. The content rules for the Gemini review are listed in test-plan.md section 7.

---

## 9. Scaffold the app and the workflow

- **Date:** Fri Nov 27, 2026, two days ahead of the plan's Nov 29 slot
- **Phase:** Implementation
- **Tool:** Claude Opus 5.5, in the repo, through T3 Code
- **Screenshots**, in [`/screenshots`](../screenshots):
  - [`04-implementation/01-planning-chat-new-thread-question-p1.png`](../screenshots/04-implementation/01-planning-chat-new-thread-question-p1.png)
  - [`04-implementation/02-opus-scaffold-interrupted-p1.png`](../screenshots/04-implementation/02-opus-scaffold-interrupted-p1.png)
  - [`04-implementation/03-gemini-install-node-p1.png`](../screenshots/04-implementation/03-gemini-install-node-p1.png)
  - [`04-implementation/04-opus-scaffold-p1.png`](../screenshots/04-implementation/04-opus-scaffold-p1.png)
  - [`04-implementation/04-opus-scaffold-p2.png`](../screenshots/04-implementation/04-opus-scaffold-p2.png)
  - [`04-implementation/05-planning-chat-scaffold-review-p1.png`](../screenshots/04-implementation/05-planning-chat-scaffold-review-p1.png)
  - [`04-implementation/06-opus-merge-and-failing-test-check-p1.png`](../screenshots/04-implementation/06-opus-merge-and-failing-test-check-p1.png)
  - [`04-implementation/06-opus-merge-and-failing-test-check-p2.png`](../screenshots/04-implementation/06-opus-merge-and-failing-test-check-p2.png)

**Prompt**

> First coding step: scaffold the app and get it deploying. Read CLAUDE.md first.
>
> Node isn't installed. Check `node -v`. If it fails, you have my OK to install the current LTS without sudo: the official tarball from nodejs.org into ~/.local/opt, checksum verified, with node, npm, and npx linked into ~/.local/bin. Tell me exactly what you ran.
>
> Then:
> 1. Scaffold Vite + React + TypeScript with exactly the eight packages in architecture.md section 5 and the folder layout in section 3. A placeholder start screen with the title is enough, no game logic yet.
> 2. Add the workflow from architecture.md section 2 and security.md (SEC-5 to SEC-9). Look the action versions and SHAs up again, don't copy them from the doc.
> 3. Add the rules test (test-plan section 4) and the CSP meta tag (SEC-12). If the CSP takes more than 15 minutes, drop it and say so.
> 4. Run npm audit and record the result (SEC-3).
>
> For this step only, you may make these repo settings changes with gh and nothing else: enable Pages with GitHub Actions as the source, turn on Dependabot alerts, add the ruleset on main from D27, and limit Actions to GitHub-owned ones. List each change you made.
>
> Open a PR and stop there. I'll tell you when to merge. After it's merged and the site is live, we'll run the failing-test check (MT-24).

**Result**

Four code commits on the branch `scaffold/app-and-workflow`, plus the commit that records the audit and adds this entry, and a pull request into `main` that is open and not merged. Four repository settings were changed.

- **Node.** `node -v` printed `v26.13.1`, so nothing was installed. The prompt said Node was not installed, but it was already in `~/.local/opt/node-v26.13.1-linux-x64`, linked into `~/.local/bin`, created at 15:28 today, a few minutes before this session started. It had been installed by my first scaffold thread, with the OK in the same prompt, and I interrupted that thread at 15:28 just after the install. I had also had Gemini install nvm, so there are two copies of v26.13.1: `~/.local/opt/node-v26.13.1-linux-x64` and `~/.nvm/versions/node/v26.13.1`. In an interactive shell `~/.local/bin` comes first on `PATH`, so the `~/.local/opt` copy is the one that runs. The AI checked that install instead of installing a third copy. `https://nodejs.org/dist/index.json` lists v26.13.1 (Lithium, Nov 10) as the newest LTS. It downloaded `SHASUMS256.txt` and `node-v26.13.1-linux-x64.tar.xz` from `nodejs.org/dist/v26.13.1/` into a scratch folder, `sha256sum -c` passed, and `diff -r` found the unpacked tarball identical to the installed folder. It did not check the GPG signature on `SHASUMS256.txt`.
- `530f62b`: the scaffold. `package.json` lists exactly the eight packages at exact versions, read from the npm registry with `npm view` on Nov 27: `react` and `react-dom` 19.3.1, `vite` 8.4.0, `@vitejs/plugin-react` 6.3.0, `typescript` 7.0.2, `@types/react` 19.3.3, `@types/react-dom` 19.3.0, `vitest` 5.1.2. `package-lock.json` is committed. No package in the tree has an install script. Vite's own React template (read from `create-vite` with `npm pack`, not run) adds `@types/node` and `oxlint`, and both were left out. One strict `tsconfig.json`, as in the folder layout, instead of the template's three. `base` is `/hold-the-line/`. A placeholder start screen with the title and the premise line from design.md section 3.2. `src/game/` and `src/data/` do not exist yet, because git does not keep empty folders.
- `ff87e3e`: the Content-Security-Policy. A small plugin in `vite.config.ts` adds the policy from security.md, unchanged, as the first tag in the built `index.html`, and not in the dev server. It took well under 15 minutes. The built page has no inline script or style.
- `e9b03d9`: the rules test, `src/rules.test.ts`. It reads the source files with Vite's `import.meta.glob`, so it needs no Node API and no `@types/node`. It checks the six rules in test-plan.md section 4, plus a first case that fails if it finds no files. It also reads `.css` files, which the test plan does not mention.
- `d9a6a53`: the workflow, `.github/workflows/deploy.yml`. It runs on a push to `main` and on a pull request into `main`. The top-level token is `contents: read`. Only the deploy job adds `pages: write` and `id-token: write`, it runs only on a push to `main`, and its one step is `actions/deploy-pages`. `actions/checkout` has `persist-credentials: false`. `setup-node` uses Node 26.13.1, the same as this machine, with its automatic npm cache turned off. The artifact is uploaded only on a push to `main`.
- **Action versions.** `git ls-remote --tags https://github.com/actions/<name>` on Nov 27 showed the same newest releases as security.md: checkout v7.0.1, setup-node v7.1.0, upload-pages-artifact v5.0.0, deploy-pages v5.0.1. The tags are not annotated, so the SHA shown is the commit. `gh api repos/actions/<name>/commits/<sha>` confirmed each one is a commit, and each action's `action.yml` at that commit was read for its input names.
- **`npm audit`.** 0 vulnerabilities. `npm audit signatures`: 44 packages with verified registry signatures. Recorded in test-plan.md section 8.

**Repository settings changed**, each read first and read back after:

1. Pages turned on with GitHub Actions as the source: `POST /repos/.../pages` with `build_type=workflow`. HTTPS is enforced. GitHub also created the `github-pages` environment with a branch policy that allows only `main`. The AI did not set that itself.
2. Dependabot alerts turned on: `PUT /repos/.../vulnerability-alerts`.
3. A ruleset on `main`, "main: pull request required, no force pushes (D27)", id 28261439, active, no one can bypass it. Rules: a pull request is required with 0 approvals, since I can't approve my own pull requests, and force pushes are blocked. No status check is required. Deleting `main` is not blocked, because D27 did not ask for that. The API added `require_extra_approval_for_unattributed_changes: true` on its own. The AI looked it up in GitHub's docs: it only adds an approval to pull requests that Copilot opens under its own identity, and has no effect when 0 approvals are required.
4. Actions limited to GitHub-owned: `allowed_actions=selected`, `github_owned_allowed=true`, `verified_allowed=false`, no patterns. SHA pinning is still not required, as D27 says.

Unchanged, and matching SEC-19: the default workflow token is read-only, and secret scanning and push protection are on.

**What worked**

This part is the record of what the AI did. TODO: add my own view.

- It checked Node before following the install instructions, found it already installed, and verified that install against the official checksum instead of installing a second copy.
- It looked up every version and SHA rather than copying the documents, and its final `git ls-remote` check compares each pinned SHA in the workflow with its tag.
- It kept to eight packages even though Vite's template wants `@types/node`. The rules test reads files through Vite instead of Node's `fs`, so `tsc -b` passes without Node's types.
- It tested the CSP in a real browser and not just by reading the HTML. It served the build with `vite preview` and loaded it with the Chromium-based browser already on this machine, headless and with a throwaway profile. React rendered the title and no CSP violation was logged. It then loaded a scratch page with an inline script twice: the script was blocked with the policy and ran without it.
- It saw each rule in the rules test fail once (D34). It added a file in `src/game/` that imports React and calls `Math.random`, a file in `src/data/` with an import that is not `import type`, a `Slip.tsx` that reads `truth`, and a `console.log`, a `localStorage` call, and a web address in `App.tsx`. All six rules failed and named the file. A data file with `import type` from `game/types` passed. Everything was then removed.
- It ran the review commands from security.md section 6, and all came back clean.
- It noticed a default value the ruleset API added and checked the docs before leaving it on.

**What the AI got wrong**

- The first version of the import pattern in the rules test could run on from one statement into the next, because the code has no semicolons. It caught this before committing.
- Commit `530f62b` fails `npm test` by itself: it has the test setup but no test file until `e9b03d9`, and Vitest exits with code 1 when it finds no tests. Nothing ran on that commit alone.
- To stop the preview server it ran `pkill -f` with a pattern that also matched its own shell, which ended that command with an error. The server did stop.
- Without asking, it downloaded the Node tarball to check the install, unpacked `create-vite` to read its template, and ran a browser that was already installed, in headless mode. None of these installed anything, but `CLAUDE.md` says to ask before downloading, and the prompt approved the tarball only for an install.
- Nobody has seen the page in a normal browser. Layout, fonts, and colour are unchecked.

**Open items**

- The workflow has not run yet. Its first run is on this pull request, and that run builds without deploying. The deploy job first runs when the pull request is merged.
- MT-24 runs after the merge, as the prompt says.
- MT-16 expects every request to go to `/hold-the-line/`. Browsers also ask for `/favicon.ico` at the root of `jeff-meendering.github.io`, which will 404 and sits outside that path. It is on the same origin and is allowed by the policy. This is a note for my decision, not a change. Closed in the follow-up below.
- The built bundle is 68.65 kB of JavaScript and 0.32 kB of CSS gzipped, against NFR-7's 200 kB.

**What I changed**

> Reviewed, looks good.
>
> 1. Favicon: add a small SVG favicon in public/ (the 🏦 emoji as text in an SVG, no drawn art) and link it from index.html, so the browser stops asking for /favicon.ico at the site root. Check the CSP still allows it.
> 2. In ai-log entry 9: Node was installed by my first scaffold thread, which I interrupted at 15:28 after it had installed Node with the OK from the same prompt. I then also had Gemini install nvm, so there are two copies of the same version. That answers "I don't know who installed it".
> 3. Then merge PR #3. Wait for the deploy and confirm the live site loads at https://jeff-meendering.github.io/hold-the-line/ with the CSP in place.
> 4. Then run MT-24. Open a PR with one deliberately failing test, and merge it even though its check is red. Confirm the deploy job is skipped and the live site is unchanged. Then open and merge a PR that reverts it and confirm the deploy runs again. Record the run links in test-plan section 8.
>
> Those three merges are the only ones you may do. Tell me the run links and anything that didn't behave the way the docs say.

**What the AI did with the follow-up**

- The favicon is `public/favicon.svg`: one `<text>` element holding 🏦, with no drawn shapes and no style. `index.html` links it as `/favicon.svg`, and Vite rewrites that to `/hold-the-line/favicon.svg` in the build. It served the build with `vite preview` and loaded it headless with a network log. The page asked for exactly four files: the page, the CSS, the JavaScript, and `/hold-the-line/favicon.svg`. It asked for nothing at the site root, and no CSP violation was logged. `img-src 'self'` covers the icon.
- It corrected the Node bullet above with what I told it, and checked where the second copy is and which one runs.

---

## 11. Prompt screenshots into the repo

- **Date:** Fri Nov 27, 2026
- **Phase:** Documentation (process evidence for every phase so far)
- **Tool:** Claude Opus 5.5, in the repo, through T3 Code. The screenshots were captured by the planning-partner chat through T3 Code's built-in browser, as plan.md section 5 says.
- **Screenshots:** TODO: add filenames

Numbered 11 because PR #7, still open, adds entry 10.

**Prompt**

> The planning chat captured the prompt screenshots into ~/Desktop/hold-the-line-screenshots/ (58 PNGs in four phase folders, taken through T3 Code's built-in browser). Copy them into the repo's screenshots/ folders, keeping the names. Then fill in the screenshot filename TODOs in ai-log entries 1 to 10 by matching the names to the entries. Leave a TODO where there's no screenshot yet. The ChatGPT fact-check is one of those, I'll take it myself. Don't edit the images. Open a PR, and you may merge it once its check is green.

**Result**

Two commits on the branch `docs/screenshots`, plus the commit that adds this entry, and a pull request into `main`.

- `2cfc847`: the 58 PNGs in `screenshots/01-planning` (23), `02-requirements` (8), `03-design` (15), and `04-implementation` (12), with their names unchanged. A `sha256sum` of every file matched the source folder, so none was changed in the copy.
- `fdbbf8a`: the screenshot lines in entries 1 to 9, each a list of links. Each file was matched to an entry by its name and by what it shows. Entry 4 keeps a TODO for the ChatGPT conversation.
- Entry 10 is only on the branch `game/logic` (PR #7), so its screenshots are filled in by a separate commit there: `07-opus-game-logic-p1.png` and `-p2.png`, and `08-planning-chat-game-logic-review-p1.png`.
- `04-implementation/09-planning-chat-pairing-question-p1.png` is in no entry. It shows the planning chat setting up the screenshot capture, which has no entry of its own.

**Checked before committing (SEC-20)**

Subagents of this session read every image and reported what each one shows and anything private. The AI looked at 08 and 09 in `04-implementation` itself. Nothing was edited.

- No token, key, phone number, notification, or other browser tab appears in any image.
- The GitHub no-reply address `112517844+Jeff-Meendering@users.noreply.github.com` can be read in `01-planning/04-opus-repo-setup-p1.png`, and is in small print in the thumbnails in 02, 03, and 05. It is already the author address on all 36 commits on `main`, so the screenshots publish nothing new.
- `04-implementation/08` and `09` show my line "Like my sudo password? Because you can use that" and the reply refusing it. No password or token is shown.
- `04-implementation/05` says my recent threads were started from my phone.

**Problems in the screenshots, for me to decide**

- Two are the same capture: `03-design/06-fable-design-final-fixes-p1.png` and `04-fable-design-part-2-p2.png`, and `03-design/09-fable-security-decisions-merge-p1.png` and `07-fable-security-test-plan-claude-md-p2.png`. ImageMagick `compare` found 14 different pixels in each pair, the blinking cursor in the message box. Both are still linked.
- `04-implementation/08-planning-chat-game-logic-review-p1.png` does not show the review of PR #7. It shows the end of the step 9 prompt and the pairing-token exchange, and is nearly the same as 09. Entry 10 keeps a TODO for the review.
- Gaps: no capture shows the end of the step 2b prompt in the planning chat (between `01-planning/08-p2` and `10-p1`), and a few lines of the reply are missing between `03-design/07-p1` and `07-p2`. The prompts themselves are in the Fable thread captures.
- Several pairs overlap heavily, such as `01-planning/07-p2` and `08-p1`, and `02-requirements/04-p2` and `06-p1`.
- `04-implementation/03-gemini-install-node-p1.png`: the model picker reads "4 Neon", which is Gemini 4 Neon in plan.md.
- `01-planning/09-fable-plan-revision-p4.png` and `11-fable-plan-fixes-p1.png` show "[model name]", the placeholder in my message, unfilled.

**What worked**

This part is the record of what the AI did. TODO: add my own view.

- It checked every image for private details before committing, as SEC-20 says, and checked whether the one email address it found was already public.
- It confirmed the copies are byte for byte the same as the originals, and that every one of the 58 files is linked from an entry or listed as in none.

**What the AI got wrong**

- It called the T3 Code wait tool twice with subagent ids, which that tool does not take, and then started a subagent that did nothing just to wait. Subagents report back on their own.
- The privacy check of 56 of the 58 images was done by its subagents, not by the AI that wrote this entry. SEC-20 asks that every screenshot be looked at, and I have not looked at them yet.
