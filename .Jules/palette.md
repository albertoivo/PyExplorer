## 2024-05-23 - Ambiguous Label Text in Tests
**Learning:** Using `getByLabelText` can be ambiguous if an interactive element (like a toggle button) has an `aria-label` that partially matches the input's label text (e.g., "Senha" vs "Mostrar senha").
**Action:** Always specify `{ selector: 'input' }` when querying inputs by label text if there are related buttons nearby with similar ARIA labels.

## 2024-05-24 - Frictionless Guest Entry
**Learning:** Users in "Guest Mode" value speed over customization. Replacing a blocking `window.prompt` with auto-generated names removes a significant friction point and feels more "magical" and polished.
**Action:** When designing "try it out" or guest flows, prioritize immediate access (1-click) over configuration. Save customization for after the user is hooked.
