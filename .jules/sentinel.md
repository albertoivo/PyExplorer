## 2026-01-15 - Custom Markdown Parsers XSS Risk
**Vulnerability:** The custom regex-based markdown parser in `ArticlePage.tsx` was vulnerable to XSS because it used `dangerouslySetInnerHTML` with `[\s\S]*?` regexes that allowed breaking out of HTML tags (e.g., `</pre><script>`).
**Learning:** This codebase uses manual regex replacement for Markdown instead of a library. These custom parsers are brittle and default to insecure behavior if not explicitly sanitized.
**Prevention:** Always sanitize input (escape HTML entities) *before* applying custom markdown regex transformations, or switch to a secure library like `dompurify` + `react-markdown`.

## 2026-01-18 - Firestore IDOR Vulnerability in User Progress
**Vulnerability:** Users could overwrite any `userProgress` document (e.g., another user's progress) by simply including their own `uid` in the payload, as the security rule only checked the payload `uid` against `auth.uid` but ignored the document ID.
**Learning:** Checking `request.resource.data.uid == request.auth.uid` is insufficient if the document ID itself targets another user's resource.
**Prevention:** Always enforce that the Document ID matches the User ID (or a deterministic derivation) in `allow write` rules when the collection is keyed by user-specific identifiers.

## 2026-01-26 - Hardcoded Admin Email
**Vulnerability:** The admin email address was hardcoded in multiple files (`ProfilePage.tsx`, `DataSeeder.tsx`), exposing privileged account information in the source code.
**Learning:** Hardcoding sensitive identifiers (like admin emails) in the frontend code makes them visible to anyone inspecting the bundle, and makes rotation/changing them difficult.
**Prevention:** Use environment variables (e.g., `VITE_ADMIN_EMAIL`) for configuration values that may change or should be somewhat abstracted.
