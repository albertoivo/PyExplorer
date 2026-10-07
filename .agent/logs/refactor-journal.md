## 2025-05-18 — Refactored Markdown logic in ArticlePage

- **💡 What:** Extracted Markdown logic parsing out of `src/pages/ArticlePage.tsx` into a new utility file `src/utils/markdownParser.ts`. Fixed a bug where bold and italic tags were consuming format characters greedily causing parsing issues when multiple elements appear on the same line.
- **🎯 Why:** Code smell identified (SRP violation and logic coupling in page component). `ArticlePage.tsx` had custom markdown parsing logic that is better extracted to a pure function for testing and reuse. Additionally, the non-greedy matching fix required by memory could be easily added and verified.
- **📁 Files Changed:**
  - `src/pages/ArticlePage.tsx`: Removed `MarkdownContent` logic inside `escapeHtml` and inline logic; updated to use `parseMarkdown`.
  - `src/utils/markdownParser.ts`: New file containing `escapeHtml` and `parseMarkdown` with the greedy bug fix applied.
  - `src/utils/__tests__/markdownParser.test.ts`: Added unit tests for the newly extracted functions.
- **🧹 Architectural Gain:** SRP applied (logic separated from components into purely functional helpers). Testability greatly improved. Avoids polluting UI components with non-trivial text transformations.
- **🔬 Verification:** Confirmed that `tsc`, `npm test`, `npm run lint`, and `npm run build` pass smoothly.

## 2026-09-07 — Extracted calculateScore to pure function

- **💡 What:** Extracted the `calculateScore` business logic function out of `src/components/game/QuestionEngine.tsx` and moved it to the pure utility file `src/utils/progressLogic.ts`.
- **🎯 Why:** Code smell identified: Business rules embedded directly in UI components violating the Single Responsibility Principle.
- **📁 Files Changed:**
  - `src/components/game/QuestionEngine.tsx`: Removed `calculateScore` definition and imported it.
  - `src/utils/progressLogic.ts`: Added the `calculateScore` function and explicitly typed it with `QuestionDocument`.
- **🧹 Architectural Gain:** SRP applied (business logic decoupled from view layer); improved testability by moving logic to a pure function.
- **🔬 Verification:** Confirmed that `tsc`, `npm test`, `npm run lint`, and `npm run build` passed.

## 2024-05-24 — [Refactor `AuthContext.tsx` Hook Extraction]

- **💡 What:** Extracted inline `useEffect` logic responsible for redirect processing, state subscription, and domain redirects into specialized sub-hooks (`useAuthRedirect.ts`, `useAuthState.ts`, `useDomainRedirect.ts`) inside `src/hooks/auth/`.
- **🎯 Why:** `AuthContext.tsx` violated the Single Responsibility Principle by being a "God component" managing side-effects for redirects, URL enforcing, and database state updates alongside React state providing.
- **📁 Files Changed:**
  - `src/context/AuthContext.tsx`: Reduced in size; delegates logic to sub-hooks.
  - `src/hooks/auth/useAuthRedirect.ts`: Manages Google login redirects on mobile.
  - `src/hooks/auth/useAuthState.ts`: Subscribes to Firebase Auth changes and pulls user data from Firestore.
  - `src/hooks/auth/useDomainRedirect.ts`: Protects against users accessing the `.web.app` raw url instead of the real domain.
  - `src/hooks/auth/index.ts`: Exposes the new hooks.
- **🧹 Architectural Gain:** SRP — `AuthContext` now primarily provides state and acts as a central aggregator, while side effects are localized in specific domain hooks. Better composability.
- **🔬 Verification:** `npx tsc -b --noEmit`, `npm test`, `npm run lint`, and `npm run build` all passed.

## 2024-05-28 — [Extract calculateSagaStats from WorldMap.tsx]

- **💡 What:** Extracted the inline `calculateSagaStats` business logic for computing completed/unlocked worlds per saga from the 347 line `src/components/game/WorldMap.tsx` component into a pure TypeScript function in `src/utils/game/sagaLogic.ts`.
- **🎯 Why:** Code smell identified: The `WorldMap.tsx` component contained heavy inline business logic within a `useMemo` block iterating through `SAGAS` and `WORLDS` arrays to calculate percentages and unlocked status. This violated the Single Responsibility Principle and made the UI component harder to unit test.
- **📁 Files Changed:**
    - `src/utils/game/sagaLogic.ts` (created) — encapsulated the logic for calculating completion stats per saga.
    - `src/components/game/WorldMap.tsx` — updated to import and use the new pure function.
    - `src/firebase/__tests__/firebaseConfig.test.ts` — fixed brittle hardcoded test expecting exactly `pyexplorer-cd32d` that failed when running tests with `.env` mocks.
- **🧹 Architectural Gain:** SRP — The view component now delegates saga statistics calculation to a pure, testable function inside `src/utils/game/`.
- **🔬 Verification:** `tsc`, `npm test`, `npm run lint`, and `npm run build` all passed successfully.

