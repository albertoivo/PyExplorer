## 2023-10-27 — Extracted useNetworkStatus from useOffline

- **💡 What:** Extracted the online/offline event listener and state management logic from `src/hooks/useOffline.ts` into a new, smaller, focused hook `src/hooks/useNetworkStatus.ts`.
- **🎯 Why:** `useOffline` was managing multiple concerns: network status listening, LocalStorage caching, data fetching, and queue-based syncing. By extracting `useNetworkStatus`, `useOffline` is now focused purely on the offline data strategy, while network listening logic is decoupled and reusable.
- **📁 Files Changed:**
  - `src/hooks/useNetworkStatus.ts` (created) - New hook encapsulating network status event listeners.
  - `src/hooks/useOffline.ts` (modified) - Removed `isOnline` from `OfflineState` object and imported `useNetworkStatus` to consume the value.
- **🧹 Architectural Gain:** Single Responsibility Principle (SRP). State logic is split by domain, separating environment polling from offline sync logic.
- **🔬 Verification:** Confirmed that `npx tsc -b --noEmit` and `npm test` successfully passed with 0 errors.
## 2024-10-30 — Refactoring `runPythonCode` in `src/utils/pyodide/runner.ts`

- **💡 What:** Extracted helper functions `evaluateFunctionTests` and `evaluateStdoutTests` from the massively monolithic `runPythonCode` function in `src/utils/pyodide/runner.ts`.
- **🎯 Why:** `runPythonCode` was over 200 lines long, violating the Single Responsibility Principle by orchestrating execution *and* performing complex stdout/function test validations within the same massive try-catch block.
- **📁 Files Changed:**
    - `src/utils/pyodide/runner.ts`: Split testing logic into dedicated private helper functions.
- **🧹 Architectural Gain:** SRP — `runPythonCode` now orchestrates execution and simply delegates validation to focused helper functions, increasing readability and testability.
- **🔬 Verification:** Confirmed that `npx tsc --noEmit` and `npm test` passed successfully.
## 2024-05-30 — Extracted Gamification Checks Logic to Pure Function

- **💡 What:** Extracted `runGamificationChecks` logic from `src/hooks/gamification/useGamificationStore.ts` into a new pure function `runPostLoadGamificationChecks` in `src/utils/gamification/loadLogic.ts`.
- **🎯 Why:** Code smell identified: The hook `useGamificationStore` contained inline business logic for evaluating achievements and missions on state changes, violating SRP. This makes it harder to test independently from React lifecycle.
- **📁 Files Changed:**
  - `src/utils/gamification/loadLogic.ts`: Created `runPostLoadGamificationChecks` pure function.
  - `src/hooks/gamification/useGamificationStore.ts`: Replaced inline logic with the pure function call and handled side-effects cleanly.
- **🧹 Architectural Gain:** SRP — `useGamificationStore` now focuses solely on state management and side effects, while domain rules for post-load logic reside in purely testable utility functions.
- **🔬 Verification:** Confirmed that `tsc -b --noEmit`, `npm test`, `npm run lint`, and `npm run build` all pass successfully.
