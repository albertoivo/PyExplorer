## 2024-08-26 — Extract Game State and Actions from GamePage

- **💡 What:** Extracted `useGameState` and `useGameActions` hooks from `GamePage.tsx`, reducing it from 437 to ~100 lines.
- **🎯 Why:** Code smell identified: `GamePage.tsx` was a god component mixing complex state management, event handling, and rendering. This violated the Single Responsibility Principle and made the component hard to read and maintain.
- **📁 Files Changed:**
  - `src/pages/GamePage.tsx`: Extracted logic to hooks and simplified the component to just handle rendering.
  - `src/hooks/game/useGameState.ts`: New file for game state management.
  - `src/hooks/game/useGameActions.ts`: New file for game action handlers.
- **🧹 Architectural Gain:** SRP — `GamePage` now only handles rendering, while `useGameState` manages state and `useGameActions` manages event handlers. This improves modularity and readability.
- **🔬 Verification:** `npm test`, `npx tsc -b --noEmit`, and `npm run lint` all passed.
## 2023-11-XX — Refactored useProgress Hook

- **💡 What:** Extracted `calculateAttemptResult`, `calculateProgressStats`, and `calculateWorldStats` functions out of `src/hooks/useProgress.ts` into a pure utility module `src/utils/progressLogic.ts`. Removed unused `ProgressStatus` type.
- **🎯 Why:** The `useProgress.ts` hook was violating the Single Responsibility Principle by mixing complex business logic for score, stars, attempt calculation, and stats calculation directly within a React hook. It also improved modularity and pure function testability.
- **📁 Files Changed:**
  - `src/hooks/useProgress.ts`: Refactored to import pure utility functions instead of performing all calculations inline. Removed unused imports.
  - `src/utils/progressLogic.ts`: New file housing pure functions for calculation logic extracted from the hook.
- **🧹 Architectural Gain:** Single Responsibility Principle — the custom hook now acts purely as a coordinator of React state and persistent storage (Firestore/LocalStorage), delegating domain logic to pure functions, which makes tests and reasoning about the hook easier.
- **🔬 Verification:** Successfully verified via `tsc -b --noEmit`, `npm test`, `npm run lint`, and `npm run build`.
