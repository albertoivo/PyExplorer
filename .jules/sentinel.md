## 2026-01-15 - Custom Markdown Parsers XSS Risk
**Vulnerability:** The custom regex-based markdown parser in `ArticlePage.tsx` was vulnerable to XSS because it used `dangerouslySetInnerHTML` with `[\s\S]*?` regexes that allowed breaking out of HTML tags (e.g., `</pre><script>`).
**Learning:** This codebase uses manual regex replacement for Markdown instead of a library. These custom parsers are brittle and default to insecure behavior if not explicitly sanitized.
**Prevention:** Always sanitize input (escape HTML entities) *before* applying custom markdown regex transformations, or switch to a secure library like `dompurify` + `react-markdown`.

## 2026-01-18 - Firestore IDOR Vulnerability in User Progress
**Vulnerability:** Users could overwrite any `userProgress` document (e.g., another user's progress) by simply including their own `uid` in the payload, as the security rule only checked the payload `uid` against `auth.uid` but ignored the document ID.
**Learning:** Checking `request.resource.data.uid == request.auth.uid` is insufficient if the document ID itself targets another user's resource.
**Prevention:** Always enforce that the Document ID matches the User ID (or a deterministic derivation) in `allow write` rules when the collection is keyed by user-specific identifiers.

## 2026-01-28 - Implicit Requirement vs Default CSP
**Vulnerability:** The default Content Security Policy (`default-src 'self'`) blocked legitimate features (GitHub Sponsors iframe) which were only discoverable via specific page tests (`AboutPage.test.tsx`), leading to a broken feature or potential insecure workaround.
**Learning:** Security controls like CSP must be aligned with application requirements found in tests and code, not just generic best practices. Blindly applying strict defaults can break features.
**Prevention:** Audit codebase for external resource usage (iframes, scripts) before finalizing CSP headers. Use tests to verify that security controls don't block legitimate functionality.

## 2026-02-04 - Username Enumeration via Firebase Errors
**Vulnerability:** The application was revealing whether a user exists during login/password reset by mapping `auth/user-not-found` to specific messages like "Usuário não encontrado". This allows attackers to enumerate registered emails.
**Learning:** Default error mapping often prioritizes debugging over security. Authentication errors must be generic to prevent enumeration.
**Prevention:** Always map `auth/user-not-found` and `auth/wrong-password` to the same generic message (e.g., "Email or password incorrect") and handle password reset flows to blindly return success.
