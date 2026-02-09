# /verify

## Overview

The Verify command runs a full verification loop against a saved checkpoint. It loads the baseline state, executes evaluations, calculates pass@k metrics, grades results against a rubric, and produces a comprehensive verification report. This is the primary quality gate in the development workflow.

**Model:** Sonnet 4.5

## Usage

```
/verify
```

**Arguments:**

This command takes no arguments. It automatically uses the most recent checkpoint, or prompts for selection if multiple exist.

## Prerequisites

- At least one saved checkpoint (created with `/checkpoint`).
- A configured test suite.
- The project must build successfully.

## Workflow Steps

1. **Load Checkpoint** -- Read the most recent checkpoint from the store. Display the baseline metrics (test counts, pass rate, timestamp) for comparison.
2. **Run Evals** -- Execute the full test suite and any additional evaluation scripts configured in the project. Capture all results with detailed output.
3. **Calculate pass@k** -- Compute pass@k metrics across multiple evaluation runs (default k=1). This measures the probability that at least one of k attempts produces a correct result.
4. **Grade Against Rubric** -- Compare current results against the checkpoint baseline and project-defined quality rubric. Rubric dimensions include: test pass rate, coverage delta, build success, and lint cleanliness.
5. **Report Results** -- Generate a verification report with pass/fail determination, metric comparisons, regressions detected, and improvement summary.

## Example

```
/verify
```

**Interaction:**

```
Loading checkpoint: auth-complete (2025-01-15T14:30:00Z)
Baseline: 84 passed, 0 failed, 2 skipped

Running evaluations...
Current: 91 passed, 0 failed, 1 skipped
Duration: 13.1s

pass@1: 1.00 (all tests passing)

Grading against rubric:
  Test pass rate:    100%    PASS (threshold: 95%)
  Coverage delta:    +3.2%   PASS (threshold: no decrease)
  Build status:      clean   PASS
  Lint status:       clean   PASS

## Verification Report: PASSED

| Metric          | Baseline | Current | Delta  | Status |
|-----------------|----------|---------|--------|--------|
| Tests passing   | 84       | 91      | +7     | PASS   |
| Tests failing   | 0        | 0       | 0      | PASS   |
| Coverage        | 81.2%    | 84.4%   | +3.2%  | PASS   |
| Build warnings  | 2        | 0       | -2     | PASS   |

New tests added: 7
Regressions: none
```

## Output Format

The verification report contains:

- Checkpoint reference with baseline metrics.
- Current evaluation results.
- pass@k score.
- Rubric grading with per-dimension pass/fail status.
- Comparison table showing baseline, current, delta, and status for each metric.
- Summary of new tests, regressions, and overall pass/fail determination.

## Notes

- If no checkpoint exists, the command will prompt you to create one first with `/checkpoint`.
- The rubric can be customized in `.copilot/config.yaml` under the `verification` key.
- pass@k with k > 1 runs evaluations multiple times and reports the best result probability.
- A verification failure does not block work -- it produces actionable feedback about what needs fixing.
- Use `/verify` as a gate before merging: it provides an objective quality assessment.
- The report integrates with `/checkpoint` to form a continuous improvement loop.
