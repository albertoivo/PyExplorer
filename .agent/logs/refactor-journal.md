## 2024-05-28 — [Extract calculateSagaStats from WorldMap.tsx]

- **💡 What:** Extracted the inline `calculateSagaStats` business logic for computing completed/unlocked worlds per saga from the 347 line `src/components/game/WorldMap.tsx` component into a pure TypeScript function in `src/utils/game/sagaLogic.ts`.
- **🎯 Why:** Code smell identified: The `WorldMap.tsx` component contained heavy inline business logic within a `useMemo` block iterating through `SAGAS` and `WORLDS` arrays to calculate percentages and unlocked status. This violated the Single Responsibility Principle and made the UI component harder to unit test.
- **📁 Files Changed:**
    - `src/utils/game/sagaLogic.ts` (created) — encapsulated the logic for calculating completion stats per saga.
    - `src/components/game/WorldMap.tsx` — updated to import and use the new pure function.
    - `src/firebase/__tests__/firebaseConfig.test.ts` — fixed brittle hardcoded test expecting exactly `pyexplorer-cd32d` that failed when running tests with `.env` mocks.
- **🧹 Architectural Gain:** SRP — The view component now delegates saga statistics calculation to a pure, testable function inside `src/utils/game/`.
- **🔬 Verification:** `tsc`, `npm test`, `npm run lint`, and `npm run build` all passed successfully.
