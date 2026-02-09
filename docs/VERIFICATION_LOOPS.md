# Verification Loops

## Overview

Verification loops are continuous quality checks that run throughout a coding session. Rather than waiting until the end to test, you verify at every stage — catching regressions early and building confidence incrementally.

## The Loop

```
┌─────────────────────────────────────────┐
│  1. CHECKPOINT — Capture current state  │
│  2. CHANGE     — Implement the feature  │
│  3. EVALUATE   — Run evals against code │
│  4. COMPARE    — Diff against checkpoint│
│  5. DECIDE     — Pass → continue        │
│                  Fail → fix and re-eval │
└─────────────────────────────────────────┘
```

Every meaningful change goes through this loop. The loop is not optional — it is the primary quality mechanism.

## Checkpoints

A checkpoint captures the state of your project at a known-good point.

### What a Checkpoint Contains

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "id": "chk_abc123",
  "tests": {
    "total": 142,
    "passed": 140,
    "failed": 2,
    "skipped": 5
  },
  "coverage": {
    "lines": 84.2,
    "branches": 71.5,
    "functions": 88.0
  },
  "lint": {
    "errors": 0,
    "warnings": 3
  },
  "build": {
    "success": true,
    "duration_ms": 4200
  },
  "types": {
    "errors": 0
  }
}
```

### When to Create Checkpoints

| Trigger | Why |
|---------|-----|
| Before starting a new feature | Baseline for regression detection |
| After all tests pass | Lock in a known-good state |
| Before a risky refactor | Safety net for rollback |
| At end of session | Resume point for next session |
| Before merging PR | Final quality snapshot |

### Creating a Checkpoint

Use the `/checkpoint` command:

```
/checkpoint
```

This runs all quality checks and saves the result. You can compare future states against this checkpoint to detect regressions.

## Evaluations (Evals)

Evals are the individual quality checks that run during verification.

### Eval Types

**1. Test Suite**
```bash
# JavaScript
npm test -- --coverage

# Python
pytest --cov=src --cov-report=json

# Go
go test -coverprofile=cover.out ./...
```

**2. Type Checking**
```bash
# TypeScript
npx tsc --noEmit

# Python
mypy src/

# Go (built into compiler)
go build ./...
```

**3. Linting**
```bash
# JavaScript/TypeScript
npx eslint src/

# Python
ruff check src/

# Go
golangci-lint run
```

**4. Build Verification**
```bash
# Verify the project compiles/bundles cleanly
npm run build
# or
go build ./...
```

**5. Security Scan**
```bash
npm audit
# or
pip-audit
# or
govulncheck ./...
```

### Eval Results Schema

Each eval produces a standardized result:

```json
{
  "eval": "test-suite",
  "status": "pass",
  "score": 0.986,
  "details": {
    "total": 142,
    "passed": 140,
    "failed": 2,
    "duration_ms": 3200
  },
  "threshold": 0.95,
  "passed_threshold": true
}
```

## Continuous Evaluation

Rather than running all evals at the end, run them incrementally:

### Quality Gates

| Gate | When | What Runs | Fail Action |
|------|------|-----------|-------------|
| **Per-save** | On file save | Lint + type check | Show inline errors |
| **Per-commit** | Before commit | Tests + lint + types | Block commit |
| **Pre-push** | Before push | Full test suite + coverage | Block push |
| **Pre-merge** | PR review | All evals + security scan | Block merge |

### Incremental Testing

Run only tests affected by the change:

```bash
# Jest — changed files only
npx jest --onlyChanged

# Vitest — watch mode
npx vitest --changed

# Go — specific package
go test ./pkg/auth/...

