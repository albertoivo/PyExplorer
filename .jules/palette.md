## 2024-05-22 - Mascot Component Accessibility
**Learning:** Interactive elements implemented as `div`s with `onClick` handlers are inaccessible to keyboard users and screen readers.
**Action:** Always use `<button>` for clickable elements that are not links. Reset default browser styles (`background: none`, `border: none`, etc.) to maintain custom designs while gaining native accessibility features like focus management and keyboard support. Use `aria-label` to provide context if the button contains complex content.

## 2024-05-24 - Complex Card Accessibility
**Learning:** Complex cards (like QuestionCard/WorldCard) wrapping multiple pieces of info (status, type, difficulty) inside a button create noisy screen reader experiences.
**Action:** Use a constructed `aria-label` on the parent button to summarize all critical info (Status, Type, Difficulty, Title) and apply `aria-hidden="true"` to all internal decorative children.