## 2024-09-30 — Extracted QuestionEngine Logic to useQuestionEngine Hook

- **💡 What:** Extracted state, handlers, and side effects from `src/components/game/QuestionEngine.tsx` into a new custom hook `src/hooks/game/useQuestionEngine.ts`.
- **🎯 Why:** `QuestionEngine.tsx` was a "God component" of 326 lines handling complex local state, `localStorage` read/writes, score calculation, power-up application, sound effects, animations, and component rendering all at once.
- **📁 Files Changed:**
  - `src/components/game/QuestionEngine.tsx` (Reduced from 326 lines to 181 lines, now focuses only on mapping question types to UI components).
  - `src/hooks/game/useQuestionEngine.ts` (New file, encapsulates business logic).
- **🧹 Architectural Gain:**
  - **Single Responsibility Principle (SRP):** UI rendering is now decoupled from the complex question-handling business logic.
  - **Maintainability:** Easier to write isolated unit tests for the hook and the presentational logic in the future.
- **🔬 Verification:** Confirmed that `npx tsc -b --noEmit`, `npm test`, `npm run lint`, and `npm run build` all pass.
## 2025-02-04 — Extract Gamification Firebase Fallback Logic

- **💡 What:** Moved `saveGamificationWithFallback` and `isPermissionDeniedError` out of `src/hooks/gamification/useGamificationStore.ts` into `src/firebase/services/gamificationService.ts`. Re-exported the function in `src/firebase/firestore.ts`.
- **🎯 Why:** Code smell identified (Violated Single Responsibility Principle by mixing Firebase save logic and Firebase-specific error handling directly inside a React state hook).
- **📁 Files Changed:**
    - `src/firebase/services/gamificationService.ts`: Added fallback and error-handling functions, imported necessary utils.
    - `src/hooks/gamification/useGamificationStore.ts`: Removed Firebase logic, imported newly exposed fallback method from firestore module.
    - `src/firebase/firestore.ts`: Added export for `saveGamificationWithFallback` to match existing patterns.
    - `src/hooks/__tests__/useGamification.test.ts`: Updated tests to mock and expect calls to `saveGamificationWithFallback` instead of `saveGamificationData`.
- **🧹 Architectural Gain:** SRP — `useGamificationStore` is now more tightly focused on local state management and React lifecycles. Firebase interactions are strictly within the `src/firebase/` service layer.
- **🔬 Verification:** Confirmation that `npx tsc -b --noEmit`, `npm test`, and `npm run lint` all passed.

## 2024-10-05 — Extract Local Storage logic into `useLocalStorage` hook from `WorldMap` 🧹

- **💡 What:** Extract the `localStorage` access patterns inside `src/components/game/WorldMap.tsx` into a custom hook (`useLocalStorage`).
- **🎯 Why:** Code smell identified (DRY violations + Side Effect inside Component). The `WorldMap.tsx` accessed `localStorage` directly multiple times using `useState` and `useEffect` with `try/catch` wrappers. This mixed persistence logic directly within a UI component and duplicated code for each persistent state (`VIEWED_TUTORIALS_KEY` and `VIEWED_STORIES_KEY`).
- **📁 Files Changed:**
  - `src/hooks/useLocalStorage.ts` (New file for the hook)
  - `src/components/game/WorldMap.tsx` (Used the new hook and removed explicit `localStorage` handling)
- **🧹 Architectural Gain:**
  - Abstraction & Reusability: Extracted generic local storage logic into a reusable hook that guarantees type safety and handles parsing / error states centrally.
  - SRP (Single Responsibility Principle): The UI component `WorldMap` no longer owns the responsibility of safely interacting with the browser's `localStorage` API.
- **🔬 Verification:** `tsc`, `npm test`, `npm run lint`, and `npm run build` all passed successfully.
## 2025-03-05 — Refactoring `coreLogic.ts` into Single Responsibility files

- **💡 What:** Split `src/utils/gamification/coreLogic.ts` (400 lines) into `src/utils/gamification/initialState.ts` and `src/utils/gamification/questionLogic.ts`.
- **🎯 Why:** Code smell identified: `coreLogic.ts` violated SRP by handling basic gamification object initialization/parsing as well as complex logic rules like processing completed questions.
- **📁 Files Changed:**
  - `src/utils/gamification/coreLogic.ts` (deleted)
  - `src/utils/gamification/initialState.ts` (created)
  - `src/utils/gamification/questionLogic.ts` (created)
  - `src/utils/gamificationState.ts` (updated exports)
- **🧹 Architectural Gain:** Applied SRP (Single Responsibility Principle). Initial state setup and deep complex rules are now strictly separated by domain concerns.
- **🔬 Verification:** Confirmed that `tsc`, `npm test`, `npm run lint`, and `npm run build` all pass successfully.
