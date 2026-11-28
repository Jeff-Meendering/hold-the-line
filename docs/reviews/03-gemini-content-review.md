# Review 03: Gemini content review

- **Date:** Fri Nov 27, 2026
- **Branch:** `content/customers`
- **Files reviewed:** `src/data/customers.ts`, `src/data/questions.ts`, `src/data/labels.ts` against `docs/design.md` (section 2.4) and `docs/requirements.md` (sections 5–7)

The three highest-priority findings are listed first. Items that pass cleanly (including NFR-11 victim-blaming checks on all ten explanations, C1, C4, C7, C8, and `c10-wire-daughter`) are omitted.

1. **Customer:** `c04-cash-bank`
   - **Severity:** high
   - **Exact text:**
     - `answers.next`: `"It gets paid in this afternoon. There's a machine at a gas station on Miller Road. I scan a code and feed the bills in."`
     - `answers.origin`: `"I had a call about some odd activity on my accounts. It made me think I shouldn't leave it all sitting in here."`
     - (Compare `answers.purpose`: `"We're redoing the kitchen. The contractor takes ten percent off for cash."` and `explanation`: `"...He was told not to trust the branch and to say the cash was for a kitchen."`)
   - **Why it's a problem:** Breaks **C5** and collapses the cover story. Stephen is calm, unhurried, and coached not to trust the branch and to say the cash is for a kitchen remodel. Voluntarily telling the teller he is feeding `$14,000` into a gas-station kiosk after scanning a code cannot be reconciled with paying a kitchen contractor and turns `next` into a one-question confession rather than a slip a careful reader catches. Likewise, `origin` abandons the kitchen story completely and volunteers the fraud call to the exact branch he was told not to trust.
   - **Suggested fix:** Weave the fraud-call slip into `origin` as his reason for breaking the CD early for the remodel, and rewrite `next` so he tries to keep the cover while letting slip a detail about an automated deposit code/machine rather than flatly describing a gas-station crypto ATM.

2. **Customer:** `c02-gift-government`
   - **Severity:** high
   - **Exact text:**
     - `behaviour`: `Mid-twenties, in a delivery uniform. His phone is at his ear when he reaches the counter. He says "okay, I'm up" into it and lowers it without ending the call.`
     - `answers.next`: `"Tonight I send pictures of the backs, with the numbers showing. After that I just hold on to the cards."`
     - `answers.urgency`: `"No, there's no rush... Sorry. Yes. Yes, it has to be today."`
   - **Why it's a problem:** Breaks **C6** and **C5**, and makes the customer identifiable with zero questions asked (or on one click). Saying `"okay, I'm up"` and lowering a phone without hanging up is an overt eavesdropping cue no legitimate customer shows—especially contrasted with `c08-gift-crew`'s self-explaining business call. In `next`, Darius completely abandons his wedding-present cover story (`purpose`) and confesses the scam mechanics verbatim; nobody tells a teller they are keeping the physical cards of a wedding gift after photographing the numbers. In `urgency`, reversing mid-sentence after lowering the phone is physically inconsistent with `behaviour` (no speakerphone or earbud is mentioned), reads as a cartoon giveaway rather than a subtle slip, and makes little sense for someone terrified of an arrest warrant (who wouldn't open with `"No, there's no rush"`).
   - **Suggested fix:** Remove `"okay, I'm up"` and show an ambiguous live call (e.g., an earbud or muted phone), reconcile `next` with the wedding cover (e.g., claiming the couple lives out of state and wants the codes from the back tonight), and replace `urgency`'s live correction with an unexplained same-hour deadline that clashes with a Saturday wedding.

