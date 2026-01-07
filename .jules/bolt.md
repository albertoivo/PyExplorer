## 2024-05-23 - Lazy Loading Pyodide
**Learning:** Large dependencies like Pyodide (20MB+) should never be loaded globally if they are only used in specific routes.
**Action:** Always check bundle size and network impact of large libraries. Move initialization to the components that need them or use lazy loading.
