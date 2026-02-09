# Checkpoint Evaluations

## What Checkpoints Capture

A checkpoint is a snapshot of project state at a known-good point:

```json
{
  "id": "cp-20240115-a3f2",
  "label": "pre-auth-refactor",
  "timestamp": "2024-01-15T10:30:00Z",
  "tests": { "total": 142, "passed": 142, "failed": 0, "skipped": 3 },
  "coverage": { "lines": 84.2, "branches": 78.1 },
  "lint": { "errors": 0, "warnings": 2 },
  "build": { "success": true, "duration_ms": 4200 },
  "codeHash": "sha256:a3f2c4d8e1..."
}
```

## When to Create Checkpoints

| Trigger | Reason |
|---------|--------|
| Before major refactoring | Baseline to compare against |
| After completing a feature | Known-good state to defend |
| Before dependency upgrades | Detect regressions from updates |
| At PR creation | Ensure PR doesn't degrade quality |
| At deploy milestones | Record production-ready state |

## Creating a Checkpoint

```bash
# Run all quality checks and capture results
npm test -- --json > test-results.json
npm run lint -- --format json > lint-results.json
npm run build 2>&1 | tee build-output.log

# Save checkpoint (using the checkpoint command)
node scripts/instinct-manager.js checkpoint --label "pre-refactor"
```

## Comparing Checkpoints

Compare current state against a saved checkpoint to detect regressions:

| Metric | Checkpoint | Current | Status |
|--------|-----------|---------|--------|
| Tests passing | 142 | 140 | REGRESSION |
| Coverage (lines) | 84.2% | 85.1% | IMPROVED |
| Lint errors | 0 | 0 | OK |
| Build time | 4.2s | 4.8s | WARNING |

**Regression rules:**
- Test count decreased → BLOCK
- Coverage dropped > 2% → WARNING
- Coverage dropped > 5% → BLOCK
- New lint errors introduced → WARNING
- Build broken → BLOCK

## Restoring from Checkpoints

Checkpoints don't store code — they store metrics. To restore:

1. Use git to return to the checkpoint's commit (`codeHash` → git SHA)
2. Re-run verification to confirm metrics match
3. Branch from the checkpoint commit if needed

## Automation

Integrate checkpoint comparison into CI:

```yaml
- name: Compare against baseline checkpoint
  run: |
    node scripts/checkpoint-compare.js \
      --baseline=checkpoints/main-baseline.json \
      --current=test-results.json \
      --fail-on=regression
```

## Checklist
- [ ] Checkpoint created before every major change
- [ ] Checkpoint includes: tests, coverage, lint, build status
- [ ] Regression comparison runs in CI
- [ ] Regressions in tests or build block the PR
- [ ] Coverage regressions > 5% block the PR
- [ ] Checkpoints are versioned and stored alongside code