3. **Customer:** `c01-cash-emergency`, `c02-gift-government`, `c04-cash-bank` (pool-wide shortcut)
   - **Severity:** high
   - **Exact text:**
     - `c01-cash-emergency` `answers.next`: `"I take it straight home. A driver is coming to the door for it at three, and I'm to have it in an envelope."` (`RF-16`)
     - `c02-gift-government` `answers.next`: `"Tonight I send pictures of the backs, with the numbers showing. After that I just hold on to the cards."` (`RF-12`)
     - `c04-cash-bank` `answers.next`: `"It gets paid in this afternoon. There's a machine at a gas station on Miller Road. I scan a code and feed the bills in."` (`RF-15`)
   - **Why it's a problem:** Creates a mechanical shortcut that beats the whole pool without reading the slip or weighing trade-offs. All three non-wire scams put their strongest smoking gun behind `next`, zero of the four scams put any flag behind `purpose`, and only `c01` (already caught by `next`) flags `told`. A player who always asks `purpose` + `origin` + `next` on cash, `purpose` + `recipient` + `next` on gift cards, and `recipient` + `met` + `verified` on wires catches 100% of scams and resolves 100% of legit look-alikes while never touching `urgency` or `told` (and bypassing `c07-gift-retirement`'s `told` trap entirely). On gift cards, `next` alone beats every customer; on cash, `next` + `purpose` beats all four with a question left over.
   - **Suggested fix:** Move one cash scam's flag off `next` (e.g., keep `c04-cash-bank`'s `next` consistent with the cover and flag `urgency` or `purpose` instead) and soften the remaining `next` flags so they have to be weighed against another answer.

4. **Customer:** `c09-wire-hospital`
   - **Severity:** medium
   - **Exact text:**
     - `slip.recipient`: `'Mabini Coast Medical Center'` / `slip.accountNote`: `'Payroll deposits, card spending. Sends about $300 abroad most months through a transfer app.'`
     - `answers.purpose`: `"My mother's in the hospital and they won't operate until the deposit is paid. It has to get there today."`
     - `lookAlike`: `{ flag: 'RF-5', shownIn: 'purpose', explainedBy: 'verified' }`
   - **Why it's a problem:** Breaks **C9** and **C10**, and misapplies `RF-5` (`"A loved one's emergency, but a stranger gets paid"`). Because the slip already names a hospital and notes regular remittances abroad, paying a hospital deposit for his mother's surgery is not paying an unconnected third party; `purpose` sounds entirely legitimate rather than as worrying on its own as a scam flag (**C9**). It also mentions no call, text, email, or forwarded invoice, so it gives the player no cue pointing toward `verified` (**C10**)—that cue sits in `recipient` (`"sent me a picture of the invoice"`).
   - **Suggested fix:** Change the wire recipient to an individual's name that does not match Joel's surname (e.g., his married sister or a named local coordinator) and have `purpose` mention receiving the wire instructions by text or email so it genuinely resembles `RF-5` and points to `verified`.

5. **Customer:** `c05-cash-card`
   - **Severity:** medium
   - **Exact text:**
     - `slip.amount`: `900`
     - `behaviour`: `Mid-thirties, flustered, a toddler on her hip. She says sorry to the line behind her and tells you she has never done this at a counter before.`
     - `answers.origin`: `"The bank's fraud team called me on Saturday. Somebody got into my account, and they've had to shut my card off."`
     - `lookAlike`: `{ flag: 'RF-7', shownIn: 'origin', explainedBy: 'next' }`
   - **Why it's a problem:** Breaks **C9** and **C10**, and telegraphs "legit" at zero questions. At `$900`—far below every scam in the pool—a frazzled parent with a toddler looks harmless before a question is asked. Even if asked, `origin` describes routine debit-card replacement and never says anyone told her to move money (`RF-7`), so it is neither alarming on its own (**C9**) nor pointed specifically at `next` (**C10**, since `purpose` clears it up just as easily). It is also slightly unrealistic for a bank window, where a teller would normally see a locked or reissued card on her profile.
   - **Suggested fix:** Raise the withdrawal to a more noticeable sum (e.g., `$2,600` for rent and bills while an account is being re-numbered) and rewrite `origin` so she says the fraud department called about account compromise and she has to pull cash out before the account closes—sounding like `RF-7` until `next` clarifies she is paying her own bills.

