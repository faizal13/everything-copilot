# Token Optimization

## Token Estimation

Quick estimation: **1 token ≈ 4 characters** (English text). Code is slightly more token-dense.

```js
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}
```

For precision, use the model's tokenizer (tiktoken for OpenAI, Claude's tokenizer for Anthropic).

## Model Token Limits

| Model | Context Window | Cost Tier | Best For |
|-------|---------------|-----------|----------|
| Opus | 200K tokens | $$$ | Architecture, security, complex reasoning |
| Sonnet | 200K tokens | $$ | Implementation, TDD, code review |
| Haiku | 200K tokens | $ | Quick fixes, docs, formatting |

## Budget Allocation Strategy

For a typical session, allocate tokens:

```
System prompt + instructions: 15% (~30K tokens)
Context (code, search results):  60% (~120K tokens)
Output generation:               25% (~50K tokens)
```

## Reducing Token Usage

### 1. Focused Context
Only include files directly relevant to the current task. Don't dump entire directories.

### 2. Concise Prompts
```
# BAD (verbose)
"Could you please take a look at the file src/auth/service.ts and tell me if there
are any potential security vulnerabilities that you can identify?"

# GOOD (concise)
"Review src/auth/service.ts for security vulnerabilities."
```

### 3. Summary Over Raw
When referencing earlier work, summarize instead of repeating:

```
# BAD: Paste entire test output again
# GOOD: "Tests: 142 passed, 0 failed. Coverage: 84%."
```

### 4. Progressive Disclosure
Load detail on demand, not upfront:

```
Pass 1: Read file structure (50 tokens)
Pass 2: Read relevant file headers (200 tokens)
Pass 3: Read specific functions (500 tokens)
```

Total: 750 tokens vs reading entire file upfront (5000 tokens)

## Monitoring Token Usage

Track per-session usage:

```json
{
  "session": "2024-01-15-auth-refactor",
  "turns": 15,
  "tokens_used": {
    "input": 85000,
    "output": 32000,
    "total": 117000
  },
  "budget_remaining": 83000,
  "model": "sonnet"
}
```

## Cost Optimization

- Use **Haiku** for file search, formatting, and simple questions
- Use **Sonnet** for implementation and review
- Reserve **Opus** for architecture decisions and security audits
- Don't use Opus for tasks Sonnet handles equally well

## Alerting

Flag when approaching limits:

| Usage | Alert |
|-------|-------|
| 60% of budget | Info: "60% of token budget used" |
| 80% of budget | Warning: "Consider compacting context" |
| 90% of budget | Critical: "Compact now or start fresh session" |
