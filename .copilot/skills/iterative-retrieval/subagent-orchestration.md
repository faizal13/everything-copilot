# Subagent Orchestration

## Task Decomposition

Break a retrieval task into independent subtasks that can run in parallel:

```
Main task: "Understand the authentication system"

Subtasks:
1. Find all auth-related files (grep "auth|login|session")
2. Read the auth middleware
3. Find the user model/schema
4. Read auth-related tests
5. Check auth configuration (env vars, feature flags)
```

**Rules for decomposition:**
- Each subtask should be independently executable
- Subtasks should not depend on each other's output
- Results should be mergeable without conflicts

## Parallel Dispatch

Send multiple search/read operations simultaneously:

```
Agent A: grep for "auth" in src/
Agent B: read src/middleware/auth.ts
Agent C: find test files matching "*auth*"
```

Benefits: 3x faster than sequential. Especially valuable for large codebases.

## Result Aggregation

After all subtasks complete:

1. **Merge results** — Combine file lists, remove duplicates
2. **Rank by relevance** — Score each file on how central it is
3. **Summarize** — Create a brief overview of findings
4. **Identify gaps** — What's still unknown? Need another pass?

```
Results:
- Found 12 auth-related files across 4 directories
- Core auth logic in: src/auth/service.ts, src/middleware/auth.ts
- 8 test files with 45 test cases covering auth
- Auth config in: .env (JWT_SECRET, SESSION_TTL)
- Gap: OAuth integration unclear — need to check src/auth/providers/
```

## Conflict Resolution

When agents find contradictory information:

| Conflict Type | Resolution |
|-------------|-----------|
| Different implementations of same interface | Both are valid — document both |
| Conflicting documentation vs code | Code is truth, flag doc as stale |
| Multiple versions of same pattern | Prefer the most recent |
| Test says one thing, code says another | Flag as potential bug |

## Agent Specialization

Assign subtask types to appropriate models:

| Subtask | Model | Reason |
|---------|-------|--------|
| File search / grep | Haiku | Fast, low-cost |
| Code reading / analysis | Sonnet | Balanced understanding |
| Architecture inference | Opus | Deep reasoning |
| Summary generation | Haiku | Straightforward |

## Communication Protocol

Agents report back in structured format:

```json
{
  "subtask": "find auth files",
  "status": "complete",
  "files_found": ["src/auth/service.ts", "src/middleware/auth.ts"],
  "confidence": 0.9,
  "notes": "Also found deprecated auth in src/legacy/auth.js"
}
```
