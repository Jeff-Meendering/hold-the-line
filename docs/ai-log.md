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

TODO: paste the prompt. It was sent in a different session, so it is not available to copy here.

**Result**

Commit `50d5063`: a `docs/` folder, seven numbered screenshot folders (`01-planning` to `07-final-app`), a `.gitignore` for a Vite project, and a one-line README.

**What worked**

- The screenshot folders follow the SDLC phases, so evidence is sorted from the first commit.

**What the AI got wrong**

TODO

**What I changed**

TODO

---

## 2. First plan draft

- **Date:** Fri Nov 27, 2026
- **Phase:** Planning
- **Tool:** Claude Fable 5.2, in the repo
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

The biggest miss was mine. I summarised the assignment as "grades the whole SDLC" and did not paste it, so the AI planned for the summary. It cannot plan for requirements it has not been given, and it will fill the gap with a reasonable guess that looks complete. Give the source document, not my summary of it.

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

`docs/assignment.md`, `docs/plan.md` (version 2), and this log, committed and pushed.

**What worked**

- A numbered list of changes, each with its reason. All seven were applied.
- Asking the AI to say where it disagreed, after doing the work rather than instead of it.
- With the assignment in hand, the AI found a requirement neither of us had listed: user personas.

**What the AI pushed back on**

- Change 4: it applied 8.5 and 5, but pointed out that the same revision adds work (three more documents, two reviews, a fact-check, and 10 customers instead of 6), so only 6.5 of the 8.5 hours are code and the buffer fell from 2 hours to 1.5.
- Change 6: it applied the pool, but noted that a known range of 1 to 3 still lets a player count at the edges, and suggested not telling the player the range.
- Change 1: it agreed, and added that ChatGPT's sources need to be opened and read, because a fact-checker can invent citations.

**What the AI got wrong**

TODO: fill in after reviewing the plan.

**What I changed**

TODO: my decision on each pushback.
