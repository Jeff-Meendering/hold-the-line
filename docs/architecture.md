# Hold the Line: architecture

Version 1, Fri Nov 27, 2026. Built on [requirements.md](requirements.md) version 3. This document covers the system architecture, the folder layout, what each module is responsible for, and the technical decisions. The game flow and the data schema are in [design.md](design.md). Security is in `security.md`, written in the next step.

Nothing is implemented yet. This is what the code will be checked against, and it is brought in line with what was built on Dec 5.

## 1. System overview

Hold the Line is a static single-page app. All customer content is compiled into the bundle, so after the page loads the game makes no network requests (NFR-1). There is no server, no account, and nothing stored except the best score (NFR-2).

The code is in three layers, and dependencies only point one way. All three are compiled into one static bundle that runs in the browser. Vitest runs the game logic and the content checks outside the browser.

```mermaid
flowchart TB
    player(["Player"])
    storage[("localStorage:<br/>best score only")]

    subgraph ui["React layer: src/App.tsx and src/ui/"]
        app["App<br/>holds the state, draws the day,<br/>picks the screen"]
        screens["StartScreen, CustomerScreen,<br/>DebriefScreen"]
        app --> screens
    end

    subgraph data["Content: src/data/, typed data"]
        content["customers, questions, labels"]
    end

    subgraph game["Game logic: src/game/, pure TypeScript"]
        logic["reducer, draw,<br/>scoring, debrief"]
        types["types"]
        validate["validate"]
    end

    tests["Vitest: npm test"]

    player -->|"clicks and key presses"| ui
    ui -.->|"best score, if time allows"| storage
    ui -->|"reads"| content
    ui -->|"calls"| logic
    content -.->|"typed by"| types
    tests -->|"unit tests"| logic
    tests -->|"run on the real content"| validate
```

The rules the diagram shows:

1. `src/game/` imports nothing from React, the DOM, `src/ui/`, or `src/data/`. It is plain TypeScript that runs the same in a browser and in a test (NFR-8).
2. `src/data/` imports only types from `src/game/types.ts`. It contains text and numbers, no logic.
3. `src/ui/` and `App.tsx` are the only code that touches React, the DOM, `Math.random`, or `localStorage`. Components render state and dispatch actions. They do not score, draw, or decide what a flag's label is.

A game rule can then be tested without rendering anything, and a content change cannot break a rule without `npm test` saying so.

## 2. Build and delivery

```mermaid
flowchart LR
    push["Push to main"]

    subgraph wf["GitHub Actions: one workflow"]
        subgraph job1["Job 1: build"]
            test["npm test<br/>unit tests and<br/>data validation"]
            build["npm run build<br/>type-check,<br/>then vite build"]
            test -->|"pass"| build
        end
        deploy["Job 2: deploy<br/>needs job 1"]
        build -->|"pass, dist/ uploaded"| deploy
    end

    stop["Workflow stops,<br/>live site unchanged"]
    pages["GitHub Pages:<br/>static files"]
    browser["Player's browser"]

    push --> test
    test -.->|"fail"| stop
    build -.->|"fail"| stop
    deploy --> pages
    pages --> browser
```

- `npm test` is `vitest run`. It runs the unit tests and the data validation test (FR-15).
- `npm run build` is `tsc -b && vite build`, so a type error also stops a deploy.
- The deploy job has `needs:` on the build job and runs only on `main`. A failing test or build means it never starts (FR-16, AC-8.2).
- Vite's `base` is `/hold-the-line/`, because the site is served from `https://jeff-meendering.github.io/hold-the-line/` (plan risk 8).
- The workflow's permissions and action versions are specified in `security.md`.

## 3. Folder layout

```text
hold-the-line/
├── index.html
├── package.json
├── vite.config.ts            Vite and Vitest settings, base path
├── tsconfig.json             strict mode
├── CLAUDE.md                 instructions for the coding agent
├── .github/workflows/
│   └── deploy.yml            test, build, deploy
├── docs/
├── screenshots/
└── src/
    ├── main.tsx              mounts <App />
    ├── App.tsx               state, day draw, screen switch
    ├── styles.css
    ├── game/                 pure TypeScript, no React or DOM
    │   ├── types.ts
    │   ├── rng.ts
    │   ├── draw.ts           + draw.test.ts
    │   ├── reducer.ts        + reducer.test.ts
    │   ├── scoring.ts        + scoring.test.ts
    │   ├── debrief.ts        + debrief.test.ts
    │   └── validate.ts       + validate.test.ts
    ├── data/                 content only
    │   ├── questions.ts
    │   ├── labels.ts
    │   ├── customers.ts
    │   └── data.test.ts
    └── ui/                   React components
        ├── StartScreen.tsx
        ├── CustomerScreen.tsx
        ├── DebriefScreen.tsx
        └── bestScore.ts      should: FR-17
```

