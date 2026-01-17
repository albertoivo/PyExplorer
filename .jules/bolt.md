## 2024-05-23 - Lazy Loading Pyodide
**Learning:** Large dependencies like Pyodide (20MB+) should never be loaded globally if they are only used in specific routes.
**Action:** Always check bundle size and network impact of large libraries. Move initialization to the components that need them or use lazy loading.

## 2026-01-16 - State Mutation in Render
**Learning:** Found `Array.prototype.sort()` usage inside the JSX render loop on a state variable (`worldQuestions`). Since `sort()` mutates in place, this was mutating the React state directly during render, which is a React anti-pattern and can cause unpredictable UI behavior and bugs.
**Action:** Always copy arrays before sorting in render (e.g., `[...arr].sort()`) or, better yet, use `useMemo` to compute the sorted list only when dependencies change.

## 2025-01-17 - O(N^2) Render Bottleneck in List Components
**Learning:** Frequent lookups in large lists (like `getQuestionProgress` inside a map of questions) caused O(N^2) complexity during render.
**Action:** Always pre-calculate lookups into a Map or Set (O(1)) using `useMemo` before iterating over lists for rendering.
