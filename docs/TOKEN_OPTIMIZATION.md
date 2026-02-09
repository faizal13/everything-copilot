# Token Optimization

## Overview

Token optimization is about getting the most value from every token in the context window. With Claude models operating within fixed context limits, strategic token management determines how much you can accomplish in a single session.

## Context Window Budgets

### Model Limits

| Model | Context Window | Recommended Working Budget |
|-------|---------------|---------------------------|
| Claude Opus | 200K tokens | ~150K usable |
| Claude Sonnet | 200K tokens | ~150K usable |
| Claude Haiku | 200K tokens | ~150K usable |

Reserve ~25% for output generation and system overhead.

### Budget Allocation

```
┌─────────────────────────────────────────┐
│ 15%  System prompt + instructions       │
│ 60%  Context (code, docs, conversation) │
│ 25%  Output generation reserve          │
└─────────────────────────────────────────┘
```

Within the 60% context allocation:

```
50%  Source code under discussion
20%  Test files
15%  Related modules and dependencies
10%  Documentation and specs
 5%  Configuration files
```

## Token Estimation

### Quick Estimation Rules

| Content Type | Ratio | Example |
|-------------|-------|---------|
| English text | ~4 chars/token | 1000 chars ≈ 250 tokens |
| Source code | ~3.5 chars/token | 1000 chars ≈ 285 tokens |
| JSON/config | ~3 chars/token | 1000 chars ≈ 333 tokens |
| Minified code | ~2.5 chars/token | 1000 chars ≈ 400 tokens |

### File Size Estimates

| File | Lines | Approx Tokens |
|------|-------|---------------|
| Small utility (50 lines) | 50 | ~400 |
| Component (200 lines) | 200 | ~1,600 |
| Service class (500 lines) | 500 | ~4,000 |
| Large module (1000 lines) | 1000 | ~8,000 |
| Full test suite (2000 lines) | 2000 | ~16,000 |

### JavaScript Estimation

```javascript
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

function isWithinBudget(text, maxTokens) {
  return estimateTokens(text) <= maxTokens;
}
```

## Model Selection Strategy

Choose the right model to optimize cost and performance:

### Task-to-Model Routing

| Task Type | Model | Why |
|-----------|-------|-----|
| Architecture design | **Opus** | Complex reasoning, system-level thinking |
| Security review | **Opus** | Catches subtle vulnerabilities |
| Complex refactoring | **Opus** | Understands large-scale patterns |
| Feature implementation | **Sonnet** | Best cost/quality for code generation |
| TDD cycles | **Sonnet** | Fast iteration with good quality |
| Code review | **Sonnet** | Thorough but efficient |
| Bug fixes | **Sonnet** | Good at targeted changes |
| Documentation | **Haiku** | Fast, sufficient quality for docs |
| Commit messages | **Haiku** | Simple, formulaic output |
| Code formatting | **Haiku** | Mechanical transformations |
| Quick questions | **Haiku** | Low-latency responses |

### Cost Comparison

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Relative Cost |
|-------|----------------------|------------------------|---------------|
| Opus | $15.00 | $75.00 | 5× |
| Sonnet | $3.00 | $15.00 | 1× (baseline) |
| Haiku | $0.25 | $1.25 | 0.08× |

**Rule of thumb:** Use Haiku for 60% of tasks, Sonnet for 35%, Opus for 5%.

## Context Prioritization

When the context window fills up, prioritize what stays:

### Priority Levels

| Priority | Content | Action |
|----------|---------|--------|
| **Critical** | Current file, failing tests, error messages | Always keep |
| **Important** | Direct dependencies, type definitions, test file | Keep if space allows |
| **Reference** | Related modules, documentation, examples | Summarize if needed |
| **Disposable** | Old conversation turns, resolved issues, logs | Remove first |

### What to Include

```
✅ The file you're editing
✅ Its direct imports/dependencies
✅ The test file for what you're working on
✅ Error messages and stack traces
✅ Relevant type definitions
✅ API contracts (interfaces, schemas)
```

### What to Exclude

