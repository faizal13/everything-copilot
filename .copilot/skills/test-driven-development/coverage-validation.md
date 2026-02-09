# Coverage Validation

## Coverage Targets

| Scope | Line Coverage | Branch Coverage |
|-------|-------------|----------------|
| Overall project | ≥ 80% | ≥ 70% |
| Critical paths (auth, payment, data) | ≥ 90% | ≥ 85% |
| New code (PR diff) | ≥ 90% | ≥ 80% |
| Utility/helper functions | ≥ 95% | ≥ 90% |

## Line vs Branch Coverage

```js
function getDiscount(user) {
  if (user.isPremium) {      // Branch: true/false
    return user.age > 60     // Branch: true/false
      ? 0.20
      : 0.10;
  }
  return 0;
}
```

- **Line coverage**: Did every line execute? (4 paths collapse to fewer lines)
- **Branch coverage**: Did every boolean condition evaluate to both true AND false?

Branch coverage catches more bugs. A function can have 100% line coverage but miss untested branches.

## Configuration by Language

### JavaScript (Jest)
```json
{
  "coverageThreshold": {
    "global": { "branches": 80, "functions": 80, "lines": 80, "statements": 80 },
    "./src/auth/": { "branches": 90, "lines": 90 }
  }
}
```

### Python (pytest-cov)
```ini
[tool.coverage.report]
fail_under = 80
exclude_lines = ["pragma: no cover", "if TYPE_CHECKING:", "if __name__"]
```

### Go
```bash
go test -coverprofile=cover.out -covermode=atomic ./...
go tool cover -func=cover.out    # Summary
go tool cover -html=cover.out    # Visual report
```

## Mutation Testing

Coverage tells you what code ran during tests. Mutation testing tells you if your tests actually **verify** the code's behavior.

**How it works:**
1. Tool modifies (mutates) your source code (e.g., changes `>` to `>=`)
2. Runs your tests against the mutant
3. If tests still pass → mutant **survived** → your tests are weak there
4. If tests fail → mutant **killed** → your tests caught the change

**Tools:**
- JavaScript: [Stryker](https://stryker-mutator.io/) — `npx stryker run`
- Python: [mutmut](https://mutmut.readthedocs.io/) — `mutmut run`
- Go: [go-mutesting](https://github.com/zimmski/go-mutesting)

**Target:** Kill rate ≥ 80% of mutants

## What to Exclude from Coverage

```
tests/                  # Test files themselves
**/migrations/          # Generated database migrations
**/*.d.ts               # TypeScript declaration files
**/generated/           # Auto-generated code (protobuf, GraphQL codegen)
**/__mocks__/           # Mock files
**/config/              # Configuration-only files
```

## Coverage in CI/CD

```yaml
# GitHub Actions example
- name: Run tests with coverage
  run: npm test -- --coverage --coverageReporters=json-summary

- name: Check coverage threshold
  run: |
    COVERAGE=$(node -e "console.log(require('./coverage/coverage-summary.json').total.lines.pct)")
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "Coverage ${COVERAGE}% is below 80% threshold"
      exit 1
    fi
```

## When 100% Coverage is Counterproductive

- Simple getters/setters with no logic
- Framework boilerplate (config files, module declarations)
- UI layout code (better tested with visual/E2E tests)
- Third-party library wrappers (you're testing their code, not yours)

Focus coverage effort on code with **branching logic, calculations, and business rules**.

## Coverage Improvement Strategies

1. **Start with uncovered branches** — find functions with < 50% branch coverage
2. **Test error paths** — most coverage gaps are in error handling
3. **Test edge cases** — null, empty, boundary values, zero, negative
4. **Don't chase numbers** — writing tests for getters to hit 100% doesn't improve quality

## Checklist
- [ ] Coverage thresholds enforced in CI (fail build if below)
- [ ] Branch coverage measured, not just line coverage
- [ ] Critical paths have higher coverage requirements
- [ ] Generated/config code excluded from coverage
- [ ] Coverage trends tracked over time (not just current snapshot)
- [ ] Mutation testing run periodically on critical modules
