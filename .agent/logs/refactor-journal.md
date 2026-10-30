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
