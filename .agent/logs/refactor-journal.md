## 2025-05-18 — Refactored Markdown logic in ArticlePage

- **💡 What:** Extracted Markdown logic parsing out of `src/pages/ArticlePage.tsx` into a new utility file `src/utils/markdownParser.ts`. Fixed a bug where bold and italic tags were consuming format characters greedily causing parsing issues when multiple elements appear on the same line.
- **🎯 Why:** Code smell identified (SRP violation and logic coupling in page component). `ArticlePage.tsx` had custom markdown parsing logic that is better extracted to a pure function for testing and reuse. Additionally, the non-greedy matching fix required by memory could be easily added and verified.
- **📁 Files Changed:**
  - `src/pages/ArticlePage.tsx`: Removed `MarkdownContent` logic inside `escapeHtml` and inline logic; updated to use `parseMarkdown`.
  - `src/utils/markdownParser.ts`: New file containing `escapeHtml` and `parseMarkdown` with the greedy bug fix applied.
  - `src/utils/__tests__/markdownParser.test.ts`: Added unit tests for the newly extracted functions.
- **🧹 Architectural Gain:** SRP applied (logic separated from components into purely functional helpers). Testability greatly improved. Avoids polluting UI components with non-trivial text transformations.
- **🔬 Verification:** Confirmed that `tsc`, `npm test`, `npm run lint`, and `npm run build` pass smoothly.
\n## 2026-09-07 — Extracted calculateScore to pure function\n\n- **💡 What:** Extracted the `calculateScore` business logic function out of `src/components/game/QuestionEngine.tsx` and moved it to the pure utility file `src/utils/progressLogic.ts`.\n- **🎯 Why:** Code smell identified: Business rules embedded directly in UI components violating the Single Responsibility Principle.\n- **📁 Files Changed:**\n  - `src/components/game/QuestionEngine.tsx`: Removed `calculateScore` definition and imported it.\n  - `src/utils/progressLogic.ts`: Added the `calculateScore` function and explicitly typed it with `QuestionDocument`.\n- **🧹 Architectural Gain:** SRP applied (business logic decoupled from view layer); improved testability by moving logic to a pure function.\n- **🔬 Verification:** Confirmed that `tsc`, `npm test`, `npm run lint`, and `npm run build` passed.
## 2024-05-24 — [Refactor `AuthContext.tsx` Hook Extraction]

- **💡 What:** Extracted inline `useEffect` logic responsible for redirect processing, state subscription, and domain redirects into specialized sub-hooks (`useAuthRedirect.ts`, `useAuthState.ts`, `useDomainRedirect.ts`) inside `src/hooks/auth/`.
- **🎯 Why:** `AuthContext.tsx` violated the Single Responsibility Principle by being a "God component" managing side-effects for redirects, URL enforcing, and database state updates alongside React state providing.
- **📁 Files Changed:**
  - `src/context/AuthContext.tsx`: Reduced in size; delegates logic to sub-hooks.
  - `src/hooks/auth/useAuthRedirect.ts`: Manages Google login redirects on mobile.
  - `src/hooks/auth/useAuthState.ts`: Subscribes to Firebase Auth changes and pulls user data from Firestore.
  - `src/hooks/auth/useDomainRedirect.ts`: Protects against users accessing the `.web.app` raw url instead of the real domain.
  - `src/hooks/auth/index.ts`: Exposes the new hooks.
- **🧹 Architectural Gain:** SRP — `AuthContext` now primarily provides state and acts as a central aggregator, while side effects are localized in specific domain hooks. Better composability.
- **🔬 Verification:** `npx tsc -b --noEmit`, `npm test`, `npm run lint`, and `npm run build` all passed.
