## 2024-05-23 - Lazy Loading Pyodide
**Learning:** Large dependencies like Pyodide (20MB+) should never be loaded globally if they are only used in specific routes.
**Action:** Always check bundle size and network impact of large libraries. Move initialization to the components that need them or use lazy loading.

## 2026-01-16 - State Mutation in Render
**Learning:** Found `Array.prototype.sort()` usage inside the JSX render loop on a state variable (`worldQuestions`). Since `sort()` mutates in place, this was mutating the React state directly during render, which is a React anti-pattern and can cause unpredictable UI behavior and bugs.
**Action:** Always copy arrays before sorting in render (e.g., `[...arr].sort()`) or, better yet, use `useMemo` to compute the sorted list only when dependencies change.

## 2025-01-17 - O(N^2) Render Bottleneck in List Components
**Learning:** Frequent lookups in large lists (like `getQuestionProgress` inside a map of questions) caused O(N^2) complexity during render.
**Action:** Always pre-calculate lookups into a Map or Set (O(1)) using `useMemo` before iterating over lists for rendering.

## 2026-01-20 - Lazy Initialization of Expensive State
**Learning:** Initializing React state with synchronous I/O (like `localStorage.getItem` and `JSON.parse`) inside the render loop causes performance degradation on every re-render.
**Action:** Always use lazy initialization `useState(() => expensiveComputation())` for state that depends on expensive synchronous operations.

## 2025-01-22 - Interval Thrashing and Heavy Children
**Learning:** Components with active timers (like `setInterval`) force re-renders every tick. If these components render heavy children (like `MonacoEditor`) and pass new object references (props) on every render, it causes massive unnecessary work (diffing/updating heavy components).
**Action:** Isolate timers in separate components if possible, or strictly memoize all props (especially objects and functions) passed to heavy children in timer-driven components.

## 2025-01-28 - Memoizing Heavy Component Wrappers
**Learning:** Even thin wrappers around heavy components (like Monaco Editor or Canvas) can cause performance issues if not memoized. Frequent parent re-renders (e.g., from Context updates like Pyodide loading progress) cause the wrapper to re-execute and re-diff, even if props haven't changed.
**Action:** Always wrap components hosting heavy third-party libs or canvas elements in `React.memo` to isolate them from parent render noise.
