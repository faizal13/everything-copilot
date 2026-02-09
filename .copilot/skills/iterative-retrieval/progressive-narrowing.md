# Progressive Narrowing

## Search Strategy Selection

| Situation | Strategy |
|-----------|---------|
| Know nothing about the codebase | Breadth-first: scan structure, then narrow |
| Know the domain but not the file | Keyword search with grep, narrow by relevance |
| Know the file but not the function | Read the file, search within it |
| Looking for usage patterns | Reverse search: find callers/importers |
| Debugging a specific error | Stack trace search: follow the error path |

## Keyword Refinement

### Too many results → Narrow
```bash
# Too broad (500+ hits)
grep -r "error" src/

# Add specificity
grep -r "ValidationError" src/
grep -r "ValidationError" src/api/ --include='*.ts'
```

### Too few results → Broaden
```bash
# Too specific (0 hits)
grep -r "handleUserAuthenticationError" src/

# Broaden progressively
grep -r "handleAuth" src/
grep -r "auth.*error" src/ -i
grep -r "auth" src/ --include='*.ts'
```

## File Type Filtering

Prioritize by file type based on task:

| Task | Priority File Types |
|------|-------------------|
| Understanding behavior | `.ts`, `.js`, `.py`, `.go` (source) |
| Understanding contracts | `.d.ts`, `types.ts`, `interfaces.go` |
| Understanding tests | `.test.*`, `.spec.*`, `*_test.go` |
| Understanding config | `.env`, `.yaml`, `.json`, `.toml` |
| Understanding deployment | `Dockerfile`, `*.yml` (CI), `terraform` |

## Directory Scoping

Narrow search to relevant directories:

```
Level 0: ./ (entire project — last resort)
Level 1: ./src/ (source code only)
Level 2: ./src/modules/auth/ (specific module)
Level 3: ./src/modules/auth/services/ (specific layer)
```

Start at Level 1-2. Go to Level 0 only if nothing found.

## Cross-Reference Strategies

### Find Callers
```bash
# Who calls this function?
grep -rn "processPayment(" src/ --include='*.ts'
```

### Find Implementations
```bash
# Who implements this interface?
grep -rn "implements PaymentProcessor" src/ --include='*.ts'
# Or in Go:
grep -rn "func.*PaymentProcessor" src/ --include='*.go'
```

### Follow Imports
```bash
# What does this file import?
head -30 src/services/payment.ts | grep "import"

# Who imports this file?
grep -rn "from.*payment" src/ --include='*.ts'
```

## Termination Criteria

Stop searching when:

| Criterion | Confidence Level |
|-----------|-----------------|
| Found the exact function/file needed | High — proceed |
| Found 3+ related files, understand the pattern | High — proceed |
| Read 10+ files, still unclear | Medium — ask for clarification |
| Multiple search strategies tried, nothing relevant | Low — task may be misunderstood |
| Time budget exceeded (5+ minutes of pure search) | Any — summarize what's known, proceed with caveats |
