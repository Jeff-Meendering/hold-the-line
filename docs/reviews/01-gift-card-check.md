# Review 01: gift-card fact-check

- **Date:** Fri Nov 27, 2026
- **Tool:** ChatGPT, in the browser. Model: TODO
- **Question:** do gift cards make sense as a transaction at a US bank teller window, and what does a teller see of a gift card scam?
- **Log entry:** [ai-log.md](../ai-log.md), entry 4

## Triage

The planning-partner chat fetched the cited pages and checked the quotes against them. The triage is mine.

| Status | Item | Detail |
|---|---|---|
| Correct | Both FTC pages | The quotes are on the page |
| Correct | Both FinCEN PDFs | The quotes are on the page |
| Correct | The OCC handbook | The quote is on the page |
| Wrong | Educational Systems FCU quote | "from any lobby teller" is not on the page. It says "Members can purchase Visa gift cards at any of our branch locations." The $10 to $1,000 limit is correct |
| Wrong | CFPB link title | The page is "Who do I contact for help with a scam or fraud?". The quote is on it |
| Misleading | FinCEN case study | It was used as evidence that victims pay scammers with cashier's checks, but the quote is about a defendant buying them |
| Misleading | FinCEN check statistic | The figure also includes counterfeit checks |
| Not verified yet | FBI Albuquerque | |
| Not verified yet | The IC3 image | |
| Not verified yet | Together CU | |
| Not verified yet | Priority First FCU | |
| Not verified yet | The FinCEN case study page | |
| Rejected, out of scope | Sections 4 to 6 | Game design and scenarios, which I did not ask for and which is not ChatGPT's job. Not using money orders, money mules, or configurable limits |

## Decision

- Gift cards stay as the third transaction type, as bank-issued Visa gift cards with a $500 maximum per card.
- Store gift cards, gold, and crypto ATMs are reasons behind cash withdrawals, not transactions, since that is what the FTC and FBI document.
- The cashier's-check fallback is dropped, because the sources did not support it.

## Prompt

> I'm making a small educational browser game where the player is a bank teller who has to spot customers who are being scammed. I need the transactions to be realistic for a US bank teller window.
>
> 1. Do US banks or credit unions actually sell gift cards or prepaid cards at the teller window? How common is it and what are the typical limits?
> 2. In real gift card scams, where does the victim usually buy the cards, and what part of it does a bank teller see, if any?
> 3. Besides cash withdrawals and wire transfers, what other teller transactions are commonly used in scams where the victim is being coached by the scammer?
>
> Please search the web and give me a link for every claim, preferring the FTC, AARP, FBI/IC3, CFPB, or FinCEN. Quote the sentence from the source that supports each claim. If you can't find a source for something, say so instead of guessing.

## ChatGPT's answer

TODO: paste the full answer here. It was not included when this file was created.
