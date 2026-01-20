## 2024-05-22 - Mascot Component Accessibility
**Learning:** Interactive elements implemented as `div`s with `onClick` handlers are inaccessible to keyboard users and screen readers.
**Action:** Always use `<button>` for clickable elements that are not links. Reset default browser styles (`background: none`, `border: none`, etc.) to maintain custom designs while gaining native accessibility features like focus management and keyboard support. Use `aria-label` to provide context if the button contains complex content.

## 2025-01-14 - Modal Focus Management
**Learning:** `role="dialog"` requires robust focus management: initial focus on a primary interactive element, a focus trap to keep tabbing within the modal, and Escape key support.
**Action:** When implementing or fixing modals, always use `useEffect` to capture `keydown` events for Escape and Tab loops, and ensure initial focus is set via `useRef`.

## 2025-01-26 - Decorative Icons in Pseudo-elements
**Learning:** Icons implemented via CSS `content: attr(data-icon)` in pseudo-elements (like `::before`) are inconsistent across screen readers—some ignore them, some read the text content without context, and others treat them as images without alt text.
**Action:** Render decorative icons as explicit DOM elements (e.g., `<span aria-hidden="true">`) when the icon is purely visual or when the surrounding text already provides the meaning. This ensures consistent "ignoring" by assistive technology while maintaining the visual design.
