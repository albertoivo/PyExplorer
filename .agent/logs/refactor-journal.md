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

## 2026-08-25 - Extract specific auth hooks from AuthContext

- **💡 What:** Extracted specific flows for `useGoogleAuth`, `useGuestAuth`, and `useEmailAuth` to handle authentication flows individually.
- **🎯 Why:** Code smell identified: Large god Context file `AuthContext.tsx` managed everything about authentication, guest access, and user progress sync.
- **📁 Files Changed:**
  - `src/context/AuthContext.tsx`: Simplified by delegating logic to custom hooks.
  - `src/utils/auth/authUtils.ts`: Added helper functions for handling auth.
  - `src/hooks/auth/useGoogleAuth.ts`: Added to handle Google authentication flows.
  - `src/hooks/auth/useGuestAuth.ts`: Added to handle guest user flow.
  - `src/hooks/auth/useEmailAuth.ts`: Added to handle email-based authentication flows.
- **🧹 Architectural Gain:** SRP — each custom hook manages a very specific type of authentication flow, simplifying the core `AuthContext.tsx`.
- **🔬 Verification:** Verified `tsc`, `npm test`, `npm run lint`, and `npm run build` all pass.
