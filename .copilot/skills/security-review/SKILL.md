# Security Review Skill

## Name
Security Review

## Description
Security analysis patterns for identifying vulnerabilities, scanning dependencies, detecting secrets, and enforcing security best practices across all languages and frameworks.

## Trigger Conditions
- Security audit or review requested
- Authentication or authorization code changes
- Dependency updates or additions
- Input handling or data processing code
- API endpoint creation or modification
- Configuration or deployment changes
- Files matching: `.env*`, `*auth*`, `*security*`, `*crypto*`

## Files
- `vulnerability-checklist.md` — OWASP Top 10 with detection and remediation
- `dependency-scanning.md` — Automated vulnerability scanning per language
- `secret-detection.md` — Finding and preventing credential leaks
- `security-best-practices.md` — Auth, encryption, input validation, headers

## Model Recommendation
- **Opus** for comprehensive security audits and architecture review
- **Sonnet** for code-level security review and fix implementation
- **Haiku** for quick dependency checks and secret scanning
