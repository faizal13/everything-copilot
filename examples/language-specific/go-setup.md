# Go Setup

## Tooling
- **Formatter:** `gofmt` (built-in, run automatically)
- **Linter:** `golangci-lint` (aggregates go vet, staticcheck, errcheck, etc.)
- **Test Runner:** `go test` (built-in)
- **Module Manager:** Go modules (`go.mod`)

## Skills to Enable
- `coding-standards/go.md` — Effective Go, error handling, naming
- `golang-patterns/` — All files (interfaces, testing, concurrency)
- Use Go Reviewer and Go Build Resolver agents

## AGENTS.md Snippet

```markdown
## Go Project Rules
- All errors must be checked (no _ for error returns)
- Errors wrapped with fmt.Errorf("context: %w", err)
- Interfaces defined in consumer package, not provider
- Table-driven tests for functions with multiple inputs
- go vet and staticcheck must pass with zero issues
- Race detector: go test -race passes
- Package layout: cmd/ for binaries, internal/ for private, pkg/ for public
```

## Common Gotchas
- **GOPATH vs modules:** Use modules (go.mod) for all new projects
- **CGO:** Set `CGO_ENABLED=0` for static binaries (cross-compilation)
- **Goroutine leaks:** Always manage goroutine lifetime (context, WaitGroup)
- **Interface pollution:** Keep interfaces small (1-3 methods)
- **Error handling:** Don't panic in library code — return errors
