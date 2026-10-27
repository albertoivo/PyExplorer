## 2023-10-27 — Extracted useNetworkStatus from useOffline

- **💡 What:** Extracted the online/offline event listener and state management logic from `src/hooks/useOffline.ts` into a new, smaller, focused hook `src/hooks/useNetworkStatus.ts`.
- **🎯 Why:** `useOffline` was managing multiple concerns: network status listening, LocalStorage caching, data fetching, and queue-based syncing. By extracting `useNetworkStatus`, `useOffline` is now focused purely on the offline data strategy, while network listening logic is decoupled and reusable.
- **📁 Files Changed:**
  - `src/hooks/useNetworkStatus.ts` (created) - New hook encapsulating network status event listeners.
  - `src/hooks/useOffline.ts` (modified) - Removed `isOnline` from `OfflineState` object and imported `useNetworkStatus` to consume the value.
- **🧹 Architectural Gain:** Single Responsibility Principle (SRP). State logic is split by domain, separating environment polling from offline sync logic.
- **🔬 Verification:** Confirmed that `npx tsc -b --noEmit` and `npm test` successfully passed with 0 errors.
