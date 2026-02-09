# Example Project-Level Copilot Configuration

This file shows how a real SaaS project (hypothetical "TaskFlow" app) would
configure `.copilot/AGENTS.md` with project-specific agents, skills, and MCP
integrations. Copy and adapt this for your own project.

## Project: TaskFlow

TaskFlow is a SaaS task management platform with a REST API (Node.js/Express),
React frontend, and PostgreSQL database.

---

## .copilot/AGENTS.md

```markdown
# TaskFlow Copilot Agents

## Project Context
- **Stack:** Node.js 20, Express 4, React 18, PostgreSQL 16, Prisma ORM
- **Testing:** Vitest (unit), Playwright (e2e), Supertest (API integration)
- **CI:** GitHub Actions with required checks on all PRs
- **Deploy:** Docker containers on AWS ECS, Terraform for infrastructure

## Agents

### Planner
- **Source:** everything-copilot/agents/planner.md
- **Use when:** Starting any feature larger than a single-file change
- **Project rules:** Always check `docs/architecture.md` before planning

### Architect
- **Source:** everything-copilot/agents/architect.md
- **Use when:** Adding new services, changing data models, or modifying API contracts
- **Project rules:** All ADRs go in `docs/adr/`. Use Mermaid for diagrams.

### TDD Guide
- **Source:** everything-copilot/agents/tdd-guide.md
- **Use when:** Implementing any feature or fixing any bug
- **Project rules:** Coverage minimum is 85% for `src/api/` and `src/services/`

### Code Reviewer
- **Source:** everything-copilot/agents/code-reviewer.md
- **Use when:** Before opening any PR
- **Project rules:** Load `coding-standards/typescript.md` for all reviews

## Skills

### Coding Standards
- **Source:** everything-copilot/.copilot/skills/coding-standards/
- **Languages:** TypeScript (primary), SQL (migrations)
- **Overrides:**
  - Max function length: 25 lines (stricter than default 30)
  - Prefer `type` over `interface` for object shapes
  - Always use named exports, never default exports

### Backend Patterns
- **Source:** everything-copilot/.copilot/skills/backend-patterns/
- **Project rules:**
  - All endpoints use `asyncHandler` wrapper for error propagation
  - Request validation via Zod schemas in `src/api/schemas/`
  - Database access only through repository layer in `src/repositories/`

### Frontend Patterns
- **Source:** everything-copilot/.copilot/skills/frontend-patterns/
- **Project rules:**
  - State management via Zustand (no Redux)
  - All API calls go through `src/lib/api-client.ts`
  - Components follow atomic design: atoms, molecules, organisms, pages

### Security Review
- **Source:** everything-copilot/.copilot/skills/security-review/
- **Project rules:**
  - All user input must be validated server-side even if validated client-side
  - JWT tokens expire after 15 minutes; refresh tokens after 7 days
  - Rate limiting on all public endpoints via `src/middleware/rate-limit.ts`

## Commands

| Command | Purpose | Notes |
|---------|---------|-------|
| `/plan` | Break features into tasks | Always run before starting implementation |
| `/tdd` | Test-driven development | Uses Vitest; creates files in `__tests__/` |
| `/code-review` | Pre-PR quality check | Loads project coding standards automatically |
| `/e2e` | Generate Playwright tests | Tests go in `tests/e2e/` |

## MCP Integrations

### PostgreSQL (read-only)
- **Server:** `@modelcontextprotocol/server-postgres`
- **Purpose:** Query database schema, inspect indexes, check migration state
- **Config:** Connection string from `DATABASE_URL` env var

### GitHub
- **Server:** `@modelcontextprotocol/server-github`
- **Purpose:** Read issues, PR comments, and CI check status
- **Scopes:** `repo:read`, `issues:read`, `checks:read`

### Sentry
- **Server:** `@modelcontextprotocol/server-sentry`
- **Purpose:** Look up recent errors and performance data when debugging
- **Config:** Sentry auth token from `SENTRY_AUTH_TOKEN` env var

## Conventions

- Commit format: `type(scope): description` (e.g., `feat(tasks): add due dates`)
- Branch naming: `feature/`, `fix/`, `chore/` prefixes
- PR titles must start with a conventional commit type
- All PRs require at least one approval before merge
```

## How to Use This Configuration

1. Copy the `AGENTS.md` content above into your project's `.copilot/AGENTS.md`.
2. Replace "TaskFlow" references with your project name and stack details.
3. Adjust agent sources to point to your installed everything-copilot path.
4. Add or remove MCP integrations based on your infrastructure.
5. Update conventions to match your team's existing practices.

## Key Principles

- **Be specific.** Generic instructions produce generic results. Include file
  paths, naming patterns, and technology choices.
- **Reference real files.** Point agents to actual config files, architecture
  docs, and coding standards in your repo.
- **Set boundaries.** Define what each agent should and should not do in the
  context of your project.
- **Keep it current.** Update this configuration when your stack or conventions
  change. Stale instructions degrade agent quality.
