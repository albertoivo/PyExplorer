## 2026-01-13 - Admin Email Verification
**Vulnerability:** Admin access was granted based solely on an email address claim, allowing potential privilege escalation if the email provider doesn't enforce verification or if the email is spoofed.
**Learning:** Hardcoding email addresses for authorization is risky. Relying on unverified emails is even riskier.
**Prevention:** Always check `request.auth.token.email_verified == true` when using email-based authorization in Firestore rules.
