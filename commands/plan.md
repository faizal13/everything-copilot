# /plan

## Overview

The Plan command creates a structured, dependency-aware implementation plan from a feature description. It breaks down high-level requirements into ordered tasks with clear acceptance criteria, enabling predictable and reviewable development.

**Model:** Sonnet 4.5

## Usage

```
/plan <feature description>
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `feature description` | Yes | A plain-language description of the feature or change to plan |

## Prerequisites

- A project repository with existing code to provide context.
- At least one of: README, architecture doc, or prior commit history so the planner can infer conventions.

## Workflow Steps

1. **Analyze Requirements** -- Parse the feature description and gather relevant context from the codebase (file structure, existing modules, tech stack).
2. **Break into Tasks** -- Decompose the feature into discrete, implementable tasks. Each task targets a single concern (e.g., one component, one endpoint, one migration).
3. **Identify Dependencies** -- Determine ordering constraints between tasks. Flag external dependencies such as third-party APIs, environment variables, or infrastructure changes.
4. **Create Ordered Plan** -- Produce a numbered plan with each task containing a title, description, affected files, estimated complexity, and acceptance criteria.

## Example

```
/plan Add role-based access control to the API
```

**Interaction:**

```
Analyzing codebase...
Found: Express API, Prisma ORM, JWT auth middleware

## Implementation Plan: Role-Based Access Control

### Task 1 - Define Role Schema (Low complexity)
- Add `Role` and `UserRole` models to `prisma/schema.prisma`
- Create migration
- Acceptance: migration runs cleanly, seed script creates default roles

### Task 2 - Create RBAC Middleware (Medium complexity)
- New file: `src/middleware/rbac.ts`
- Read roles from JWT claims
- Acceptance: middleware rejects unauthorized requests with 403

### Task 3 - Protect Existing Routes (Medium complexity)
- Update `src/routes/admin.ts` to require `admin` role
- Update `src/routes/users.ts` to require `user` role
- Acceptance: existing tests updated, all pass

### Task 4 - Add Role Management Endpoints (Medium complexity)
- POST/DELETE `/api/roles` for admins
- Acceptance: integration tests cover CRUD operations

Dependencies: Task 1 -> Task 2 -> Task 3, Task 1 -> Task 4
```

## Output Format

The plan is returned as a Markdown document with:

- A summary header naming the feature.
- Numbered tasks, each containing: title, complexity rating, description, affected files, and acceptance criteria.
- A dependency graph at the bottom showing task ordering.

## Notes

- Plans are advisory; they do not modify any files or execute any code.
- For large features, consider running `/plan` on sub-features to keep plans focused.
- The plan integrates with `/tdd` -- you can pass individual tasks as input to the TDD command.
- Re-running `/plan` with updated context will regenerate the plan from scratch.
