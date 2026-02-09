# Fullstack Team Configuration

## Recommended Agents
All primary agents in a balanced configuration:
- **Planner** — Feature decomposition across frontend and backend
- **Architect** — API-UI contract design, shared type definitions
- **TDD Agent** — E2E tests spanning the full stack
- **Code Reviewer** — Consistency across layers
- **Security Reviewer** — Auth flows end-to-end
- **E2E Runner** — Full user flow testing

## Skills to Enable
- `frontend-patterns` — React, state management, responsive design
- `backend-patterns` — API design, database, caching
- `test-driven-development` — Jest + integration tests
- `coding-standards` — TypeScript (shared across stack)
- `security-review` — End-to-end auth, input validation

## AGENTS.md Additions

```markdown
## Fullstack Review Rules
- API types shared between frontend and backend (shared types package)
- API changes must update both backend handler and frontend client
- E2E tests cover critical user flows (auth, core features)
- No direct database access from frontend — always through API
- Loading and error states handled in UI for every API call
- API-first development: define contract before implementing
```

## Recommended MCP Tools
- GitHub MCP (PRs, issues)
- PostgreSQL MCP (database queries)
- Slack MCP (notifications)

## Conventions
- Monorepo structure: `packages/{api,web,shared}`
- Shared types in `packages/shared/types/`
- API client auto-generated from OpenAPI spec
- E2E tests in `tests/e2e/`
- Feature flags for gradual rollouts
