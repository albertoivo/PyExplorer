## 2024-05-22 - Mascot Component Accessibility
**Learning:** Interactive elements implemented as `div`s with `onClick` handlers are inaccessible to keyboard users and screen readers.
**Action:** Always use `<button>` for clickable elements that are not links. Reset default browser styles (`background: none`, `border: none`, etc.) to maintain custom designs while gaining native accessibility features like focus management and keyboard support. Use `aria-label` to provide context if the button contains complex content.
