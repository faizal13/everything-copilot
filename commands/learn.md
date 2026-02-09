# /learn

## Overview

The Learn command analyzes the current session to extract reusable patterns and stores them as instincts. It reviews the actions taken, decisions made, and corrections applied during the session, then distills them into scored patterns that improve future sessions.

**Model:** Haiku 4.5

## Usage

```
/learn
```

**Arguments:**

This command takes no arguments. It operates on the current session context.

## Prerequisites

- An active session with meaningful interactions (at least several exchanges involving code changes, reviews, or debugging).
- The instinct store must be writable (defaults to `.copilot/instincts/`).

## Workflow Steps

1. **Analyze Session History** -- Walk through the session transcript and identify key actions: files modified, commands run, errors encountered, corrections made, and patterns applied.
2. **Identify Reusable Patterns** -- Extract generalizable patterns from the session. Examples include recurring fix strategies, preferred code structures, naming conventions applied, and debugging approaches that worked.
3. **Score Confidence** -- Assign a confidence score (0.0 to 1.0) to each pattern based on how consistently it was applied and whether it led to successful outcomes.
4. **Store as Instincts** -- Save each pattern to the instinct store with metadata: name, description, category, confidence score, source session, and timestamp.

## Example

```
/learn
```

**Interaction:**

```
Analyzing session (23 interactions)...

Extracted 4 patterns:

1. "prefer-early-return" (confidence: 0.92)
   Category: code-style
   When writing conditionals, use early returns instead of deep nesting.
   Source: Applied 3 times during refactoring, all successful.

2. "api-error-logging" (confidence: 0.85)
   Category: error-handling
   Always log the original error before wrapping in a custom exception.
   Source: Corrected this pattern twice during code review.

3. "test-name-convention" (confidence: 0.78)
   Category: testing
   Use format: "should <expected behavior> when <condition>".
   Source: Consistently applied in all new tests this session.

4. "date-fns-v3-imports" (confidence: 0.70)
   Category: dependencies
   Import named exports from 'date-fns' root, not subpaths.
   Source: Fixed build error caused by incorrect import path.

Stored 4 instincts to .copilot/instincts/
```

## Output Format

The command outputs:

- Session analysis summary (number of interactions reviewed).
- A numbered list of extracted patterns, each with: name, confidence score, category, description, and source context.
- Confirmation of storage location and count.

Instincts are persisted as JSON in the instinct store:

```json
{
  "name": "prefer-early-return",
  "description": "Use early returns instead of deep nesting in conditionals",
  "category": "code-style",
  "confidence": 0.92,
  "source_session": "2025-01-15T10:30:00Z",
  "last_used": "2025-01-15T10:30:00Z"
}
```

## Notes

- Run `/learn` at the end of a productive session to capture insights before context is lost.
- Instincts with confidence below 0.5 are stored but not actively applied until reinforced.
- Duplicate patterns are merged, and confidence scores are updated using a weighted average.
- Use `/instinct-status` to view all stored instincts and their scores.
- Instincts feed into `/evolve`, which clusters related instincts into formal skills.
