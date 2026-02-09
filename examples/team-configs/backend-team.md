# Backend Team Configuration

## Recommended Agents
- **Architect** — Service boundaries, API design, data modeling
- **Security Reviewer** — Auth, input validation, dependency scanning
- **Build Error Resolver** — Dependency conflicts, CI failures
- **Performance Optimizer** — Query optimization, caching, profiling

## Skills to Enable
- `backend-patterns` — API design, database, caching, event-driven
- `security-review` — OWASP, dependency scanning, secret detection
- `coding-standards` — Python, Go, or TypeScript (per stack)

## AGENTS.md Additions

```markdown
## Backend Review Rules
- All endpoints must have authentication middleware
- Database queries must use parameterized statements
- API responses follow { data, error, meta } format
- All errors logged with correlation ID
- Rate limiting on public endpoints
- Database migrations must be reversible
- No N+1 queries — use eager loading or DataLoader
```

## Recommended MCP Tools
- PostgreSQL / MySQL MCP (query, schema inspection)
- Datadog / New Relic (monitoring)
- Kubernetes MCP (deployment management)

## Conventions
- API versioning: URL path (`/api/v1/...`)
- Error codes: uppercase with underscores (`VALIDATION_ERROR`)
- Logging: structured JSON format
- Config: environment variables, never hardcoded
