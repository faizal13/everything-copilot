# Commands Reference

## Quick Reference

| Command | Description | Agent | Model |
|---------|------------|-------|-------|
| `/plan` | Create implementation plan | Planner | Sonnet |
| `/tdd` | Test-driven development workflow | TDD | Sonnet |
| `/code-review` | Quality review of code | Code Reviewer | Sonnet |
| `/e2e` | Generate end-to-end tests | E2E Runner | Sonnet |
| `/build-fix` | Diagnose and fix build errors | Build Error Resolver | Sonnet |
| `/refactor-clean` | Remove dead code, optimize | Refactor Agent | Sonnet |
| `/learn` | Extract patterns from session | — | Haiku |
| `/checkpoint` | Save verification state | — | Haiku |
| `/verify` | Run verification loop | — | Sonnet |
| `/setup-pm` | Configure package manager | — | Haiku |
| `/go-review` | Go-specific code review | Go Reviewer | Sonnet |
| `/go-test` | Go TDD workflow | TDD + Go Reviewer | Sonnet |
| `/go-build` | Fix Go build errors | Go Build Resolver | Sonnet |
| `/skill-create` | Generate skill from git history | — | Sonnet |
| `/instinct-status` | View learned patterns | — | Haiku |
| `/instinct-import` | Import patterns from file | — | Haiku |
| `/instinct-export` | Export patterns to file | — | Haiku |
| `/evolve` | Cluster instincts into skills | — | Sonnet |

## Development Commands

### /plan
Creates a structured implementation plan from requirements. Outputs: ordered tasks, dependencies, acceptance criteria, effort estimates. See `commands/plan.md`.

### /tdd
Runs the RED → GREEN → REFACTOR cycle. Writes a failing test first, implements minimum code to pass, then refactors. Targets 80%+ coverage. See `commands/tdd.md`.

### /build-fix
Runs the build, parses errors, identifies root cause, applies fix, re-runs build to verify. See `commands/build-fix.md`.

### /refactor-clean
Detects dead code, DRY violations, and complexity hotspots. Removes/simplifies while keeping tests green. See `commands/refactor-clean.md`.

## Review Commands

### /code-review
Analyzes code for quality, patterns, naming, complexity, error handling. Outputs review with severity levels (critical/warning/suggestion/nitpick). See `commands/code-review.md`.

### /go-review
Go-specific review: idiomatic patterns, interface design, error handling, goroutine safety. See `commands/go-review.md`.

## Testing Commands

### /e2e
Generates Playwright or Cypress end-to-end tests from user flow descriptions. Creates page objects when needed. See `commands/e2e.md`.

### /go-test
Go-specific TDD: table-driven tests, benchmarks, coverage. See `commands/go-test.md`.

### /verify
Runs the verification loop: loads checkpoint, runs evals, calculates pass@k, grades against rubric. See `commands/verify.md`.

### /checkpoint
Saves current verification state (test results, coverage, lint, build status) for later comparison. See `commands/checkpoint.md`.

## Learning Commands

### /learn
Extracts reusable patterns from the current session. Scores confidence and stores as instincts. See `commands/learn.md`.

### /instinct-status, /instinct-import, /instinct-export
View, import, and export learned patterns. See respective files in `commands/`.

### /evolve
Clusters related instincts and suggests promoting mature clusters into formal skills. See `commands/evolve.md`.

## Setup Commands

### /setup-pm
Detects and configures the project's package manager. See `commands/setup-pm.md`.

### /skill-create
Generates a new skill directory from git history patterns. See `commands/skill-create.md`.
