## 2026-01-15 - Custom Markdown Parsers XSS Risk
**Vulnerability:** The custom regex-based markdown parser in `ArticlePage.tsx` was vulnerable to XSS because it used `dangerouslySetInnerHTML` with `[\s\S]*?` regexes that allowed breaking out of HTML tags (e.g., `</pre><script>`).
**Learning:** This codebase uses manual regex replacement for Markdown instead of a library. These custom parsers are brittle and default to insecure behavior if not explicitly sanitized.
**Prevention:** Always sanitize input (escape HTML entities) *before* applying custom markdown regex transformations, or switch to a secure library like `dompurify` + `react-markdown`.