6. **Customer:** `c03-wire-romance`
   - **Severity:** medium
   - **Exact text:**
     - `answers.recipient`: `"Graham. He's an engineer on a North Sea rig. We met on a dating site last spring and we've talked every day since."` (`RF-13`)
     - `explanation`: `"...He told her to call him a friend and business partner."`
   - **Why it's a problem:** Weakens **C5** and contradicts `explanation`. If Graham coached Carol to call him a friend and business partner, immediately volunteering `"an engineer on a North Sea rig"` and `"We met on a dating site"` on `recipient` drops her cover on the first prompt and relies on the most recognizable romance-scam cliché in pop culture. At the same time, saying they met on a dating site last spring does not actually state they have *only* met online (`RF-13`), so a player who asks `recipient` without asking `met` sees a debrief label that the revealed quote never strictly established.
   - **Suggested fix:** Drop the oil-rig trope and have `recipient` stick closer to the `"friend"` cover while slipping that they have only ever spoken online or by video (or move `RF-13` onto `met` and put a subtler partnership inconsistency in `recipient`).

7. **Customer:** `c01-cash-emergency`
   - **Severity:** medium
   - **Exact text:**
     - `slip`: `amount: 8500`, `accountNote: 'Social Security and a small pension. Largest cash withdrawal this year: $200.'` (`RF-8`)
     - `behaviour`: `Late seventies, coat still buttoned. Her hand shakes as she slides the slip across, and she checks the wall clock twice while you read it.` (`RF-2`)
   - **Why it's a problem:** Weakens **C6** and makes `c01` holdable without asking a single question. Stacking a visibly trembling late-seventies customer (`RF-2`) onto a 40× cash spike from a Social Security account (`RF-8`)—with no legit look-alike in the pool showing either physical distress/trembling or a fixed-income cash spike—strongly telegraphs the grandparent-scam archetype up front.
   - **Suggested fix:** Replace the shaking hand with hurried anxiety a legitimate customer could show (e.g., coat still buttoned, glancing at the clock, eager to get back home) and narrow the `$200`-to-`$8,500` gap slightly or mirror fixed-income stress in a legit customer.

8. **Customer:** `c08-gift-crew`
   - **Severity:** medium
   - **Exact text:**
     - `slip`: `amount: 3000`, `cardCount: 12`, `valuePerCard: 250`, `accountNote: 'Business account: payroll, fuel, suppliers. No gift cards before.'`
     - `behaviour`: `Late fifties, in a company fleece, phone clamped to his ear. "Twelve, you said? Not thirteen?" he asks it, then nods at you to go ahead.` (`lookAlike RF-1`)
   - **Why it's a problem:** Solvable as legit with zero questions asked, breaking the intended `RF-1` mirror with `c02-gift-government` (**C6**). Frank is the only business account in the pool, wears a company fleece, buys `$250` cards, and his spoken line `"Twelve, you said? Not thirteen?"` explains his phone call inside `behaviour` itself, leaving no suspicion for `recipient` to clear up.
   - **Suggested fix:** Make the phone exchange ambiguous (e.g., `"I'm at the window now, stay on the line"` or `"Okay, I'm up—go ahead"`) and remove `"company fleece"` so the player must ask `recipient` to learn it is his office manager reading the employee list.

9. **Customer:** `c01-cash-emergency`, `c04-cash-bank`, `c05-cash-card`, `c06-cash-truck`
   - **Severity:** medium
   - **Exact text:**
     - `c01-cash-emergency` `answers.purpose`: `"A new furnace. Mine quit, and the man who's putting it in gives a better price for cash."` (`$8,500`)
     - `c04-cash-bank` `answers.purpose`: `"We're redoing the kitchen. The contractor takes ten percent off for cash."` (`$14,000`)
     - `c06-cash-truck` `slip.amount`: `7500` / `answers.purpose`: `"A truck. A 2016 pickup from a private seller who wants cash, and the price is worth the CD penalty."`
   - **Why it's a problem:** Creates two pattern shortcuts across the four cash customers. Both cash scams (2 of 2) use the identical cover story—a home-improvement contractor offering a discount for cash—while neither legit cash customer does. In addition, both cash scams (`$8,500`, `$14,000`) are strictly larger than both legit cash withdrawals (`$900`, `$7,500`), and `$7,500` is unrealistically low for a 2016 pickup truck in 2026.
   - **Suggested fix:** Give one cash scam a non-contractor cover story (e.g., buying a used car or helping a family member with a deposit) and raise `c06-cash-truck` to `$11,500` so a legitimate cash withdrawal sits above `c01-cash-emergency`.

