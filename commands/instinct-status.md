# /instinct-status

## Overview

The Instinct Status command displays all learned patterns stored in the instinct store. It shows each instinct's name, confidence score, category, description, and last-used date, giving a clear picture of the accumulated project knowledge.

## Usage

```
/instinct-status
```

**Arguments:**

This command takes no arguments. It reads from the instinct store and displays all entries.

## Prerequisites

- An instinct store must exist (defaults to `.copilot/instincts/`).
- At least one instinct must have been stored (typically via `/learn`).

## Workflow Steps

This command is a read-only display operation. It does not modify any state.

1. Load all instinct files from the instinct store directory.
2. Sort instincts by confidence score (highest first).
3. Display a formatted table with all instinct metadata.
4. Show summary statistics: total count, average confidence, category breakdown.

## Example

```
/instinct-status
```

**Interaction:**

```
## Instinct Store: 7 patterns

| # | Name                  | Confidence | Category       | Last Used           |
|---|-----------------------|------------|----------------|---------------------|
| 1 | prefer-early-return   | 0.92       | code-style     | 2025-01-15T10:30:00 |
| 2 | api-error-logging     | 0.85       | error-handling | 2025-01-14T16:20:00 |
| 3 | test-name-convention  | 0.78       | testing        | 2025-01-15T10:30:00 |
| 4 | date-fns-v3-imports   | 0.70       | dependencies   | 2025-01-13T09:15:00 |
| 5 | form-validation-order | 0.65       | frontend       | 2025-01-12T14:00:00 |
| 6 | db-transaction-scope  | 0.55       | backend        | 2025-01-10T11:30:00 |
| 7 | css-module-naming     | 0.42       | code-style     | 2025-01-08T08:00:00 |

Summary:
  Total instincts: 7
  Average confidence: 0.70
  Active (>= 0.5): 6
  Dormant (< 0.5): 1

Categories:
  code-style: 2
  error-handling: 1
  testing: 1
  dependencies: 1
  frontend: 1
  backend: 1

Dormant instincts (not actively applied):
  - css-module-naming (0.42) -- needs reinforcement to activate
```

## Output Format

The output contains:

- A numbered table of all instincts sorted by confidence, with columns: name, confidence score, category, and last-used timestamp.
- A summary section with total count, average confidence, and active/dormant breakdown.
- A category breakdown showing how many instincts exist per category.
- A list of dormant instincts (confidence below 0.5) with a note about reinforcement.

## Notes

- Instincts with confidence >= 0.5 are considered active and are applied during code generation and review.
- Instincts with confidence < 0.5 are dormant and displayed separately as needing reinforcement.
- Confidence scores update over time as patterns are applied and validated.
- Use `/instinct-export` to share your instincts with team members.
- Use `/instinct-import` to load instincts from a shared file.
- To evolve high-confidence instincts into formal skills, use `/evolve`.
