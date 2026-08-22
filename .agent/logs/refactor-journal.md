## 2026-08-22 - Extract domain logic from useGamification god-hook

- **💡 What:** Extracted domain sub-hooks from `useGamification.ts`, creating `useGamificationStore`, `useGamificationShop`, `useGamificationPet`, `useGamificationMissions`, and `useGamificationCore`.
- **🎯 Why:** Code smell identified: Single god-hook managing achievements, XP, streaks, missions, load/save logic, shop, and level-ups violated SRP.
- **📁 Files Changed:**
  - `src/hooks/useGamification.ts`: Removed domain logic and delegated to sub-hooks.
  - `src/hooks/gamification/useGamificationStore.ts`: New hook for load, save, sync, migration, and gamification validation check logic.
  - `src/hooks/gamification/useGamificationShop.ts`: New hook for items, shop, power-ups.
  - `src/hooks/gamification/useGamificationPet.ts`: New hook for pet actions.
  - `src/hooks/gamification/useGamificationMissions.ts`: New hook for claiming rewards and missions.
  - `src/hooks/gamification/useGamificationCore.ts`: New hook for completing questions, achievements, and level-ups.
- **🧹 Architectural Gain:** SRP — each hook now owns a single domain in the gamification system.
- **🔬 Verification:** Confirmation that `tsc`, `npm test`, `npm run lint`, and `npm run build` all passed.