10. **Customer:** `c02-gift-government`, `c07-gift-retirement`
    - **Severity:** medium
    - **Exact text:**
      - `c02-gift-government`: `cardCount: 4, valuePerCard: 500`, `behaviour: 'Mid-twenties, in a delivery uniform...'`, `accountNote: 'Payroll deposits, rent, card spending. No gift cards before.'`, `answers.purpose: 'A wedding present. My cousin gets married Saturday, and they asked for gift cards instead of stuff.'`
      - `c07-gift-retirement`: `amount: 1200, cardCount: 3, valuePerCard: 400`
    - **Why it's a problem:** Combines a slip-pattern shortcut with two banking-realism issues (weakening **C3**). `c02` is the only gift-card customer buying max-denomination `$500` cards (`c07` buys `$400`, `c08` buys `$250`). Meanwhile, buying three `$400` Visa gift cards for *one* retiring coworker makes little sense when `$500` cards are available, and a mid-twenties delivery driver paying rent giving a personal `$2,000` wedding gift to a cousin strains `c02`'s cover story against his slip and behaviour (**C3**).
    - **Suggested fix:** Change `c07-gift-retirement` to `3 × $500` (`$1,500`) so `$500` cards are not unique to the scam, and frame `c02-gift-government`'s `$2,000` cover as pooled wedding money from several relatives (or lower the amount / adjust his profile to match).

11. **Customer:** `c07-gift-retirement`
    - **Severity:** low
    - **Exact text:**
      - `answers.told`: `"Asked to keep it quiet? Yes, strictly. And I'd be grateful if you would too."`
      - `lookAlike`: `{ flag: 'RF-6', shownIn: 'told', explainedBy: 'recipient' }`
    - **Why it's a problem:** Breaks **C10**. Nothing in `told` points the player toward `recipient` as the question that explains the secrecy, so a player who hears `told` has no reason to ask `recipient` rather than `purpose`, `urgency`, or `next`.
    - **Suggested fix:** Add a pronoun cue toward the recipient in `told` (e.g., `"Asked to keep it quiet? Yes, strictly—if word gets back to her before Friday, the whole floor will have my head."`).

12. **Customer:** `c09-wire-hospital` (and `src/data/questions.ts`)
    - **Severity:** low
    - **Exact text:**
      - `QUESTION_TEXT.verified`: `'Have you double-checked this yourself, by calling a number you already had?'`
      - `c09-wire-hospital` `answers.verified`: `"Yes. I looked up the hospital's main number myself, called it, and billing read the account back to me."`
    - **Why it's a problem:** Fails the question-bank fit check (`requirements.md` section 8, open item 2). Asking someone wiring an emergency deposit to a hospital abroad whether they called `"a number you already had"` does not fit an institutional recipient, forcing Joel's answer to sidestep the wording (`"I looked up the hospital's main number myself"`).
    - **Suggested fix:** Reword `QUESTION_TEXT.verified` to `'Have you double-checked this yourself, using a number you already had or looked up independently?'`.

## Triage

Added Sat Nov 28, 2026. The triage came from the planning-partner chat. It reached the repo as Jeff's prompt for the fix round, which is quoted in full in [ai-log.md](../ai-log.md), entry 13. Claude Fable, in the repo, applied it and wrote this table from that prompt.

The prompt gives a reason for two of the decisions, 3 and 7, and those are quoted. For the others it gives the decision only. Where a finding was changed or accepted in part, the reason is left as a TODO instead of being guessed. The old and new text of every answer is in entry 13.

