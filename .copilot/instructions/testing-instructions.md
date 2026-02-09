# Testing Instructions

These instructions govern how tests are written, structured, and maintained across all languages and frameworks.

## Testing Philosophy
- Tests verify behavior, not implementation. If you refactor internals without changing behavior, tests should still pass.
- TDD is preferred: write a failing test first, then make it pass, then refactor.
- Every bug fix starts with a test that reproduces the bug.
- Tests are production code. Apply the same quality standards.

## Test Structure

### Arrange-Act-Assert (AAA)
Every test follows this pattern:
```
1. Arrange: Set up the preconditions and inputs.
2. Act:     Execute the behavior being tested.
3. Assert:  Verify the expected outcome.
```

Separate the three sections with a blank line for readability.

### Naming
- Test names describe the scenario, not the function: `returns_empty_list_when_no_users_match_filter`, not `test_filter_users`.
- Use a consistent pattern: `[unit]_[scenario]_[expected_result]` or a sentence that reads naturally.
- Group related tests in a describe/context block named after the unit under test.

### One Assertion Per Test
- Each test verifies one behavior. If a test needs multiple assertions, they should all verify the same logical outcome.
- Do not test unrelated behaviors in the same test.
- Use parameterized tests for the same behavior with different inputs.

## What to Test

### Always Test
- Happy path: the expected use case works correctly.
- Error paths: invalid input, missing data, network failures, timeouts.
- Edge cases: null, empty string, empty array, zero, negative numbers, boundary values.
- State transitions: before and after an operation that changes state.
- Return values, thrown errors, and side effects (in that priority order).

### Coverage Targets
- Aim for 80%+ line coverage on new code.
- 100% coverage on critical paths (authentication, payments, data integrity).
- Coverage is a guide, not a goal. Do not write meaningless tests to hit a number.

## Mocking and Test Doubles

### What to Mock
- External services (APIs, databases, file system, network).
- Time-dependent behavior (use a clock abstraction).
- Randomness (use a seed or injectable generator).

### What Not to Mock
- The unit under test.
- Simple internal dependencies (data transformations, utility functions).
- Standard library functions.

### Mock Hygiene
- Reset mocks between tests. Shared mutable state causes flaky tests.
- Verify mock interactions only when the interaction **is** the behavior (e.g., "sends an email").
- Prefer fakes (in-memory implementations) over mocks for complex dependencies.

## Test Quality

### Determinism
- Tests must produce the same result every time they run.
- No dependencies on system time, random values, or external state.
- No dependencies on test execution order.
- No sleep or timing-based assertions. Use polling or event-based waits.

### Speed
- Unit tests should run in milliseconds. If a unit test is slow, it is testing too much.
- Integration tests may take seconds. Keep them in a separate suite.
- Tag slow tests so they can be excluded from fast feedback loops.

### Maintenance
- Delete tests for deleted features. Dead tests erode trust.
- Update tests when requirements change. Failing tests should mean broken code, not stale expectations.
- Refactor test utilities as aggressively as production code.

## Integration and End-to-End Tests
- Integration tests verify that components work together across boundaries (API, database, message queue).
- E2E tests verify critical user workflows, not every possible path.
- Use fixtures or factories to create test data. Never depend on shared mutable test data.
- Clean up test data after each test run.
