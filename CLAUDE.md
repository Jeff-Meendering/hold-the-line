# Hold the Line: instructions for the coding agent

Hold the Line is a static browser game. The player is a bank teller who decides whether each customer's transaction is a scam. It is built with Vite, React, TypeScript, and Vitest, and served from GitHub Pages. There is no backend.

You are the implementer. The documents in `docs/` are the specification and Jeff is the engineer of record. This file gives the rules and says where to look. It does not repeat the documents, so read the ones your step touches before you write anything.

| Read | For |
|---|---|
| `docs/requirements.md` | What to build: the FR, NFR, and AC ids. Scoring is section 5 and the day draw is section 6 |
| `docs/architecture.md` | The layers, the folder layout, what each module does, and the eight packages |
| `docs/design.md` | The types to copy (sections 1.1, 1.4, 2.1 to 2.3), the transitions (1.2), the content rules (2.4), the validation rules (2.6), and the UI plan and wireframes (3 and 4) |
| `docs/security.md` | SEC-1 to SEC-21, including the workflow's permissions and pinned actions |
| `docs/test-plan.md` | Which tests to write and what each must cover (sections 2 and 3) |
| `docs/plan.md` | Who does what (section 5) and how a step runs (section 6) |

Anything a document marks **Proposed** or **Recommended** is not approved. Do not build it until its status says it is.

## Commands

These exist once the app is scaffolded.

```sh
npm ci           # install exactly what package-lock.json says
npm run dev      # dev server, at /hold-the-line/
npm test         # vitest run: the unit tests and the data validation test
npm run build    # tsc -b && vite build: the type check, then the bundle
npm run preview  # serve the built site locally
```

`npm test` does not check types, and `npm run build` does not run tests. Run both.

## Layer rules

The full version is in `docs/architecture.md` section 1.

1. `src/game/` is pure TypeScript. It imports nothing from React, the DOM, `src/ui/`, or `src/data/`, and uses no `Math.random`, timer, or storage. Randomness comes in as a parameter.
2. `src/data/` is content only: text and numbers, with `import type` from `src/game/types.ts` and no logic.
3. `src/ui/` and `src/App.tsx` are the only code that touches React, the DOM, `Math.random`, or `localStorage`. Components render state and dispatch actions. They do not score, draw, or work out a flag's status. If a component needs a rule, the rule goes in `src/game/` with a test.

## Never

1. **Never show anything about correctness before the debrief** (FR-7, SEC-18). No truth, red flag, scam type, explanation, score, or hint, whether in text, colour, a class name, an attribute, the tab title, or the console. `CustomerScreen` is given a `CustomerView` and nothing more.
2. **Never add, remove, or swap a dependency without asking first** (SEC-1). The eight packages are in `docs/architecture.md` section 5. If you think you need a ninth, stop and say why.
3. **Never render customer text as HTML** (NFR-9, SEC-10). Text goes in as React children. No `dangerouslySetInnerHTML`, `innerHTML`, or Markdown renderer, anywhere.

Also never:

- Make a network request from the app, or load anything from another origin (NFR-1).
- Push to `main`, merge a pull request, or change a repository setting. Jeff does those.
- Change, skip, or delete a test to make it pass. Fix the code, or stop and ask.
- Write a URL, a commit SHA, a version number, or a quotation from memory. Look it up and say how you checked.
- Install a tool or download an image on this machine without asking. If `node -v` fails, stop and say so.
- Write or rewrite the ten customers unless the step asks for it. The example in `docs/design.md` is not one of them.

## How to work

1. A step is one prompt from Jeff. Do what it asks and no more. Ideas for anything else go in your reply, not in the code.
2. Run `git fetch` and start a new branch from `origin/main`. End the step with a pull request into `main`, and leave it open.
3. Make small commits, each one a change you can describe in a line, and name the ids it covers: "Add scoreDay (AC-6.1, NFR-8)".
4. Before you say a step is done, run `npm test` and `npm run build` and paste what they printed. If either failed, or you could not run it, say that first.
5. Say what you did not check. You cannot see the browser, so layout, focus, and colour are unverified until Jeff runs the manual tests.
6. Add an entry to `docs/ai-log.md` in the same pull request, in the format of the entries already there: the prompt word for word, the result with its commits, what worked, and what you got wrong, stated plainly. Leave `TODO` for the screenshot names and for Jeff's own view. Never reconstruct a prompt you were not given.
7. Gemini and the planning chat review your work. Do not call it reviewed or verified yourself.

## When the docs and the code disagree

Stop and ask Jeff. Do not pick one yourself, and do not edit a document to match the code. The same goes for two documents that disagree, a requirement that cannot be met as written, and a rule in this file that blocks the step. Say what you found, where it is (file and section), and what the options are. Carry on with whatever the question does not affect.
