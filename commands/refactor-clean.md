# /refactor-clean

## Overview

The Refactor Clean command identifies and removes dead code, fixes DRY violations, and simplifies overly complex logic. It performs safe, behavior-preserving transformations and verifies that all existing tests continue to pass after each change.

**Model:** Sonnet 4.5

## Usage

```
/refactor-clean <scope>
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `scope` | Yes | A file path, directory, or glob pattern defining the refactoring scope |

## Prerequisites

- A passing test suite. The command will abort if tests fail before refactoring begins.
- Version-controlled source files so changes can be reviewed and reverted.
- The project must build successfully before starting.

## Workflow Steps

1. **Detect Unused Code** -- Scan the scope for unreachable code, unused imports, unexported dead functions, and orphaned files with no references. Use static analysis and import/export tracing.
2. **Find DRY Violations** -- Identify duplicated logic, copy-pasted blocks, and repeated patterns that could be extracted into shared utilities or helper functions.
3. **Simplify Complex Logic** -- Flag functions with high cyclomatic complexity, deeply nested conditionals, and overly long parameter lists. Propose simplifications such as early returns, guard clauses, and decomposition into smaller functions.
4. **Verify Tests Pass** -- After each refactoring transformation, run the test suite to confirm no regressions were introduced. If a test fails, revert the last change and report it.

## Example

```
/refactor-clean src/services/
```

**Interaction:**

```
Pre-check: running tests... 47 passed, 0 failed

## Refactoring Report: src/services/

### Dead Code Removed
- src/services/legacy-auth.ts: entire file unused (no imports found)
- src/services/user-service.ts: removed unused function `formatPhoneV1()`
- src/services/order-service.ts: removed 3 unused imports

### DRY Violations Fixed
- Extracted `validateEmail()` from user-service.ts and order-service.ts
  into src/utils/validators.ts (was duplicated in both files)
- Consolidated date formatting logic into src/utils/dates.ts

### Complexity Reduced
- src/services/pricing-service.ts: `calculatePrice()` simplified
  from 42 lines to 18 lines using early returns and lookup table
  Cyclomatic complexity: 12 -> 4

Post-check: running tests... 47 passed, 0 failed
Files changed: 6 | Lines removed: 128 | Lines added: 34
```

## Output Format

The report is organized into three sections:

- **Dead Code Removed** -- List of deleted files, functions, and imports with reasoning.
- **DRY Violations Fixed** -- Extracted utilities and consolidated logic with before/after locations.
- **Complexity Reduced** -- Simplified functions with complexity metrics before and after.

A summary footer shows total files changed, lines removed, and lines added.

## Notes

- The command never changes observable behavior. All transformations are strictly structural.
- If tests fail after a transformation, that specific change is reverted and flagged in the report.
- Use a narrow scope for focused cleanup or a broad scope (e.g., `src/`) for a full sweep.
- The command respects `// @keep` or `// nolint:unused` annotations to skip intentionally retained code.
- Pair with `/code-review` beforehand to identify areas that need the most cleanup.
