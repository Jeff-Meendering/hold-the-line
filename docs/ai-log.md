# AI log

A running log of every step where an AI tool was used. One entry per step, added when the step ends. The README's AI engineering analysis and reflection are written from this file.

Each entry records the tool, the prompt, what worked, what the AI got wrong, and what I changed. Screenshots are in `/screenshots`, named as described in [plan.md](plan.md).

---

## 1. Repo setup

- **Date:** Fri Nov 27, 2026
- **Phase:** Planning
- **Tool:** Claude Opus 5.5 (co-author on commit `50d5063`)
- **Screenshots:** TODO: add filenames

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
- **Screenshots:** TODO: add filenames

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
- **Screenshots:** TODO: add filenames

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
- **Screenshots:** TODO: add filenames

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
- **Tool:** Claude Fable 5.2, in the repo. TODO: say whether the prompt was drafted in the planning-partner chat.
- **Screenshots:** TODO: add filenames

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

[requirements.md](requirements.md), version 1: 3 personas, 9 user stories with 20 acceptance criteria, FR-1 to FR-17, NFR-1 to NFR-11, the scoring table, the 7 day-draw rules, 16 documented red flags and 3 marked as undocumented, and 10 decisions waiting for me.

**What worked**

This part is the record of what the AI did. TODO: add my own view after reading the document.

- It noticed that the fact-check file has no source URLs and a TODO where ChatGPT's answer should be, so "the sources in the fact-check" could not be read from the repo. It said so in the document and did not invent citations.
- It fetched the sources itself: two FinCEN PDFs and six FTC pages. It read the full text of both PDFs and quoted each indicator with a page number.
- It marked the flag closest to the game's premise, that the scammer coaches the victim on what to tell the teller (RF-P1), as not documented in any of the eight sources. The documented indicators are about being directed over the phone and not keeping a consistent reason, which is not the same claim.
- It marked one indicator as only a partial match (RF-14) and noted where a quote covers less than the flag it supports (RF-6, RF-11).
- The decisions are tagged in the text ([D1] to [D10]) and collected at the end with a reason each, as the prompt asked.

**What the AI got wrong**

- Length. The first draft was about 4,000 words against a 10-minute limit. It cut the draft itself to about 3,200 words, which is still over. The red-flag and source tables are roughly a third of that.
- It guessed both FinCEN PDF URLs from memory and both returned 404. The working URLs came from fincen.gov's own pages.
- It told its fetch helper the FinCEN trend analysis was published in February 2024. The PDF is dated April 2024. The document only says 2024.
- Its fetch tool could not read either PDF, so it extracted the text locally. The FTC quotes came back through the fetch tool with a length cap and were not read on the page. None of the eight sources has had my open-and-read check yet.
- It could not find an FTC page describing couriers collecting cash or gold, so RF-16 rests on two short clauses.
- TODO: anything I find on review.

**What I changed**

TODO: my decision on D1 to D10, and any corrections.

**Open items it raised**

- Paste ChatGPT's answer into `reviews/01-gift-card-check.md`, so the sources used here can be matched against the ones the fact-check verified.
- The header of `plan.md` says "Version 3" while its text describes version 4.
