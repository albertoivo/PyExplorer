
## 2025-01-14 - Modal Focus Management
**Learning:** `role="dialog"` requires robust focus management: initial focus on a primary interactive element, a focus trap to keep tabbing within the modal, and Escape key support.
**Action:** When implementing or fixing modals, always use `useEffect` to capture `keydown` events for Escape and Tab loops, and ensure initial focus is set via `useRef`.
