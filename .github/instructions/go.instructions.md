---
applyTo: "**/*.go"
---

# Go Instructions

- Use `gofmt` formatting — no exceptions
- Error handling: always check `err != nil`, wrap errors with `fmt.Errorf("context: %w", err)`
- Naming: `MixedCaps` for exported, `mixedCaps` for unexported, short variable names in small scopes
- Interfaces: keep small (1-3 methods), accept interfaces return structs
- Package layout: `cmd/` for binaries, `internal/` for private, `pkg/` for public
- Use `context.Context` as first parameter for cancellation and timeouts
- Prefer table-driven tests with `t.Run()`
- Use `sync.Mutex` for shared state, channels for communication
- Close resources with `defer` immediately after creation
- No `init()` functions unless absolutely necessary
- Use `errors.Is()` and `errors.As()` for error comparison