The three screens may be split into smaller components once the wireframes exist. Any such component goes in `src/ui/`.

## 4. Module responsibilities

The types named here are defined in [design.md](design.md).

**`src/game/`: pure logic**

| Module | Responsibility | Main export | Covers |
|---|---|---|---|
| `types.ts` | The schema: customers, slips, red flags, game state, actions, and the lists of valid ids | Types and `as const` id lists | FR-11, FR-12 |
| `rng.ts` | A seeded random source for tests, about 10 lines | `mulberry32(seed): () => number` | AC-5.3 |
| `draw.ts` | The day draw, rules 1 to 7 in requirements section 6. Takes its random source as a parameter | `drawDay(pool, rng): Customer[]` | AC-5.1 to 5.3, NFR-8 |
| `reducer.ts` | Every state change: start a day, ask a question, decide. Enforces the limit of 3 questions and no repeats. Ignores an action that is not allowed | `gameReducer(state, action): GameState` | FR-2, FR-4 to FR-6, FR-10 |
| `scoring.ts` | The scoring table and the floor at 0 | `scoreDay(day, results): number` | Requirements section 5, AC-6.1 |
| `debrief.ts` | Builds the debrief rows: the call, the truth, right or wrong, and each flag's status of *shown*, *you asked*, or *you didn't ask* | `buildDebrief(day, results): DebriefRow[]` | FR-8, FR-9, AC-6.2, AC-6.3 |
| `validate.ts` | Checks content against the rules in design.md section 2.5 and returns one message per broken rule, each starting with the customer id or question id | `validateData(data): string[]` | FR-15, AC-8.1, AC-8.3 |

**`src/data/`: content**

| Module | Responsibility | Covers |
|---|---|---|
| `questions.ts` | The wording of the 8 bank questions and the set of 5 for each transaction type | FR-18 |
| `labels.ts` | Display text for each red flag id, scam type, and transaction type | FR-9 |
| `customers.ts` | The pool of 10 customers, in one file so it can be pasted whole into a review | FR-11 to FR-14 |
| `data.test.ts` | Runs `validateData` on the real content and expects no messages | FR-15 |

**`src/` and `src/ui/`: React**

| Module | Responsibility | Covers |
|---|---|---|
| `main.tsx` | Mounts `App` and loads `styles.css` | |
| `App.tsx` | Holds the game state with `useReducer(gameReducer)`. On Start and Play again it calls `drawDay(customers, Math.random)` and dispatches the result. Renders the screen that matches `state.phase` | FR-2, FR-10 |
| `StartScreen.tsx` | Title, how-to-play text, Start button, best score | FR-1, FR-17 |
| `CustomerScreen.tsx` | Slip, behaviour text, question list, answers, Process and Hold. Receives a `CustomerView`, which has no truth, flags, or explanation | FR-3 to FR-7 |
| `DebriefScreen.tsx` | Calls `scoreDay` and `buildDebrief` and renders the result. Play again button | FR-8 to FR-10 |
| `bestScore.ts` | Reads and writes one number in `localStorage`, inside `try`/`catch`, so the game works without storage | FR-17, NFR-2 |

## 5. Dependencies

| Package | Kind | Why it is there |
|---|---|---|
| `react`, `react-dom` | Runtime | The UI |
| `vite`, `@vitejs/plugin-react` | Dev | Dev server and build. The plugin is what lets Vite compile React |
| `typescript`, `@types/react`, `@types/react-dom` | Dev | The compiler and React's type definitions |
| `vitest` | Dev | Test runner |

These eight packages are what React, Vite, TypeScript, and Vitest need to work together. Nothing else is added. Versions are whatever is stable when the app is scaffolded on Nov 29, and `package-lock.json` pins them. React is the only code of any size in the bundle. NFR-7's 200 kB limit is checked against the first build's output, not estimated here.

## 6. Technical decisions

