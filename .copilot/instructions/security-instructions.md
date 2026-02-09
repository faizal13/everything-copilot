# Security Instructions

These instructions define security requirements for all code written or modified by the agent. Security is not optional and overrides convenience in every case.

## Secrets and Credentials
- Never hardcode secrets, tokens, API keys, passwords, or connection strings in code.
- Load secrets from environment variables or a secrets manager.
- Never log, print, or include secrets in error messages.
- Add secret file patterns to `.gitignore` (`.env`, `*.pem`, `*.key`, `credentials.json`).
- Rotate secrets immediately if they are accidentally committed. Removing from history is not enough.

## Input Validation
- Validate all user input on the server side. Client-side validation is a UX feature, not a security control.
- Reject invalid input early. Use allowlists over denylists when possible.
- Validate type, length, format, and range for every input field.
- Sanitize file names and paths to prevent path traversal (`../`).
- Limit request body size to prevent denial-of-service via large payloads.

## Injection Prevention
- Use parameterized queries or prepared statements for all database operations. Never concatenate user input into SQL strings.
- Use ORM/query builders that parameterize by default.
- Escape or sanitize output rendered in HTML to prevent XSS.
- Use Content Security Policy (CSP) headers to limit script sources.
- Avoid `eval()`, `exec()`, `Function()`, and similar dynamic execution in all languages.

## Authentication and Authorization
- Use established libraries for authentication. Do not build your own auth system.
- Hash passwords with bcrypt, scrypt, or argon2. Never use MD5 or SHA for passwords.
- Enforce the principle of least privilege: grant the minimum permissions required.
- Check authorization on every request, not just at login.
- Use short-lived tokens and implement token refresh flows.
- Invalidate sessions on logout, password change, and privilege escalation.

## Transport Security
- Use HTTPS for all external requests. Reject HTTP in production.
- Set secure cookie flags: `Secure`, `HttpOnly`, `SameSite=Strict` (or `Lax`).
- Enable HSTS headers with a minimum max-age of one year.
- Validate TLS certificates. Do not disable certificate verification.
- Use TLS 1.2 or later. Disable older protocols.

## Data Protection
- Encrypt sensitive data at rest (PII, financial data, health records).
- Do not store more data than necessary. Minimize data collection.
- Mask or redact sensitive fields in logs (`email: j***@example.com`).
- Apply data retention policies. Delete data that is no longer needed.
- Use separate database credentials for read and write operations where possible.

## Dependencies
- Run dependency vulnerability scans regularly (`npm audit`, `pip-audit`, `govulncheck`).
- Do not use dependencies with known critical vulnerabilities in production.
- Pin dependency versions. Review changelogs before upgrading.
- Prefer dependencies with active maintenance and a security policy.
- Remove unused dependencies. Each dependency increases the attack surface.

## Security Headers and Defaults
- Set these headers on all HTTP responses in production:
  - `Content-Security-Policy` - restrict resource loading
  - `X-Content-Type-Options: nosniff` - prevent MIME sniffing
  - `X-Frame-Options: DENY` - prevent clickjacking
  - `Strict-Transport-Security` - enforce HTTPS
  - `Referrer-Policy: strict-origin-when-cross-origin` - limit referrer leakage
- Configure CORS to allow only the origins that need access. Never use `*` in production.

## Logging and Monitoring
- Log authentication events: login, logout, failed attempts, privilege changes.
- Log access to sensitive data with the requesting user and timestamp.
- Never log passwords, tokens, credit card numbers, or other secrets.
- Use structured logging (JSON) for machine-parseable security events.
- Set up alerts for anomalous patterns: brute force attempts, unusual access patterns.

## OWASP Top 10 Reference
Apply the OWASP Top 10 as a baseline checklist for every feature:
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable and Outdated Components
7. Identification and Authentication Failures
8. Software and Data Integrity Failures
9. Security Logging and Monitoring Failures
10. Server-Side Request Forgery (SSRF)
