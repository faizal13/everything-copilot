# /code-review

## Overview

The Code Review command performs a structured quality review of source code, either for a specific file or an entire pull request. It checks adherence to project patterns and conventions, identifies bugs and anti-patterns, and produces a review with findings categorized by severity level.

**Model:** Sonnet 4.5

## Usage

```
/code-review <file or PR>
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `file or PR` | Yes | A file path, glob pattern, or PR number/URL to review |

## Prerequisites

- The target code must be accessible in the current workspace.
- For PR reviews, the git remote must be configured and the PR must exist.
- Project coding standards (if defined in `.copilot/skills/coding-standards/`) will be loaded automatically.

## Workflow Steps

1. **Read Code** -- Load the target file(s) or fetch the PR diff. For PRs, only changed lines and their surrounding context are analyzed.
2. **Check Patterns and Conventions** -- Compare the code against project-level coding standards, naming conventions, file organization rules, and language idioms.
3. **Identify Issues** -- Detect potential bugs, security vulnerabilities, performance problems, readability concerns, and missing test coverage.
4. **Generate Review** -- Produce a structured review document with each finding categorized by severity: critical, warning, suggestion, or nitpick.

## Example

```
/code-review src/api/auth-handler.ts
```

**Interaction:**

```
Reviewing src/api/auth-handler.ts...
Loaded coding standards from .copilot/skills/coding-standards/

## Code Review: src/api/auth-handler.ts

### Critical (1)
- **Line 42:** User password compared with `==` instead of constant-time
  comparison. This is vulnerable to timing attacks.
  Fix: Use `crypto.timingSafeEqual()`.

### Warning (2)
- **Line 18:** Error object is caught but not logged. Silent failures
  make debugging difficult in production.
- **Line 67:** JWT expiration set to 30 days. Consider a shorter TTL
  with refresh token rotation.

### Suggestion (1)
- **Line 5-12:** Repeated config lookups could be extracted to a
  configuration object initialized once at module load.

### Nitpick (1)
- **Line 29:** Variable name `d` is unclear. Consider `decodedToken`.

Summary: 1 critical, 2 warnings, 1 suggestion, 1 nitpick
```

## Output Format

The review is structured as a Markdown document with:

- A header identifying the reviewed target.
- Sections grouped by severity: Critical, Warning, Suggestion, Nitpick.
- Each finding includes: line number, description, and a recommended fix.
- A summary line with counts per severity level.

Severity levels follow this rubric:

| Severity | Meaning |
|----------|---------|
| Critical | Must fix -- bugs, security holes, data loss risks |
| Warning | Should fix -- performance issues, error handling gaps |
| Suggestion | Could improve -- readability, maintainability, DRY |
| Nitpick | Optional -- style preferences, naming, formatting |

## Notes

- The review loads project-specific coding standards when available.
- For PR reviews, only the diff is analyzed, not the entire file history.
- Findings are deduplicated -- repeated patterns are grouped into a single finding.
- Combine with `/refactor-clean` to automatically act on suggestions.
- For Go-specific reviews, prefer `/go-review` which includes `go vet` and `staticcheck` output.
