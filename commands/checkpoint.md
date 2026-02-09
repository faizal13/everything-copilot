# /checkpoint

## Overview

The Checkpoint command captures a snapshot of the current verification state. It runs all tests, records their results alongside the current code state, and saves everything under a named label. Checkpoints serve as baselines for the `/verify` command to measure progress against.

**Model:** Haiku 4.5

## Usage

```
/checkpoint <label>
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `label` | Yes | A descriptive name for this checkpoint (e.g., `pre-refactor`, `auth-complete`) |

## Prerequisites

- A configured test suite that can be executed from the project root.
- The project must build successfully before a checkpoint can be saved.
- Write access to the checkpoint store (defaults to `.copilot/checkpoints/`).

## Workflow Steps

1. **Run All Tests** -- Execute the full test suite using the project's configured test runner. Capture pass, fail, skip, and error counts.
2. **Capture Test Results** -- Record the result of every individual test case: name, status, duration, and any failure messages.
3. **Record Code State** -- Save the current git commit hash (or working tree hash if uncommitted changes exist) and a list of all modified files.
4. **Save Checkpoint** -- Write the checkpoint to the store with the provided label, timestamp, test results, and code state reference.

## Example

```
/checkpoint auth-complete
```

**Interaction:**

```
Running test suite...
Tests: 84 passed, 2 skipped, 0 failed
Duration: 12.4s

Recording code state...
Commit: a1b2c3d (HEAD)
Modified files: 0 (clean working tree)

Checkpoint saved: auth-complete
  Location: .copilot/checkpoints/auth-complete.json
  Tests: 84 passed, 2 skipped
  Timestamp: 2025-01-15T14:30:00Z
```

## Output Format

The checkpoint confirmation includes:

- Test run summary: passed, failed, skipped counts and total duration.
- Code state: commit hash and working tree status.
- Storage path and timestamp.

The checkpoint file is stored as JSON:

```json
{
  "label": "auth-complete",
  "timestamp": "2025-01-15T14:30:00Z",
  "git_ref": "a1b2c3d",
  "working_tree_clean": true,
  "test_results": {
    "passed": 84,
    "failed": 0,
    "skipped": 2,
    "duration_ms": 12400,
    "cases": [
      {
        "name": "auth handler validates JWT",
        "status": "passed",
        "duration_ms": 45
      }
    ]
  }
}
```

## Notes

- Checkpoints do not save file contents -- they reference the git state. Ensure changes are committed or stashed.
- If tests fail, the checkpoint is still saved but marked with a warning so `/verify` can track improvement.
- Labels must be unique. Saving with an existing label will prompt for overwrite confirmation.
- Use descriptive labels that indicate the milestone (e.g., `pre-migration`, `v2-api-done`).
- Checkpoints are consumed by `/verify` to compare before-and-after states.
