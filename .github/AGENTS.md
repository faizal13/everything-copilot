# Organization-Level Agent Guidelines

These baseline instructions apply to all repositories in this organization. Repository-level
`.copilot/AGENTS.md` files may extend or override these defaults.

## Default Coding Standards

- Follow the language's official style guide (PEP 8, Effective Go, Rust API Guidelines, etc.).
- Use descriptive names that reveal intent. No abbreviations unless universally understood.
- Keep functions under 30 lines and files under 300 lines.
- Prefer composition over inheritance; prefer explicit over implicit.
- Write pure functions where possible. Minimize side effects.
- Add type annotations in every language that supports them.
- Pin dependency versions. Audit new dependencies before adding them.

## Security Requirements

- Never commit secrets, tokens, API keys, or credentials to source control.
- Validate and sanitize all external input at system boundaries.
- Use parameterized queries for all database access. No string concatenation in queries.
- Apply the principle of least privilege for service accounts and IAM roles.
- Enable TLS for all network communication. Reject plaintext HTTP in production.
- Keep dependencies updated. Address critical CVEs within 48 hours.
- Log security-relevant events (auth failures, permission changes) with structured output.
- Never log sensitive data (passwords, tokens, PII).

## Code Review Checklist

Before approving any pull request, verify the following:

1. **Correctness** - Does the code do what the PR description claims?
2. **Tests** - Are new behaviors covered by tests? Do existing tests still pass?
3. **Error handling** - Are errors handled explicitly with useful context?
4. **Security** - No secrets, no injection vectors, no unsafe deserialization.
5. **Performance** - No N+1 queries, unbounded loops, or missing pagination.
6. **Naming** - Are variables, functions, and files named clearly?
7. **Documentation** - Are public APIs and non-obvious decisions documented?
8. **Backwards compatibility** - Does this break existing consumers or contracts?
9. **Observability** - Are key operations logged or instrumented?
10. **Cleanup** - No dead code, no TODO without a linked issue, no commented-out blocks.

## Default Model Preferences

- Use the most capable model available for code generation and review tasks.
- Prefer deterministic output (low temperature) for code changes.
- Use structured output (JSON, YAML) when producing machine-readable results.
- Apply chain-of-thought reasoning for architectural decisions and debugging.
- Keep context windows focused: load only the files relevant to the current task.

## Organization Documentation

- [Coding Instructions](.copilot/instructions/coding-instructions.md)
- [System Prompts](.copilot/instructions/system-prompts.md)
- [Skills Library](.copilot/skills/)
- [Contribution Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

## Enforcement

These guidelines are validated automatically by CI. Workflows in `.github/workflows/`
run validation on every pull request targeting `main`. Violations block merge.