| # | Decision | Considered | Why |
|---|---|---|---|
| T1 | Game state is one `useReducer` in `App`, with the reducer in `src/game/reducer.ts` | `useState` in each screen; Zustand or Redux; XState | NFR-8 asks for game state as a pure function, and a reducer is one. It is built into React, and `reducer.test.ts` can play a whole day with no browser. A store library solves sharing state across a large component tree, and this app has three screens under one parent. XState would give a formal state machine for a game that has three states. |
| T2 | The screen is chosen by `state.phase`. No router | React Router; hash routes | The game has no URLs to share. A reload must return to the start screen (FR-10, D8), and with a router each screen would have a URL that a reload has to redirect away from. Client-side routes also need a 404 workaround on GitHub Pages. |
| T3 | Randomness comes in at the edge. `drawDay(pool, rng)` takes the random source; `App` passes `Math.random` and dispatches the drawn day; tests pass `mulberry32(seed)` | Drawing inside the reducer; a seed carried in the action; the `seedrandom` package; mocking `Math.random` in tests | A reducer that calls `Math.random` is not pure, and React's strict mode runs reducers twice in development to catch exactly that. A seed in the action would be pure, but the reducer would then need the customer pool and the random generator for no gain. `mulberry32` is about 10 lines, so a package is not worth a dependency. Passing the source as a parameter is what NFR-8 asks for, and it makes AC-5.1 to AC-5.3 plain unit tests. |
| T4 | Content is TypeScript modules imported into the bundle | JSON files fetched at runtime; JSON checked by a schema library such as Zod | A `.ts` file gets editor and compiler checking against the schema for free. It is bundled, so there is no extra request (NFR-1) and no loading or error state to build. A schema library would be a runtime dependency that checks things `validateData` has to check anyway, such as the cross-customer rules in FR-13 and FR-14. |
| T5 | Content rules are checked by a pure function, `validateData`, that returns a list of messages. One test runs it on the real content, and another feeds it broken content | Assertions written directly in a test; relying on the types alone | Returning messages lets one run report every problem and makes AC-8.1 testable: break a copy of a customer and expect a message with its id. The types cannot do it alone. Vitest strips types without checking them, so `npm test` would pass on a customer with a missing field, and no type can express "at least 3 legit customers have a look-alike trait". `validateData` therefore checks its input at runtime, even though it is typed. |
| T6 | Hidden information is kept hidden by the structure. `CustomerScreen` takes a `CustomerView` type without the truth, flags, or explanation. The score and flag statuses are computed only by `DebriefScreen` and are never in the state | A convention in `CLAUDE.md` only; separate public and secret data files | FR-7 is the rule a small UI change is most likely to break. With the narrower type, reading `customer.truth` in the customer screen is a compile error. With the score computed only at the debrief, there is no score in memory to show early by accident. Splitting the files would make each customer harder to write and review. The truth is still in the JavaScript a player downloads, which `security.md` records as accepted. |
| T7 | One plain CSS file, with custom properties for colours and spacing | CSS Modules; Tailwind; a component library | Three screens do not have a class-name collision problem. No build setup, nothing to learn, and nothing added to the bundle. The plan rules out custom art and makes polish a "should". |
| T8 | Tests run in Vitest's default Node environment and cover `src/game/` and `src/data/` only | Adding `jsdom` and React Testing Library for component tests | See D16. Every rule is in a pure function, so the components are thin, and the acceptance criteria about what is on screen are in the manual test plan. |
| T9 | One workflow with two jobs, using GitHub's own Pages actions | The `gh-pages` npm package pushing to a branch; a single job; separate test and deploy workflows | FR-16 asks for one workflow. Two jobs make AC-8.2 visible in the Actions tab: when a test fails, the deploy job shows as skipped. The official actions deploy an uploaded artifact and need no write access to the repository's contents. |
| T10 | npm, strict TypeScript, and no linter or formatter | ESLint with the React plugins, as in Vite's template; Prettier | See D17. `tsc` in strict mode runs in the build and is the static check. |
| T11 | The best score is read and written by `bestScore.ts`, called from the components, never from the reducer | Storing it in the game state; a persistence library | Storage is a side effect, and the reducer has to stay pure. It is one number, so two functions with a `try`/`catch` are enough (FR-17). |

## 7. Decisions for Jeff

The numbering continues from [requirements.md section 8](requirements.md#8-decisions). D14 and D15 are about the schema and are in [design.md section 6](design.md#6-decisions-for-jeff).

| # | Decision | Recommendation | Why | Status |
|---|---|---|---|---|
| D16 | Component tests | None. Do not add `jsdom` or React Testing Library | The plan's cut order treats component tests as planned but cuttable (item 5). They need two or three more dev dependencies and a test environment to set up, out of 6.5 hours of coding. The logic they would exercise is already unit-tested in `src/game/`, and what is left is whether the right text is on screen, which the manual test plan checks against each acceptance criterion. If you want one, the cheapest useful test is a single run through a scripted day that asserts nothing about correctness appears before the debrief (FR-7). | Recommended |
| D17 | Linter and formatter | Leave both out | Vite's React template comes with ESLint and about six dev dependencies. Strict `tsc` already stops a build on type errors, and each extra package is something `security.md` has to account for. The cost is that nothing checks React's hook rules, which matters little with one `useReducer` and no effects beyond the best score. | Recommended |
