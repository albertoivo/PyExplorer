## 2025-05-18 — Refactored Markdown logic in ArticlePage

- **💡 What:** Extracted Markdown logic parsing out of `src/pages/ArticlePage.tsx` into a new utility file `src/utils/markdownParser.ts`. Fixed a bug where bold and italic tags were consuming format characters greedily causing parsing issues when multiple elements appear on the same line.
- **🎯 Why:** Code smell identified (SRP violation and logic coupling in page component). `ArticlePage.tsx` had custom markdown parsing logic that is better extracted to a pure function for testing and reuse. Additionally, the non-greedy matching fix required by memory could be easily added and verified.
- **📁 Files Changed:**
  - `src/pages/ArticlePage.tsx`: Removed `MarkdownContent` logic inside `escapeHtml` and inline logic; updated to use `parseMarkdown`.
  - `src/utils/markdownParser.ts`: New file containing `escapeHtml` and `parseMarkdown` with the greedy bug fix applied.
  - `src/utils/__tests__/markdownParser.test.ts`: Added unit tests for the newly extracted functions.
- **🧹 Architectural Gain:** SRP applied (logic separated from components into purely functional helpers). Testability greatly improved. Avoids polluting UI components with non-trivial text transformations.
- **🔬 Verification:** Confirmed that `tsc`, `npm test`, `npm run lint`, and `npm run build` pass smoothly.
