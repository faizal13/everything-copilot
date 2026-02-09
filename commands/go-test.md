# /go-test

## Overview

The Go Test command implements a Go-specific TDD workflow centered on table-driven tests. It generates comprehensive test files with table-driven patterns, runs them with race detection and coverage, and adds benchmarks when performance-sensitive code is detected.

**Model:** Sonnet 4.5

## Usage

```
/go-test <package>
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `package` | Yes | The Go package path to test (e.g., `./internal/auth/`, `./pkg/cache`) |

## Prerequisites

- Go toolchain installed and available in `PATH`.
- The target package must compile without errors.
- Existing tests in the package will be preserved and extended.

## Workflow Steps

1. **Write Table-Driven Tests** -- Analyze the package's exported and internal functions. Generate table-driven tests with descriptive test case names, covering: happy paths, edge cases, error conditions, and boundary values.
2. **Run Tests** -- Execute `go test -race -v` on the package. Verify all new and existing tests pass. The `-race` flag detects data race conditions in concurrent code.
3. **Check Coverage** -- Run `go test -coverprofile` and analyze coverage. Identify uncovered code paths and add targeted test cases until the package meets the 80% threshold.
4. **Add Benchmarks** -- If the package contains performance-sensitive functions (hot loops, allocations, I/O operations), generate benchmark functions following `Benchmark*` naming conventions with `b.ReportAllocs()`.

## Example

```
/go-test ./internal/cache/
```

**Interaction:**

```
Analyzing package: ./internal/cache/
Exported functions: Get, Set, Delete, TTL
Internal functions: evict, hash

Writing table-driven tests...
Created: internal/cache/cache_test.go

func TestGet(t *testing.T) {
    tests := []struct {
        name    string
        key     string
        setup   func(*Cache)
        want    interface{}
        wantErr error
    }{
        {"existing key",    "foo", setFoo, "bar", nil},
        {"missing key",     "baz", nil,    nil,   ErrNotFound},
        {"expired key",     "old", setExpired, nil, ErrNotFound},
        {"empty key",       "",    nil,    nil,   ErrInvalidKey},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) { ... })
    }
}

Running tests: go test -race -v ./internal/cache/
  --- PASS: TestGet/existing_key (0.00s)
  --- PASS: TestGet/missing_key (0.00s)
  --- PASS: TestGet/expired_key (0.00s)
  --- PASS: TestGet/empty_key (0.00s)
  ... 16 tests passed, 0 failed

Coverage: 88.4% of statements
  Uncovered: evict() lines 45-48 (edge case: empty list)
  Added 2 more test cases -> Coverage: 93.1%

Benchmarks added:
  BenchmarkGet-8      5000000    234 ns/op    0 allocs/op
  BenchmarkSet-8      3000000    412 ns/op    1 allocs/op

All complete: 18 tests passing, 93.1% coverage, 2 benchmarks
```

## Output Format

The command produces:

- Generated test file path and function summary.
- Full test run output with pass/fail per case.
- Coverage report with percentage and uncovered lines.
- Benchmark results in standard Go bench format.

```
| Metric      | Value    |
|-------------|----------|
| Tests       | 18       |
| Pass rate   | 100%     |
| Coverage    | 93.1%    |
| Benchmarks  | 2        |
| Race issues | 0        |
```

## Notes

- This is the Go-specific counterpart to `/tdd`. Use it for all Go packages.
- Table-driven tests follow the standard Go pattern with `tests` slice and `t.Run()`.
- The `-race` flag is always enabled. Data races are treated as test failures.
- Benchmarks are only added for functions identified as performance-sensitive; use `go test -bench=.` to run them.
- Existing test files are extended, never overwritten. New test cases are appended.
- Pair with `/go-review` to ensure the code being tested follows Go idioms.
