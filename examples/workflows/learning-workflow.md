# Workflow: Pattern Learning and Evolution

Workflow for extracting, tracking, and evolving project-specific patterns using
the everything-copilot continuous learning skills. This builds institutional
knowledge that improves agent performance over time.

---

## Phase 1: Extract Patterns from Existing Code

**Skill:** continuous-learning | **Purpose:** Learn from what already works

After completing a feature or code review, capture the patterns that emerged:

```
/learn The repository layer in this project always returns Result types instead
of throwing exceptions. Every repository method wraps database calls in a
try-catch and returns { data, error } objects. Callers check the error field
rather than using try-catch.
```

The learning system will:
1. Validate the pattern against existing code examples.
2. Store it with metadata: category (error-handling), language (TypeScript),
   confidence level (high if found in 3+ files).
3. Make it available to the TDD Guide and Code Reviewer agents.

---

## Phase 2: Check Current Pattern Status

**Command:** `/instinct-status` | **Purpose:** Review what has been learned

```
/instinct-status
```

This outputs a summary of all learned patterns:

```markdown
## Learned Patterns (12 total)

### Error Handling (3 patterns, high confidence)
- Repository methods return Result<T> types
- API handlers use asyncHandler wrapper
- Service errors include context chain

### Naming (2 patterns, high confidence)
- Files use kebab-case: user-service.ts
- Test files mirror source: user-service.test.ts

### Architecture (4 patterns, medium confidence)
- Controller -> Service -> Repository layering
- Shared types in src/types/ directory
- Config loaded once at startup via src/config/index.ts
- Feature flags checked at service layer, not controller

### Testing (3 patterns, medium confidence)
- Factories in tests/factories/ for test data
- Integration tests use test database, reset per suite
- Mocks only at I/O boundaries (HTTP, database, filesystem)
```

Review the patterns. Remove any that are incorrect or outdated.

---

## Phase 3: Evolve Patterns as the Project Grows

**Command:** `/evolve` | **Purpose:** Update patterns when practices change

When your team adopts a new practice or changes an existing one:

```
/evolve We are migrating from callback-style error handling to Result types.
Update the error handling patterns to reflect that new code should use Result<T>
and existing callback-style code should be refactored when touched.
```

The evolution system will:
1. Mark the old pattern as deprecated (not deleted, for context).
2. Add the new pattern with a migration note.
3. Update the Code Reviewer to flag old-style error handling as a suggestion.

---

## Phase 4: Apply Patterns Across Agents

Learned patterns automatically influence agent behavior:

**Planner Agent:** Uses architecture patterns to structure task breakdowns
consistent with the existing codebase layers.

**TDD Guide:** Applies testing patterns (factories, mock boundaries) when
generating new tests.

**Code Reviewer:** Checks code against all learned patterns. Flags deviations
as suggestions with references to the learned convention.

**Architect:** References architecture patterns when proposing new designs to
maintain consistency with the existing system.

---

## Phase 5: Periodic Review

Schedule a monthly review of learned patterns:

```
/instinct-status --detailed
```

For each pattern, assess:
- **Still accurate?** Does the codebase still follow this pattern?
- **Still valuable?** Does enforcing this pattern improve code quality?
- **Needs evolution?** Has the practice changed since this was learned?

Remove outdated patterns. Evolve patterns that have shifted. Add new patterns
discovered during recent development.

---

## Example: Learning Loop in Practice

A real learning loop across three sprints:

**Sprint 1:** Team adopts Zod for request validation.
```
/learn All API request bodies are validated using Zod schemas defined in
src/api/schemas/. The schema file name matches the route file name.
```

**Sprint 2:** Code reviewer catches inconsistency in a PR.
```
The /code-review flagged that src/api/routes/billing.ts validates manually
instead of using a Zod schema. The learned pattern caught the deviation.
```

**Sprint 3:** Team decides to also validate response bodies.
```
/evolve Extend Zod validation to include response schemas. Each route file
should have both request and response schemas in the corresponding schema file.
```

---

## Commands Used

| Command | Purpose |
|---------|---------|
| `/learn` | Extract and store a new pattern |
| `/instinct-status` | Review all learned patterns |
| `/evolve` | Update or replace an existing pattern |
| `/code-review` | Automatically applies learned patterns |
