## 2026-01-15 - Custom Markdown Parsers XSS Risk
**Vulnerability:** The custom regex-based markdown parser in `ArticlePage.tsx` was vulnerable to XSS because it used `dangerouslySetInnerHTML` with `[\s\S]*?` regexes that allowed breaking out of HTML tags (e.g., `</pre><script>`).
**Learning:** This codebase uses manual regex replacement for Markdown instead of a library. These custom parsers are brittle and default to insecure behavior if not explicitly sanitized.
**Prevention:** Always sanitize input (escape HTML entities) *before* applying custom markdown regex transformations, or switch to a secure library like `dompurify` + `react-markdown`.

## 2026-01-18 - Firestore IDOR Vulnerability in User Progress
**Vulnerability:** Users could overwrite any `userProgress` document (e.g., another user's progress) by simply including their own `uid` in the payload, as the security rule only checked the payload `uid` against `auth.uid` but ignored the document ID.
**Learning:** Checking `request.resource.data.uid == request.auth.uid` is insufficient if the document ID itself targets another user's resource.
**Prevention:** Always enforce that the Document ID matches the User ID (or a deterministic derivation) in `allow write` rules when the collection is keyed by user-specific identifiers.

## 2026-01-22 - Missing Validation for Allowlisted Fields
**Vulnerability:** The `bestTimeSeconds` field in `userProgress` was allowlisted via `hasOnly` but lacked specific validation logic, allowing invalid types or values (e.g., negative numbers, strings) to be written.
**Learning:** Using `hasOnly` creates a false sense of security; it only restricts *which* fields exist, not *what* they contain.
**Prevention:** Every field present in a `hasOnly` list must have a corresponding validation check (e.g., `isValidNumber`, `isValidString`) in the rule condition.