# pytest — last failed
pytest --lf
```

## pass@k Metrics

pass@k measures the probability that at least one of k generated solutions passes all tests.

### Formula

```
pass@k = 1 - C(n-c, k) / C(n, k)
```

Where:
- `n` = total solutions generated
- `c` = solutions that pass
- `k` = number of attempts allowed

### Practical Examples

| n (total) | c (correct) | k (attempts) | pass@k |
|-----------|-------------|--------------|--------|
| 10 | 5 | 1 | 50.0% |
| 10 | 5 | 3 | 83.3% |
| 10 | 5 | 5 | 97.2% |
| 10 | 8 | 1 | 80.0% |
| 10 | 8 | 3 | 98.3% |

### Interpreting pass@k

- **pass@1 > 80%** — Model reliably solves the task on first try
- **pass@1 < 50%, pass@5 > 90%** — Model can solve it but needs retries; improve prompting
- **pass@5 < 50%** — Task is too hard or underspecified; break it down

## Grading Rubric

Every eval result is graded on five dimensions:

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| **Correctness** | 30% | Does it produce the right output? |
| **Completeness** | 25% | Does it handle all requirements? |
| **Code Quality** | 20% | Clean, readable, maintainable? |
| **Performance** | 15% | Efficient? No unnecessary work? |
| **Security** | 10% | Safe inputs, proper auth, no leaks? |

### Scoring Scale

| Score | Label | Meaning |
|-------|-------|---------|
| 5 | Excellent | Exceeds requirements, production-ready |
| 4 | Good | Meets all requirements, minor improvements possible |
| 3 | Acceptable | Meets core requirements, notable gaps |
| 2 | Below Standard | Missing requirements or significant issues |
| 1 | Failing | Does not meet basic requirements |

### Overall Score

```
overall = (correctness × 0.30) + (completeness × 0.25) +
          (quality × 0.20) + (performance × 0.15) + (security × 0.10)
```

- **≥ 4.0** → Ship it
- **3.0 – 3.9** → Fix issues, re-evaluate
- **< 3.0** → Significant rework needed

## Regression Detection

Compare current eval results against the last checkpoint:

```
Checkpoint (chk_abc123)     Current           Delta
─────────────────────────────────────────────────────
Tests:    140/142 pass      138/145 pass      -2 pass, +3 new
Coverage: 84.2% lines       82.1% lines       -2.1% ⚠️
Lint:     0 errors           2 errors          +2 ⚠️
Build:    passing            passing           ✓
Types:    0 errors           0 errors          ✓
```

### Regression Rules

1. **Test count must not decrease** — Deleting tests requires justification
2. **Coverage must not drop > 2%** — New code needs proportional tests
3. **Lint errors must not increase** — Fix as you go
4. **Build must stay green** — Non-negotiable
5. **Type errors must stay at zero** — In strict-mode projects

## Workflow Integration

### With /tdd

```
1. /checkpoint              → Save baseline
2. Write failing test       → RED
3. /verify                  → Confirm test fails
4. Implement minimum code   → GREEN
5. /verify                  → Confirm test passes, no regressions
6. Refactor                 → CLEAN
7. /verify                  → Confirm still green
8. /checkpoint              → Save new baseline
```

### With /code-review

```
1. /checkpoint              → Save pre-review state
2. /code-review             → Identify issues
3. Fix critical issues      → Apply changes
4. /verify                  → Confirm fixes don't regress
5. /checkpoint              → Save post-review state
```

### In CI/CD

```yaml
# GitHub Actions example
- name: Load checkpoint
  run: node scripts/load-checkpoint.js

- name: Run full verification
  run: |
    npm test -- --coverage
    npx tsc --noEmit
    npx eslint src/
    npm run build

- name: Compare against checkpoint
  run: node scripts/compare-checkpoint.js

- name: Fail on regression
  run: node scripts/check-regressions.js
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Verify only at the end | Regressions pile up | Verify after every change |
| Skip verification for "small" changes | Small changes cause big bugs | Always verify |
| Ignore coverage drops | Technical debt accumulates | Enforce coverage thresholds |
| No checkpoints | No rollback safety net | Checkpoint before risky changes |
| Testing only happy path | Edge cases crash production | Test error paths and boundaries |

## Checklist

- [ ] Checkpoints created before features and refactors
- [ ] All five eval types running (tests, types, lint, build, security)
- [ ] Quality gates enforced at commit, push, and merge
- [ ] pass@k tracked for generated code quality
- [ ] Regression detection comparing against checkpoints
- [ ] Grading rubric applied to significant changes
- [ ] CI/CD pipeline includes verification loop
