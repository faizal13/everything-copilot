# /go-build

## Overview

The Go Build command diagnoses and fixes Go build errors, with specialized handling for module resolution, dependency management, and Go-specific compilation issues. It runs `go build`, parses errors, resolves module problems, and re-runs the build to verify the fix.

**Model:** Sonnet 4.5

## Usage

```
/go-build
```

**Arguments:**

This command takes no arguments. It detects the build target from `go.mod` and the project structure automatically.

## Prerequisites

- Go toolchain installed and available in `PATH`.
- A valid `go.mod` file at the project root.
- Network access may be needed for `go mod tidy` to resolve remote dependencies.

## Workflow Steps

1. **Run go build** -- Execute `go build ./...` to compile all packages in the module. Capture compiler output, linker errors, and any build constraint issues.
2. **Parse Errors** -- Extract structured error data: file path, line number, error type, and message. Categorize errors into: syntax errors, type errors, import errors, and module errors.
3. **Fix Module and Dependency Issues** -- For module-related errors, run `go mod tidy` to synchronize dependencies. For version conflicts, analyze the dependency graph with `go mod graph` and resolve to compatible versions. For missing packages, add them with `go get`.
4. **Re-run Build** -- Execute `go build ./...` again to verify all errors are resolved. If new errors surface, repeat from step 2 for up to three cycles.

## Example

```
/go-build
```

**Interaction:**

```
Running: go build ./...

Build failed with 4 errors:

Error 1: cmd/server/main.go:8:2
  cannot find module providing package github.com/example/newlib
  Root cause: dependency not in go.mod
  Fix: go get github.com/example/newlib@latest

Error 2: internal/handler/auth.go:23:15
  cannot use token (variable of type string) as jwt.Token
  Root cause: jwt library upgraded, Token is now a struct
  Fix: Update to use jwt.Parse() which returns *jwt.Token

Error 3: internal/handler/auth.go:31:9
  undefined: jwt.StandardClaims
  Root cause: StandardClaims removed in jwt/v5, replaced by RegisteredClaims
  Fix: Replace jwt.StandardClaims with jwt.RegisteredClaims

Error 4: internal/db/migrate.go:5:2
  imported and not used: "fmt"
  Root cause: unused import left after refactor
  Fix: Remove unused import

Running: go mod tidy
Running: go build ./...

Build cycle 2: PASSED
Applied 4 fixes across 3 files.
```

## Output Format

Each build cycle reports:

- The build command executed and result (pass/fail with error count).
- For each error: file location, error message, root cause category, and fix applied.
- Module operations performed (`go mod tidy`, `go get`).
- Final build status.

```
Build Cycle 1: FAILED (4 errors)
  Module fixes: 1 (go get)
  Code fixes: 3
  go mod tidy: ran
Build Cycle 2: PASSED
```

## Notes

- This is the Go-specific counterpart to `/build-fix`. Use it for all Go projects.
- Module version conflicts are resolved conservatively, preferring the minimum version that satisfies all dependents (following Go's MVS algorithm).
- The command will not upgrade major versions automatically -- major version bumps require explicit confirmation due to potential breaking changes.
- `go mod tidy` is always run after dependency changes to keep `go.mod` and `go.sum` consistent.
- A maximum of four build cycles are attempted before stopping.
- After fixing, consider running `/go-test` to verify tests still pass with the updated dependencies.
