# /go-review

## Overview

The Go Review command performs a Go-specific code review that combines static analysis tools with idiomatic Go pattern checking. It runs `go vet` and `staticcheck`, reviews error handling practices, checks for Go idioms, and produces a consolidated review report.

**Model:** Sonnet 4.5

## Usage

```
/go-review <file or package>
```

**Arguments:**

| Argument | Required | Description |
|----------|----------|-------------|
| `file or package` | Yes | A Go file path or package pattern (e.g., `./cmd/server/`, `./...`) |

## Prerequisites

- Go toolchain installed and available in `PATH`.
- `staticcheck` installed (`go install honnef.co/go/tools/cmd/staticcheck@latest`).
- The project must have a valid `go.mod` file.

## Workflow Steps

1. **Run go vet** -- Execute `go vet` on the target package to catch suspicious constructs: Printf format mismatches, unreachable code, incorrect struct tags, and other common mistakes.
2. **Run staticcheck** -- Execute `staticcheck` for deeper analysis: deprecated API usage, inefficient code, simplifiable expressions, and unused identifiers.
3. **Check Idioms** -- Review the code for Go idiom adherence: proper use of `context.Context`, correct `defer` placement, idiomatic error variable naming (`err` not `e`), interface compliance, and struct initialization style.
4. **Review Error Handling** -- Examine every error return for proper handling: no silently ignored errors, consistent wrapping with `%w` for `fmt.Errorf`, sentinel error usage where appropriate, and error type assertions using `errors.Is`/`errors.As`.
5. **Generate Report** -- Consolidate all findings into a single report, deduplicated and sorted by severity.

## Example

```
/go-review ./internal/auth/
```

**Interaction:**

```
Running go vet on ./internal/auth/... clean
Running staticcheck on ./internal/auth/... 2 findings

## Go Review: ./internal/auth/

### Critical (1)
- **handler.go:67:** Error from `db.QueryRow().Scan()` is ignored.
  The returned error must be checked. Unchecked database errors can
  cause nil pointer panics downstream.

### Warning (2)
- **middleware.go:23:** (SA1029) should not use built-in type string
  as key for context.WithValue. Define a custom unexported type.
- **handler.go:34:** Error wrapped with `fmt.Errorf("failed: %v", err)`
  should use `%w` verb to preserve error chain for `errors.Is()`.

### Suggestion (2)
- **token.go:12:** Function `validateToken` returns `(bool, error)`.
  Prefer returning only `error` -- callers already check the error.
- **handler.go:5-9:** Five unused imports detected by staticcheck.

### Idiom (1)
- **middleware.go:45:** `defer rows.Close()` should appear immediately
  after the error check on the `Query()` call, not 10 lines later.

Summary: 1 critical, 2 warnings, 2 suggestions, 1 idiom note
```

## Output Format

The report follows the same structure as `/code-review` with an additional **Idiom** severity level:

| Severity | Meaning |
|----------|---------|
| Critical | Must fix -- ignored errors, data races, panics |
| Warning | Should fix -- staticcheck findings, improper wrapping |
| Suggestion | Could improve -- API design, simplification |
| Idiom | Go convention -- defer placement, naming, context usage |

## Notes

- This command is the Go-specific counterpart to `/code-review`. Use it for all Go codebases.
- If `staticcheck` is not installed, the command will offer to install it automatically.
- Findings from `go vet` and `staticcheck` are deduplicated before inclusion in the report.
- The command respects `//nolint` directives and will not flag suppressed warnings.
- Pair with `/go-test` to ensure found issues are covered by tests after fixing.
