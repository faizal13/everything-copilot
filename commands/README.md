# Commands Reference

Index of all workflow commands available in Everything Copilot. Each command can be invoked with a `/` prefix in your Copilot session.

## Planning and Development

| Command | Description | Model |
|---------|-------------|-------|
| [/plan](plan.md) | Create structured implementation plans from feature descriptions | Sonnet 4.5 |
| [/tdd](tdd.md) | Test-driven development workflow with coverage verification | Sonnet 4.5 |
| [/e2e](e2e.md) | Generate end-to-end tests for user flows | Sonnet 4.5 |

## Code Quality

| Command | Description | Model |
|---------|-------------|-------|
| [/code-review](code-review.md) | Quality review of code with severity-graded findings | Sonnet 4.5 |
| [/refactor-clean](refactor-clean.md) | Remove dead code, fix DRY violations, simplify logic | Sonnet 4.5 |

## Build and Fix

| Command | Description | Model |
|---------|-------------|-------|
| [/build-fix](build-fix.md) | Diagnose and fix build errors automatically | Sonnet 4.5 |
| [/setup-pm](setup-pm.md) | Configure package manager for the project | Haiku 4.5 |

## Verification

| Command | Description | Model |
|---------|-------------|-------|
| [/checkpoint](checkpoint.md) | Save verification state with a label | Haiku 4.5 |
| [/verify](verify.md) | Run the verification loop against a checkpoint | Sonnet 4.5 |

## Go Language

| Command | Description | Model |
|---------|-------------|-------|
| [/go-review](go-review.md) | Go-specific code review with vet and staticcheck | Sonnet 4.5 |
| [/go-test](go-test.md) | Go TDD workflow with table-driven tests and benchmarks | Sonnet 4.5 |
| [/go-build](go-build.md) | Fix Go build and module dependency errors | Sonnet 4.5 |

## Learning and Skills

| Command | Description | Model |
|---------|-------------|-------|
| [/learn](learn.md) | Extract reusable patterns from the current session | Haiku 4.5 |
| [/skill-create](skill-create.md) | Generate formal skills from git history patterns | Sonnet 4.5 |
| [/evolve](evolve.md) | Cluster instincts into formal skills | Sonnet 4.5 |

## Instinct Management

| Command | Description | Model |
|---------|-------------|-------|
| [/instinct-status](instinct-status.md) | View all learned patterns with confidence scores | -- |
| [/instinct-import](instinct-import.md) | Import patterns from a JSON/YAML file | -- |
| [/instinct-export](instinct-export.md) | Export learned instincts to shareable JSON | -- |

## Quick Start

```bash
# Plan a feature, then implement with TDD
/plan Add user authentication with OAuth2
/tdd auth-service

# Review and clean up
/code-review src/auth/
/refactor-clean src/auth/

# Save and verify
/checkpoint auth-complete
/verify
```

## Conventions

- Commands prefixed with `go-` are Go-language-specific variants.
- Commands prefixed with `instinct-` manage the learned-pattern store.
- Model column indicates which AI model powers the command workflow.
- All commands respect project-level configuration in `.copilot/config.yaml`.
