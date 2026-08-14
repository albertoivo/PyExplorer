## 2026-08-14 — Refactoring PyodideContext.tsx outputs and errors formats

- **💡 What:** Extracted `compareOutputs` and `formatPythonError` from `src/context/PyodideContext.tsx` into a new utility file `src/utils/pyodideLogic.ts`.
- **🎯 Why:** The PyodideContext file contained inline utility logic.
- **📁 Files Changed:**
  - `src/context/PyodideContext.tsx`: removed utility functions.
  - `src/utils/pyodideLogic.ts`: new file, added the `compareOutputs` and `formatPythonError` functions.
- **🧹 Architectural Gain:** Separates pure utility functions from React Context logic.
- **🔬 Verification:** Confirmed that tests passed and typing works properly.
