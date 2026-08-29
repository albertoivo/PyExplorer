## 2025-02-12 — Extract PWA Logic from useOffline hook

- **💡 What:** Extracted Progressive Web App (PWA) installation and update logic from the `useOffline` hook into a new dedicated `usePWA` hook.
- **🎯 Why:** The `useOffline` hook was managing two distinct domains: offline data caching/syncing and PWA installation/service worker updates. This violated the Single Responsibility Principle (SRP).
- **📁 Files Changed:**
  - `src/hooks/usePWA.ts` (new): Contains the extracted PWA logic.
  - `src/hooks/useOffline.ts`: Removed PWA logic.
  - `src/components/layout/OfflineIndicator.tsx`: Updated to consume both `useOffline` and `usePWA`.
  - `src/hooks/__tests__/usePWA.test.ts` (new): Contains PWA tests.
  - `src/hooks/__tests__/useOffline.test.ts`: Removed PWA tests.
- **🧹 Architectural Gain:** SRP — each hook now owns a single domain, making them easier to test, maintain, and reuse.
- **🔬 Verification:** Confirmed that `tsc`, `npm test`, `npm run lint`, and `npm run build` all passed successfully.
