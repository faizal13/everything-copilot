# /tdd

## Overview

The TDD command drives a test-driven development workflow for a component or feature. It follows the classic Red-Green-Refactor cycle: write a failing test first, implement the minimum code to make it pass, then refactor while keeping tests green. Coverage is verified to meet or exceed 80%.

**Model:** Sonnet 4.5

## Usage

```
/tdd <component/feature>
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `component/feature` | Yes | The name or path of the component or feature to develop |

## Prerequisites

- A test framework configured in the project (Jest, Vitest, pytest, Go testing, etc.).
- The project builds successfully before starting the TDD cycle.
- A clear understanding of the expected behavior for the target component.

## Workflow Steps

1. **Write Failing Test** -- Create a test file (or add to an existing one) that describes the expected behavior. Run the test suite to confirm the new test fails with a meaningful error.
2. **Implement Minimum Code** -- Write the smallest amount of production code required to make the failing test pass. Avoid premature abstraction or over-engineering at this stage.
3. **Refactor** -- Improve code structure, naming, and clarity without changing behavior. Extract helpers, reduce duplication, and apply project conventions.
4. **Verify Coverage** -- Run the test suite with coverage enabled. Confirm that coverage for the changed files is at or above 80%. If below threshold, add additional test cases and repeat.

## Example

```
/tdd src/services/invoice-calculator
```

**Interaction:**

```
Step 1: Writing failing test...
Created: src/services/__tests__/invoice-calculator.test.ts
- test: calculates subtotal from line items
- test: applies percentage discount
- test: computes tax based on jurisdiction
Running tests... 3 FAILED (as expected)

Step 2: Implementing minimum code...
Created: src/services/invoice-calculator.ts
- calculateSubtotal()
- applyDiscount()
- computeTax()
Running tests... 3 PASSED

Step 3: Refactoring...
- Extracted tax rate lookup to src/services/tax-rates.ts
- Simplified discount logic with early return
Running tests... 3 PASSED

Step 4: Checking coverage...
invoice-calculator.ts: 94% coverage
tax-rates.ts: 87% coverage
All files above 80% threshold.
```

## Output Format

Each cycle step is reported with:

- The action taken (test written, code implemented, refactoring applied).
- Test run results showing pass/fail counts.
- Final coverage report as a table with file, line coverage percentage, and status.

```
| File                    | Coverage | Status |
|-------------------------|----------|--------|
| invoice-calculator.ts   | 94%      | PASS   |
| tax-rates.ts            | 87%      | PASS   |
```

## Notes

- The command adapts to the project's test framework automatically.
- If coverage drops below 80% after refactoring, the command will prompt for additional tests.
- Each TDD cycle is atomic -- if any step fails unexpectedly, the command stops and reports the issue.
- Pair this command with `/plan` to implement individual tasks from a plan using TDD.
- For Go projects, prefer `/go-test` which uses table-driven test patterns and includes benchmarks.
