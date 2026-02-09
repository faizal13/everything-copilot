# Workflow: Security Audit

Workflow for conducting a security audit using the everything-copilot toolkit.
Covers dependency scanning, code review for vulnerabilities, secret detection,
and generating a structured security report.

---

## Phase 1: Dependency Scanning

**Tool:** Bash | **Purpose:** Identify known vulnerabilities in dependencies

```bash
# Node.js projects
npm audit --json > security/npm-audit.json

# Python projects
pip-audit --format json --output security/pip-audit.json

# Go projects
govulncheck ./... > security/go-vulncheck.txt
```

Review the output. Classify findings by severity (critical, high, medium, low).
Update dependencies where patches are available. Document accepted risks for
findings that cannot be resolved immediately.

---

## Phase 2: Secret Detection

**Tool:** Bash + Grep | **Purpose:** Find leaked credentials in the codebase

```bash
# Scan for common secret patterns
grep -rn "AKIA[0-9A-Z]{16}" src/           # AWS access keys
grep -rn "sk_live_" src/                     # Stripe live keys
grep -rn "password\s*=\s*['\"]" src/        # Hardcoded passwords

# Use a dedicated scanner if available
gitleaks detect --source . --report-path security/gitleaks-report.json
```

For each finding:
1. Rotate the exposed credential immediately.
2. Move the value to environment variables or a secrets manager.
3. Add the pattern to `.gitignore` and pre-commit hooks.

---

## Phase 3: Code Security Review

**Agent:** Code Reviewer (security focus) | **Command:** `/code-review`

Review critical paths with a security lens:

```
/code-review src/api/auth/          # Authentication logic
/code-review src/api/middleware/     # Authorization and input validation
/code-review src/services/payment/   # Payment processing
/code-review src/lib/crypto/         # Cryptographic operations
```

Focus areas for each review:
- **Authentication:** Token validation, session management, brute-force protection.
- **Authorization:** Role checks on every endpoint, no privilege escalation paths.
- **Input validation:** All user input sanitized, SQL injection prevention, XSS protection.
- **Data handling:** PII encryption at rest, secure transport, proper logging (no secrets).

---

## Phase 4: Infrastructure Review

**Tool:** Manual inspection | **Purpose:** Check deployment security

Verify these configurations:

```markdown
## Infrastructure Checklist
- [ ] HTTPS enforced on all endpoints (no HTTP fallback)
- [ ] CORS configured with explicit origin allowlist
- [ ] Rate limiting active on public endpoints
- [ ] Database connections use TLS
- [ ] Container images scanned for vulnerabilities
- [ ] Secrets injected via environment, not baked into images
- [ ] Logging excludes sensitive fields (passwords, tokens, PII)
- [ ] Backups encrypted and access-controlled
```

---

## Phase 5: Generate Security Report

Compile findings into a structured report:

```markdown
# Security Audit Report
**Date:** YYYY-MM-DD
**Scope:** Full application audit
**Auditor:** [Your name]

## Summary
- Critical: X findings
- High: X findings
- Medium: X findings
- Low: X findings

## Findings

### [CRITICAL] SEC-001: Hardcoded API key in config
- **Location:** src/config/payment.ts:14
- **Risk:** Credential exposure if source code is leaked
- **Remediation:** Move to environment variable, rotate key
- **Status:** Remediated / Accepted / In Progress

### [HIGH] SEC-002: Missing rate limiting on login endpoint
- **Location:** src/api/routes/auth.ts
- **Risk:** Brute-force attacks on user accounts
- **Remediation:** Add rate limiter middleware (10 req/min per IP)
- **Status:** Remediated / Accepted / In Progress

## Recommendations
1. Implement automated dependency scanning in CI pipeline.
2. Add pre-commit hooks for secret detection.
3. Schedule quarterly security audits.
```

---

## Agents and Commands Used

| Phase | Tool | Purpose |
|-------|------|---------|
| Dependencies | `npm audit` / `pip-audit` | Known vulnerability scan |
| Secrets | `gitleaks` / `grep` | Credential leak detection |
| Code Review | `/code-review` | Security-focused code analysis |
| Infrastructure | Manual checklist | Deployment configuration review |
| Report | Manual compilation | Structured findings document |
