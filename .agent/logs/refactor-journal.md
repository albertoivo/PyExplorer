## 2024-05-18 — Refactored `src/firebase/firestore.ts` God File into Services

- **💡 What:** Split the oversized `src/firebase/firestore.ts` (660 lines) into domain-specific service files (`usersService.ts`, `progressService.ts`, `gamificationService.ts`, and `leaderboardService.ts`). Re-exported all the functions from the original file to maintain backward compatibility.
- **🎯 Why:** The `firestore.ts` file handled five different distinct domains (Users, Gamification, Progress, Leaderboard, Questions), violating the Single Responsibility Principle and forming a God File. Extracting them improves code readability, testability, and modularity.
- **📁 Files Changed:**
  - `src/firebase/firestore.ts`: Removed all code except question-related logic; added re-exports for the extracted functions.
  - `src/firebase/services/usersService.ts`: New file managing user documents and state in Firestore.
  - `src/firebase/services/progressService.ts`: New file handling the `userProgress` collection.
  - `src/firebase/services/gamificationService.ts`: New file managing the `gamification` collection.
  - `src/firebase/services/leaderboardService.ts`: New file for the `leaderboard` collection and ranking logic.
- **🧹 Architectural Gain:** SRP — each module inside the `src/firebase/services/` layer now focuses on a single domain. The `firestore.ts` now delegates its work efficiently.
- **🔬 Verification:** Confirmed that `tsc`, `npm run lint`, `npm test`, and `npm run build` all pass with no errors.
