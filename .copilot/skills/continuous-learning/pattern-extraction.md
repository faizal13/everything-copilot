# Pattern Extraction

## What Makes a Pattern Worth Extracting

A pattern is worth saving when:
- You solved a problem that took significant effort
- You found yourself repeating the same approach across files/tasks
- A debugging technique revealed a non-obvious root cause
- You discovered a project convention not documented elsewhere
- You made an architectural decision with important tradeoffs

## Pattern Categories

| Category | Examples |
|----------|---------|
| **code-pattern** | Error handling approach, data transformation pipeline, API response format |
| **workflow** | TDD sequence for this project, deployment checklist, PR review order |
| **debugging** | "When X error appears, check Y first", common misconfigurations |
| **architecture** | Service boundaries, data flow patterns, caching strategy decisions |
| **testing** | Fixture patterns, mock setup for specific APIs, test data strategies |
| **tooling** | CLI flags that work, build configurations, environment setup |

## Extraction Process

### 1. Identify the Pattern
Ask: "If I faced this same situation again, what would I want to remember?"

### 2. Document the Pattern

```json
{
  "name": "retry-with-exponential-backoff",
  "category": "code-pattern",
  "context": "When calling external APIs that may be rate-limited or temporarily unavailable",
  "problem": "API calls fail intermittently under load",
  "solution": "Wrap calls in retry logic with exponential backoff and jitter",
  "example": "await retry(() => fetchAPI(url), { maxRetries: 3, baseDelay: 1000 })",
  "anti_patterns": ["Fixed delay retries (thundering herd)", "Infinite retries without circuit breaker"],
  "confidence": 0.5
}
```

### 3. Validate the Pattern
- Does it apply beyond the specific case where you found it?
- Is it specific enough to be actionable?
- Does it conflict with any existing patterns?

## Extraction Triggers

| Trigger | Action |
|---------|--------|
| Solved a hard bug | Extract the debugging path as a pattern |
| Wrote similar code 3+ times | Extract the common structure |
| Made a decision after research | Record the decision and reasoning |
| Found an undocumented convention | Extract and document it |
| Got a code review comment | Extract the review insight |

## Quality Criteria

A good pattern has:
- **Clear name** — Descriptive, searchable
- **Specific context** — When does this apply?
- **Concrete solution** — Not vague advice, but actionable steps
- **Example** — Real code or command that demonstrates it
- **Anti-patterns** — What NOT to do (common mistakes)

A bad pattern is:
- Too generic ("write clean code")
- Too specific to one file or function
- Already covered by a formal skill or documentation

## Deduplication

Before storing a new pattern, check if it:
- Already exists under a different name
- Is a subset of an existing broader pattern
- Conflicts with an existing pattern (resolve the conflict)
