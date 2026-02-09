# Context Preservation

## Priority Ranking

When compacting, preserve in this order:

### Priority 1: Critical (Never Drop)
- Current task description and acceptance criteria
- Active file paths and their current state
- Unresolved errors or blockers
- Key architectural decisions made this session
- Constraints and requirements from the user

### Priority 2: Important (Summarize, Don't Drop)
- Test results (keep: pass/fail counts, coverage %)
- Exploration findings (keep: conclusions, drop: search process)
- Code review comments (keep: actionable items)
- Discussion outcomes (keep: decisions, drop: deliberation)

### Priority 3: Reference (Summarize Aggressively)
- File contents already read (keep: key function signatures)
- Command output (keep: 1-line summary)
- Error messages (keep: error type + resolution)
- Search results (keep: final relevant file list)

### Priority 4: Disposable (Drop)
- Verbose tool output (full `npm install` logs)
- Failed exploration paths that led nowhere
- Superseded plans or approaches
- Pleasantries and meta-conversation
- Repeated information

## What to Preserve Verbatim

Always keep the exact text for:
- Error messages being debugged (exact text needed for grep/search)
- File paths with line numbers (context will be lost if approximated)
- Configuration values (exact strings matter)
- API endpoints and URL paths
- Regex patterns or complex expressions

## Summarization Templates

### Multi-turn discussion → Decision summary
```
BEFORE: 8 turns discussing auth approach (OAuth vs JWT vs session)
AFTER: "Decision: Using JWT with short-lived access tokens (15min) + refresh tokens (7d).
Rationale: Stateless, works across services, refresh enables revocation."
```

### File read → Key findings
```
BEFORE: 200-line file dump of auth middleware
AFTER: "auth.ts: Express middleware that validates JWT from Authorization header.
Extracts user ID/role from token. Returns 401 if expired, 403 if insufficient role.
Key functions: verifyToken(), extractUser(), requireRole(role)."
```

### Test run → Results summary
```
BEFORE: 50 lines of test runner output
AFTER: "Tests: 142 passed, 2 failed (auth.test.ts:45, user.test.ts:88). Coverage: 84% lines, 78% branches."
```

## Compacted Context Template

```markdown
## Session Context (Compacted)

**Task:** [1-2 sentence description]
**Status:** [In progress / Blocked / Near completion]

### Decisions Made
- [Decision 1 + brief rationale]
- [Decision 2 + brief rationale]

### Active Files
- `path/to/file1.ts` — [what was done/needs to be done]
- `path/to/file2.ts` — [status]

### Current State
- [What's completed]
- [What's in progress]
- [What's blocked]

### Test Results
- Last run: [pass/fail/coverage]
- Failing: [specific test names if any]

### Next Steps
1. [Immediate next action]
2. [Following action]

### Open Questions
- [Unresolved question 1]
```

## Anti-Patterns

- **Don't drop error context during debugging** — You'll need the exact error again
- **Don't summarize code you're about to modify** — Keep verbatim
- **Don't compress file paths** — Abbreviated paths cause errors
- **Don't drop test names** — "2 tests failing" is useless without names
