# Workflow: Implement a New Feature

Step-by-step workflow for implementing a feature using the everything-copilot
toolkit. This example adds a "due date" field to tasks in a project management
application.

---

## Phase 1: Planning

**Agent:** Planner | **Command:** `/plan`

```
/plan Add due date support to tasks with reminders and overdue highlighting
```

The Planner agent will:
1. Scan the codebase for the existing Task model and related components.
2. Break the feature into ordered tasks with dependencies.
3. Produce a plan with effort estimates and acceptance criteria.

**Output:** A structured plan with 5-8 tasks covering schema, API, UI, and tests.

Review the plan. Adjust task ordering or scope before proceeding.

---

## Phase 2: Architecture Review (if needed)

**Agent:** Architect | **Trigger:** Plan involves schema or API changes

If the plan introduces new data models or API contracts, consult the Architect:

```
Review the plan for due date support. Evaluate the schema design and API
contract for the reminder scheduling system.
```

The Architect will produce an ADR and recommend patterns for date handling,
timezone storage, and reminder job scheduling.

---

## Phase 3: Implementation via TDD

**Agent:** TDD Guide | **Command:** `/tdd`

Work through the plan task by task. For each task:

```
/tdd src/services/task-due-date
```

The TDD cycle for each task:
1. **RED** -- Write failing tests for the expected behavior.
2. **GREEN** -- Implement the minimum code to pass tests.
3. **REFACTOR** -- Clean up while keeping tests green.
4. **COVERAGE** -- Verify 80%+ coverage on changed files.

Repeat for each task in the plan: schema migration, API endpoint, service
logic, frontend component, and E2E flow.

---

## Phase 4: Code Review

**Agent:** Code Reviewer | **Command:** `/code-review`

Before opening a PR, run a self-review:

```
/code-review src/services/task-due-date.ts src/api/routes/tasks.ts src/components/DueDatePicker.tsx
```

The reviewer will check:
- Naming conventions and code structure.
- Error handling completeness.
- Test quality and coverage.
- Performance concerns (e.g., N+1 queries in the reminder system).

Fix all critical and warning findings before proceeding.

---

## Phase 5: E2E Testing

**Command:** `/e2e`

```
/e2e User creates a task with a due date, receives a reminder, and sees overdue highlighting
```

This generates Playwright tests covering the full user flow. Run them locally
to confirm the feature works end-to-end.

---

## Phase 6: Final Checks and Merge

1. Run the full test suite: `npm test`
2. Run linters: `npm run lint`
3. Verify CI passes on the PR branch.
4. Address any reviewer feedback.
5. Squash and merge.

---

## Summary of Agents and Commands Used

| Phase | Agent/Command | Purpose |
|-------|---------------|---------|
| Planning | `/plan` | Break feature into tasks |
| Architecture | Architect agent | Schema and API design |
| Implementation | `/tdd` | Test-driven coding per task |
| Review | `/code-review` | Pre-PR quality check |
| E2E Testing | `/e2e` | Full user flow validation |
| Merge | Manual | Final CI checks and merge |