| # | Finding | Outcome | What was done | Why |
|---|---|---|---|---|
| 1 | `c04` Stephen: `origin` and `next` drop the cover story | Accepted | `origin` now gives the kitchen as the reason and the call about his accounts as what decided it (still RF-7). `next` keeps the contractor as the one being paid, and a code to scan and a machine slip out (still RF-15). The gas station is gone from the answer | Accepted as found |
| 2 | `c02` Darius: the phone call, `urgency`, and `next` | Accepted | The behaviour is now an earbud and a call still running, with no "okay, I'm up". `urgency` is a deadline within the hour that he cannot square with a Saturday wedding (still RF-3). `next` fits the wedding: pictures of the backs go to his cousin tonight and the cards go in the envelope on Saturday (still RF-12) | Accepted as found |
| 3 | The strongest flag of all three non-wire scams is behind `next` | Changed | Gemini suggested moving `c04`'s flag off `next`. Instead `c01` Lorraine's driver moved from `next` to `urgency`, so RF-16 is now behind `urgency`, and her `next` fits the furnace story. `c04` keeps a flag behind `next`, softened under finding 1. The gift card and wire parts of the shortcut were not in the prompt and are unchanged | From the prompt: "That way always asking purpose, origin and next no longer catches every cash scam." |
| 4 | `c09` Joel: `purpose` is not alarming and does not point to `verified` | Accepted in part | `purpose` now says how he heard: a message in the night with the bank details. That points to `verified`. The recipient is still the hospital. Gemini suggested an individual with a different surname | The prompt says to keep the hospital as the recipient and gives no reason. TODO: the reason |
| 5 | `c05` Ana: $900 and a routine `origin` | Accepted | The amount is $2,600. `origin` says the fraud team called, she was told not to use the account, and she needs cash out, which reads like RF-7. `next` explains it: rent, daycare, and groceries. `purpose`, the account note, and the explanation were changed to fit the new amount | Accepted as found |
| 6 | `c03` Carol: `recipient` drops the cover on the first question | Accepted, as Gemini's second option | `recipient` gives "a friend and my business partner" and declines to say how they met (RF-3). `met` says they met online and have never met in person (RF-13). The flags are behind the same two questions as before, with the ids swapped. The dating site and the North Sea rig are out of the answers. `met` still says his work keeps him offshore, which is what the FTC romance page describes | The prompt says where the two parts go and to keep two flagged answers. Putting RF-3 behind `recipient` was Fable's choice |
| 7 | `c01` Lorraine: holdable with no question asked | Skipped | Nothing changed. The shaking hand and the account note are as they were | From the prompt: "Lorraine is the easy one on purpose, and Margaret and Joel are legit customers who also look alarming before any question." |
| 8 | `c08` Frank: the phone call explains itself | Accepted | His line is now "I'm at the counter now, stay on", and the company fleece is gone. The business account note is unchanged, because the prompt names only the line and the fleece | Accepted as found |
| 9 | Both cash scams use a contractor's discount for cash, and both are larger than both legit withdrawals | Changed | `c06` Curtis is $11,500, as suggested, which is above `c01`'s $8,500. Gemini suggested a different cover story for one cash scam. Instead both cover stories stay and only `c04` keeps the discount: `c01`'s furnace man now "wants to be paid in cash" | The prompt gives the decision and no reason. TODO: the reason |
| 10 | `c02` is the only customer buying $500 cards, and $2,000 is a lot for his cover story | Accepted | `c07` Denise buys 3 × $500, $1,500. `c02`'s present is now "from me and my brothers". Gemini suggested several relatives | Accepted as found |
| 11 | `c07` Denise: `told` does not point to `recipient` | Accepted | `told` now has Gemini's cue, "If word gets back to her before Friday, the whole floor will have my head", with its dash made a full stop | Accepted as found |
| 12 | The `verified` question does not fit a hospital | Accepted, with different wording | The question is now "Have you double-checked this yourself, by calling a number you already had or found on your own?". Gemini's wording was "using a number you already had or looked up independently". The prompt asked for a rewording and did not give one, so the wording is Fable's | Accepted as found |

The rewritten text has not been back to Gemini.
