## 2024-05-23 - Ambiguous Label Text in Tests
**Learning:** Using `getByLabelText` can be ambiguous if an interactive element (like a toggle button) has an `aria-label` that partially matches the input's label text (e.g., "Senha" vs "Mostrar senha").
**Action:** Always specify `{ selector: 'input' }` when querying inputs by label text if there are related buttons nearby with similar ARIA labels.
