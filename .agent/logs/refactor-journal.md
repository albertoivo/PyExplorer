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
