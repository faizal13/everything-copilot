# Continuous Evaluations

## Philosophy

Don't wait until the end to verify. Evaluate continuously as changes are made, catching regressions immediately rather than at PR review time.

## Eval Triggers

| Trigger | What to Evaluate |
|---------|-----------------|
| After every file save | Lint the changed file, run related tests |
| After every code change | Type checking, test suite for affected module |
| After every commit | Full test suite, coverage check |
| After dependency update | Full test suite, security scan |
| After config change | Build verification, smoke tests |

## Incremental Evaluation

Only evaluate what changed — don't re-run the entire suite on every save:

```bash
# Jest: run only tests related to changed files
jest --onlyChanged

# pytest: run tests affected by changes (pytest-testmon)
pytest --testmon

# Go: test specific package
go test ./pkg/auth/...
```

## Eval Result Tracking

Track results over time to detect trends:

```json
{
  "evalHistory": [
    { "timestamp": "10:30", "tests": 142, "passed": 142, "duration": 4.2 },
    { "timestamp": "10:45", "tests": 145, "passed": 144, "duration": 4.5 },
    { "timestamp": "11:00", "tests": 145, "passed": 145, "duration": 4.3 }
  ]
}
```

**Trend signals:**
- Test count growing → Good (more coverage)
- Test count shrinking → Investigate (deleted tests?)
- Duration increasing > 20% → Performance concern
- Flaky tests appearing → Fix immediately (erodes trust in suite)

## Quality Gates

Define thresholds that must pass before proceeding:

```
GATE 1 (per-save): Lint passes, types check
GATE 2 (per-commit): Related tests pass
GATE 3 (pre-push): Full test suite passes, coverage ≥ 80%
GATE 4 (pre-merge): All of above + security scan + build succeeds
```

## Handling Failures

When a continuous eval fails:

1. **Stop and fix immediately** — don't accumulate failures
2. **Check if the failure is in your change** — not a pre-existing flaky test
3. **If flaky test** — quarantine it (mark as `@flaky` or `xfail`) and file a ticket
4. **If real regression** — revert the change, understand why, fix, re-apply

## Integration with Agent Workflow

The agent should:
1. Run relevant tests after every code change it makes
2. Report test results before moving to the next task
3. Fix failures before proceeding (don't leave broken tests)
4. Update checkpoint if all evals pass and a milestone is reached

## Checklist
- [ ] Tests run automatically on relevant file changes
- [ ] Incremental testing configured (not full suite on every save)
- [ ] Quality gates defined for each stage (save, commit, push, merge)
- [ ] Eval results tracked over time for trend detection
- [ ] Flaky tests quarantined and tracked for fixes
- [ ] Agent fixes failures immediately, not deferred