```
❌ Entire node_modules or vendor directories
❌ Build output / compiled files
❌ Lock files (package-lock.json, yarn.lock)
❌ Large data fixtures
❌ Git history
❌ Binary files
❌ Unrelated modules
```

## Compaction Strategies

When approaching context limits, compact the conversation:

### Trigger Conditions

- Context window > 80% full
- Conversation exceeds 20 turns
- Repeated information across messages
- Task focus has shifted significantly

### Compaction Techniques

**1. Summarize Completed Work**
```
Instead of keeping 15 messages about a bug fix:
"Fixed the auth token refresh race condition in src/auth/refresh.ts
by adding a mutex lock. Tests pass. Coverage at 92%."
```

**2. Drop Resolved Context**
```
Remove: Error messages from bugs already fixed
Remove: Exploration of approaches not taken
Remove: Verbose command output already processed
```

**3. Reference Files Instead of Including Them**
```
Instead of pasting a 500-line file:
"See src/services/UserService.ts — particularly the
createUser method (lines 45-80) and validateInput (lines 82-110)."
```

**4. Consolidate Instructions**
```
Instead of scattered corrections across messages:
"Requirements update: The API returns paginated results,
uses camelCase, requires auth header, and rate-limits at 100 req/min."
```

### Context Preservation Priorities

When compacting, always preserve:

1. **Current objective** — What are we trying to accomplish?
2. **Key decisions made** — Why did we choose this approach?
3. **Active constraints** — What limitations apply?
4. **Unresolved issues** — What still needs attention?
5. **File paths** — Where is the relevant code?

## Prompt Engineering for Efficiency

### Be Specific

```
❌ "Help me with this code"
✅ "Add input validation to the createUser function in src/api/users.ts.
    Validate email format, password length (8-64 chars), and name (non-empty)."
```

### Provide Structure

```
❌ "There's a bug somewhere in the auth flow"
✅ "Bug: Login returns 401 even with valid credentials.
    File: src/auth/login.ts
    Line: 42 (comparePassword call)
    Error: bcrypt.compare returns false
    Expected: Returns true for matching password"
```

### Batch Related Requests

```
❌ Message 1: "Add a name field"
   Message 2: "Also add email"
   Message 3: "And phone number"

✅ "Add three fields to the User form:
    1. name (required, string, 1-100 chars)
    2. email (required, valid email format)
    3. phone (optional, E.164 format)"
```

## Skill and Instruction File Optimization

### Keep Skill Files Focused

Each skill file should be:
- Under 200 lines
- Focused on one specific topic
- Using concise examples (minimal but complete)
- Structured with scannable headers

### Instruction File Sizes

| File | Target Size | Purpose |
|------|-------------|---------|
| system-prompts.md | < 100 lines | High-level identity and behavior |
| coding-instructions.md | < 150 lines | Code style and conventions |
| testing-instructions.md | < 100 lines | Test patterns and coverage targets |
| security-instructions.md | < 100 lines | Security requirements |

### AGENTS.md Optimization

- Keep each agent definition concise (10-20 lines)
- Use references to skill files rather than duplicating content
- Focus on triggers, constraints, and model selection

## Monitoring Token Usage

### Signs of Poor Token Economy

- Sessions ending mid-task due to context exhaustion
- Repeating the same information across messages
- Including entire files when only a few lines are relevant
- Not summarizing completed work
- Asking for the same file to be read multiple times

### Signs of Good Token Economy

- Completing complex tasks within a single session
- Clean context with only relevant information
- Summarized decision history
- Targeted file references (line ranges, not entire files)
- Appropriate model selection per task

## Checklist

- [ ] Estimate token cost before including large files
- [ ] Route tasks to the appropriate model (Opus/Sonnet/Haiku)
- [ ] Prioritize context by critical → important → reference → disposable
- [ ] Compact conversation when approaching 80% context usage
- [ ] Preserve key decisions and current objectives during compaction
- [ ] Write specific, structured prompts
- [ ] Batch related requests into single messages
- [ ] Keep skill and instruction files concise
